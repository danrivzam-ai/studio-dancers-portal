import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Shield, Search, ArrowLeft, RefreshCw, CheckCircle, XCircle, Lock, CalendarClock } from 'lucide-react'

export default function AdminPanel({ onBack }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [pin, setPin] = useState('')
  const [resetting, setResetting] = useState(false)
  const [result, setResult] = useState(null) // { ok, name, new_next } | { ok:false, error }

  useEffect(() => {
    Promise.all([
      supabase.from('students')
        .select('id, name, course_id, next_payment_date')
        .eq('active', true)
        .order('name'),
      supabase.from('courses')
        .select('id, name')
    ]).then(([{ data: sData }, { data: cData }]) => {
      const courseMap = {}
      ;(cData || []).forEach(c => {
        courseMap[c.id] = (c.name || '').split(' | ')[0]
      })
      setStudents((sData || []).map(s => ({
        ...s,
        course_name: courseMap[s.course_id] || s.course_id || '—',
      })))
      setLoading(false)
    })
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-EC', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const handleReset = async () => {
    if (pin.length < 4 || resetting) return
    setResetting(true)
    const { data, error } = await supabase.rpc('rpc_admin_reset_student_month', {
      p_pin: pin,
      p_student_id: resetTarget.id,
    })
    setResetting(false)
    if (error) {
      setResult({ ok: false, error: error.message })
    } else {
      setResult(data)
      if (data?.ok) {
        setStudents(prev => prev.map(s =>
          s.id === resetTarget.id
            ? { ...s, next_payment_date: data.new_next }
            : s
        ))
      }
    }
  }

  // ── Result screen ──────────────────────────────────────────────
  if (result) {
    const ok = result.ok
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center" style={{ animation: 'fadeIn 0.3s ease-out both' }}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${ok ? 'bg-green-100' : 'bg-red-100'}`}>
            {ok
              ? <CheckCircle size={34} className="text-green-600" />
              : <XCircle size={34} className="text-red-500" />
            }
          </div>
          {ok ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">¡Ciclo extendido!</h2>
              <p className="text-gray-600 text-sm mb-1 font-medium">{result.name}</p>
              <p className="text-xs text-gray-400">
                Anterior: <span className="line-through">{formatDate(result.old_next)}</span>
              </p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Nuevo vencimiento: {formatDate(result.new_next)}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">No se pudo aplicar</h2>
              <p className="text-gray-500 text-sm">{result.error || 'Error desconocido'}</p>
            </>
          )}
          <button
            onClick={() => { setResult(null); setResetTarget(null); setPin('') }}
            className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm ${ok ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {ok ? 'Continuar' : 'Reintentar'}
          </button>
        </div>
      </div>
    )
  }

  // ── PIN confirmation modal ─────────────────────────────────────
  if (resetTarget) {
    return (
      <div className="min-h-screen bg-gray-900/95 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ animation: 'fadeIn 0.25s ease-out both' }}>
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
            <Lock size={22} className="text-purple-700" />
          </div>
          <h3 className="font-bold text-gray-900 text-center text-lg mb-0.5">PIN de Administrador</h3>
          <p className="text-[12px] text-gray-400 text-center mb-1">Extender ciclo de:</p>
          <p className="text-sm font-bold text-purple-700 text-center mb-1 px-2 truncate">{resetTarget.name}</p>
          <p className="text-[11px] text-gray-400 text-center mb-5">
            <CalendarClock size={11} className="inline mr-1" />
            Vence: {formatDate(resetTarget.next_payment_date)}
            {' → '}
            <span className="text-green-600 font-semibold">
              {formatDate(
                (() => {
                  const d = new Date((resetTarget.next_payment_date || new Date().toISOString().split('T')[0]) + 'T00:00:00')
                  d.setMonth(d.getMonth() + 1)
                  return d.toISOString().split('T')[0]
                })()
              )}
            </span>
          </p>

          {/* PIN input */}
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center text-2xl tracking-[0.6em] border-2 border-gray-200 rounded-xl py-3 mb-5 focus:border-purple-400 focus:outline-none transition-colors"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setResetTarget(null); setPin('') }}
              className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleReset}
              disabled={pin.length < 4 || resetting}
              className="py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
            >
              {resetting && <RefreshCw size={14} className="animate-spin" />}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Student list ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 px-4 pt-safe-top pb-4">
        <div className="flex items-center gap-3 pt-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
            <Shield size={17} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm leading-tight">Panel Admin</p>
            <p className="text-white/50 text-[11px]">Reset de ciclo mensual</p>
          </div>
          <span className="text-[10px] text-white/40 font-mono">{students.length} alumnas</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar alumna..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
        <CalendarClock size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 leading-relaxed">
          El reset extiende el vencimiento 1 mes y reinicia el contador de clases desde hoy. Se requiere PIN de administrador.
        </p>
      </div>

      {/* List */}
      <div className="p-4 space-y-2 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={20} className="text-purple-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Sin resultados</p>
        ) : filtered.map(s => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm"
            style={{ animation: 'fadeIn 0.3s ease-out both' }}
          >
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{s.course_name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Vence: <span className="font-medium text-gray-600">{formatDate(s.next_payment_date)}</span>
              </p>
            </div>

            {/* Reset button */}
            <button
              onClick={() => setResetTarget(s)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <RefreshCw size={11} />
              Reset
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
