import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  ArrowLeft, Clock, Users, DollarSign, X,
  CheckCircle, LogOut, MessageCircle, ChevronRight, RefreshCw
} from 'lucide-react'

const STUDIO_WHATSAPP = '593963741884'
const MAESTRO_WHATSAPP = '593986390822'

// ══════════════════════════════════════════════
// SVG ICONS — siluetas minimalistas rellenas
// ══════════════════════════════════════════════

// Arabesque — Ballet Adultas Principiantes
const IconArabesque = ({ size = 36, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="22" cy="6" r="4.5"/>
    <ellipse cx="20.5" cy="16.5" rx="2.8" ry="6.5" transform="rotate(15 20.5 16.5)"/>
    <ellipse cx="18.5" cy="33" rx="2.4" ry="9.5"/>
    <ellipse cx="33" cy="22" rx="12" ry="2.5" transform="rotate(-10 33 22)"/>
    <ellipse cx="14.5" cy="18.5" rx="5.5" ry="2" transform="rotate(22 14.5 18.5)"/>
    <ellipse cx="27.5" cy="15" rx="5.5" ry="2" transform="rotate(-16 27.5 15)"/>
  </svg>
)

// Grand Jeté — Sábados Intensivos
const IconGrandJete = ({ size = 36, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="24" cy="5.5" r="4.5"/>
    <ellipse cx="23" cy="15.5" rx="2.8" ry="6.5" transform="rotate(-5 23 15.5)"/>
    <ellipse cx="13.5" cy="30" rx="2.4" ry="9.5" transform="rotate(36 13.5 30)"/>
    <ellipse cx="35" cy="30" rx="2.4" ry="9.5" transform="rotate(-40 35 30)"/>
    <ellipse cx="14" cy="11" rx="2" ry="6.5" transform="rotate(-58 14 11)"/>
    <ellipse cx="34" cy="10" rx="2" ry="6.5" transform="rotate(52 34 10)"/>
  </svg>
)

// Dúo — Dance Camp 2026
const IconGroupDance = ({ size = 36, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="14.5" cy="6" r="3.8"/>
    <ellipse cx="14.5" cy="15.5" rx="2.6" ry="6"/>
    <ellipse cx="12.5" cy="29" rx="2.2" ry="8.5"/>
    <ellipse cx="16.5" cy="29" rx="2.2" ry="8.5"/>
    <ellipse cx="10" cy="10" rx="2" ry="5.5" transform="rotate(-45 10 10)"/>
    <ellipse cx="22.5" cy="14.5" rx="5.5" ry="1.8"/>
    <circle cx="33.5" cy="6" r="3.8"/>
    <ellipse cx="33.5" cy="15.5" rx="2.6" ry="6"/>
    <ellipse cx="31.5" cy="29" rx="2.2" ry="8.5"/>
    <ellipse cx="35.5" cy="29" rx="2.2" ry="8.5"/>
    <ellipse cx="25.5" cy="14.5" rx="5.5" ry="1.8"/>
    <ellipse cx="38" cy="10" rx="2" ry="5.5" transform="rotate(45 38 10)"/>
  </svg>
)

// Baby Ballet — niña pequeña con tutú
const IconBabyBallet = ({ size = 36, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="24" cy="5.5" r="4"/>
    <ellipse cx="24" cy="14" rx="2.4" ry="5.5"/>
    {/* tutú */}
    <ellipse cx="24" cy="19" rx="7.5" ry="2.8"/>
    {/* falda izq */}
    <ellipse cx="18" cy="21" rx="4" ry="1.6" transform="rotate(-20 18 21)"/>
    {/* falda der */}
    <ellipse cx="30" cy="21" rx="4" ry="1.6" transform="rotate(20 30 21)"/>
    {/* pierna izq */}
    <ellipse cx="21.5" cy="32" rx="1.8" ry="7" transform="rotate(8 21.5 32)"/>
    {/* pierna der */}
    <ellipse cx="26.5" cy="32" rx="1.8" ry="7" transform="rotate(-8 26.5 32)"/>
    {/* brazo izq */}
    <ellipse cx="16" cy="13.5" rx="1.2" ry="4.5" transform="rotate(-40 16 13.5)"/>
    {/* brazo der */}
    <ellipse cx="32" cy="13.5" rx="1.2" ry="4.5" transform="rotate(40 32 13.5)"/>
  </svg>
)

// Maestro — Ballet Intermedios y Avanzados
const IconMaestro = ({ size = 36, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill={color}>
    <circle cx="24" cy="6" r="5"/>
    <ellipse cx="24" cy="20.5" rx="3.5" ry="8"/>
    <ellipse cx="21.5" cy="37" rx="2.5" ry="7.5" transform="rotate(4 21.5 37)"/>
    <ellipse cx="27" cy="37" rx="2.5" ry="7.5" transform="rotate(-4 27 37)"/>
    <ellipse cx="15.5" cy="18.5" rx="6" ry="2" transform="rotate(26 15.5 18.5)"/>
    <ellipse cx="35.5" cy="17.5" rx="7.5" ry="2" transform="rotate(-20 35.5 17.5)"/>
  </svg>
)

// ══════════════════════════════════════════════
// CATEGORY CONFIG
// ══════════════════════════════════════════════

const CARD_GRADIENT = 'from-[#551735] to-[#3d0f25]'

const CATEGORY_CONFIG = {
  regular: {
    label: 'Ballet Adultas · Principiantes',
    description: 'Clases semanales · Martes/Jueves y Sábados',
    Icon: IconArabesque,
    bgColor: '#afeeee',
    textColor: '#0d4444',
    lightBg: true,
  },
  ninas: {
    label: 'Baby Ballet · Niñas',
    description: 'Clases de sábados para pequeñas bailarinas',
    Icon: IconBabyBallet,
    bgColor: '#fce7f3',
    textColor: '#9d174d',
    lightBg: true,
  },
  intensivo: {
    label: 'Sábados Intensivos',
    description: 'Sesiones intensivas de fin de semana',
    Icon: IconGrandJete,
    gradient: CARD_GRADIENT,
    lightBg: false,
  },
  especial: {
    label: 'Dance Camp 2026',
    description: 'Programa especial vacacional · Exploradoras de la Danza',
    Icon: IconGroupDance,
    bgColor: '#ffcfe0',
    textColor: '#6b1a3a',
    lightBg: true,
    badge: 'Recital · 25 Abr',
  },
}

// Orden de visualización en el catálogo
const CATEGORY_ORDER = ['regular', 'ninas', 'intensivo', 'especial']

const MAESTRO_CONFIG = {
  label: 'Ballet Intermedios y Avanzados',
  description: 'Masterclasses con el Maestro Freddy Rivadeneira',
  Icon: IconMaestro,
  gradient: CARD_GRADIENT,
  lightBg: false,
}

const PRICE_TYPE_LABELS = {
  mes: '/mes',
  paquete: '/paquete',
  clase: '/clase',
  programa: '',
}

// ══════════════════════════════════════════════
// LOADER
// ══════════════════════════════════════════════

function CourseLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center"
          style={{ animation: 'dancerFloat 2s ease-in-out infinite' }}
        >
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="12" r="6" fill="#7e22ce" />
            <path d="M32 18 C32 18 28 24 26 30 C24 36 20 42 16 46" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 18 C32 18 34 26 34 32 C34 38 32 44 32 50" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 24 C32 24 40 20 46 18" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 24 C32 24 22 22 18 24" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 50 C32 50 28 54 24 56" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 50 C32 50 36 54 40 52" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-300"
          style={{ animation: 'pirouette 1.2s linear infinite' }}
        />
      </div>
      <p className="text-purple-700 font-medium text-sm">Cargando cursos</p>
      <div className="flex items-center gap-1.5 mt-1">
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

// ══════════════════════════════════════════════
// MAESTRO MODAL
// ══════════════════════════════════════════════

function MaestroModal({ onClose }) {
  const schedules = [
    {
      bg: 'bg-[#f4ece6]',
      label: 'Mañanas',
      days: 'Lun · Mié · Vie',
      time: '10:00 a.m. – 12:00 p.m.',
    },
    {
      bg: 'bg-[#ffcfe0]/50',
      label: 'Noches',
      days: 'Lun · Mié',
      time: '7:00 p.m. – 8:30 p.m.',
    },
    {
      bg: 'bg-[#afeeee]/50',
      label: 'Sábados · Clase suelta',
      days: 'Sábados',
      time: '10:00 a.m. – 12:00 p.m.',
    },
  ]

  const prices = [
    { label: 'Mensualidad Mañanas', value: '$70', period: '/mes' },
    { label: 'Mensualidad Noches',  value: '$50', period: '/mes' },
    { label: 'Clase suelta',        value: '$7',  period: '/clase' },
  ]

  const waText = encodeURIComponent(
    '¡Hola Maestro Freddy! Me interesa información sobre las Masterclasses de Ballet Clásico.'
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Foto ── */}
        <div className="relative">
          <img
            src="/maestro-galo.png"
            alt="Maestro Freddy Rivadeneira"
            className="w-full h-52 object-cover object-center"
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
          {/* Fallback si no carga la foto */}
          <div
            className="w-full h-52 items-center justify-center hidden"
            style={{ background: 'linear-gradient(135deg, #551735 0%, #3d0f25 100%)' }}
          >
            <span className="text-white text-8xl font-extralight opacity-40 tracking-widest">FR</span>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full"
          >
            <X size={18} />
          </button>

          {/* Gradiente oscuro en la base de la foto para legibilidad del badge */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Badge SOBRE la foto */}
          <div className="absolute bottom-4 left-4">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: 'white', color: '#551735' }}
            >
              Director Artístico · Fundador
            </span>
          </div>
        </div>

        <div className="px-5 pb-6 pt-4 space-y-5">

          {/* ── Título ── */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Masterclasses con el Maestro Freddy Rivadeneira
            </h2>
            <p
              className="text-xs text-gray-500 mt-2 italic leading-relaxed pl-3 border-l-2"
              style={{ borderColor: '#551735' }}
            >
              Clases magistrales dirigidas exclusivamente a bailarines con bases sólidas
              que buscan perfeccionar su técnica. No aplica para categorías infantiles.
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Biografía ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#551735' }}>
              Sobre el Maestro
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Con más de 46 años de trayectoria escénica, el Maestro Freddy Rivadeneira
              es el corazón artístico y Fundador de Studio Dancers. Formado en Bellas Artes
              en México y Estados Unidos, su enfoque combina la pureza del ballet clásico
              con la sensibilidad artística, creando un espacio donde bailarines intermedios
              y avanzados pueden pulir su fluidez y expresión escénica.
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Horarios ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#551735' }}>
              🩰 Ballet Clásico — Intermedios y Avanzados
            </p>
            <p className="text-[11px] text-gray-400 mb-3">Horarios disponibles</p>
            <div className="space-y-2">
              {schedules.map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ background: '#551735' }}
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{s.label} · {s.days}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="shrink-0" />
                      {s.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Valores ── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#551735' }}>
              💵 Valores
            </p>
            <div>
              {prices.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">{p.label}</span>
                  <span className="font-bold text-base" style={{ color: '#551735' }}>
                    {p.value}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">{p.period}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA WhatsApp ── */}
          <a
            href={`https://wa.me/${MAESTRO_WHATSAPP}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle size={18} />
            Contactar al Maestro Freddy
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// CATEGORY CARD — componente reutilizable
// ══════════════════════════════════════════════

function CategoryCard({ config, count, onClick, delay = 0 }) {
  const Icon = config.Icon
  const isLight = config.lightBg
  const iconColor = isLight ? '#551735' : 'white'

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
      style={{ animation: `fadeIn 0.4s ease-out ${delay}s both` }}
    >
      <div
        className={`${config.gradient ? `bg-gradient-to-br ${config.gradient}` : ''} rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden`}
        style={config.bgColor ? { background: config.bgColor } : {}}
      >
        {/* Icono decorativo de fondo */}
        <div className={`absolute -right-4 -bottom-4 pointer-events-none ${isLight ? 'opacity-12' : 'opacity-10'}`}>
          <Icon size={96} color={iconColor} />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: isLight ? 'rgba(85,23,53,0.12)' : 'rgba(255,255,255,0.15)' }}
            >
              <Icon size={24} color={iconColor} />
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold text-base leading-tight"
                style={{ color: isLight ? (config.textColor || '#1f2937') : 'white' }}
              >
                {config.label}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: isLight ? '#6b7280' : 'rgba(255,255,255,0.6)' }}
              >
                {config.description}
              </p>
            </div>
          </div>
          <ChevronRight
            size={20}
            className="shrink-0"
            style={{ color: isLight ? 'rgba(85,23,53,0.4)' : 'rgba(255,255,255,0.5)' }}
          />
        </div>

        <div className="relative z-10 mt-3 flex items-center gap-2 flex-wrap">
          {count !== undefined && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: isLight ? 'rgba(85,23,53,0.12)' : 'rgba(255,255,255,0.2)',
                color: isLight ? (config.textColor || '#551735') : 'white'
              }}
            >
              {count} {count === 1 ? 'curso' : 'cursos'}
            </span>
          )}
          {config.badge && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: isLight ? 'rgba(85,23,53,0.85)' : 'rgba(255,255,255,0.25)',
                color: 'white'
              }}
            >
              {config.badge}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════

export default function CourseCatalog({ onBack, isAuthenticated, onLogout, initialCategory, initialCourseName }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  // If a specific course name is requested, don't pre-select category — wait for auto-open
  const [selectedCategory, setSelectedCategory] = useState(initialCourseName ? null : (initialCategory || null))
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showMaestroModal, setShowMaestroModal] = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const { data, error } = await supabase.rpc('rpc_public_courses')
      if (error) throw error
      setCourses(data || [])
    } catch (e) {
      console.warn('Error fetching courses:', e)
      setLoadError(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  // Auto-open a specific course by name (e.g. from LandingPage deep-link)
  useEffect(() => {
    if (!initialCourseName || courses.length === 0 || selectedCourse) return
    const needle = initialCourseName.toLowerCase()
    const match = courses.find(c => (c.name || '').toLowerCase().includes(needle))
    if (match) {
      let cat = match.category || 'regular'
      if (cat === 'camp') cat = 'especial'
      setSelectedCategory(cat)
      setSelectedCourse(match)
    }
  }, [courses, initialCourseName])

  useEffect(() => {
    const handlePopState = () => {
      if (selectedCourse) { setSelectedCourse(null); return }
      if (selectedCategory) { setSelectedCategory(null); return }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedCategory, selectedCourse])

  const openCategory = useCallback((category) => {
    const catCourses = courses.filter(c =>
      (c.category === 'camp' ? 'especial' : (c.category || 'regular')) === category
    )
    // If only 1 course in category, go directly to course detail
    if (catCourses.length === 1) {
      history.pushState({ catalog: 'course', courseId: catCourses[0].id }, '')
      setSelectedCategory(category)
      setSelectedCourse(catCourses[0])
      return
    }
    history.pushState({ catalog: 'category', category }, '')
    setSelectedCategory(category)
  }, [courses])

  const openCourse = useCallback((course) => {
    history.pushState({ catalog: 'course', courseId: course.id }, '')
    setSelectedCourse(course)
  }, [])

  const goBackFromCategory = useCallback(() => { history.back() }, [])
  const closeCourse = useCallback(() => { history.back() }, [])

  const grouped = courses.reduce((acc, course) => {
    let cat = course.category || 'regular'
    if (cat === 'camp') cat = 'especial'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(course)
    return acc
  }, {})

  const formatAge = (min, max) => {
    if (!min && !max) return null
    if (min === 3 && max === 99) return null
    if (max >= 99) return `Desde ${min} años`
    return `${min}–${max} años`
  }

  // ── Vista: lista de categorías ──
  const renderCategoryList = () => (
    <div className="max-w-md mx-auto p-4 space-y-3 pb-24 animate-fadeIn">
      {loading ? (
        <CourseLoader />
      ) : loadError ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-600 font-medium">No se pudieron cargar los cursos</p>
          <p className="text-gray-400 text-sm mt-1">Verifica tu conexión a internet</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium text-sm flex items-center gap-2 mx-auto hover:bg-purple-700 transition-colors"
          >
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Categorías dinámicas (DB) — orden controlado */}
          {CATEGORY_ORDER
            .filter(cat => grouped[cat]?.length > 0)
            .map((category, idx) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.regular
              return (
                <CategoryCard
                  key={category}
                  config={config}
                  count={grouped[category].length}
                  onClick={() => openCategory(category)}
                  delay={idx * 0.1}
                />
              )
            })
          }
          {/* Categorías no definidas en CATEGORY_ORDER (por si hay nuevas en DB) */}
          {Object.entries(grouped)
            .filter(([cat]) => !CATEGORY_ORDER.includes(cat))
            .map(([category, catCourses], idx) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.regular
              return (
                <CategoryCard
                  key={category}
                  config={config}
                  count={catCourses.length}
                  onClick={() => openCategory(category)}
                  delay={(CATEGORY_ORDER.length + idx) * 0.1}
                />
              )
            })
          }

          {/* Tarjeta estática Maestro — siempre al final */}
          <CategoryCard
            config={MAESTRO_CONFIG}
            onClick={() => setShowMaestroModal(true)}
            delay={Object.keys(grouped).length * 0.1}
          />
        </>
      )}
    </div>
  )

  // ── Vista: cursos dentro de una categoría ──
  const renderCategoryCourses = () => {
    const catCourses = grouped[selectedCategory] || []
    const config = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG.regular
    const Icon = config.Icon

    const isLight = config.lightBg
    const iconColor = isLight ? '#551735' : 'white'

    return (
      <div className="max-w-md mx-auto p-4 space-y-3 pb-24 animate-fadeIn">
        {/* Header de categoría */}
        <div
          className={`${config.gradient ? `bg-gradient-to-br ${config.gradient}` : ''} rounded-2xl p-4 mb-1 relative overflow-hidden`}
          style={config.bgColor ? { background: config.bgColor } : {}}
        >
          <div className={`absolute -right-4 -bottom-4 pointer-events-none ${isLight ? 'opacity-12' : 'opacity-10'}`}>
            <Icon size={80} color={iconColor} />
          </div>
          <div className="relative z-10">
            <Icon size={28} color={iconColor} />
            <h2
              className="font-bold text-xl mt-2"
              style={{ color: isLight ? (config.textColor || '#1f2937') : 'white' }}
            >
              {config.label}
            </h2>
            <p
              className="text-xs"
              style={{ color: isLight ? '#6b7280' : 'rgba(255,255,255,0.6)' }}
            >
              {catCourses.length} {catCourses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
            </p>
          </div>
        </div>

        {catCourses.map((course, idx) => (
          <button
            key={course.id}
            onClick={() => openCourse(course)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow"
            style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.08}s both` }}
          >
            <div className="flex">
              {course.image_url ? (
                <img src={course.image_url} alt={course.name} className="w-24 h-24 object-cover shrink-0" />
              ) : (
                <div
                  className="w-24 h-24 flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #551735, #3d0f25)' }}
                >
                  <IconArabesque size={32} />
                </div>
              )}
              <div className="p-3 flex flex-col justify-center min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 text-sm truncate">{course.name}</h3>
                {course.schedule && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="shrink-0" />
                    <span className="truncate">{course.schedule}</span>
                  </p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  {formatAge(course.age_min, course.age_max) ? (
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                      {formatAge(course.age_min, course.age_max)}
                    </span>
                  ) : <span />}
                  <span className="font-bold text-sm" style={{ color: '#551735' }}>
                    ${parseFloat(course.price).toFixed(0)}{PRICE_TYPE_LABELS[course.price_type] || ''}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div
        className="text-white px-4 py-4"
        style={{ background: 'linear-gradient(to right, #551735, #3d0f25)' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(onBack || selectedCategory) && (
              <button
                onClick={() => selectedCategory ? goBackFromCategory() : onBack?.()}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="font-bold text-lg">
                {selectedCategory
                  ? (CATEGORY_CONFIG[selectedCategory]?.label || 'Cursos')
                  : 'Nuestros Cursos'}
              </h1>
              <p className="text-xs text-white/60">
                {selectedCategory ? 'Toca un curso para más info' : 'Elige una categoría'}
              </p>
            </div>
          </div>
          {isAuthenticated && onLogout && (
            <button onClick={onLogout} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── Contenido ── */}
      {selectedCategory ? renderCategoryCourses() : renderCategoryList()}

      {/* ── Modal detalle de curso (DB) ── */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={closeCourse}
        >
          <div
            className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {selectedCourse.image_url ? (
              <div className="relative">
                <img src={selectedCourse.image_url} alt={selectedCourse.name} className="w-full h-48 object-cover" />
                <button onClick={closeCourse} className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                className="relative w-full h-32 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #551735, #3d0f25)' }}
              >
                <IconArabesque size={48} />
                <button onClick={closeCourse} className="absolute top-3 right-3 p-2 bg-black/20 text-white rounded-full">
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedCourse.name}</h2>
                {selectedCourse.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedCourse.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedCourse.schedule && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1">
                      <Clock size={10} /> Horario
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedCourse.schedule}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1">
                    <DollarSign size={10} /> Precio
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#551735' }}>
                    ${parseFloat(selectedCourse.price).toFixed(2)}{PRICE_TYPE_LABELS[selectedCourse.price_type] || ''}
                  </p>
                </div>
                {formatAge(selectedCourse.age_min, selectedCourse.age_max) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1">
                      <Users size={10} /> Edades
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {formatAge(selectedCourse.age_min, selectedCourse.age_max)}
                    </p>
                  </div>
                )}
              </div>

              {selectedCourse.benefits && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Beneficios</h3>
                  <ul className="space-y-1.5">
                    {selectedCourse.benefits.split('\n').filter(Boolean).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Requisitos</h3>
                  <ul className="space-y-1.5">
                    {selectedCourse.requirements.split('\n').filter(Boolean).map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span style={{ color: '#551735' }}>—</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(`¡Hola! Me interesa el curso: ${selectedCourse.name}. Quisiera más información para inscribirme.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} /> Deseo inscribirme
              </a>
              <button
                onClick={closeCourse}
                className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Maestro Freddy ── */}
      {showMaestroModal && (
        <MaestroModal onClose={() => setShowMaestroModal(false)} />
      )}
    </div>
  )
}
