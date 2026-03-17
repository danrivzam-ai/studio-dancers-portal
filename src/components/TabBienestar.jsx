import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Dumbbell, Zap, HeartPulse, Brain, Music, LayoutGrid } from 'lucide-react'
import { getBienestar } from '../lib/adultas'

export const CATEGORIA_CFG = {
  fortalecimiento:  { label: 'Fortalecimiento', Icon: Dumbbell,   badgeBg: 'bg-teal-100',    badgeText: 'text-teal-700',   iconColor: 'text-teal-600'   },
  estiramiento:     { label: 'Estiramiento',     Icon: Zap,        badgeBg: 'bg-blue-100',    badgeText: 'text-blue-700',   iconColor: 'text-blue-600'   },
  salud:            { label: 'Salud',            Icon: HeartPulse, badgeBg: 'bg-orange-100',  badgeText: 'text-orange-700', iconColor: 'text-orange-500' },
  bienestar_mental: { label: 'Bienestar mental', Icon: Brain,      badgeBg: 'bg-purple-100',  badgeText: 'text-purple-700', iconColor: 'text-purple-600' },
  cultura_ballet:   { label: 'Cultura ballet',   Icon: Music,      badgeBg: 'bg-yellow-100',  badgeText: 'text-yellow-700', iconColor: 'text-yellow-600' },
}

const FILTROS = [
  { id: null,               label: 'Todo',           Icon: LayoutGrid },
  { id: 'fortalecimiento',  label: 'Fuerza',         Icon: Dumbbell   },
  { id: 'estiramiento',     label: 'Estiramiento',   Icon: Zap        },
  { id: 'salud',            label: 'Salud',          Icon: HeartPulse },
  { id: 'bienestar_mental', label: 'Mental',         Icon: Brain      },
  { id: 'cultura_ballet',   label: 'Ballet',         Icon: Music      },
]

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-gray-800 mt-3 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm,  '<h3 class="font-bold text-gray-800 mt-3 mb-1 text-base">$1</h3>')
    .replace(/^- (.+)$/gm,   '<li class="ml-4 list-disc text-gray-700">$1</li>')
    .replace(/\n/g, '<br />')
}

function BienestarCard({ item, expanded, onToggle }) {
  const cfg = CATEGORIA_CFG[item.categoria] || CATEGORIA_CFG.fortalecimiento
  const Icon = cfg.Icon
  const fecha = new Date(item.fecha_publicacion + 'T12:00:00')
    .toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.badgeBg}`}>
            <Icon size={17} className={cfg.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.badgeText}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] text-gray-400">{fecha}</span>
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-snug">{item.titulo}</p>
            {!expanded && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.cuerpo.replace(/[#*_]/g, '').slice(0, 120)}…
              </p>
            )}
          </div>
          {expanded
            ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-0.5" />
            : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-0.5" />
          }
        </div>
      </button>
      {expanded && (
        <div
          className="px-4 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-50 pt-3"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(item.cuerpo) }}
        />
      )}
    </div>
  )
}

export default function TabBienestar({ students, cedula, phoneLast4 }) {
  const student = students?.[0]
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE = 10

  const load = useCallback(async (offset = 0, replace = false) => {
    if (!student) return
    setLoading(true)
    const { data } = await getBienestar(cedula, phoneLast4, student.id, PAGE, offset)
    if (replace) {
      setItems(data)
    } else {
      setItems(prev => [...prev, ...data])
    }
    setHasMore(data.length === PAGE)
    setLoading(false)
  }, [cedula, phoneLast4, student])

  useEffect(() => {
    setPage(0)
    load(0, true)
  }, [load])

  const filtered = filtro ? items.filter(i => i.categoria === filtro) : items

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-700 px-4 py-4 text-white">
        <h1 className="font-bold text-lg leading-tight">Bienestar</h1>
        <p className="text-purple-200 text-xs mt-0.5">Contenido nuevo cada lunes y jueves</p>
      </div>

      <div className="px-4 pt-4 pb-20 max-w-lg mx-auto">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {FILTROS.map(f => {
            const FIcon = f.Icon
            const active = filtro === f.id
            return (
              <button
                key={String(f.id)}
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                <FIcon size={12} />
                {f.label}
              </button>
            )
          })}
        </div>

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Brain size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Pronto habrá contenido aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <BienestarCard
                key={item.publicacion_id}
                item={item}
                expanded={expanded === item.publicacion_id}
                onToggle={() => setExpanded(prev => prev === item.publicacion_id ? null : item.publicacion_id)}
              />
            ))}
            {!filtro && hasMore && (
              <button
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  load(next * PAGE)
                }}
                disabled={loading}
                className="w-full py-3 text-sm text-purple-600 font-medium disabled:opacity-50"
              >
                {loading ? 'Cargando…' : 'Ver más'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
