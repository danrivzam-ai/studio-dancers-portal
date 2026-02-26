import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Gray screen recovery: if root is empty after 5 seconds, force reload
const root = document.getElementById('root')

const recoveryTimeout = setTimeout(() => {
  if (root && (!root.innerHTML || root.innerHTML.trim() === '')) {
    console.warn('Gray screen detected — forcing reload')
    // Clear all caches before reload
    if ('caches' in window) {
      caches.keys().then(names => {
        Promise.all(names.map(n => caches.delete(n))).then(() => {
          window.location.reload()
        })
      }).catch(() => window.location.reload())
    } else {
      window.location.reload()
    }
  }
}, 5000)

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  // Root rendered OK — cancel recovery
  clearTimeout(recoveryTimeout)
} catch (err) {
  clearTimeout(recoveryTimeout)
  console.error('Render error:', err)
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;font-family:system-ui,sans-serif">
      <p style="font-size:48px;margin-bottom:16px">😕</p>
      <p style="color:#374151;font-weight:500">Ocurrio un error al cargar.</p>
      <button onclick="
        if('caches' in window){caches.keys().then(n=>Promise.all(n.map(c=>caches.delete(c)))).then(()=>location.reload()).catch(()=>location.reload())}
        else{location.reload()}
      " style="margin-top:16px;padding:10px 24px;background:#7e22ce;color:white;border:none;border-radius:12px;font-weight:500;cursor:pointer">
        Recargar
      </button>
    </div>
  `
}
