import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, Copy, CheckCircle, Upload, Clock, XCircle, History, CreditCard, BookOpen, RefreshCw, Shield, ExternalLink, Banknote, AlertCircle, Bell, MessageCircle, Camera, CalendarDays, Zap, Award, Trophy, TrendingUp, CalendarCheck, Megaphone, Pin, X as XIcon } from 'lucide-react'
import UploadTransfer from './UploadTransfer'
import PaymentHistory from './PaymentHistory'
import MilestoneModal from './MilestoneModal'

// ═══════ FIDELIDAD ═══════
function getLoyaltyTier(consecutiveMonths) {
  const months = parseInt(consecutiveMonths) || 0
  if (months >= 12) return { tier: 'oro',    label: 'Oro',    discount: 15, next: null,     nextMonths: null,        months }
  if (months >= 6)  return { tier: 'plata',  label: 'Plata',  discount: 10, next: 'Oro',   nextMonths: 12 - months, months }
  if (months >= 3)  return { tier: 'bronce', label: 'Bronce', discount: 5,  next: 'Plata', nextMonths: 6 - months,  months }
  return               { tier: null,     label: null,     discount: 0,  next: 'Bronce', nextMonths: 3 - months, months }
}

function LoyaltyCard({ consecutiveMonths }) {
  const loyalty = getLoyaltyTier(consecutiveMonths)
  const months = loyalty.months

  const cfg = (() => {
    if (loyalty.tier === 'oro') return {
      progressMax: 12, progressVal: 12,
      bg: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%)',
      border: '#fcd34d', barFrom: '#f59e0b', barTo: '#d97706',
      label: '#92400e', sub: '#b45309',
      pillBg: '#fef3c7', pillText: '#92400e', pillBorder: '#fcd34d',
      title: 'ORO · 15% de descuento',
      subtitle: '¡Nivel máximo alcanzado! Gracias por tu fidelidad',
      icon: 'trophy',
    }
    if (loyalty.tier === 'plata') return {
      progressMax: 12, progressVal: months,
      bg: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)',
      border: '#cbd5e1', barFrom: '#94a3b8', barTo: '#64748b',
      label: '#334155', sub: '#64748b',
      pillBg: '#f1f5f9', pillText: '#334155', pillBorder: '#cbd5e1',
      title: 'PLATA · 10% de descuento',
      subtitle: `${loyalty.nextMonths} ${loyalty.nextMonths === 1 ? 'mes' : 'meses'} más para Oro · 15%`,
      icon: 'award',
    }
    if (loyalty.tier === 'bronce') return {
      progressMax: 6, progressVal: months,
      bg: 'linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)',
      border: '#fdba74', barFrom: '#f97316', barTo: '#ea580c',
      label: '#9a3412', sub: '#c2410c',
      pillBg: '#ffedd5', pillText: '#9a3412', pillBorder: '#fdba74',
      title: 'BRONCE · 5% de descuento',
      subtitle: `${loyalty.nextMonths} ${loyalty.nextMonths === 1 ? 'mes' : 'meses'} más para Plata · 10%`,
      icon: 'award',
    }
    if (months > 0) return {
      progressMax: 3, progressVal: months,
      bg: 'linear-gradient(135deg,#faf5ff 0%,#f3e8ff 100%)',
      border: '#d8b4fe', barFrom: '#a855f7', barTo: '#7c3aed',
      label: '#6b21a8', sub: '#7c3aed',
      pillBg: '#f3e8ff', pillText: '#6b21a8', pillBorder: '#d8b4fe',
      title: `Racha activa · ${months} ${months === 1 ? 'mes' : 'meses'}`,
      subtitle: `Solo ${loyalty.nextMonths} más para tu descuento Bronce · 5%`,
      icon: 'zap',
    }
    return {
      progressMax: 3, progressVal: 0,
      bg: 'linear-gradient(135deg,#faf5ff 0%,#f5f3ff 100%)',
      border: '#e9d5ff', barFrom: '#c4b5fd', barTo: '#a78bfa',
      label: '#5b21b6', sub: '#7c3aed',
      pillBg: '#f5f3ff', pillText: '#5b21b6', pillBorder: '#e9d5ff',
      title: 'Beneficios por fidelidad',
      subtitle: 'Paga 3 meses seguidos y obtén 5% de descuento',
      icon: 'trending',
    }
  })()

  const pct = Math.min(100, cfg.progressMax > 0 ? (cfg.progressVal / cfg.progressMax) * 100 : 0)

  const Icon = () => {
    if (cfg.icon === 'trophy')   return <Trophy    size={13} color={cfg.label} strokeWidth={2} />
    if (cfg.icon === 'award')    return <Award     size={13} color={cfg.label} strokeWidth={2} />
    if (cfg.icon === 'zap')      return <Zap       size={13} color={cfg.label} strokeWidth={2.5} />
    return                              <TrendingUp size={13} color={cfg.label} strokeWidth={2} />
  }

  return (
    <div className="rounded-xl p-3" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {/* Top row: icon + title + pill */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-[22px] h-[22px] flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: cfg.pillBg, border: `1px solid ${cfg.pillBorder}` }}>
            <Icon />
          </div>
          <span className="text-[11px] font-bold tracking-wide" style={{ color: cfg.label }}>
            {cfg.title}
          </span>
        </div>
        {months > 0 && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-1"
            style={{ background: cfg.pillBg, color: cfg.pillText, border: `1px solid ${cfg.pillBorder}` }}>
            {months} {months === 1 ? 'mes' : 'meses'}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
            minWidth: pct > 0 ? '8px' : '0',
          }}
        />
      </div>

      {/* Bottom: subtitle + counter */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] leading-tight" style={{ color: cfg.sub }}>
          {cfg.subtitle}
        </span>
        <span className="text-[9px] font-semibold tabular-nums flex-shrink-0" style={{ color: cfg.sub }}>
          {cfg.progressVal}/{cfg.progressMax}
        </span>
      </div>
    </div>
  )
}

// ═══════ SKELETON LOADING COMPONENT ═══════
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="h-4 w-32 bg-white/20 rounded-md" />
            <div className="h-3 w-24 bg-white/10 rounded-md mt-1.5" />
          </div>
          <div className="h-5 w-16 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Financial skeleton */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center">
            <div className="skeleton h-2.5 w-16 mb-2" />
            <div className="skeleton h-6 w-20" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center">
            <div className="skeleton h-2.5 w-20 mb-2" />
            <div className="skeleton h-4 w-24 mt-1" />
          </div>
        </div>
        {/* Payment buttons skeleton */}
        <div className="pt-1">
          <div className="skeleton h-2.5 w-24 mb-2" />
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton h-20 w-full rounded-xl" />
            <div className="skeleton h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════ DANCE LOADING SCREEN ═══════
function DanceLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">
      {/* Ballet dancer silhouette animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center"
          style={{ animation: 'dancerFloat 2s ease-in-out infinite' }}>
          <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle cx="35" cy="9" r="4.5" stroke="#7e22ce" strokeWidth="2.2"/>
            {/* Hair bun */}
            <circle cx="39.5" cy="6.5" r="2.2" stroke="#7e22ce" strokeWidth="1.8"/>
            {/* Ponytail */}
            <path d="M41 5 C47 1 53 6 49 13" stroke="#7e22ce" strokeWidth="1.8" strokeLinecap="round"/>
            {/* Torso */}
            <path d="M35 13.5 C34 17 33 21 32 25" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Tutu skirt */}
            <path d="M19 27 C22 21 44 21 47 27 C50 33 44 37 32 36.5 C20 37 14 33 19 27Z" stroke="#7e22ce" strokeWidth="2"/>
            {/* Left arm raised up */}
            <path d="M31 19 C27 15 22 11 17 9" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Right arm extended */}
            <path d="M38 19 C43 20 50 19 54 17" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Left leg down */}
            <path d="M28 36.5 C26 41 23 47 21 53" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Right leg arabesque */}
            <path d="M36 36.5 C41 39 47 43 53 47" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Sparkle ✦ top-left (large) */}
            <path d="M10 19 L12 25 L10 31 L8 25Z M5.5 25 L10 23.5 L14.5 25 L10 26.5Z" fill="#7e22ce"/>
            {/* Sparkle ✦ top-right (medium) */}
            <path d="M53 10 L54.5 14.5 L53 19 L51.5 14.5Z M49 14.5 L53 13.2 L57 14.5 L53 15.8Z" fill="#7e22ce"/>
            {/* Sparkle ✦ bottom-left (small) */}
            <path d="M8 47 L9.2 51 L8 55 L6.8 51Z M5 51 L8 50.2 L11 51 L8 51.8Z" fill="#7e22ce"/>
            {/* Sparkle ✦ bottom-right (medium) */}
            <path d="M54 43 L55.4 47.5 L54 52 L52.6 47.5Z M51 47.5 L54 46.2 L57 47.5 L54 48.8Z" fill="#7e22ce"/>
          </svg>
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-300"
          style={{ animation: 'pirouette 1.2s linear infinite' }} />
      </div>

      <p className="text-purple-800 font-semibold text-base mb-1">Cargando tu portal</p>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            style={{ animation: `dotWave 1.4s ease-in-out ${i * 0.16}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

// ═══════ CLASES ESTIMADAS: cuenta días de clase desde el último pago ═══════
// class_days usa ISO weekday: 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb 7=Dom
// "hoy" se calcula en timezone Guayaquil (UTC-5, sin DST) para consistencia con el calendario

// Normalize class_days — handles: array of numbers, array of strings, JSON string "[2,4]", null
// Admin stores 0=Dom,1=Lun,...,6=Sáb; portal uses ISO 1=Lun,...,7=Dom — remap 0→7
function normalizeClassDays(days) {
  if (!days && days !== 0) return []
  if (typeof days === 'string') {
    try { days = JSON.parse(days) } catch { return [] }
  }
  if (!Array.isArray(days)) return []
  return days
    .map(d => { const n = Number(d); return n === 0 ? 7 : n }) // remap Sunday 0→7
    .filter(d => d >= 1 && d <= 7)
}

// Parse class days from schedule text as last resort
// e.g. "Martes y Jueves 7:00" → [2, 4]
const SCHEDULE_DAY_MAP = {
  lun:1, lunes:1, mar:2, martes:2,
  'mié':3, mie:3, 'miércoles':3, miercoles:3,
  jue:4, jueves:4, vie:5, viernes:5,
  'sáb':6, sab:6, 'sábado':6, sabado:6, dom:7, domingo:7
}
function parseScheduleToDays(schedule) {
  if (!schedule) return []
  const words = schedule.toLowerCase().replace(/[^a-záéíóúüñ]/g, ' ').split(/\s+/)
  const days = []
  for (const w of words) {
    const d = SCHEDULE_DAY_MAP[w]
    if (d && !days.includes(d)) days.push(d)
  }
  return days.sort((a, b) => a - b)
}

function computeEstimatedClasses(lastPaymentDate, classDays, totalPerCycle) {
  const days = normalizeClassDays(classDays)
  if (!lastPaymentDate || !days.length) return 0
  const start = new Date(lastPaymentDate + 'T00:00:00')
  const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
  todayGYE.setHours(0, 0, 0, 0)
  let count = 0
  const d = new Date(start)
  while (d <= todayGYE) {
    const isoDay = d.getDay() === 0 ? 7 : d.getDay()
    if (days.includes(isoDay)) count++
    d.setDate(d.getDate() + 1)
  }
  return totalPerCycle ? Math.min(count, totalPerCycle) : count
}

// Counts how many class days fall within 1 month from lastPaymentDate
// Used as fallback total when classes_per_cycle is not set in the DB
function computeMonthlyTotal(lastPaymentDate, classDays) {
  const days = normalizeClassDays(classDays)
  if (!lastPaymentDate || !days.length) return 0
  const start = new Date(lastPaymentDate + 'T00:00:00')
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  let count = 0
  const d = new Date(start)
  while (d < end) {
    const isoDay = d.getDay() === 0 ? 7 : d.getDay()
    if (days.includes(isoDay)) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

// Returns the label for the student's next class day in Guayaquil TZ
// Returns: 'Hoy', 'Mañana', or e.g. 'lunes 3 de marzo'
function getNextClassDate(classDays) {
  const days = normalizeClassDays(classDays)
  if (!days.length) return null
  const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
  todayGYE.setHours(0, 0, 0, 0)
  for (let i = 0; i <= 7; i++) {
    const d = new Date(todayGYE)
    d.setDate(d.getDate() + i)
    const isoDay = d.getDay() === 0 ? 7 : d.getDay()
    if (days.includes(isoDay)) {
      if (i === 0) return 'Hoy'
      if (i === 1) return 'Mañana'
      return d.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })
    }
  }
  return null
}

// ═══════ CLASS CALENDAR MODAL ═══════
// Shows current month with class days highlighted — timezone: America/Guayaquil (UTC-5)
function ClassCalendar({ student, onClose }) {
  const classDays = normalizeClassDays(student.class_days) // ISO: 1=Lun ... 7=Dom

  // Current date in Guayaquil timezone
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-indexed

  const todayInGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))

  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const dayNames = ['L','M','X','J','V','S','D']

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  // First weekday of month: 0=Sun…6=Sat → convert to Mon-first: 0=Mon…6=Sun
  const firstDayJS = new Date(viewYear, viewMonth, 1).getDay()
  const offset = (firstDayJS + 6) % 7 // how many blanks before day 1

  const isClassDay = (day) => {
    const d = new Date(viewYear, viewMonth, day)
    const jsDay = d.getDay() // 0=Sun..6=Sat
    const isoDay = jsDay === 0 ? 7 : jsDay
    return classDays.includes(isoDay)
  }

  const isToday = (day) =>
    day === todayInGYE.getDate() &&
    viewMonth === todayInGYE.getMonth() &&
    viewYear === todayInGYE.getFullYear()

  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(23, 59, 59)
    return d < todayInGYE
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Count upcoming class days this month
  const upcomingClasses = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(d => isClassDay(d) && !isPast(d)).length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">{student.name.split(' ')[0]} · Días de clase</p>
            <p className="text-white/70 text-xs">{student.course_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-white/20 rounded-full">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
              <path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <p className="font-bold text-gray-800 text-sm">{monthNames[viewMonth]} {viewYear}</p>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-3 pt-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 pb-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px px-3 pb-3">
          {/* Offset blanks */}
          {Array.from({ length: offset }).map((_, i) => <div key={`b${i}`} />)}

          {/* Days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const cls = isClassDay(day)
            const today = isToday(day)
            const past = isPast(day)
            return (
              <div
                key={day}
                className={`
                  relative flex items-center justify-center aspect-square rounded-full text-xs font-semibold
                  ${cls && !today ? (past ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800 border-2 border-purple-500') : ''}
                  ${today && cls ? 'bg-purple-700 text-white ring-2 ring-amber-400 ring-offset-1' : ''}
                  ${today && !cls ? 'ring-2 ring-amber-400 ring-offset-1 text-gray-700' : ''}
                  ${!cls && !today ? 'text-gray-500' : ''}
                `}
              >
                {day}
                {cls && !today && !past && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600" />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend + stats */}
        <div className="px-4 py-3 bg-purple-50 border-t border-purple-100 space-y-2">
          <div className="flex gap-3 flex-wrap text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-700 inline-block" />Clase pasada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-purple-100 border-2 border-purple-500 inline-block" />Próxima clase
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full ring-2 ring-amber-400 inline-block bg-white" />Hoy
            </span>
          </div>
          {upcomingClasses > 0 && (
            <p className="text-xs font-semibold text-purple-700">
              📅 {upcomingClasses} {upcomingClasses === 1 ? 'clase próxima' : 'clases próximas'} este mes
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════ PAYPHONE RETURN BANNER ═══════
function PayphoneReturnBanner({ onConfirm, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-5 text-center">
          <div className="w-14 h-14 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard size={26} className="text-white" />
          </div>
          <p className="font-bold text-white text-lg leading-tight">¿Completaste tu pago?</p>
          <p className="text-[12px] text-white/80 mt-1">Notifica al estudio para que lo verifiquen</p>
        </div>
        {/* Acciones */}
        <div className="flex gap-3 p-4">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            No aún
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Bell size={15} />
            Sí, notificar
          </button>
        </div>
      </div>
    </div>
  )
}

const STUDIO_WHATSAPP = '593963741884'

// ═══════ AVATAR HELPERS ═══════

// Compress image to max 400px square, JPEG 75% — lightweight for profile photos
async function compressAvatar(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 400
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(resolve, 'image/jpeg', 0.75)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// Get public URL for avatar — Supabase Storage, bucket: avatars, path: {studentId}.jpg
function getAvatarUrl(studentId, ts) {
  const { data } = supabase.storage.from('avatars').getPublicUrl(`${studentId}.jpg`)
  return ts ? `${data.publicUrl}?t=${ts}` : data.publicUrl
}

// ═══════ MAIN DASHBOARD ═══════
export default function Dashboard({ students: initialStudents, cedula, phoneLast4, onLogout, onSessionUpdate }) {
  const [liveStudents, setLiveStudents] = useState(initialStudents)
  const students = liveStudents
  const [bankInfo, setBankInfo] = useState(null)
  const [requests, setRequests] = useState({})
  const [showUpload, setShowUpload] = useState(null)
  const [showHistory, setShowHistory] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedPayment, setExpandedPayment] = useState({})
  const [selectedBankIdx, setSelectedBankIdx] = useState({})
  const [ppConfirm, setPpConfirm] = useState({})
  const [ppLoading, setPpLoading] = useState({})
  const [ppSuccess, setPpSuccess] = useState({})
  const [ppError, setPpError] = useState({})
  const [ppAmount, setPpAmount] = useState({})
  const [copiedField, setCopiedField] = useState(null)
  // Avatar photo state (Storage-only, no DB column needed)
  const [photoTimestamp, setPhotoTimestamp] = useState({})   // cache-bust key after upload
  const [photoUploading, setPhotoUploading] = useState({})   // upload in progress flag
  const [photoError, setPhotoError] = useState({})           // true=no photo/failed, false=loaded OK
  const avatarInputRefs = useRef({})                          // hidden file inputs per student
  // Milestone celebration modal — { tier, studentName } or null
  const [milestone, setMilestone] = useState(null)
  // Calendar modal
  const [calendarStudent, setCalendarStudent] = useState(null)
  // Track which modal is open — used by back-button handler to close modals natively
  const modalHistoryRef = useRef(null)  // 'upload' | 'history' | 'calendar' | null
  // PayPhone return detection
  const [showReturnBanner, setShowReturnBanner] = useState(false)
  const payphoneOpenedRef = useRef(false)
  // Tablón de anuncios — dismiss es solo por sesión (vuelve a aparecer al reabrir la app)
  const [announcements, setAnnouncements] = useState([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState(new Set())

  // Fetch bank info
  useEffect(() => {
    const fetchBank = async () => {
      const { data } = await supabase.rpc('rpc_client_get_bank_info')
      if (data && data.length > 0) setBankInfo(data[0])
    }
    fetchBank()
  }, [])

  // Auto-refresh student data (payment status, balance, classes, etc.)
  // Runs on mount + every 30s + after any payment action
  useEffect(() => {
    const refreshStudents = async () => {
      try {
        const { data, error } = await supabase.rpc('rpc_client_login', {
          p_cedula: cedula,
          p_phone_last4: phoneLast4
        })
        if (!error && data && data.length > 0) {
          // Load ALL public courses — index by id AND by base name for robust matching
          // (rpc_client_login may not return course_id, so name match is essential fallback)
          const courseIds = [...new Set(data.map(s => s.course_id).filter(Boolean))]
          const [infoRes, pubRes] = await Promise.all([
            courseIds.length
              ? supabase.rpc('rpc_get_course_info', { p_course_ids: courseIds })
              : Promise.resolve({ data: [] }),
            supabase.rpc('rpc_public_courses')
          ])

          const courseById = {}
          const courseByName = {}
          ;(pubRes.data || []).forEach(c => {
            if (c.id) courseById[c.id] = c
            // Index by base name (strip "| schedule" suffix if any)
            const base = (c.name || '').split('|')[0].trim().toLowerCase()
            if (base) courseByName[base] = c
          })
          // Overlay rpc_get_course_info (adds class_days if it exists)
          ;(infoRes.data || []).forEach(c => {
            if (c.id) courseById[c.id] = { ...courseById[c.id], ...c }
          })

          // Enrich each student — match course by id, then by name, then parse schedule text
          const enriched = data.map(s => {
            const sBase = (s.course_name || '').split('|')[0].trim().toLowerCase()
            const course = courseById[s.course_id] || courseByName[sBase] || null
            let classDays = normalizeClassDays(course?.class_days ?? s.class_days)
            if (!classDays.length) classDays = parseScheduleToDays(course?.schedule || s.schedule)
            const classesPer = course?.classes_per_cycle ?? s.classes_per_cycle ?? 0
            const priceType = course?.price_type || s.price_type || null
            const classes_used = (s.classes_used != null && s.classes_used > 0)
              ? s.classes_used
              : computeEstimatedClasses(s.last_payment_date, classDays, classesPer)
            return { ...s, classes_used, classes_per_cycle: classesPer, class_days: classDays, price_type: priceType }
          })
          setLiveStudents(enriched)
          onSessionUpdate?.(enriched)
        }
      } catch { /* silent */ }
    }
    // Refresh immediately (get latest status)
    refreshStudents()
    // Then every 30 seconds
    const interval = setInterval(refreshStudents, 30000)
    return () => clearInterval(interval)
  }, [cedula, phoneLast4, refreshKey])

  // ─── Milestone detection ───
  // After every live-student refresh, check if any student just reached a tier
  // threshold for the first time. Show celebration modal once per tier per student.
  useEffect(() => {
    if (!liveStudents?.length) return
    const TIERS = [
      { tier: 'oro',    months: 12 },
      { tier: 'plata',  months: 6  },
      { tier: 'bronce', months: 3  },
    ]
    for (const s of liveStudents) {
      const m = parseInt(s.consecutive_months) || 0
      if (!m) continue
      for (const { tier, months } of TIERS) {
        if (m >= months) {
          const key = `sd_milestone_${s.id}_${tier}`
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, '1')
            setMilestone({ tier, studentName: s.name })
            return // show one at a time
          }
          break // only show the highest unlocked tier not yet seen
        }
      }
    }
  }, [liveStudents])

  // Fetch transfer requests + end loading (with timeout safety)
  useEffect(() => {
    // Safety: force loading false after 8s to prevent infinite load screens
    const safetyTimer = setTimeout(() => setLoading(false), 8000)
    const fetchRequests = async () => {
      try {
        const allReqs = {}
        for (const s of students) {
          const { data } = await supabase.rpc('rpc_client_get_requests', {
            p_cedula: cedula,
            p_phone_last4: phoneLast4,
            p_student_id: s.id
          })
          allReqs[s.id] = data || []
        }
        setRequests(allReqs)
      } catch { /* silent — requests are optional display info */ }
      finally { clearTimeout(safetyTimer); setLoading(false) }
    }
    fetchRequests()
    return () => clearTimeout(safetyTimer)
  }, [students, cedula, phoneLast4, refreshKey])

  // Fetch active announcements
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data) })
  }, [])

  // ─── PayPhone return detection ───
  // When user taps "Pagar con Tarjeta" link, we flag it.
  // When user comes back (visibility change), we show the banner.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && payphoneOpenedRef.current) {
        payphoneOpenedRef.current = false
        // Small delay to let the app stabilize
        setTimeout(() => setShowReturnBanner(true), 600)
      }
    }

    // Also check sessionStorage in case the app was killed/reloaded
    const ppFlag = sessionStorage.getItem('pp_payment_started')
    if (ppFlag) {
      sessionStorage.removeItem('pp_payment_started')
      setTimeout(() => setShowReturnBanner(true), 800)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // ─── Modal back-button support ───
  // Each modal pushes a history entry on open. Pressing the Android/iOS back
  // button fires popstate → this handler closes the modal instead of navigating away.
  // Tapping X inside a modal also calls history.back() → same handler closes it cleanly.
  useEffect(() => {
    const handleModalBack = () => {
      const type = modalHistoryRef.current
      if (!type) return
      modalHistoryRef.current = null
      if (type === 'upload')   { setShowUpload(null); setRefreshKey(k => k + 1) }
      if (type === 'history')  { setShowHistory(null) }
      if (type === 'calendar') { setCalendarStudent(null) }
    }
    window.addEventListener('popstate', handleModalBack)
    return () => window.removeEventListener('popstate', handleModalBack)
  }, [])

  // Open helpers — push history so back button can close the modal
  const openUpload = (sid) => {
    modalHistoryRef.current = 'upload'
    history.pushState({ modal: 'upload' }, '')
    setShowUpload(sid)
  }
  const openHistoryModal = (sid) => {
    modalHistoryRef.current = 'history'
    history.pushState({ modal: 'history' }, '')
    setShowHistory(sid)
  }
  const openCalendarModal = (student) => {
    modalHistoryRef.current = 'calendar'
    history.pushState({ modal: 'calendar' }, '')
    setCalendarStudent(student)
  }
  // Close helpers — go back in history → popstate handler does the actual state cleanup
  const closeUpload   = () => { history.back() }
  const closeHistoryModal = () => { history.back() }
  const closeCalendarModal = () => { history.back() }

  const handlePayphoneLinkClick = () => {
    payphoneOpenedRef.current = true
    sessionStorage.setItem('pp_payment_started', '1')
  }

  const handleReturnConfirm = () => {
    setShowReturnBanner(false)
    // Auto-expand card payment for first student and show confirm form
    const firstStudent = students[0]
    if (firstStudent) {
      setExpandedPayment(prev => ({ ...prev, [firstStudent.id]: 'card' }))
      setPpConfirm(prev => ({ ...prev, [firstStudent.id]: true }))
      // Scroll to student card
      setTimeout(() => {
        document.getElementById(`student-${firstStudent.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  const handleAvatarChange = async (studentId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''   // allow re-selecting same file
    setPhotoUploading(prev => ({ ...prev, [studentId]: true }))
    try {
      const blob = await compressAvatar(file)
      const { error } = await supabase.storage
        .from('avatars')
        .upload(`${studentId}.jpg`, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      // Cache-bust so browser reloads the new photo
      setPhotoError(prev => ({ ...prev, [studentId]: false }))
      setPhotoTimestamp(prev => ({ ...prev, [studentId]: Date.now() }))
    } catch (err) {
      console.error('[Avatar] Upload error:', err)
    } finally {
      setPhotoUploading(prev => ({ ...prev, [studentId]: false }))
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Al día', color: 'bg-green-100 text-green-700' }
    if (status === 'partial') return { label: 'Abono parcial', color: 'bg-yellow-100 text-yellow-700' }
    if (status === 'pending') return { label: 'Pendiente', color: 'bg-red-100 text-red-700' }
    return { label: status || 'N/A', color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Por definir'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const isCycleBased = (student) => {
    const pt = student.price_type
    return pt === 'paquete' || pt === 'programa' || pt === 'clase'
  }

  const togglePaymentMethod = (studentId, method) => {
    setExpandedPayment(prev => ({
      ...prev,
      [studentId]: prev[studentId] === method ? null : method
    }))
  }

  const handlePayphoneConfirm = async (studentId) => {
    const amount = ppAmount[studentId]
    setPpError(prev => ({ ...prev, [studentId]: '' }))

    if (!amount || parseFloat(amount) <= 0) {
      setPpError(prev => ({ ...prev, [studentId]: 'Ingrese el monto pagado' }))
      return
    }

    setPpLoading(prev => ({ ...prev, [studentId]: true }))
    try {
      const { error: rpcError } = await supabase.rpc('rpc_client_submit_transfer', {
        p_cedula: cedula,
        p_phone_last4: phoneLast4,
        p_student_id: studentId,
        p_amount: parseFloat(amount),
        p_bank_name: 'PayPhone (Tarjeta)',
        p_receipt_image_url: null,
        p_notes: 'Pago con tarjeta vía PayPhone'
      })
      if (rpcError) throw rpcError
      setPpSuccess(prev => ({ ...prev, [studentId]: true }))
      setRefreshKey(k => k + 1)
      setTimeout(() => {
        setPpSuccess(prev => ({ ...prev, [studentId]: false }))
        setPpConfirm(prev => ({ ...prev, [studentId]: false }))
        setPpAmount(prev => ({ ...prev, [studentId]: '' }))
      }, 3000)
    } catch (err) {
      console.error('PayPhone confirm error:', err)
      setPpError(prev => ({ ...prev, [studentId]: 'Error al registrar. Intente de nuevo.' }))
    } finally {
      setPpLoading(prev => ({ ...prev, [studentId]: false }))
    }
  }

  // ═══════ LOADING STATE ═══════
  if (loading) {
    return <DanceLoader />
  }

  return (
    <div className="min-h-screen bg-gray-100 animate-fadeIn">
      {/* PayPhone Return Banner */}
      {showReturnBanner && (
        <PayphoneReturnBanner
          onConfirm={handleReturnConfirm}
          onDismiss={() => setShowReturnBanner(false)}
        />
      )}

      {/* Milestone celebration modal */}
      {milestone && (
        <MilestoneModal
          tier={milestone.tier}
          studentName={milestone.studentName}
          onClose={() => setMilestone(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{bankInfo?.school_name || 'Studio Dancers'}</h1>
            <p className="text-xs text-white/70">
              {students.length === 1 ? students[0].name : `${students.length} alumno${students.length > 1 ? 's' : ''} registrado${students.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Salir"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* Prominent payment reminder banner */}
        {(() => {
          const urgentStudents = students.filter(s => {
            if (!s.next_payment_date) return false
            const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
            todayGYE.setHours(0, 0, 0, 0)
            const due = new Date(s.next_payment_date + 'T00:00:00')
            const days = Math.round((due - todayGYE) / (1000 * 60 * 60 * 24))
            // Overdue: siempre mostrar (DB no resetea payment_status al terminar el ciclo)
            if (days < 0) return true
            // Próximo ≤5 días: solo si aún no ha pagado este ciclo
            return days <= 5 && s.payment_status !== 'paid'
          })
          if (!urgentStudents.length) return null
          const overdue = urgentStudents.filter(s => {
            const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
            todayGYE.setHours(0, 0, 0, 0)
            return new Date(s.next_payment_date + 'T00:00:00') < todayGYE
          })
          const isOverdue = overdue.length > 0
          return (
            <div className={`rounded-2xl p-4 flex items-start gap-3 shadow-sm border ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOverdue ? 'bg-rose-100' : 'bg-amber-100'}`}>
                <Bell size={20} className={isOverdue ? 'text-rose-600' : 'text-amber-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isOverdue ? 'text-rose-800' : 'text-amber-800'}`}>
                  {isOverdue ? 'Tu membresía venció' : 'Es momento de renovar'}
                </p>
                {urgentStudents.map(s => {
                  const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
                  todayGYE.setHours(0, 0, 0, 0)
                  const due = new Date(s.next_payment_date + 'T00:00:00')
                  const days = Math.round((due - todayGYE) / (1000 * 60 * 60 * 24))
                  return (
                    <p key={s.id} className={`text-xs mt-0.5 ${isOverdue ? 'text-rose-700' : 'text-amber-700'}`}>
                      {s.name} · {days < 0 ? `Venció hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}` : days === 0 ? 'Vence hoy' : `Vence en ${days} día${days !== 1 ? 's' : ''}`}
                    </p>
                  )
                })}
                <p className={`text-xs mt-1.5 font-medium ${isOverdue ? 'text-rose-600' : 'text-amber-600'}`}>
                  {isOverdue ? 'Renueva para seguir disfrutando tus clases.' : 'Renueva tu membresía antes de que venza.'}
                </p>
              </div>
            </div>
          )
        })()}

        {/* Student Cards */}
        {students.map((student, idx) => {
          const badge = getStatusBadge(student.payment_status)
          const studentRequests = requests[student.id] || []
          const pendingReqs = studentRequests.filter(r => r.status === 'pending')
          const cycleMode = isCycleBased(student)
          const classesUsed = student.classes_used || 0
          // If classes_per_cycle is not stored, compute it from the monthly calendar
          const classesTotal = student.classes_per_cycle > 0
            ? student.classes_per_cycle
            : computeMonthlyTotal(student.last_payment_date, student.class_days)
          // Show counter/calendar for any course that has a schedule (class_days) defined
          const hasClassInfo = student.class_days?.length > 0
          const activeMethod = expandedPayment[student.id]
          // Parse schedule suffix from course_name (e.g. "Ballet Adultas | L - M" → "L - M")
          const scheduleLabel = (() => {
            const parts = (student.course_name || '').split(' | ')
            return parts.length > 1 ? parts[parts.length - 1].trim() : null
          })()
          // Next class date label (only for monthly students with class_days)
          const nextClassLabel = (!cycleMode && hasClassInfo)
            ? getNextClassDate(student.class_days)
            : null
          // Payment reminder: days until next payment (negative = overdue)
          const daysUntilPayment = (() => {
            if (!student.next_payment_date || student.payment_status === 'paid') return null
            const todayGYE = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }))
            todayGYE.setHours(0, 0, 0, 0)
            const due = new Date(student.next_payment_date + 'T00:00:00')
            return Math.round((due - todayGYE) / (1000 * 60 * 60 * 24))
          })()

          return (
            <div
              key={student.id}
              id={`student-${student.id}`}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both` }}
            >
              {/* ───── Student Identity + Status ───── */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar circle — tap to change photo */}
                    <button
                      onClick={() => avatarInputRefs.current[student.id]?.click()}
                      className="relative w-10 h-10 rounded-full shrink-0 overflow-visible flex items-center justify-center"
                      title="Cambiar foto de perfil"
                    >
                      {/* Circle container */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center relative">
                        {/* Spinner while uploading */}
                        {photoUploading[student.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                            <div
                              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                              style={{ animation: 'pirouette 0.8s linear infinite' }}
                            />
                          </div>
                        )}
                        {/* Photo — invisible until loaded; stays hidden on error */}
                        <img
                          src={getAvatarUrl(student.id, photoTimestamp[student.id])}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                          style={{ opacity: photoError[student.id] === false ? 1 : 0 }}
                          onLoad={() => setPhotoError(prev => ({ ...prev, [student.id]: false }))}
                          onError={() => setPhotoError(prev => ({ ...prev, [student.id]: true }))}
                        />
                        {/* Initials fallback — shows when photo hasn't loaded or errored */}
                        {photoError[student.id] !== false && (
                          <span className="text-white font-bold text-sm select-none">
                            {student.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Camera badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-purple-200">
                        <Camera size={9} className="text-purple-600" />
                      </div>
                    </button>

                    {/* Name + course */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{student.name}</h3>
                      <p className="text-xs text-white/70 mt-0.5">{student.course_name}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Hidden file input — no capture attr so user can pick gallery or camera */}
                <input
                  type="file"
                  accept="image/*"
                  ref={el => { avatarInputRefs.current[student.id] = el }}
                  onChange={(e) => handleAvatarChange(student.id, e)}
                  className="hidden"
                />
              </div>

              <div className="p-4 space-y-3">
                {/* ───── Tu próxima clase ───── */}
                {nextClassLabel && (
                  <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 ${
                    nextClassLabel === 'Hoy'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : nextClassLabel === 'Mañana'
                        ? 'bg-gradient-to-r from-teal-400 to-cyan-500'
                        : 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={14} className={nextClassLabel === 'Hoy' || nextClassLabel === 'Mañana' ? 'text-white' : 'text-teal-600'} />
                      <span className={`text-[10px] uppercase font-semibold tracking-wider ${nextClassLabel === 'Hoy' || nextClassLabel === 'Mañana' ? 'text-white/80' : 'text-teal-600'}`}>
                        Tu próxima clase
                      </span>
                    </div>
                    <span className={`text-sm font-bold capitalize ${nextClassLabel === 'Hoy' || nextClassLabel === 'Mañana' ? 'text-white' : 'text-teal-700'}`}>
                      {nextClassLabel}
                    </span>
                  </div>
                )}

                {/* ───── Financial Summary ───── */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-purple-600 uppercase font-medium tracking-wider">
                      {cycleMode ? 'Inversión' : 'Mensualidad'}
                    </p>
                    <p className="text-xl font-bold text-purple-800 mt-0.5">
                      ${parseFloat(student.monthly_fee || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wider flex items-center justify-center gap-1">
                      {cycleMode ? (
                        <>
                          <RefreshCw size={9} />
                          Renovación
                        </>
                      ) : (
                        'Próximo pago'
                      )}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${student.next_payment_date ? 'text-gray-800' : 'text-gray-400'}`}>
                      {formatDate(student.next_payment_date)}
                    </p>
                  </div>
                </div>

                {/* Last payment info */}
                {student.last_payment_date && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-green-600 uppercase font-medium tracking-wider">Último pago</span>
                    <span className="text-xs font-semibold text-green-700">{formatDate(student.last_payment_date)}</span>
                  </div>
                )}

                {/* Fidelidad badge — solo para alumnas con mensualidad recurrente */}
                {!cycleMode && <LoyaltyCard consecutiveMonths={student.consecutive_months || 0} />}

                {/* Balance Alert */}
                {student.balance > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Saldo pendiente</p>
                      <p className="text-lg font-bold text-amber-700">${parseFloat(student.balance).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Recordatorio de pago */}
                {daysUntilPayment !== null && daysUntilPayment <= 3 && (
                  <div className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border ${
                    daysUntilPayment < 0
                      ? 'bg-rose-50 border-rose-200'
                      : daysUntilPayment === 0
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-amber-50 border-amber-200'
                  }`}>
                    <Bell size={14} className={
                      daysUntilPayment < 0 ? 'text-rose-500' :
                      daysUntilPayment === 0 ? 'text-orange-500' : 'text-amber-500'
                    } />
                    <p className={`text-xs font-medium flex-1 ${
                      daysUntilPayment < 0 ? 'text-rose-700' :
                      daysUntilPayment === 0 ? 'text-orange-700' : 'text-amber-700'
                    }`}>
                      {daysUntilPayment < 0
                        ? `Tu pago venció hace ${Math.abs(daysUntilPayment)} día${Math.abs(daysUntilPayment) !== 1 ? 's' : ''}`
                        : daysUntilPayment === 0
                          ? 'Tu pago vence hoy'
                          : daysUntilPayment === 1
                            ? 'Tu pago vence mañana'
                            : `Tu pago vence en ${daysUntilPayment} días`}
                    </p>
                  </div>
                )}

                {/* Classes Info — solo para alumnas con mensualidad recurrente */}
                {hasClassInfo && !cycleMode && (
                  <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-purple-600 uppercase font-medium tracking-wider flex items-center gap-1.5">
                      <BookOpen size={10} className="shrink-0" />
                      {scheduleLabel ? `${scheduleLabel} · Clase` : 'Clases del mes'}
                    </span>
                    <span className="text-xs font-semibold text-purple-700">{classesUsed}/{classesTotal}</span>
                  </div>
                )}

                {/* Pending requests */}
                {pendingReqs.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2">
                    <Clock size={14} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700">
                      {pendingReqs.length} pago{pendingReqs.length > 1 ? 's' : ''} pendiente{pendingReqs.length > 1 ? 's' : ''} de verificación
                    </p>
                  </div>
                )}

                {/* ═══════ PAYMENT OPTIONS ═══════ */}
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-2">Realizar pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Transfer */}
                    <button
                      onClick={() => togglePaymentMethod(student.id, 'transfer')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        activeMethod === 'transfer'
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        activeMethod === 'transfer' ? 'bg-purple-600' : 'bg-purple-100'
                      }`}>
                        <Banknote size={18} className={activeMethod === 'transfer' ? 'text-white' : 'text-purple-600'} />
                      </div>
                      <span className={`text-xs font-semibold ${activeMethod === 'transfer' ? 'text-purple-700' : 'text-gray-700'}`}>
                        Transferencia
                      </span>
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => togglePaymentMethod(student.id, 'card')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        activeMethod === 'card'
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        activeMethod === 'card' ? 'bg-green-600' : 'bg-green-100'
                      }`}>
                        <CreditCard size={18} className={activeMethod === 'card' ? 'text-white' : 'text-green-600'} />
                      </div>
                      <span className={`text-xs font-semibold ${activeMethod === 'card' ? 'text-green-700' : 'text-gray-700'}`}>
                        Tarjeta
                      </span>
                    </button>
                  </div>

                  {/* ── Transfer Expanded ── */}
                  {activeMethod === 'transfer' && (
                    <div className="mt-3 bg-purple-50 rounded-xl border border-purple-200 overflow-hidden animate-slideDown">
                      {bankInfo?.bank_account_number && (() => {
                        const allBanks = [
                          { short: bankInfo.bank_name, name: bankInfo.bank_name, account: bankInfo.bank_account_number, type: bankInfo.bank_account_type, holder: bankInfo.bank_account_holder },
                          { short: 'Produbanco', name: 'Produbanco', account: '20007543342', type: 'Cuenta de Ahorros', holder: bankInfo.bank_account_holder },
                          { short: 'Pacífico', name: 'Banco del Pacífico', account: '1040219097', type: 'Cuenta de Ahorros', holder: bankInfo.bank_account_holder },
                        ]
                        const bIdx = selectedBankIdx[student.id] ?? 0
                        const bank = allBanks[bIdx]
                        return (
                          <div className="p-3 space-y-2">
                            <p className="text-[10px] text-purple-600 uppercase font-semibold tracking-wider">Datos bancarios</p>
                            {/* Bank selector chips */}
                            <div className="flex gap-1.5">
                              {allBanks.map((b, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelectedBankIdx(prev => ({ ...prev, [student.id]: i }))}
                                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors truncate px-1 ${
                                    bIdx === i
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-100 active:bg-purple-200'
                                  }`}
                                >
                                  {b.short}
                                </button>
                              ))}
                            </div>
                            {/* Selected bank details */}
                            <div className="space-y-1">
                              {[
                                { label: 'Banco', value: bank.name, key: `banco-${student.id}-${bIdx}` },
                                { label: 'Nro. Cuenta', value: bank.account, key: `cuenta-${student.id}-${bIdx}`, mono: true },
                                { label: 'Tipo', value: bank.type, key: `tipo-${student.id}-${bIdx}` },
                                { label: 'Titular', value: bank.holder, key: `titular-${student.id}-${bIdx}` },
                                { label: 'Cédula', value: '0915553630', key: `ced-${student.id}-${bIdx}`, mono: true },
                              ].map(({ label, value, key, mono }) => (
                                <button
                                  key={key}
                                  onClick={() => copyToClipboard(value, key)}
                                  className="w-full bg-white hover:bg-purple-100 active:bg-purple-200 rounded-lg px-3 py-2 transition-colors text-left"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1 mr-2">
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
                                      <p className={`text-xs font-medium text-gray-800 mt-0.5 break-words ${mono ? 'font-mono tracking-wide' : ''}`}>
                                        {value}
                                      </p>
                                    </div>
                                    <div className="shrink-0">
                                      {copiedField === key ? (
                                        <span className="flex items-center gap-0.5 text-green-600 text-[9px] font-medium">
                                          <CheckCircle size={12} />
                                        </span>
                                      ) : (
                                        <Copy size={12} className="text-gray-300" />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                              <p className="text-[9px] text-purple-400 text-center mt-1">Toque para copiar</p>
                            </div>
                          </div>
                        )
                      })()}
                      <button
                        onClick={() => openUpload(student.id)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm transition-colors"
                      >
                        <Upload size={16} />
                        Ya transferí — Subir comprobante
                      </button>
                    </div>
                  )}

                  {/* ── Card Expanded ── */}
                  {activeMethod === 'card' && (
                    <div className="mt-3 bg-green-50 rounded-xl border border-green-200 overflow-hidden animate-slideDown">
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield size={14} className="text-green-600" />
                          <p className="text-xs text-gray-600">
                            Pago seguro vía Produbanco y PayPhone. Datos encriptados (PCI DSS 4.0).
                          </p>
                        </div>

                        <a
                          href="https://ppls.me/8IycwXygt2iTUEYuTLiyQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handlePayphoneLinkClick}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                          <CreditCard size={16} />
                          Pagar con Tarjeta
                          <ExternalLink size={13} className="opacity-70" />
                        </a>

                        {/* PayPhone Confirmation */}
                        {!ppConfirm[student.id] ? (
                          <button
                            onClick={() => setPpConfirm(prev => ({ ...prev, [student.id]: true }))}
                            className="w-full mt-2.5 py-2.5 text-green-700 text-xs font-semibold bg-green-100 hover:bg-green-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Bell size={13} />
                            Ya pagué — Notificar al estudio
                          </button>
                        ) : ppSuccess[student.id] ? (
                          <div className="mt-2.5 bg-green-100 border border-green-300 rounded-xl p-3 text-center">
                            <CheckCircle size={22} className="text-green-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-green-800">Pago registrado</p>
                            <p className="text-[11px] text-green-600">El estudio verificará su pago</p>
                          </div>
                        ) : (
                          <div className="mt-2.5 bg-white border border-green-200 rounded-xl p-3 space-y-2 animate-slideDown">
                            <p className="text-xs font-medium text-gray-700">Confirmar pago con tarjeta:</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={ppAmount[student.id] || ''}
                                onChange={(e) => setPpAmount(prev => ({ ...prev, [student.id]: e.target.value }))}
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Monto pagado"
                              />
                            </div>
                            {ppError[student.id] && (
                              <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2">{ppError[student.id]}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setPpConfirm(prev => ({ ...prev, [student.id]: false }))
                                  setPpError(prev => ({ ...prev, [student.id]: '' }))
                                }}
                                className="flex-1 py-2.5 text-gray-500 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handlePayphoneConfirm(student.id)}
                                disabled={ppLoading[student.id]}
                                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {ppLoading[student.id] ? (
                                  <span style={{ animation: 'gentlePulse 1s ease-in-out infinite' }}>Enviando...</span>
                                ) : (
                                  <>
                                    <CheckCircle size={14} />
                                    Confirmar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-green-100/50 px-3 py-1.5 flex items-center justify-center gap-1.5">
                        <Shield size={10} className="text-green-700" />
                        <span className="text-[9px] text-green-700 font-medium">Transacción segura · PCI DSS 4.0 · No almacena datos</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ───── Recent Requests ───── */}
                {studentRequests.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Estado de solicitudes</p>
                    {studentRequests.slice(0, 5).map(req => (
                      <div key={req.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">${parseFloat(req.amount).toFixed(2)}</span>
                          <span className="text-gray-400 ml-1.5 text-[10px]">{req.bank_name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                          {req.status === 'pending' && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px] flex items-center gap-0.5">
                              <Clock size={9} />En revisión
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] flex items-center gap-0.5">
                              <CheckCircle size={10} />Aprobada
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <>
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-500 rounded text-[10px] flex items-center gap-0.5">
                                <XCircle size={9} />Rechazada
                              </span>
                              {req.rejection_reason && (
                                <p className="text-[9px] text-red-400 text-right max-w-[160px] leading-tight">
                                  {req.rejection_reason}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History Button */}
              <div className="border-t">
                <button
                  onClick={() => openHistoryModal(student.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <History size={15} />
                  Ver historial de pagos
                </button>
              </div>
            </div>
          )
        })}

        {/* Tablón de anuncios */}
        {(() => {
          const COLOR_MAP = {
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800', body: 'text-purple-700', pin: 'text-purple-400', dismiss: 'text-purple-300 hover:text-purple-600' },
            blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-800',   body: 'text-blue-700',   pin: 'text-blue-400',   dismiss: 'text-blue-300 hover:text-blue-600' },
            green:  { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-800',  body: 'text-green-700',  pin: 'text-green-400',  dismiss: 'text-green-300 hover:text-green-600' },
            amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  title: 'text-amber-800',  body: 'text-amber-700',  pin: 'text-amber-400',  dismiss: 'text-amber-300 hover:text-amber-600' },
            rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   title: 'text-rose-800',   body: 'text-rose-700',   pin: 'text-rose-400',   dismiss: 'text-rose-300 hover:text-rose-600' },
          }
          const visible = announcements.filter(a => !dismissedAnnouncements.has(a.id))
          if (!visible.length) return null
          const dismissOne = (id) => {
            setDismissedAnnouncements(prev => new Set([...prev, id]))
          }
          return (
            <div className="space-y-2">
              {visible.map(a => {
                const cfg = COLOR_MAP[a.color] || COLOR_MAP.purple
                return (
                  <div key={a.id} className={`rounded-xl border p-3.5 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 mt-0.5">
                        {a.pinned
                          ? <Pin size={14} className={cfg.pin} />
                          : <Megaphone size={14} className={cfg.pin} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${cfg.title}`}>{a.title}</p>
                        <p className={`text-xs mt-1 leading-relaxed whitespace-pre-wrap ${cfg.body}`}>{a.body}</p>
                      </div>
                      <button onClick={() => dismissOne(a.id)} className={`shrink-0 p-1 rounded-lg transition-colors ${cfg.dismiss}`}>
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Contact + Footer */}
        <div className="pt-2 pb-6 space-y-3">
          <a
            href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent('¡Hola! Tengo una consulta sobre mi cuenta en Studio Dancers.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium hover:bg-green-100 active:bg-green-150 transition-colors"
          >
            <MessageCircle size={16} />
            ¿Dudas? Escríbenos por WhatsApp
          </a>
          <p className="text-center text-[10px] text-gray-300">
            Los datos se actualizan automáticamente · v{new Date('2026-02-28').toLocaleDateString('es-EC',{day:'2-digit',month:'short'})}
          </p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadTransfer
          studentId={showUpload}
          studentName={students.find(s => s.id === showUpload)?.name}
          cedula={cedula}
          phoneLast4={phoneLast4}
          onClose={closeUpload}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <PaymentHistory
          studentId={showHistory}
          studentName={students.find(s => s.id === showHistory)?.name}
          cedula={cedula}
          phoneLast4={phoneLast4}
          onClose={closeHistoryModal}
        />
      )}

      {/* Calendar Modal */}
      {calendarStudent && (
        <ClassCalendar
          student={calendarStudent}
          onClose={closeCalendarModal}
        />
      )}
    </div>
  )
}
