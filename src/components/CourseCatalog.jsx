import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Clock, Users, DollarSign, X, CheckCircle, LogOut, MessageCircle } from 'lucide-react'

const STUDIO_WHATSAPP = '593963741884'

const CATEGORY_LABELS = {
  regular: 'Clases Regulares',
  intensivo: 'Intensivos',
  camp: 'Programas Especiales',
  especial: 'Programas Especiales'
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
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.rpc('rpc_public_courses')
      if (!error && data) setCourses(data)
      setLoading(false)
    }
    fetchCourses()
  }, [])

  // Group courses by category
  const grouped = courses.reduce((acc, course) => {
    const cat = course.category === 'camp' ? 'especial' : course.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(course)
    return acc
  }, {})

  const formatAge = (min, max) => {
    if (!min && !max) return null
    if (min === 3 && max === 99) return null
    if (max >= 99) return `Desde ${min} años`
    return `${min}-${max} años`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="font-bold text-lg">Nuestros Cursos</h1>
              <p className="text-xs text-white/70">Descubre tu clase ideal</p>
            </div>
          </div>
          {isAuthenticated && onLogout && (
            <button onClick={onLogout} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No hay cursos disponibles</p>
            <p className="text-sm mt-1">Vuelve pronto para ver nuevas opciones</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catCourses]) => (
            <div key={category}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="space-y-3">
                {catCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.name} className="w-full h-36 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">🩰</span>
                      </div>
                    )}
                    <div className="p-3.5">
                      <h3 className="font-bold text-gray-800 text-sm">{course.name}</h3>
                      {course.schedule && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock size={11} />
                          {course.schedule}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {formatAge(course.age_min, course.age_max) && (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                              {formatAge(course.age_min, course.age_max)}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-purple-700 text-sm">
                          ${parseFloat(course.price).toFixed(0)}{PRICE_TYPE_LABELS[course.price_type] || ''}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedCourse(null)}>
          <div
            className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            {selectedCourse.image_url ? (
              <div className="relative">
                <img src={selectedCourse.image_url} alt={selectedCourse.name} className="w-full h-48 object-cover" />
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative w-full h-32 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                <span className="text-5xl">🩰</span>
                <button
                  onClick={() => setSelectedCourse(null)}
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
                href={`https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(`Hola! Me interesa el curso: ${selectedCourse.name}. Quisiera más información para inscribirme.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Deseo inscribirme
              </a>
              <button
                onClick={() => setSelectedCourse(null)}
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
