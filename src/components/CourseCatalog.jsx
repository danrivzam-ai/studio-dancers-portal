import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Clock, Users, DollarSign, X, CheckCircle, LogOut, MessageCircle, ChevronRight, Sparkles, Calendar, Star } from 'lucide-react'

const STUDIO_WHATSAPP = '593963741884'

const CATEGORY_CONFIG = {
  regular: {
    label: 'Clases Regulares',
    description: 'Ballet semanal para todas las edades',
    emoji: '\u{1FA70}',
    gradient: 'from-purple-500 to-purple-700'
  },
  intensivo: {
    label: 'Sabados Intensivos',
    description: 'Sesiones intensivas de fin de semana',
    emoji: '\u2B50',
    gradient: 'from-pink-500 to-rose-600'
  },
  especial: {
    label: 'Programas Especiales',
    description: 'Camps, talleres y eventos',
    emoji: '\u{1F3AD}',
    gradient: 'from-amber-500 to-orange-600'
  }
}

const PRICE_TYPE_LABELS = {
  mes: '/mes',
  paquete: '/paquete',
  clase: '/clase',
  programa: ''
}

export default function CourseCatalog({ onBack, isAuthenticated, onLogout }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.rpc('rpc_public_courses')
        if (!error && data) setCourses(data)
      } catch (e) {
        console.warn('Error fetching courses:', e)
      }
      setLoading(false)
    }
    fetchCourses()
  }, [])

  // --- HISTORY API for internal navigation (category / course detail) ---
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state

      // If we have a course detail open, close it first
      if (selectedCourse) {
        setSelectedCourse(null)
        return
      }
      // If we're in a category, go back to category list
      if (selectedCategory) {
        setSelectedCategory(null)
        return
      }
      // Otherwise, let the parent handle it (App.jsx popstate will fire)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedCategory, selectedCourse])

  const openCategory = useCallback((category) => {
    history.pushState({ catalog: 'category', category }, '')
    setSelectedCategory(category)
  }, [])

  const openCourse = useCallback((course) => {
    history.pushState({ catalog: 'course', courseId: course.id }, '')
    setSelectedCourse(course)
  }, [])

  const goBackFromCategory = useCallback(() => {
    history.back()
  }, [])

  const closeCourse = useCallback(() => {
    history.back()
  }, [])

  // Group courses by category
  const grouped = courses.reduce((acc, course) => {
    const cat = (course.category === 'camp') ? 'especial' : (course.category || 'regular')
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(course)
    return acc
  }, {})

  const formatAge = (min, max) => {
    if (!min && !max) return null
    if (min === 3 && max === 99) return null
    if (max >= 99) return `Desde ${min} anos`
    return `${min}-${max} anos`
  }

  // --- CATEGORY LIST VIEW ---
  const renderCategoryList = () => (
    <div className="max-w-md mx-auto p-4 space-y-3 pb-24">
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No hay cursos disponibles</p>
          <p className="text-sm mt-1">Vuelve pronto para ver nuevas opciones</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catCourses]) => {
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.regular
          return (
            <button
              key={category}
              onClick={() => openCategory(category)}
              className="w-full text-left"
            >
              <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow relative overflow-hidden`}>
                {/* Background decoration */}
                <span className="absolute -right-3 -bottom-3 text-7xl opacity-20">{config.emoji}</span>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{config.label}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{config.description}</p>
                    </div>
                    <ChevronRight size={22} className="text-white/60" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {catCourses.length} {catCourses.length === 1 ? 'curso' : 'cursos'}
                    </span>
                    {catCourses.some(c => c.image_url) && (
                      <div className="flex -space-x-2">
                        {catCourses.filter(c => c.image_url).slice(0, 3).map((c, i) => (
                          <img key={i} src={c.image_url} alt="" className="w-6 h-6 rounded-full border-2 border-white/30 object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )

  // --- COURSES IN CATEGORY VIEW ---
  const renderCategoryCourses = () => {
    const catCourses = grouped[selectedCategory] || []
    const config = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG.regular

    return (
      <div className="max-w-md mx-auto p-4 space-y-3 pb-24">
        {/* Category header */}
        <div className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-4 text-white mb-1`}>
          <span className="text-3xl">{config.emoji}</span>
          <h2 className="font-bold text-xl mt-1">{config.label}</h2>
          <p className="text-white/70 text-xs">{catCourses.length} {catCourses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</p>
        </div>

        {/* Course cards */}
        {catCourses.map(course => (
          <button
            key={course.id}
            onClick={() => openCourse(course)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow"
          >
            <div className="flex">
              {/* Thumbnail */}
              {course.image_url ? (
                <img src={course.image_url} alt={course.name} className="w-24 h-24 object-cover shrink-0" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">{'\u{1FA70}'}</span>
                </div>
              )}
              {/* Info */}
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
                  <span className="font-bold text-purple-700 text-sm">
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
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
                {selectedCategory ? (CATEGORY_CONFIG[selectedCategory]?.label || 'Cursos') : 'Nuestros Cursos'}
              </h1>
              <p className="text-xs text-white/70">
                {selectedCategory ? 'Toca un curso para mas info' : 'Elige una categoria'}
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

      {/* Content */}
      {selectedCategory ? renderCategoryCourses() : renderCategoryList()}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={closeCourse}>
          <div
            className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            {selectedCourse.image_url ? (
              <div className="relative">
                <img src={selectedCourse.image_url} alt={selectedCourse.name} className="w-full h-48 object-cover" />
                <button
                  onClick={closeCourse}
                  className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <span className="text-5xl">{'\u{1FA70}'}</span>
                <button
                  onClick={closeCourse}
                  className="absolute top-3 right-3 p-2 bg-black/20 text-white rounded-full"
                >
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

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedCourse.schedule && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1"><Clock size={10} />Horario</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedCourse.schedule}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1"><DollarSign size={10} />Precio</p>
                  <p className="text-sm font-semibold text-purple-700 mt-0.5">
                    ${parseFloat(selectedCourse.price).toFixed(2)}{PRICE_TYPE_LABELS[selectedCourse.price_type] || ''}
                  </p>
                </div>
                {formatAge(selectedCourse.age_min, selectedCourse.age_max) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-medium flex items-center gap-1"><Users size={10} />Edades</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{formatAge(selectedCourse.age_min, selectedCourse.age_max)}</p>
                  </div>
                )}
              </div>

              {/* Benefits */}
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

              {/* Requirements */}
              {selectedCourse.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Requisitos</h3>
                  <ul className="space-y-1.5">
                    {selectedCourse.requirements.split('\n').filter(Boolean).map((r, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500">-</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(`Hola! Me interesa el curso: ${selectedCourse.name}. Quisiera mas informacion para inscribirme.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Deseo inscribirme
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
    </div>
  )
}
