import { useState, useEffect, useCallback, useRef } from 'react'
import { AlertCircle, MessageCircle, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'
import { getTodayEC, getPortalStatus } from './lib/dateUtils'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Reportes from './components/Reportes'
import TabBienestar from './components/TabBienestar'
import TabRetos from './components/TabRetos'
import TabDiario from './components/TabDiario'
import CalendarTab from './components/CalendarTab'
import TabRecursos from './components/TabRecursos'
import BalletGlossary from './components/BalletGlossary'
import TabActividades from './components/TabActividades'
import BottomNav from './components/BottomNav'
import './index.css'

// Build timestamp injected at compile-time (changes every build → new SW hash → browser updates)
// eslint-disable-next-line no-undef
const _buildTs = typeof __BUILD_TS__ !== 'undefined' ? __BUILD_TS__ : 0

// If ?reset URL param: nuke all SW caches and reload clean
;(function checkReset() {
  try {
    if (!window.location.search.includes('reset')) return
    // Remove param from URL immediately so it doesn't loop
    const clean = window.location.pathname
    history.replaceState({}, '', clean)
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs =>
        Promise.all(regs.map(r => r.unregister()))
      ).then(() => {
        // Clear all caches
        return caches.keys().then(keys =>
          Promise.all(keys.map(k => caches.delete(k)))
        )
      }).then(() => {
        // Hard reload
        window.location.reload(true)
      })
    }
  } catch { /* ignore */ }
})()

// Safe sessionStorage read
function getSession() {
  try {
    const saved = sessionStorage.getItem('portal_session')
    if (!saved) return null
    const parsed = JSON.parse(saved)
    if (parsed?.students?.length > 0 && parsed?.cedula && parsed?.phoneLast4) {
      return parsed
    }
    sessionStorage.removeItem('portal_session')
    return null
  } catch {
    sessionStorage.removeItem('portal_session')
    return null
  }
}

// "Recordar este dispositivo": token opaco emitido por la base (v47).
// Si la RPC no responde, se conserva lo que haya (no se guardan credenciales nuevas).
const DEVICE_KEY = 'studio_device_token'
async function rememberDevice(cedula, phoneLast4) {
  try {
    const { data: token, error } = await supabase.rpc('rpc_client_device_register', {
      p_cedula: cedula, p_phone_last4: phoneLast4
    })
    if (!error && token) localStorage.setItem(DEVICE_KEY, JSON.stringify({ token }))
  } catch { /* ignore */ }
}

function getInitialAuthTab() {
  try {
    const state = history.state
    if (state?.type === 'auth' && state.tab) return state.tab
  } catch { /* ignore */ }
  return 'payments'
}

export default function App() {
  const [session, setSession] = useState(getSession)
  const [authTab, setAuthTab] = useState(getInitialAuthTab)
  const [error, setError] = useState(null)
  const [hasNewTips, setHasNewTips] = useState(false)
  const isHandlingPopState = useRef(false)

  // --- SERVICE WORKER: force update + auto-reload when new SW takes control ---
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // When a new SW activates and claims this client → reload to get fresh content
    const onControllerChange = () => window.location.reload()
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => {
        reg.update()
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        // Poll for updates every 60s (keeps long-lived tabs fresh)
        setInterval(() => reg.update(), 60000)
      })
    })

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])

  // --- GLOBAL ERROR HANDLER (only for truly fatal errors) ---
  useEffect(() => {
    const errorHandler = (e) => {
      const msg = String(e.error?.message || e.message || '')
      // Ignore benign/non-fatal errors
      if (msg.includes('ResizeObserver') || msg.includes('Script error') ||
          msg.includes('Loading chunk') || msg.includes('Failed to fetch') ||
          msg.includes('NetworkError') || msg.includes('Load failed') ||
          msg.includes('rpc_public_courses')) return
      console.error('[Portal] Fatal error:', msg)
      setError('Ocurrió un error. Toque para recargar.')
    }
    const rejectionHandler = (e) => {
      console.warn('[Portal] Unhandled rejection:', e.reason)
    }
    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', rejectionHandler)
    return () => {
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', rejectionHandler)
    }
  }, [])

  // --- HISTORY API: Android back button support ---
  useEffect(() => {
    // Only replaceState if current state doesn't match
    const currentState = history.state
    if (!currentState || !currentState.type) {
      const initialState = session
        ? { type: 'auth', tab: authTab }
        : { type: 'public', view: 'home' }
      history.replaceState(initialState, '')
    }

    const handlePopState = (e) => {
      isHandlingPopState.current = true
      const state = e.state

      if (!state) {
        if (session) setAuthTab('payments')
        isHandlingPopState.current = false
        return
      }

      if (state.type === 'auth') {
        setAuthTab(state.tab || 'payments')
      }
      isHandlingPopState.current = false
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [session, authTab])

  // --- NAVIGATION HELPERS ---
  const navigateTab = useCallback((tab) => {
    if (isHandlingPopState.current) return
    if (tab !== authTab) {
      history.pushState({ type: 'auth', tab }, '')
      setAuthTab(tab)
    }
  }, [authTab])

  // --- REMEMBER DEVICE: auto-login on mount if valid token ---
  // localStorage guarda solo un token aleatorio (v47); la base lo canjea por la
  // sesión mientras siga vigente. Formato viejo ({cedula, phoneLast4}) se migra.
  useEffect(() => {
    if (session) return // already logged in via sessionStorage
    let stored
    try { stored = JSON.parse(localStorage.getItem(DEVICE_KEY) || 'null') } catch { stored = null }
    if (!stored) return

    const resolveCredentials = async () => {
      if (stored.token) {
        const { data } = await supabase.rpc('rpc_client_device_login', { p_token: stored.token })
        return data?.[0] ? { cedula: data[0].cedula, phoneLast4: data[0].phone_last4 } : null
      }
      if (stored.cedula && stored.phoneLast4 && Date.now() < stored.expires) {
        return { cedula: stored.cedula, phoneLast4: stored.phoneLast4, legacy: true }
      }
      return null
    }

    ;(async () => {
      try {
        const creds = await resolveCredentials()
        if (!creds) { localStorage.removeItem(DEVICE_KEY); return }
        const { data, error: rpcErr } = await supabase.rpc('rpc_client_login', {
          p_cedula: creds.cedula, p_phone_last4: creds.phoneLast4
        })
        if (rpcErr || !data?.length) { localStorage.removeItem(DEVICE_KEY); return }
        if (creds.legacy) await rememberDevice(creds.cedula, creds.phoneLast4)
        const sessionData = { students: data, cedula: creds.cedula, phoneLast4: creds.phoneLast4 }
        sessionStorage.setItem('portal_session', JSON.stringify(sessionData))
        setSession(sessionData)
        setAuthTab('payments')
        history.replaceState({ type: 'auth', tab: 'payments' }, '')
      } catch { /* sin conexión: se mantiene el token para el próximo intento */ }
    })()
  }, [])

  // Tips badge — hooks declarados aquí para no violar reglas de React (no después de returns condicionales)
  useEffect(() => {
    if (!session || !session.students?.[0]?.course_id) return
    const ADULTAS_IDS = new Set(['ballet-adultos-semana', 'ballet-adultos-sabados'])
    const adultas = session.students.some(s =>
      s.is_minor === false || ADULTAS_IDS.has(s.course_id) ||
      (s.course_name || '').toLowerCase().includes('adult')
    )
    if (!adultas) return
    const checkNewTips = async () => {
      try {
        const { data } = await supabase.rpc('rpc_client_get_tips', {
          p_cedula: session.cedula, p_phone_last4: session.phoneLast4,
          p_course_id: session.students[0].course_id, p_limit: 1
        })
        if (data?.[0]?.week_start) {
          const lastSeen = localStorage.getItem('tips_last_seen_' + session.cedula)
          setHasNewTips(!lastSeen || data[0].week_start > lastSeen)
        }
      } catch { /* silent */ }
    }
    checkNewTips()
  }, [session])

  useEffect(() => {
    if (!session?.cedula || authTab !== 'recursos' || !hasNewTips) return
    localStorage.setItem('tips_last_seen_' + session.cedula, getTodayEC())
    setHasNewTips(false)
  }, [authTab, hasNewTips, session])

  // --- LOGIN / LOGOUT ---
  const handleLogin = (data) => {
    try {
      const sessionData = { students: data.students, cedula: data.cedula, phoneLast4: data.phoneLast4 }
      sessionStorage.setItem('portal_session', JSON.stringify(sessionData))
      if (data.rememberDevice) rememberDevice(data.cedula, data.phoneLast4)
      setSession(sessionData)
      setAuthTab('payments')
      history.replaceState({ type: 'auth', tab: 'payments' }, '')
    } catch (err) {
      console.error('Login save error:', err)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('portal_session')
    try {
      const stored = JSON.parse(localStorage.getItem(DEVICE_KEY) || 'null')
      if (stored?.token) supabase.rpc('rpc_client_device_revoke', { p_token: stored.token }).then(() => {}, () => {})
    } catch { /* ignore */ }
    localStorage.removeItem(DEVICE_KEY)
    setSession(null)
    setAuthTab('payments')
    setError(null)
    history.replaceState({ type: 'public', view: 'home' }, '')
  }

  // --- ERROR SCREEN with cache cleanup ---
  if (error) {
    const handleReload = () => {
      if ('caches' in window) {
        caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
          .finally(() => window.location.reload())
      } else {
        window.location.reload()
      }
    }
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-700 font-semibold">Ocurrió un error</p>
        <p className="text-gray-500 text-sm mt-1">Toque el botón para limpiar caché y reiniciar</p>
        <button
          onClick={handleReload}
          className="mt-5 px-8 py-3 bg-[#6b2145] text-white rounded-xl font-semibold text-base"
        >
          Limpiar y Recargar
        </button>
      </div>
    )
  }

  // --- PUBLIC VIEW: login ---
  if (!session) {
    return <Login onLogin={handleLogin} onBack={null} />
  }

  // --- INACTIVE CHECK (soft block) ---
  // If ALL students are 'inactive' per getPaymentStatus (60+ days past due), block access
  const INACTIVE_DAYS = 60
  const isInactive = (() => {
    if (!session.students || session.students.length === 0) return false
    // Block ONLY if every student with a payment date is overdue by 60+ days
    // Students without next_payment_date are skipped (not counted as inactive)
    const studentsWithDate = session.students.filter(s =>
      !s.is_courtesy && !s.is_paused && s.next_payment_date
    )
    if (studentsWithDate.length === 0) return false // No payment dates → don't block
    return studentsWithDate.every(s => getPortalStatus(s).status === 'inactive')
  })()

  if (isInactive) {
    return (
      <div className="min-h-screen bg-[#faf7f4] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full overflow-hidden">
          <div className="bg-[#551735] px-6 py-8 text-center">
            <img src="/logo.png" alt="Studio Dancers" className="w-28 mx-auto mb-3 opacity-90" style={{ filter: 'brightness(0) invert(1)' }} />
            <h2 className="text-white text-lg font-bold">Cuenta inactiva</h2>
          </div>
          <div className="px-6 py-6 text-center space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              Tu cuenta no tiene pagos registrados en los últimos {INACTIVE_DAYS} días.
              Para reactivar tu acceso, comunícate con nosotros.
            </p>
            <p className="text-gray-400 text-xs">
              ¡Te esperamos de vuelta!
            </p>
            <a
              href="https://wa.me/593991741741?text=Hola%2C%20quisiera%20reactivar%20mi%20cuenta%20en%20Mi%20Studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-base"
            >
              <MessageCircle size={18} />
              Escríbenos por WhatsApp
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- AUTHENTICATED VIEWS ---
  // Determinar si es alumna adulta:
  // 1. Prefer is_minor field from RPC (v23+)
  // 2. Fallback: course_id codes or course_name containing "adult" (matches adulto/adultos/adultas)
  const ADULTAS_IDS = new Set(['ballet-adultos-semana', 'ballet-adultos-sabados'])
  const isAdultas = session.students.some(s =>
    s.is_minor === false ||
    ADULTAS_IDS.has(s.course_id) ||
    (s.course_name || '').toLowerCase().includes('adult')
  )

  // Si el tab activo no corresponde al tipo de alumna, redirigir a pagos
  const ADULTAS_TABS = ['payments', 'bienestar', 'retos', 'diario', 'calendario', 'recursos']
  const NINAS_TABS   = ['payments', 'calendario', 'actividades', 'glosario', 'reportes']
  const validTabs    = isAdultas ? ADULTAS_TABS : NINAS_TABS
  const currentTab   = validTabs.includes(authTab) ? authTab : 'payments'

  return (
    <ErrorBoundary>
    <div className="pb-16">
      {currentTab === 'payments' && (
        <Dashboard
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
          isAdultas={isAdultas}
          onLogout={handleLogout}
          onSessionUpdate={(newStudents) => {
            const updated = { ...session, students: newStudents }
            sessionStorage.setItem('portal_session', JSON.stringify(updated))
            setSession(updated)
          }}
        />
      )}
      {currentTab === 'bienestar' && isAdultas && (
        <TabBienestar
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
        />
      )}
      {currentTab === 'retos' && isAdultas && (
        <TabRetos
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
        />
      )}
      {currentTab === 'diario' && isAdultas && (
        <TabDiario
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
        />
      )}
      {currentTab === 'calendario' && (
        <CalendarTab
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
          onLogout={handleLogout}
        />
      )}
      {currentTab === 'actividades' && !isAdultas && (
        <TabActividades students={session.students} />
      )}
      {currentTab === 'glosario' && !isAdultas && (
        <BalletGlossary />
      )}
      {currentTab === 'recursos' && isAdultas && (
        <TabRecursos
          students={session.students}
          cedula={session.cedula}
          phoneLast4={session.phoneLast4}
        />
      )}
      {currentTab === 'reportes' && (
        <Reportes students={session.students} cedula={session.cedula} phoneLast4={session.phoneLast4} onLogout={handleLogout} />
      )}
      <BottomNav activeTab={currentTab} onChangeTab={navigateTab} isAdultas={isAdultas} hasNewTips={hasNewTips} />
    </div>
    </ErrorBoundary>
  )
}
