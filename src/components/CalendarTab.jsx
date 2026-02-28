import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

// ── helpers (mirror Dashboard) ──────────────────────────────────────────────
function normalizeClassDays(days) {
  if (!days && days !== 0) return []
  if (typeof days === 'string') { try { days = JSON.parse(days) } catch { return [] } }
  if (!Array.isArray(days)) return []
  return days.map(d => { const n = Number(d); return n === 0 ? 7 : n }).filter(d => d >= 1 && d <= 7)
}
const DAY_MAP = {
  lun:1,lunes:1,mar:2,martes:2,'mié':3,mie:3,'miércoles':3,miercoles:3,
  jue:4,jueves:4,vie:5,viernes:5,'sáb':6,sab:6,'sábado':6,sabado:6,dom:7,domingo:7
}
function parseScheduleToDays(s) {
  if (!s) return []
  const words = s.toLowerCase().replace(/[^a-záéíóúüñ]/g, ' ').split(/\s+/)
  const days = []
  for (const w of words) { const d = DAY_MAP[w]; if (d && !days.includes(d)) days.push(d) }
  return days.sort((a, b) => a - b)
}

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_LABELS = ['L','M','X','J','V','S','D']

// ── component ────────────────────────────────────────────────────────────────
export default function CalendarTab({ students: initial, onLogout }) {
  const nowGYE = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))

  const now = nowGYE()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [students, setStudents]   = useState(initial)
  const [selIdx, setSelIdx]       = useState(0)

  // Enrich with class_days if not already present
  useEffect(() => {
    const enrich = async () => {
      try {
        const courseIds = [...new Set(initial.map(s => s.course_id).filter(Boolean))]
        const [infoRes, pubRes] = await Promise.all([
          courseIds.length
            ? supabase.rpc('rpc_get_course_info', { p_course_ids: courseIds })
            : Promise.resolve({ data: [] }),
          supabase.rpc('rpc_public_courses')
        ])
        const byId = {}, byName = {}
        ;(pubRes.data || []).forEach(c => {
          if (c.id) byId[c.id] = c
          const base = (c.name || '').split('|')[0].trim().toLowerCase()
          if (base) byName[base] = c
        })
        ;(infoRes.data || []).forEach(c => { if (c.id) byId[c.id] = { ...byId[c.id], ...c } })
        setStudents(initial.map(s => {
          const base = (s.course_name || '').split('|')[0].trim().toLowerCase()
          const course = byId[s.course_id] || byName[base] || null
          let days = normalizeClassDays(course?.class_days ?? s.class_days)
          if (!days.length) days = parseScheduleToDays(course?.schedule || s.schedule)
          return { ...s, class_days: days }
        }))
      } catch { /* silent */ }
    }
    if (initial.some(s => !normalizeClassDays(s.class_days).length)) enrich()
  }, [])

  const student   = students[selIdx] || students[0]
  const classDays = normalizeClassDays(student?.class_days)
  const today     = nowGYE()

  // Active payment window: [last_payment_date, next_payment_date)
  // Classes outside this window are shown as inactive (not highlighted)
  const cycleStart = student?.last_payment_date
    ? new Date(student.last_payment_date + 'T00:00:00') : null
  const cycleEnd   = student?.next_payment_date
    ? new Date(student.next_payment_date + 'T00:00:00') : null

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const offset      = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7

  const isClass = day => {
    if (!classDays.length) return false
    const date = new Date(viewYear, viewMonth, day)
    // Only mark within the paid cycle
    if (cycleStart && date < cycleStart) return false
    if (cycleEnd   && date >= cycleEnd)  return false
    const iso = date.getDay()
    return classDays.includes(iso === 0 ? 7 : iso)
  }
  const isToday = day =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
  const isPast = day => {
    const d = new Date(viewYear, viewMonth, day); d.setHours(23,59,59); return d < today
  }

  const upcoming = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => isClass(d) && !isPast(d)).length
  const total = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => isClass(d)).length

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1)
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y+1)) : setViewMonth(m => m+1)

  const courseName = (student?.course_name || '').split('|')[0].trim()
  const schedule   = (student?.course_name || '').split('|')[1]?.trim() || ''

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 pt-10 pb-4 safe-top">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0 flex-1 mr-3">
            <h1 className="text-white font-bold text-lg leading-tight">Mi Calendario</h1>
            <p className="text-white/70 text-xs mt-0.5 truncate">{courseName}{schedule ? ` · ${schedule}` : ''}</p>
          </div>
          <button onClick={onLogout} className="p-2 bg-white/20 rounded-full shrink-0">
            <LogOut size={16} className="text-white" />
          </button>
        </div>

        {/* Student selector — only shown when > 1 student */}
        {students.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {students.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelIdx(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  i === selIdx ? 'bg-white text-purple-700' : 'bg-white/20 text-white'
                }`}
              >
                {s.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 max-w-md mx-auto space-y-3">

        {/* ── Calendar card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <p className="font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</p>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-3 pt-3">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400 pb-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-y-1 px-3 pb-4">
            {Array.from({ length: offset }).map((_, i) => <div key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const cls  = isClass(day)
              const tod  = isToday(day)
              const past = isPast(day)
              return (
                <div
                  key={day}
                  className={`
                    relative flex items-center justify-center mx-auto w-9 h-9 rounded-full text-[13px] font-semibold
                    ${cls && tod  ? 'bg-purple-700 text-white ring-2 ring-amber-400 ring-offset-1' : ''}
                    ${cls && !tod && past  ? 'bg-purple-100 text-purple-600' : ''}
                    ${cls && !tod && !past ? 'bg-purple-600 text-white' : ''}
                    ${!cls && tod  ? 'ring-2 ring-amber-400 ring-offset-1 text-gray-700' : ''}
                    ${!cls && !tod ? 'text-gray-400' : ''}
                  `}
                >
                  {day}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="px-4 pb-4 flex gap-4 flex-wrap text-[11px] text-gray-500 border-t border-gray-50 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shrink-0" />Próxima clase
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-100 inline-block shrink-0" />Clase pasada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-amber-400 inline-block shrink-0" />Hoy
            </span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-tight">Clases<br/>este mes</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-tight">Clases<br/>restantes</p>
            <p className="text-2xl font-bold text-purple-500 mt-1">{upcoming}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider leading-tight">Próximo<br/>pago</p>
            <p className="text-sm font-bold text-gray-700 mt-1 leading-tight">
              {student?.next_payment_date
                ? new Date(student.next_payment_date + 'T00:00:00').toLocaleDateString('es-EC',{ day:'2-digit', month:'short' })
                : '—'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
