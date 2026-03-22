import { useState, useEffect, useCallback, useRef } from 'react'
import { AlertCircle, MessageCircle, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseCatalog from './components/CourseCatalog'
import Reportes from './components/Reportes'
import TabBienestar from './components/TabBienestar'
import TabRetos from './components/TabRetos'
import TabDiario from './components/TabDiario'
import CalendarTab from './components/CalendarTab'
import TabRecursos from './components/TabRecursos'
import BalletGlossary from './components/BalletGlossary'
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

// Restore public view from history.state on refresh
function getInitialPublicView() {
  try {
    const state = history.state
    if (state?.type === 'public' && state.view) return state.view
  } catch { /* ignore */ }
  return 'home'
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
  const [publicView, setPublicView] = useState(getInitialPublicView)
  const [catalogCategory, setCatalogCategory] = useState(null)
  const [catalogCourseName, setCatalogCourseName] = useState(null)
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
        : { type: 'public', view: publicView }
      history.replaceState(initialState, '')
    }

    const handlePopState = (e) => {
      isHandlingPopState.current = true
      const state = e.state

      if (!state) {
        if (session) {
          setAuthTab('payments')
        } else {
          setPublicView('home')
        }
        isHandlingPopState.current = false
        return
      }

      if (state.type === 'auth') {
        setAuthTab(state.tab || 'payments')
      } else if (state.type === 'public') {
        setPublicView(state.view || 'home')
        setCatalogCategory(state.category || null)
        setCatalogCourseName(state.courseName || null)
      }
      isHandlingPopState.current = false
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [session, authTab, publicView])

  // --- NAVIGATION HELPERS ---
  const navigatePublic = useCallback((view, category = null, courseName = null) => {
    if (isHandlingPopState.current) return
    history.pushState({ type: 'public', view, category, courseName }, '')
    setPublicView(view)
    setCatalogCategory(category)
    setCatalogCourseName(courseName)
  }, [])

  const navigateTab = useCallback((tab) => {
    if (isHandlingPopState.current) return
    if (tab !== authTab) {
      history.pushState({ type: 'auth', tab }, '')
      setAuthTab(tab)
    }
  }, [authTab])

  // --- REMEMBER DEVICE: auto-login on mount if valid token ---
  useEffect(() => {
    if (session) return // already logged in via sessionStorage
    try {
      const stored = localStorage.getItem('studio_device_token')
      if (!stored) return
      const token = JSON.parse(stored)
      if (!token?.cedula || !token?.phoneLast4 || !token?.expires) return
      if (Date.now() > token.expires) { localStorage.removeItem('studio_device_token'); return }
      // Re-verify with RPC to get fresh student data
      supabase.rpc('rpc_client_login', { p_cedula: token.cedula, p_phone_last4: token.phoneLast4 })
        .then(({ data, error: rpcErr }) => {
          if (!rpcErr && data?.length > 0) {
            const sessionData = { students: data, cedula: token.cedula, phoneLast4: token.phoneLast4 }
            sessionStorage.setItem('portal_session', JSON.stringify(sessionData))
            setSession(sessionData)
            setAuthTab('payments')
            history.replaceState({ type: 'auth', tab: 'payments' }, '')
          } else {
            localStorage.removeItem('studio_device_token')
          }
        })
        .catch(() => localStorage.removeItem('studio_device_token'))
    } catch { localStorage.removeItem('studio_device_token') }
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
    localStorage.setItem('tips_last_seen_' + session.cedula, new Date().toISOString().slice(0, 10))
    setHasNewTips(false)
  }, [authTab, hasNewTips, session])

  // --- LOGIN / LOGOUT ---
  const handleLogin = (data) => {
    try {
      const sessionData = { students: data.students, cedula: data.cedula, phoneLast4: data.phoneLast4 }
      sessionStorage.setItem('portal_session', JSON.stringify(sessionData))
      if (data.rememberDevice) {
        localStorage.setItem('studio_device_token', JSON.stringify({
          cedula: data.cedula,
          phoneLast4: data.phoneLast4,
          expires: Date.now() + 30 * 24 * 60 * 60 * 1000
        }))
      }
      setSession(sessionData)
      setAuthTab('payments')
      history.replaceState({ type: 'auth', tab: 'payments' }, '')
    } catch (err) {
      console.error('Login save error:', err)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('portal_session')
    localStorage.removeItem('studio_device_token')
    setSession(null)
    setPublicView('home')
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

  // --- PUBLIC VIEWS ---
  if (!session) {
    if (publicView === 'catalog') {
      return <CourseCatalog onBack={() => navigatePublic('home')} initialCategory={catalogCategory} initialCourseName={catalogCourseName} />
    }
    if (publicView === 'landing') {
      return (
        <LandingPage
          onGoToCatalog={(category, courseName) => navigatePublic('catalog', category || null, courseName || null)}
          onGoToLogin={() => navigatePublic('home')}
        />
      )
    }
    // Login is now the default home view
    return <Login onLogin={handleLogin} onBack={null} />
  }

  // --- INACTIVE CHECK (soft block) ---
  // If ALL students have next_payment_date older than 60 days, block access
  const INACTIVE_DAYS = 60
  const isInactive = (() => {
    if (!session.students || session.students.length === 0) return false
    const now = new Date()
    // Block ONLY if every student with a payment date is overdue by 60+ days
    // Students without next_payment_date are skipped (not counted as inactive)
    const studentsWithDate = session.students.filter(s =>
      !s.is_courtesy && !s.is_paused && s.next_payment_date
    )
    if (studentsWithDate.length === 0) return false // No payment dates → don't block
    return studentsWithDate.every(s => {
      const nextPay = new Date(s.next_payment_date + 'T12:00:00')
      const diffDays = Math.floor((now - nextPay) / (1000 * 60 * 60 * 24))
      return diffDays > INACTIVE_DAYS
    })
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
  const NINAS_TABS   = ['payments', 'calendario', 'glosario', 'reportes']
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
          onLogout={handleLogout}
        />
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
        <Reportes students={session.students} onLogout={handleLogout} />
      )}
      <BottomNav activeTab={currentTab} onChangeTab={navigateTab} isAdultas={isAdultas} hasNewTips={hasNewTips} />
    </div>
    </ErrorBoundary>
  )
}
