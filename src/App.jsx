import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseCatalog from './components/CourseCatalog'
import BalletTips from './components/BalletTips'
import BottomNav from './components/BottomNav'
import './index.css'

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem('portal_session')
    return saved ? JSON.parse(saved) : null
  })
  const [publicView, setPublicView] = useState('home') // 'home' | 'catalog' | 'login'
  const [authTab, setAuthTab] = useState('payments')   // 'payments' | 'tips' | 'courses'

  const handleLogin = (data) => {
    sessionStorage.setItem('portal_session', JSON.stringify(data))
    setSession(data)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('portal_session')
    setSession(null)
    setPublicView('home')
    setAuthTab('payments')
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
