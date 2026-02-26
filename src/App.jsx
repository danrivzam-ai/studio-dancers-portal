import { useState, useEffect } from 'react'
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
    // Validate session has required fields
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

export default function App() {
  const [session, setSession] = useState(getSession)
  const [publicView, setPublicView] = useState('home')
  const [authTab, setAuthTab] = useState('payments')
  const [error, setError] = useState(null)

  // Catch unhandled errors to prevent gray screen
  useEffect(() => {
    const handler = (e) => {
      console.error('Unhandled error:', e.error || e.reason || e)
      setError('Ocurrió un error. Toque para recargar.')
    }
    window.addEventListener('error', handler)
    window.addEventListener('unhandledrejection', handler)
    return () => {
      window.removeEventListener('error', handler)
      window.removeEventListener('unhandledrejection', handler)
    }
  }, [])

  // Force service worker update on load
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.update())
      })
    }
  }, [])

  const handleLogin = (data) => {
    try {
      sessionStorage.setItem('portal_session', JSON.stringify(data))
      setSession(data)
      setAuthTab('payments')
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
  }

  // Error screen — tap to reload
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
      return <CourseCatalog onBack={() => setPublicView('home')} />
    }
    if (publicView === 'login') {
      return <Login onLogin={handleLogin} onBack={() => setPublicView('home')} />
    }
    return (
      <LandingPage
        onGoToCatalog={() => setPublicView('catalog')}
        onGoToLogin={() => setPublicView('login')}
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
      <BottomNav activeTab={authTab} onChangeTab={setAuthTab} />
    </div>
  )
}
