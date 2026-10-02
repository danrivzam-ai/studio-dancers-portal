// Fechas y estado de pago — espejo de src/lib/dateUtils.js del Admin.
// Toda comparación de "hoy" usa la hora de Ecuador (America/Guayaquil, UTC-5),
// nunca new Date() directo: después de las 7 PM ya es el día siguiente en UTC.
// Si cambia getPaymentStatus() en el Admin, replicar el cambio aquí.

const DAY_MS = 24 * 60 * 60 * 1000

/** Fecha/hora actual con los componentes de Ecuador (año, mes, día, hora…). */
export const getNowEC = () => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  })
  const parts = {}
  fmt.formatToParts(new Date()).forEach(p => { parts[p.type] = p.value })
  return new Date(
    parseInt(parts.year), parseInt(parts.month) - 1, parseInt(parts.day),
    parseInt(parts.hour) % 24, parseInt(parts.minute), parseInt(parts.second)
  )
}

/** Hoy en Ecuador como 'yyyy-MM-dd'. */
export const getTodayEC = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Guayaquil',
  year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date())

/**
 * Parsea cualquier formato de fecha de Supabase a mediodía local
 * ('2026-02-21', '2026-02-21T00:00:00+00:00', '2026-02-21 05:00:00'…)
 * para evitar el corrimiento de día por UTC.
 */
export const toNoonLocal = (date) => {
  if (!date) return null
  if (typeof date === 'string') {
    const dateOnly = date.includes('T') ? date.split('T')[0] : date.substring(0, 10)
    return new Date(dateOnly + 'T12:00:00')
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

/** Date → 'yyyy-MM-dd' con la fecha local. */
export const toDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const diffDays = (a, b) => Math.round((toNoonLocal(a) - toNoonLocal(b)) / DAY_MS)

/** Días de clase en convención del Admin: 0=Dom … 6=Sáb (acepta 7=Dom del portal). */
const toAdminClassDays = (classDays) => {
  let days = classDays
  if (!days) return null
  if (typeof days === 'string') {
    try { days = JSON.parse(days) } catch {
      days = days.replace(/[{}[\]]/g, '').split(',')
    }
  }
  if (!Array.isArray(days)) return null
  const nums = days.map(d => Number(d) % 7).filter(n => Number.isInteger(n) && n >= 0 && n <= 6)
  return nums.length ? [...new Set(nums)] : null
}

const getPrevClassDay = (date, classDays) => {
  const d = toNoonLocal(date)
  for (let i = 1; i <= 7; i++) {
    const prev = addDays(d, -i)
    if (classDays.includes(prev.getDay())) return prev
  }
  return addDays(d, -1)
}

const getNextClassDay = (date, classDays) => {
  const d = toNoonLocal(date)
  for (let i = 0; i <= 7; i++) {
    const next = addDays(d, i)
    if (classDays.includes(next.getDay())) return next
  }
  return d
}

/** Días hasta el vencimiento (el vencimiento es el día anterior a next_payment_date). */
export const getDaysUntilDue = (nextPaymentDate) => {
  if (!nextPaymentDate) return 999
  const dueDate = addDays(toNoonLocal(nextPaymentDate), -1)
  return diffDays(dueDate, getTodayEC())
}

/** Clases del ciclo actual: { totalClasses, classesPassed }. */
export const getCycleInfo = (lastPaymentDate, nextPaymentDate, rawClassDays, classesPerCycle) => {
  if (!lastPaymentDate || !nextPaymentDate) return null
  const classDays = toAdminClassDays(rawClassDays)
  const lastPay = toNoonLocal(lastPaymentDate)
  const nextPay = toNoonLocal(nextPaymentDate)
  const todayStr = getTodayEC()

  let cycleStart, cycleEnd, totalClasses
  if (classDays) {
    cycleStart = getNextClassDay(lastPay, classDays)
    cycleEnd = getPrevClassDay(nextPay, classDays)
    totalClasses = 0
    for (let cur = new Date(cycleStart), i = 0; cur <= cycleEnd && i < 400; cur = addDays(cur, 1), i++) {
      if (classDays.includes(cur.getDay())) totalClasses++
    }
    if (classesPerCycle > 0) totalClasses = classesPerCycle
  } else {
    cycleStart = lastPay
    cycleEnd = addDays(nextPay, -1)
    totalClasses = classesPerCycle || null
  }

  let classesPassed = 0
  if (classDays) {
    const endStr = toDateStr(cycleEnd)
    const limitStr = todayStr <= endStr ? todayStr : endStr
    for (let cur = new Date(cycleStart), i = 0; toDateStr(cur) <= limitStr && i < 400; cur = addDays(cur, 1), i++) {
      if (classDays.includes(cur.getDay())) classesPassed++
    }
  } else if (totalClasses) {
    const totalDays = diffDays(cycleEnd, cycleStart) + 1
    const elapsed = diffDays(todayStr, cycleStart) + 1
    if (totalDays > 0) {
      classesPassed = Math.max(0, Math.min(Math.round((elapsed / totalDays) * totalClasses), totalClasses))
    }
  }

  return {
    totalClasses,
    classesPassed: totalClasses ? Math.min(classesPassed, totalClasses) : classesPassed
  }
}

/**
 * Construye el objeto "course" que espera getPaymentStatus a partir del alumno
 * enriquecido en el portal (rpc_client_login + rpc_public_courses).
 */
export const courseFromStudent = (s) => ({
  priceType: s.price_type || null,
  price: s.course_price ?? null,
  classDays: toAdminClassDays(s.class_days),
  classesPerCycle: s.classes_per_cycle || null,
  ageMin: s.age_min ?? (s.is_minor === false ? 18 : 0),
  cicloFin: s.ciclo_fin || null,
})

/**
 * Estado de pago real — misma lógica que getPaymentStatus() del Admin.
 * Nunca usar student.payment_status crudo para decidir lo que se muestra.
 */
export const getPaymentStatus = (student, course, autoInactiveDays = 60, graceDays = 5, moraDays = 20) => {
  const cicloFin = course?.cicloFin
  if (cicloFin && getTodayEC() > cicloFin) {
    return { status: 'cycle_ended', label: 'Ciclo finalizado', color: 'bg-slate-100 text-slate-600 border border-slate-200', colorCode: 'gray', priority: 5 }
  }

  const priceType = course?.priceType

  if (priceType === 'clase') {
    return { status: 'single', label: 'Por clase', color: 'bg-sky-100 text-sky-700 border border-sky-200', colorCode: 'blue', priority: 5 }
  }

  if (priceType === 'programa') {
    const totalPrice = student?.total_program_price || course?.price || student?.monthly_fee || 0
    const amountPaid = parseFloat(student?.amount_paid || 0)
    const balance = student?.balance != null ? parseFloat(student.balance) : (totalPrice - amountPaid)
    if (balance <= 0 || amountPaid >= totalPrice) {
      return { status: 'paid', label: 'Pagado', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', colorCode: 'green', priority: 5 }
    }
    if (amountPaid > 0) {
      return { status: 'partial', label: `Abono: $${amountPaid} / Debe: $${balance.toFixed(2)}`, color: 'bg-orange-100 text-orange-700 border border-orange-200', colorCode: 'orange', priority: 2 }
    }
    return { status: 'pending', label: 'Pendiente', color: 'bg-slate-100 text-slate-500 border border-slate-200', colorCode: 'gray', priority: 4 }
  }

  if (priceType === 'paquete') {
    if (!student.next_payment_date) {
      return { status: 'pending', label: 'Sin pago', color: 'bg-slate-100 text-slate-500 border border-slate-200', colorCode: 'gray', priority: 4 }
    }
    const classesTotal = course?.classesPerCycle || 4
    const baseDate = student.last_payment_date || student.enrollment_date
    let classesTaken = student.classes_used || 0
    if (baseDate && course?.classDays) {
      const info = getCycleInfo(baseDate, student.next_payment_date, course.classDays, classesTotal)
      if (info && info.classesPassed > 0) classesTaken = info.classesPassed
    }
    const remaining = classesTotal - classesTaken
    const classDaysArr = course?.classDays || []
    const subCycleSize = classDaysArr.length >= 2 ? 8 : 4
    const isMultiCycle = classesTotal > subCycleSize && classesTotal % subCycleSize === 0
    const totalMonths = isMultiCycle ? Math.round(classesTotal / subCycleSize) : 1
    const currentMonth = isMultiCycle ? Math.min(totalMonths, Math.floor(classesTaken / subCycleSize) + 1) : 1
    const remainingInMonth = isMultiCycle ? subCycleSize - (classesTaken % subCycleSize) : remaining
    const days = getDaysUntilDue(student.next_payment_date)

    if (days < 0 && Math.abs(days) > autoInactiveDays) {
      return { status: 'inactive', label: 'Inactiva', color: 'bg-slate-200 text-slate-600 border border-slate-300', colorCode: 'gray', priority: 6 }
    }
    if (days < 0) {
      const absDays = Math.abs(days)
      return { status: 'cycle_complete', label: absDays === 1 ? 'Lista para renovar · 1d' : `Lista para renovar · ${absDays}d`, color: 'bg-sky-100 text-sky-800 border border-sky-200', colorCode: 'blue', priority: 3 }
    }
    if (isMultiCycle) {
      return {
        status: 'active_package',
        label: remainingInMonth <= 1 ? `Mes ${currentMonth}/${totalMonths} · Última clase` : `Mes ${currentMonth}/${totalMonths} · ${remainingInMonth} restantes`,
        color: remainingInMonth <= 1 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-violet-100 text-violet-700 border border-violet-200',
        colorCode: remainingInMonth <= 1 ? 'orange' : 'blue',
        priority: remainingInMonth <= 1 ? 2 : 4,
      }
    }
    return {
      status: 'active_package',
      label: remaining <= 1 ? 'Última clase' : `${remaining} clases restantes`,
      color: remaining <= 1 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-violet-100 text-violet-700 border border-violet-200',
      colorCode: remaining <= 1 ? 'orange' : 'blue',
      priority: remaining <= 1 ? 2 : 4
    }
  }

  // Mensual — abono parcial
  if (student.payment_status === 'partial') {
    const paid = parseFloat(student.amount_paid || 0)
    const bal = parseFloat(student.balance || 0)
    return { status: 'partial', label: `Abono: $${paid.toFixed(0)} / Debe: $${bal.toFixed(2)}`, color: 'bg-orange-100 text-orange-700 border border-orange-200', colorCode: 'orange', priority: 2 }
  }

  if (!student.next_payment_date) {
    return { status: 'pending', label: 'Sin cobro', color: 'bg-slate-100 text-slate-500 border border-slate-200', colorCode: 'gray', priority: 4 }
  }

  const days = getDaysUntilDue(student.next_payment_date)
  const isAdultCourse = (course?.ageMin ?? 0) >= 18

  // Adultas: el ciclo se completa por número de clases, aunque no llegue la fecha
  if (isAdultCourse && days >= 0) {
    const baseDate = student.last_payment_date || student.enrollment_date
    if (baseDate && course?.classDays) {
      const info = getCycleInfo(baseDate, student.next_payment_date, course.classDays, course.classesPerCycle)
      const classesTotal = info?.totalClasses ?? null
      const classesTaken = info?.classesPassed ?? 0
      const remaining = classesTotal != null ? classesTotal - classesTaken : -1

      if (remaining <= 0 && classesTotal != null) {
        const todayDow = new Date(getTodayEC() + 'T12:00:00').getDay()
        if (course.classDays.includes(todayDow)) {
          return { status: 'due_today', label: 'Última clase hoy', color: 'bg-orange-100 text-orange-700 border border-orange-200', colorCode: 'orange', canAttend: true, priority: 1 }
        }
        return { status: 'adult_renewal', label: 'Lista para renovar', color: 'bg-sky-100 text-sky-800 border border-sky-200', colorCode: 'blue', canAttend: false, priority: 3 }
      }
      if (remaining === 1) {
        return { status: 'active_package', label: 'Última clase', color: 'bg-orange-100 text-orange-700 border border-orange-200', colorCode: 'orange', canAttend: true, priority: 2 }
      }
    }
  }

  if (days < 0) {
    const absDays = Math.abs(days)
    if (absDays > autoInactiveDays) {
      return { status: 'inactive', label: 'Inactiva', color: 'bg-slate-200 text-slate-600 border border-slate-300', colorCode: 'gray', canAttend: false, priority: 6 }
    }
    if (isAdultCourse) {
      return { status: 'adult_renewal', label: absDays === 1 ? 'Lista para renovar · 1d' : `Lista para renovar · ${absDays}d`, color: 'bg-sky-100 text-sky-800 border border-sky-200', colorCode: 'blue', canAttend: false, priority: 3 }
    }
    if (absDays > moraDays) {
      return { status: 'mora', label: `Suspendida (${absDays}d)`, color: 'bg-rose-700 text-white ring-1 ring-rose-800', colorCode: 'rose', canAttend: false, priority: 0 }
    }
    if (absDays > graceDays) {
      return { status: 'overdue', label: absDays === 1 ? 'Vencida (1 día)' : `Vencida (${absDays} días)`, color: 'bg-red-600 text-white ring-1 ring-red-700', colorCode: 'red', canAttend: true, priority: 1 }
    }
    return { status: 'grace', label: absDays === 1 ? 'Gracia (1 día)' : `Gracia (${absDays} días)`, color: 'bg-amber-400 text-white ring-1 ring-amber-500', colorCode: 'amber', canAttend: true, priority: 2 }
  }

  if (days === 0) {
    return {
      status: 'due_today',
      label: isAdultCourse ? 'Última clase hoy' : 'Renovar hoy',
      color: isAdultCourse ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-red-500 text-white ring-1 ring-red-600',
      colorCode: isAdultCourse ? 'orange' : 'red',
      canAttend: true, priority: 1
    }
  }
  if (days <= 3) {
    return {
      status: 'urgent',
      label: isAdultCourse
        ? (days === 1 ? 'Última clase mañana' : `Termina en ${days} días`)
        : (days === 1 ? 'Vence mañana' : `Vence en ${days} días`),
      color: isAdultCourse ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-orange-500 text-white ring-1 ring-orange-600',
      colorCode: isAdultCourse ? 'yellow' : 'orange',
      canAttend: true, priority: 2
    }
  }
  if (days <= 7) {
    return { status: 'upcoming', label: isAdultCourse ? `Por renovar · ${days}d` : `Vence en ${days} días`, color: 'bg-amber-100 text-amber-800 border border-amber-300', colorCode: 'yellow', canAttend: true, priority: 3 }
  }
  return { status: 'ok', label: `Al día (${days}d)`, color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', colorCode: 'green', canAttend: true, priority: 5 }
}

/**
 * Estado que ve la alumna en el portal: getPaymentStatus + casos de cortesía y pausa
 * (el Admin los muestra como insignias aparte).
 */
export const getPortalStatus = (student) => {
  if (student.is_courtesy) {
    return { status: 'courtesy', label: 'Activa', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', colorCode: 'green', priority: 5 }
  }
  if (student.is_paused) {
    return { status: 'paused', label: 'En pausa', color: 'bg-blue-100 text-blue-700 border border-blue-200', colorCode: 'blue', priority: 5 }
  }
  return getPaymentStatus(student, courseFromStudent(student))
}

/** Estados que requieren que la alumna renueve o pague. */
export const NEEDS_PAYMENT = new Set(['mora', 'overdue', 'grace', 'due_today', 'urgent', 'adult_renewal', 'cycle_complete'])
/** Estados vencidos (ya pasó la fecha o el ciclo terminó por clases). */
export const IS_OVERDUE = new Set(['mora', 'overdue', 'grace', 'adult_renewal', 'cycle_complete'])
