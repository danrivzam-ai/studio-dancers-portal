import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, AlertCircle, ArrowLeft, Lock, Eye, EyeOff, MessageCircle, Globe } from 'lucide-react'

const STUDIO_WHATSAPP = '593963741884'

export default function Login({ onLogin, onBack }) {
  const [cedula, setCedula] = useState('')
  const [phoneLast4, setPhoneLast4] = useState('')
  const [showPhone, setShowPhone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!cedula.trim() || !phoneLast4.trim()) {
      setError('Ingrese cédula y últimos 4 dígitos del teléfono')
      return
    }

    if (phoneLast4.length !== 4) {
      setError('Ingrese exactamente 4 dígitos del teléfono')
      return
    }

    setLoading(true)
    try {
      // Verificar que Supabase esté configurado
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setError('El portal no está configurado correctamente. Contacte al administrador. (ENV)')
        return
      }

      const { data, error: rpcError } = await supabase.rpc('rpc_client_login', {
        p_cedula: cedula.trim(),
        p_phone_last4: phoneLast4.trim()
      })

      if (rpcError) throw rpcError

      if (!data || data.length === 0) {
        setError('No se encontró alumno con esos datos. Verifique su cédula y teléfono.')
        return
      }

      onLogin({
        students: data,
        cedula: cedula.trim(),
        phoneLast4: phoneLast4.trim(),
        rememberDevice
      })
    } catch (err) {
      console.error('Login error:', err)
      setError(`Error: ${err?.message || err?.code || 'Intente de nuevo.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(160deg, #551735 0%, #7B2D5E 40%, #8B4070 70%, #a8607e 100%)' }}
    >
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: '#ffcfe0', opacity: 0.08 }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full" style={{ background: '#afeeee', opacity: 0.06 }} />
        <div className="absolute top-1/3 right-8 w-20 h-20 rounded-full" style={{ background: '#ffcfe0', opacity: 0.05 }} />
      </div>

      {/* Volver al sitio web */}
      {onBack ? (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors z-10"
        >
          <ArrowLeft size={16} />
          <span>Atrás</span>
        </button>
      ) : (
        <a
          href="https://studiodancersec.com"
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors z-10"
        >
          <Globe size={16} />
          <span>Sitio web</span>
        </a>
      )}

      {/* Logo y título */}
      <div className="text-center mb-8 relative z-10">
        <img
          src="/logo-landing.png"
          alt="Studio Dancers"
          className="h-16 mx-auto mb-3"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
        />
        <h1 className="text-2xl font-bold text-white tracking-tight">Mi Studio</h1>
        <p className="text-sm mt-1" style={{ color: '#ffcfe0' }}>
          Consulta pagos, horarios y más
        </p>
      </div>

      {/* Card de login */}
      <div className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative z-10" style={{ backgroundColor: '#f4ece6' }}>
        <div className="px-1 pt-1">
          <div className="rounded-xl px-6 py-4" style={{ background: 'linear-gradient(135deg, #ffcfe0 0%, #f4ece6 100%)' }}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Lock size={15} style={{ color: '#551735' }} />
              <p className="font-semibold text-sm" style={{ color: '#551735' }}>Ingresa con tus datos</p>
            </div>
            <p className="text-center text-xs" style={{ color: '#7a6b6b' }}>
              Usa la cédula y los últimos 4 dígitos del teléfono registrado
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#551735' }}>
              Cédula de identidad
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(e) => { setCedula(e.target.value.replace(/\D/g, '')); setError('') }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white focus:outline-none transition-all"
              style={{ caretColor: '#551735' }}
              onFocus={e => { e.target.style.borderColor = '#551735'; e.target.style.boxShadow = '0 0 0 4px rgba(85,23,53,0.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
              placeholder="0912345678"
              maxLength={13}
              autoFocus
            />
            <p className="text-xs mt-1" style={{ color: '#7a6b6b' }}>Cédula del alumno, representante o pagador</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: '#551735' }}>
              Últimos 4 dígitos del teléfono
            </label>
            <div className="relative">
              <input
                type={showPhone ? 'text' : 'password'}
                inputMode="numeric"
                value={phoneLast4}
                onChange={(e) => { setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
                className="w-full px-4 pr-12 py-3 border-2 border-gray-200 rounded-xl text-base bg-white focus:outline-none transition-all tracking-widest font-mono"
                style={{ caretColor: '#551735' }}
                onFocus={e => { e.target.style.borderColor = '#551735'; e.target.style.boxShadow = '0 0 0 4px rgba(85,23,53,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                placeholder="••••"
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPhone(!showPhone)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 active:scale-95 transition-all"
                style={{ color: '#551735' }}
              >
                {showPhone ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: '#7a6b6b' }}>
              Ej.: si tu número es 0991234567, escribe <strong>4567</strong>
            </p>
          </div>

          {/* Recordar dispositivo */}
          <button
            type="button"
            onClick={() => setRememberDevice(v => !v)}
            className="flex items-center gap-3 w-full py-1 select-none"
          >
            <div
              className="relative w-10 h-6 rounded-full transition-colors shrink-0"
              style={{ backgroundColor: rememberDevice ? '#551735' : '#d1d5db' }}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rememberDevice ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm" style={{ color: '#551735' }}>Recordar este dispositivo</span>
          </button>

          <button
            type="submit"
            disabled={loading || cedula.length < 6 || phoneLast4.length !== 4}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-base active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #551735 0%, #7B2D5E 100%)',
              boxShadow: '0 4px 15px rgba(85,23,53,0.35)'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn size={18} />
                Ingresar
              </span>
            )}
          </button>
        </form>

        {/* Ayuda */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-center gap-3 text-xs" style={{ color: '#7a6b6b' }}>
            <span>¿No puedes ingresar?</span>
            <a
              href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent('Hola, necesito ayuda para ingresar a Mi Studio')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
              style={{ color: '#551735' }}
            >
              <MessageCircle size={13} />
              Escríbenos
            </a>
          </div>
        </div>
      </div>

      <p className="text-white/30 text-xs mt-8 relative z-10">Studio Dancers © {new Date().getFullYear()}</p>
    </div>
  )
}
