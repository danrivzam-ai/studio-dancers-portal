import { useState, useEffect, useCallback, useRef } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseCatalog from './components/CourseCatalog'
import BalletTips from './components/BalletTips'
import CalendarTab from './components/CalendarTab'
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
  const isHandlingPopState = useRef(false)

  // --- SPLASH: fade out y remover una vez que React montó ---
  useEffect(() => {
    const splash = document.getElementById('splash')
    if (!splash) return
    // Delay start of fade so first React paint is committed before fading
    let removeTimer
    const fadeTimer = setTimeout(() => {
      splash.style.opacity = '0'
      removeTimer = setTimeout(() => { splash.remove() }, 420)
    }, 80)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

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

  // --- LOGIN / LOGOUT ---
  const handleLogin = (data) => {
    try {
      sessionStorage.setItem('portal_session', JSON.stringify(data))
      setSession(data)
      setAuthTab('payments')
      history.replaceState({ type: 'auth', tab: 'payments' }, '')
    } catch (err) {
      console.error('Login save error:', err)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('portal_session')
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
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-700 font-semibold">Ocurrió un error</p>
        <p className="text-gray-500 text-sm mt-1">Toque el botón para limpiar caché y reiniciar</p>
        <button
          onClick={handleReload}
          className="mt-5 px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold text-base"
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
    if (publicView === 'login') {
      return <Login onLogin={handleLogin} onBack={() => navigatePublic('home')} />
    }
    return (
      <LandingPage
        onGoToCatalog={(category, courseName) => navigatePublic('catalog', category || null, courseName || null)}
        onGoToLogin={() => navigatePublic('login')}
      />
    )
  }

  // --- AUTHENTICATED VIEWS ---
  return (
    <div className="pb-16">
      {authTab === 'payments' && (
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
      {authTab === 'calendar' && (
        <CalendarTab
          students={session.students}
          onLogout={handleLogout}
        />
      )}
      {authTab === 'tips' && (
        <BalletTips onLogout={handleLogout} />
      )}
      {authTab === 'courses' && (
        <CourseCatalog isAuthenticated onLogout={handleLogout} />
      )}
      <BottomNav activeTab={authTab} onChangeTab={navigateTab} />
    </div>
  )
}
