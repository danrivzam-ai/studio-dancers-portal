// Post-build script: patch dist/registerSW.js with full auto-update logic
// Runs after vite build → overwrites the minimal file vite-plugin-pwa generates

import { writeFileSync } from 'fs'

const content = `if('serviceWorker' in navigator) {
  // Auto-reload the page when a new SW activates and claims this client
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(reg => {
      // Force check for new version immediately on load
      reg.update()
      // If a new SW is waiting, tell it to activate now
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      // Keep checking for updates every 60s (for long-lived tabs)
      setInterval(() => reg.update(), 60000)
    })
  })
}
`

writeFileSync('dist/registerSW.js', content)
console.log('✅ dist/registerSW.js patched with auto-reload on SW update')
