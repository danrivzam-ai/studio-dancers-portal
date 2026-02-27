import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ======== AGGRESSIVE SERVICE WORKER CLEANUP ========
// Unregister ALL old service workers and clear ALL caches on version bump
const APP_VERSION = '3.0'
const storedVersion = localStorage.getItem('portal_version')

if (storedVersion !== APP_VERSION) {
  // Version changed — nuclear cleanup
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister())
    })
  }
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
  }
  localStorage.setItem('portal_version', APP_VERSION)
  console.log('[Portal] Cache cleared for v' + APP_VERSION)
}

// ======== RENDER APP ========
const root = document.getElementById('root')

// Gray screen recovery: if root is empty after 3 seconds, reload
const recoveryTimer = setTimeout(() => {
  if (root && (!root.innerHTML || root.innerHTML.trim().length < 10)) {
    console.warn('[Portal] Gray screen detected — clearing cache and reloading')
    // Nuclear: unregister SW + clear caches + reload
    const cleanup = []
    if ('serviceWorker' in navigator) {
      cleanup.push(
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => reg.unregister())
        })
      )
    }
    if ('caches' in window) {
      cleanup.push(
        caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
      )
    }
    Promise.all(cleanup)
      .catch(() => {})
      .finally(() => {
        // Force hard reload bypassing cache
        window.location.href = window.location.origin + '/?nocache=' + Date.now()
      })
  }
}, 3000)

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  clearTimeout(recoveryTimer)
} catch (err) {
  clearTimeout(recoveryTimer)
  console.error('[Portal] Render crash:', err)
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;font-family:system-ui,sans-serif;background:#f3f4f6">
      <p style="font-size:48px;margin-bottom:16px">😕</p>
      <p style="color:#374151;font-weight:600;font-size:16px">Ocurrió un error al cargar</p>
      <p style="color:#9ca3af;font-size:13px;margin-top:8px">Toque el boton para limpiar cache y reiniciar</p>
      <button onclick="
        if('caches' in window){caches.keys().then(function(n){return Promise.all(n.map(function(c){return caches.delete(c)}))}).then(function(){location.reload()}).catch(function(){location.reload()})}
        else{location.reload()}
      " style="margin-top:20px;padding:12px 32px;background:#7e22ce;color:white;border:none;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer">
        Limpiar y Recargar
      </button>
    </div>
  `
}
