import { useState, useEffect, useCallback, useRef } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseCatalog from './components/CourseCatalog'
import BalletTips from './components/BalletTips'
import BottomNav from './components/BottomNav'
import './index.css'

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

// Aggressive service worker cleanup
function cleanServiceWorkers() {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      // Force update
      reg.update()
      // If waiting worker exists, tell it to activate immediately
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
  })

  // Listen for new service worker and reload when it takes over
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Only reload if user isn't in the middle of something
    if (!sessionStorage.getItem('portal_session')) {
      window.location.reload()
    }
  })
}

// Clear all caches if version changed
async function clearStaleCache() {
  if (!('caches' in window)) return
  try {
    const APP_VERSION = '2.1'
    const storedVersion = localStorage.getItem('app_version')
    if (storedVersion !== APP_VERSION) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      localStorage.setItem('app_version', APP_VERSION)
      console.log('Caches cleared for new version')
    }
  } catch (e) {
    console.warn('Cache clear failed:', e)
  }
}

export default function App() {
  const [session, setSession] = useState(getSession)
  const [publicView, setPublicView] = useState('home')
  const [authTab, setAuthTab] = useState('payments')
  const [error, setError] = useState(null)
  const isHandlingPopState = useRef(false)

  // --- SERVICE WORKER + CACHE CLEANUP ---
  useEffect(() => {
    cleanServiceWorkers()
    clearStaleCache()
  }, [])

  // --- GLOBAL ERROR HANDLER ---
  useEffect(() => {
    const handler = (e) => {
      console.error('Unhandled error:', e.error || e.reason || e)
      // Don't show error for ResizeObserver or benign errors
      const msg = String(e.error?.message || e.reason?.message || '')
      if (msg.includes('ResizeObserver') || msg.includes('Script error')) return
      setError('Ocurrio un error. Toque para recargar.')
    }
    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', handler)
    return () => {
      window.removeEventListener('error', handler)
      window.removeEventListener('unhandledrejection', handler)
    }
  }, [])

  // --- HISTORY API: Android back button support ---
  useEffect(() => {
    // Set initial history state
    const initialState = session
      ? { type: 'auth', tab: 'payments' }
      : { type: 'public', view: 'home' }
    history.replaceState(initialState, '')

    const handlePopState = (e) => {
      isHandlingPopState.current = true
      const state = e.state

      if (!state) {
        // Fell off the history stack — go to home
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
      }
      isHandlingPopState.current = false
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [session])

  // --- NAVIGATION HELPERS (push to history) ---
  const navigatePublic = useCallback((view) => {
    if (isHandlingPopState.current) return
    history.pushState({ type: 'public', view }, '')
    setPublicView(view)
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
      // Reset history for authenticated state
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
    // Reset history for public state
    history.replaceState({ type: 'public', view: 'home' }, '')
  }

  // --- ERROR SCREEN ---
  if (error) {
    return (
      <div
        className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center"
        onClick={() => window.location.reload()}
      >
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-700 font-medium">{error}</p>
        <button className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
          Recargar
        </button>
      </div>
    )
  }

  // --- PUBLIC VIEWS (not logged in) ---
  if (!session) {
    if (publicView === 'catalog') {
      return <CourseCatalog onBack={() => navigatePublic('home')} />
    }
    if (publicView === 'login') {
      return <Login onLogin={handleLogin} onBack={() => navigatePublic('home')} />
    }
    return (
      <LandingPage
        onGoToCatalog={() => navigatePublic('catalog')}
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
