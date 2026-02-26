import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, AlertCircle } from 'lucide-react'

export default function Login({ onLogin }) {
  const [cedula, setCedula] = useState('')
  const [phoneLast4, setPhoneLast4] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        phoneLast4: phoneLast4.trim()
      })
    } catch (err) {
      console.error('Login error:', err)
      setError(`Error: ${err?.message || err?.code || 'Intente de nuevo.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🩰</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Portal de Pagos</h1>
          <p className="text-sm text-gray-500 mt-1">Ingrese sus datos para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cedula}
              onChange={(e) => { setCedula(e.target.value.replace(/\D/g, '')); setError('') }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg tracking-wider"
              placeholder="0912345678"
              maxLength={13}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">Cédula del alumno, representante o pagador</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Últimos 4 dígitos del teléfono
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={phoneLast4}
              onChange={(e) => { setPhoneLast4(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="• • • •"
              maxLength={4}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-base"
          >
            {loading ? (
              <span className="animate-pulse">Buscando...</span>
            ) : (
              <>
                <LogIn size={20} />
                Ingresar
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Si no puede ingresar, contacte al estudio.
        </p>
      </div>
    </div>
  )
}
