import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './index.css'

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem('portal_session')
    return saved ? JSON.parse(saved) : null
  })

  const handleLogin = (data) => {
    sessionStorage.setItem('portal_session', JSON.stringify(data))
    setSession(data)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('portal_session')
    setSession(null)
  }

  if (!session) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Dashboard
      students={session.students}
      cedula={session.cedula}
      phoneLast4={session.phoneLast4}
      onLogout={handleLogout}
    />
  )
}
