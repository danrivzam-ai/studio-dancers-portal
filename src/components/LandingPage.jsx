import { BookOpen, LogIn, MapPin, Phone, Clock, Award, TrendingUp, UserCheck, Sparkles, ChevronDown, MessageCircle, Users } from 'lucide-react'

// SVG icons for social media
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const STUDIO_WHATSAPP = '593963741884'

// Ballet silhouette decorative SVG
const BalletDecoration = () => (
  <svg className="absolute right-4 bottom-8 opacity-10 w-32 h-32" viewBox="0 0 120 120" fill="white">
    <circle cx="60" cy="18" r="10"/>
    <path d="M60 28c0 0-8 12-12 24s-10 18-18 26" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M60 28c0 0 4 16 4 28s-4 24-4 36" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M60 40c0 0 16-8 28-12" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M60 40c0 0-16-4-24 0" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M60 92c0 0-8 8-16 12" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M60 92c0 0 8 8 16 4" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
  </svg>
)

const FEATURES = [
  {
    icon: Award,
    title: 'Excelencia y Técnica',
    desc: 'Dominarás la disciplina del método clásico, garantizando una base sólida.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: TrendingUp,
    title: 'Evolución sin límites',
    desc: 'Desde la iniciación a los 3 años hasta adultos. Un programa que crece contigo.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: UserCheck,
    title: 'Acompañamiento Personalizado',
    desc: 'Avanza a tu propio ritmo en grupos reducidos y en un espacio seguro.',
    color: 'from-amber-500 to-orange-500'
  }
]

const QUICK_COURSES = [
  { name: 'Baby Ballet', age: '3-6 años', schedule: 'Sábados', icon: '🩰', color: 'bg-pink-50 border-pink-200' },
  { name: 'Ballet Adultos', age: 'Desde 18 años', schedule: 'Mar y Jue', icon: '💃', color: 'bg-purple-50 border-purple-200' },
  { name: 'Intensivo Sábados', age: '7+ años', schedule: 'Sábados', icon: '⭐', color: 'bg-amber-50 border-amber-200' },
]

export default function LandingPage({ onGoToCatalog, onGoToLogin }) {
  const scrollToContent = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════ HERO SECTION ═══════ */}
      <div className="relative min-h-[85vh] bg-gradient-to-br from-purple-800 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-[-40px] w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 right-[-20px] w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-8 w-16 h-16 bg-pink-400/10 rounded-full" />
        <BalletDecoration />

        <div className="text-center max-w-sm relative z-10 animate-fadeIn">
          {/* Logo */}
          <img
            src="/logo-landing.png"
            alt="Studio Dancers"
            className="w-56 mx-auto mb-4 object-contain drop-shadow-xl"
          />
          <p className="text-white/80 text-sm mb-1">Escuela de Ballet en Guayaquil</p>
          <p className="text-white/50 text-xs mb-8">Donde los sueños se bailan</p>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={onGoToCatalog}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 border-2 border-white/70 text-white rounded-2xl font-semibold hover:bg-white/10 active:bg-white/15 transition-all text-base backdrop-blur-sm"
            >
              <BookOpen size={20} />
              Ver Cursos Disponibles
            </button>
            <button
              onClick={onGoToLogin}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-white text-purple-700 rounded-2xl font-bold hover:bg-white/95 active:bg-purple-50 transition-all text-base shadow-xl shadow-purple-900/20"
            >
              <LogIn size={20} />
              Ingresar al Portal de Pagos
            </button>
          </div>

          {/* Social Media */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <a
              href="https://www.instagram.com/studiodancers.ec/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/studiodancers.ec/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent('¡Hola! Me gustaría información sobre los cursos de ballet.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 bg-green-500/80 hover:bg-green-500 active:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors"
          style={{ animation: 'dancerFloat 2s ease-in-out infinite' }}
        >
          <ChevronDown size={28} />
        </button>
      </div>

      {/* ═══════ FEATURES SECTION ═══════ */}
      <div id="features" className="bg-white px-5 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-purple-600 text-xs font-semibold uppercase tracking-widest mb-1">¿Por qué elegirnos?</p>
            <h2 className="text-2xl font-bold text-gray-900">Formación de excelencia para verdaderos resultados escénicos.</h2>
          </div>

          <div className="space-y-3">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
                  style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both` }}
                >
                  <div className={`w-11 h-11 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ═══════ QUICK COURSES PREVIEW ═══════ */}
      <div className="bg-gradient-to-b from-purple-50 to-white px-5 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <p className="text-purple-600 text-xs font-semibold uppercase tracking-widest mb-1">Nuestros Cursos</p>
            <h2 className="text-xl font-bold text-gray-900">Encuentra tu clase ideal</h2>
          </div>

          <div className="space-y-2.5">
            {QUICK_COURSES.map((course, idx) => (
              <button
                key={idx}
                onClick={onGoToCatalog}
                className={`w-full flex items-center gap-3.5 ${course.color} border rounded-xl p-3.5 text-left hover:shadow-md active:scale-[0.98] transition-all`}
                style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.08}s both` }}
              >
                <span className="text-2xl">{course.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm">{course.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Users size={10} />{course.age}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} />{course.schedule}
                    </span>
                  </div>
                </div>
                <Sparkles size={16} className="text-purple-400 shrink-0" />
              </button>
            ))}
          </div>

          <button
            onClick={onGoToCatalog}
            className="w-full mt-4 py-3 text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen size={16} />
            Ver todos los cursos y precios
          </button>
        </div>
      </div>

      {/* ═══════ CONTACT & LOCATION ═══════ */}
      <div className="bg-white px-5 py-10 border-t border-gray-100">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <p className="text-purple-600 text-xs font-semibold uppercase tracking-widest mb-1">Contáctanos</p>
            <h2 className="text-xl font-bold text-gray-900">Estamos para ayudarte</h2>
          </div>

          <div className="space-y-3">
            <a
              href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent('¡Hola! Me gustaría información sobre los cursos de ballet.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 bg-green-50 border border-green-200 rounded-xl p-3.5 hover:bg-green-100 active:bg-green-150 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">WhatsApp</p>
                <p className="text-xs text-gray-500">+593 96 374 1884</p>
              </div>
            </a>

            <div className="flex items-center gap-3.5 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Ubicación</p>
                <p className="text-xs text-gray-500">Guayaquil, Ecuador</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <Clock size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Horarios de clase</p>
                <p className="text-xs text-gray-500">Martes, Jueves y Sábados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ FOOTER ═══════ */}
      <div className="bg-gradient-to-br from-purple-800 to-purple-900 px-5 py-8">
        <div className="max-w-md mx-auto text-center">
          <img src="/logo-landing.png" alt="Studio Dancers" className="w-28 mx-auto mb-3 opacity-80" />

          {/* Social again */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <a href="https://www.instagram.com/studiodancers.ec/" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <InstagramIcon />
            </a>
            <a href="https://www.facebook.com/studiodancers.ec/" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <FacebookIcon />
            </a>
          </div>

          {/* Quick links */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button onClick={onGoToCatalog} className="text-white/60 hover:text-white text-xs transition-colors">
              Ver Cursos
            </button>
            <span className="text-white/20">|</span>
            <button onClick={onGoToLogin} className="text-white/60 hover:text-white text-xs transition-colors">
              Portal de Pagos
            </button>
          </div>

          <p className="text-white/30 text-[10px]">
            © {new Date().getFullYear()} Studio Dancers. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
