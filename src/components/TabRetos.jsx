import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Dumbbell, MoveVertical, Scale, Music, Eye, Target } from 'lucide-react'
import { getRetos } from '../lib/adultas'

const CATEGORIA_CFG = {
  fuerza:              { Icon: Dumbbell,      label: 'Fuerza',              iconBg: 'bg-teal-100',   iconColor: 'text-teal-600'   },
  flexibilidad:        { Icon: MoveVertical,  label: 'Flexibilidad',        iconBg: 'bg-blue-100',   iconColor: 'text-blue-600'   },
  equilibrio:          { Icon: Scale,         label: 'Equilibrio',          iconBg: 'bg-amber-100',  iconColor: 'text-amber-600'  },
  musicalidad:         { Icon: Music,         label: 'Musicalidad',         iconBg: 'bg-rose-100',   iconColor: 'text-rose-500'   },
  conciencia_corporal: { Icon: Eye,           label: 'Conciencia corporal', iconBg: 'bg-[#f9e8f0]', iconColor: 'text-[#6b2145]' },
}

function formatSemana(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const fin = new Date(d)
  fin.setDate(fin.getDate() + 6)
  const opts = { day: 'numeric', month: 'short' }
  return `${d.toLocaleDateString('es-EC', opts)} – ${fin.toLocaleDateString('es-EC', opts)}`
}

export default function TabRetos({ students, cedula, phoneLast4 }) {
  const student = students?.[0]
  const [retos, setRetos] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!student) return
    async function load() {
      const { data } = await getRetos(cedula, phoneLast4, student.id, 20)
      setRetos(data)
      setLoading(false)
    }
    load()
  }, [cedula, phoneLast4, student])

  const activo = retos.find(r => r.es_activo)
  const historial = retos.filter(r => !r.es_activo)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#551735] px-4 py-4 text-white">
        <h1 className="font-bold text-lg leading-tight">Retos semanales</h1>
        <p className="text-[#e8b4cc] text-xs mt-0.5">Un nuevo reto cada lunes</p>
        <p className="text-xs text-white/50 mt-0.5">
          {(() => {
            const h = new Date().getHours()
            return h < 12 ? 'Un nuevo día, un nuevo desafío' : h < 18 ? '¿Ya completaste tu reto de hoy?' : 'Cierra el día con un reto cumplido'
          })()}
        </p>
      </div>

      <div className="px-4 pt-5 pb-20 max-w-lg mx-auto space-y-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#e8b4cc] border-t-[#6b2145] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Reto activo */}
            {activo ? (() => {
              const cfg = CATEGORIA_CFG[activo.categoria] || CATEGORIA_CFG.fuerza
              const Icon = cfg.Icon
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-[#f9e8f0] overflow-hidden">
                  {/* Card header — sólido para buen contraste */}
                  <div className="bg-[#551735] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">Reto de esta semana</span>
                    <span className="text-[10px] text-[#e8b4cc]">{formatSemana(activo.semana_inicio)}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                        <Icon size={20} className={cfg.iconColor} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#6b2145] mb-0.5">{cfg.label}</p>
                        <p className="font-bold text-gray-800 text-base leading-snug">{activo.titulo}</p>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{activo.descripcion}</p>
                        {activo.tip_extra && (
                          <div className="mt-3 bg-[#fdf2f7] rounded-xl px-3 py-2.5 flex gap-2">
                            <Target size={14} className="text-[#7e2d55] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#551735] leading-relaxed">{activo.tip_extra}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })() : (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-gray-400">
                <Target size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-gray-500">Nuevo reto disponible el lunes</p>
                <p className="text-xs text-gray-400 mt-1">Mientras tanto, sigue practicando lo aprendido.</p>
                <p className="text-xs text-gray-400 mt-1">Tu constancia en clases es el mayor desafío ganado.</p>
              </div>
            )}

            {/* Historial */}
            {historial.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Retos anteriores</p>
                <div className="space-y-2">
                  {historial.map(r => {
                    const cfg = CATEGORIA_CFG[r.categoria] || CATEGORIA_CFG.fuerza
                    const Icon = cfg.Icon
                    const open = expanded === r.pub_reto_id
                    return (
                      <div key={r.pub_reto_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <button
                          onClick={() => setExpanded(prev => prev === r.pub_reto_id ? null : r.pub_reto_id)}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                            <Icon size={15} className={cfg.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{r.titulo}</p>
                            <p className="text-[10px] text-gray-400">{formatSemana(r.semana_inicio)}</p>
                          </div>
                          {open
                            ? <ChevronUp size={14} className="text-gray-300" />
                            : <ChevronDown size={14} className="text-gray-300" />
                          }
                        </button>
                        {open && (
                          <div className="px-4 pb-3 border-t border-gray-50 pt-2 text-sm text-gray-600 leading-relaxed">
                            {r.descripcion}
                            {r.tip_extra && (
                              <div className="mt-2 flex gap-2 bg-[#fdf2f7] rounded-lg px-3 py-1.5">
                                <Target size={12} className="text-[#7e2d55] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#551735]">{r.tip_extra}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
