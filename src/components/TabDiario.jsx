import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { getDiarioList, createDiarioEntry, updateDiarioEntry, deleteDiarioEntry } from '../lib/adultas'

const ANIMOS = [
  { id: 'feliz',     emoji: '😊', label: 'Feliz'     },
  { id: 'motivada',  emoji: '💪', label: 'Motivada'  },
  { id: 'cansada',   emoji: '😴', label: 'Cansada'   },
  { id: 'frustrada', emoji: '😤', label: 'Frustrada' },
  { id: 'neutral',   emoji: '😐', label: 'Neutral'   },
]

function todayEC() {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  const ec = new Date(utcMs - 5 * 3600000)
  return ec.toISOString().slice(0, 10)
}

function formatFecha(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function DiaryIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tapa del diario */}
      <rect x="10" y="6" width="38" height="52" rx="4" fill="white" opacity="0.15" />
      <rect x="13" y="6" width="35" height="52" rx="4" fill="white" opacity="0.25" />
      {/* Lomo */}
      <rect x="10" y="6" width="7" height="52" rx="3" fill="#ffcfe0" />
      {/* Líneas de contenido */}
      <line x1="22" y1="22" x2="42" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="29" x2="42" y2="29" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="36" x2="36" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Pluma */}
      <path d="M44 14 L54 8 L56 12 L46 22 Z" fill="#ffcfe0" />
      <path d="M44 14 L46 22 L42 20 Z" fill="#e8b4cc" />
      <line x1="46" y1="22" x2="44" y2="26" stroke="#e8b4cc" strokeWidth="1.5" strokeLinecap="round" />
      {/* Corazón pequeño */}
      <path d="M30 44 C30 44 26 41 26 38.5 C26 37 27.5 36 29 37 L30 38 L31 37 C32.5 36 34 37 34 38.5 C34 41 30 44 30 44Z" fill="#ffcfe0" />
    </svg>
  )
}

export default function TabDiario({ students, cedula, phoneLast4 }) {
  const student = students?.[0]
  const [entradas, setEntradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ fecha: todayEC(), contenido: '', estado_animo: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const formRef = useRef(null)
  const containerRef = useRef(null)

  async function loadEntradas() {
    if (!student) return
    setLoading(true)
    const { data } = await getDiarioList(cedula, phoneLast4, student.id, 50)
    setEntradas(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadEntradas() }, [cedula, phoneLast4, student?.id])

  function openNew() {
    setEditing(null)
    setForm({ fecha: todayEC(), contenido: '', estado_animo: null })
    setShowForm(true)
    // Scroll al formulario en el siguiente frame
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function openEdit(entrada) {
    setEditing(entrada)
    setForm({ fecha: entrada.fecha, contenido: entrada.contenido, estado_animo: entrada.estado_animo })
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleSave() {
    if (!form.contenido.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateDiarioEntry(cedula, phoneLast4, student.id, editing.entrada_id, form.contenido, form.estado_animo)
      } else {
        await createDiarioEntry(cedula, phoneLast4, student.id, form.fecha, form.contenido, form.estado_animo)
      }
      setShowForm(false)
      setEditing(null)
      await loadEntradas()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(entradaId) {
    if (!window.confirm('¿Eliminar esta entrada?')) return
    setDeleting(entradaId)
    try {
      await deleteDiarioEntry(cedula, phoneLast4, student.id, entradaId)
      setEntradas(prev => prev.filter(e => e.entrada_id !== entradaId))
    } finally {
      setDeleting(null)
    }
  }

  if (!student) return (
    <div className="flex justify-center py-12 text-gray-400 text-sm">No hay estudiante seleccionado</div>
  )

  return (
    <div className="min-h-screen bg-gray-50" ref={containerRef}>

      {/* Header */}
      <div className="bg-[#551735] px-4 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DiaryIcon className="w-9 h-9 shrink-0" />
          <div>
            <h1 className="font-bold text-lg leading-tight">Mi diario</h1>
            <p className="text-[#e8b4cc] text-xs mt-0.5">Solo tú puedes ver esto</p>
            <p className="text-xs text-white/50 mt-0.5">
              {(() => {
                const h = new Date().getHours()
                return h < 12 ? 'Escribe sobre tu mañana de práctica' : h < 18 ? 'Registra cómo fue tu clase de hoy' : 'Reflexiona sobre tu día de danza'
              })()}
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Nueva entrada
        </button>
      </div>

      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">

        {/* Formulario nueva / editar entrada */}
        {showForm && (
          <div ref={formRef} className="bg-white rounded-2xl shadow-sm border border-[#f9e8f0] p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                {editing ? 'Editar entrada' : 'Nueva entrada'}
              </p>
              <button onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {!editing && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  max={todayEC()}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e4a72]"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-2">¿Cómo te sentiste? <span className="text-gray-400">(opcional)</span></label>
              <div className="flex gap-2 flex-wrap">
                {ANIMOS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setForm(f => ({ ...f, estado_animo: f.estado_animo === a.id ? null : a.id }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs border transition-all ${
                      form.estado_animo === a.id
                        ? 'border-[#9e4a72] bg-[#fdf2f7] text-[#551735] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-[#e8b4cc]'
                    }`}
                  >
                    {a.emoji} {a.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={form.contenido}
              onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))}
              rows={5}
              placeholder="¿Cómo estuvo tu clase? ¿Qué sentiste? ¿Qué te gustó? ¿Qué te costó?"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9e4a72] resize-none"
              autoFocus
            />

            <button
              onClick={handleSave}
              disabled={saving || !form.contenido.trim()}
              className="w-full mt-3 py-2.5 bg-[#6b2145] text-white font-semibold text-sm rounded-xl hover:bg-[#551735] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><Check size={15} /> {editing ? 'Guardar cambios' : 'Guardar entrada'}</>
              )}
            </button>
          </div>
        )}

        {/* Estados: cargando / vacío / lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#e8b4cc] border-t-[#6b2145] rounded-full animate-spin" />
          </div>
        ) : entradas.length === 0 && !showForm ? (
          <div className="text-center py-14 px-4">
            <DiaryIcon className="w-20 h-20 mx-auto mb-4 opacity-60" />
            <p className="text-base font-semibold text-gray-700 mb-1">Tu historia comienza aquí</p>
            <p className="text-xs text-gray-400 mb-5">Escribe sobre tu primera plié, tu primer giro, tu primer momento de libertad.</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6b2145] text-white text-sm font-semibold rounded-xl hover:bg-[#551735] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={15} />
              Escribe tu primera entrada
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entradas.map(e => (
              <div key={e.entrada_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-500 capitalize">{formatFecha(e.fecha)}</p>
                    {e.estado_animo && (
                      <span className="text-base">{ANIMOS.find(a => a.id === e.estado_animo)?.emoji}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(e)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6b2145] transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.entrada_id)}
                      disabled={deleting === e.entrada_id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {deleting === e.entrada_id
                        ? <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{e.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
