import { useState } from 'react'
import { Home, BookOpen, Palette, Heart, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

// ═══════ CONTENT BY AGE RANGE ═══════

const CONTENT = {
  baby: {
    label: 'Baby Ballet (3-5 años)',
    sections: [
      {
        icon: Home, title: 'En casa', color: '#6b2145',
        items: [
          { title: 'Juego de las estatuas bailarinas', body: 'Pon música y cuando pare, tu hija debe quedarse quieta en una pose de ballet. Ayuda a trabajar el equilibrio y la escucha musical.' },
          { title: 'Caminata de puntas por la casa', body: 'Practica caminar en relevé (puntitas) desde la cocina hasta su cuarto. Cuenta los pasos juntas. Fortalece los pies y tobillos de forma divertida.' },
          { title: 'Estiramiento de "teléfono"', body: 'Sentados, intenten llevar un pie hacia la nariz y luego moverlo hacia la oreja como si fuera un teléfono, sosteniendo la posición unos segundos. Mejora la flexibilidad jugando.' },
          { title: 'Círculos con los brazos', body: 'Como si fueran alas de mariposa: brazos arriba, al lado, abajo. Repetir 5 veces despacio. Desarrolla coordinación y conciencia corporal.' },
        ]
      },
      {
        icon: Sparkles, title: 'Creatividad', color: '#9e4a72',
        items: [
          { title: 'Dibuja tu tutú soñado', body: 'Dale papel y colores para que diseñe su tutú ideal. ¿De qué color sería? ¿Con brillos? ¿Con flores? Fomenta la creatividad y conexión con la danza.' },
          { title: 'Corona de bailarina', body: 'Con cartulina y stickers pueden hacer una corona o tiara de bailarina para practicar en casa. Refuerza la postura: la corona no se puede caer.' },
          { title: 'Playlist de práctica', body: 'Crea una playlist corta (10-15 min) con música clásica suave. Tu hija puede inventar su propia coreografía libre. Estimula la expresión corporal.' },
        ]
      },
      {
        icon: BookOpen, title: 'Sabías que...', color: '#2a7f7f',
        items: [
          { title: 'Las bailarinas usan 2-3 pares de zapatillas por semana', body: 'Las bailarinas profesionales gastan sus zapatillas de punta muy rápido por la intensidad del entrenamiento. ¡Por eso cuidamos las nuestras!' },
          { title: 'El ballet tiene más de 500 años', body: 'Nació en Italia durante el Renacimiento y luego se desarrolló en Francia. La palabra "ballet" viene del italiano "ballare" que significa bailar.' },
          { title: 'Las posiciones de pies son 5', body: 'Todas las combinaciones de ballet empiezan y terminan en una de las 5 posiciones básicas. Tu hija ya está aprendiéndolas en clase.' },
        ]
      },
      {
        icon: Heart, title: 'Bienestar', color: '#c2410c',
        items: [
          { title: 'Hidratación antes de clase', body: 'Asegúrate de que tome agua 30 minutos antes de la clase. Durante la clase también puede hidratarse. Evita jugos azucarados justo antes de bailar.' },
          { title: 'Descanso después de clase', body: 'Después de bailar, un snack ligero (fruta, yogur) y tiempo de descanso ayudan a la recuperación muscular, incluso en las más pequeñas.' },
          { title: 'El sueño es clave', body: 'Las niñas de 3-5 años necesitan 10-13 horas de sueño. Un buen descanso mejora la coordinación, el ánimo y el rendimiento en clase.' },
        ]
      }
    ]
  },
  kids: {
    label: 'Kids (6-9 años)',
    sections: [
      {
        icon: Home, title: 'En casa', color: '#6b2145',
        items: [
          { title: 'Práctica de plié frente al espejo', body: 'Usa el respaldo de una silla como barra. Practica demi-plié en primera y segunda posición, 8 repeticiones cada una. Mantén la espalda recta y las rodillas sobre los dedos.' },
          { title: 'Estiramiento de splits', body: '5 minutos diarios de estiramiento progresivo hacia el split. Nunca forzar, solo llegar hasta donde sea cómodo y sostener 30 segundos. La constancia es la clave.' },
          { title: 'Equilibrio en passé', body: 'De pie, subir una pierna en passé (triángulo) y mantener el equilibrio 10 segundos con cada pierna. Repetir 5 veces. Puedes hacerlo mientras ve su programa favorito.' },
          { title: 'Saltos en primera posición', body: 'Pequeños sautés (saltos) en primera posición: 8 saltos, descanso, 8 más. Los pies deben apuntar y aterrizar suavemente. Fortalece piernas y mejora la elevación.' },
        ]
      },
      {
        icon: Sparkles, title: 'Creatividad', color: '#9e4a72',
        items: [
          { title: 'Crea tu propia coreografía', body: 'Escoge una canción favorita y crea una secuencia de 8 movimientos. Puede mezclar pasos de ballet con movimientos libres. Presentarla a la familia el fin de semana.' },
          { title: 'Diario de ballet ilustrado', body: 'Un cuaderno donde dibuje los pasos que aprendió en clase y escriba cómo se sintió. Ayuda a procesar lo aprendido y crea un lindo recuerdo.' },
          { title: 'Noche de ballet en familia', body: 'Busca en YouTube un ballet clásico corto (El Cascanueces es ideal). Véanlo juntos y comenten qué pasos reconoce de sus clases.' },
        ]
      },
      {
        icon: BookOpen, title: 'Sabías que...', color: '#2a7f7f',
        items: [
          { title: 'El Lago de los Cisnes tiene 4 actos', body: 'Fue compuesto por Tchaikovsky en 1876. La bailarina principal hace el papel de Odette (cisne blanco) y Odile (cisne negro) — ¡dos personajes opuestos!' },
          { title: 'Un arabesque necesita todo el cuerpo', body: 'No es solo levantar la pierna atrás: los brazos, la espalda, el cuello y la mirada trabajan juntos para crear la línea perfecta.' },
          { title: 'Las bailarinas profesionales entrenan 6-8 horas diarias', body: 'Incluyen clase técnica, ensayos, acondicionamiento y estiramientos. Todo lo que tu hija aprende ahora es la base para ese nivel.' },
          { title: 'El tutú clásico tiene 10-12 capas de tul', body: 'Cada capa se corta y cose a mano. Un tutú profesional puede costar más de $2,000 y tomar semanas en fabricarse.' },
        ]
      },
      {
        icon: Heart, title: 'Bienestar', color: '#c2410c',
        items: [
          { title: 'Nutrición para bailarinas', body: 'Proteína (pollo, huevo, yogur) para los músculos, carbohidratos complejos (arroz, avena) para la energía, y frutas/verduras para las vitaminas. Evitar comida pesada 1 hora antes de clase.' },
          { title: 'Cuidado de los pies', body: 'Revisar que las zapatillas no estén muy apretadas. Después de clase, secar bien los pies y aplicar crema hidratante. Los pies son la herramienta principal de una bailarina.' },
          { title: 'Manejo de la frustración', body: 'Es normal que algunos pasos cuesten más que otros. Celebra el esfuerzo, no solo el resultado. "Hoy te vi intentar muchas veces y eso es lo que hace a una verdadera bailarina."' },
        ]
      }
    ]
  },
  teens: {
    label: 'Teens (10-16 años)',
    sections: [
      {
        icon: Home, title: 'En casa', color: '#6b2145',
        items: [
          { title: 'Rutina de barra en casa (20 min)', body: 'Pliés (8 en 1ra, 8 en 2da), tendus (8 cada dirección), rond de jambe (4 en dehors, 4 en dedans), développé (4 cada pierna). Usar silla o mueble estable como barra.' },
          { title: 'Fortalecimiento de core', body: 'Plancha 30 seg + descanso 15 seg × 3 series. Agregar elevación alterna de piernas en plancha. Un core fuerte = mejores giros y mejor equilibrio en puntas.' },
          { title: 'Trabajo de pies con theraband', body: 'Sentada con las piernas estiradas, envuelve la banda elástica en el pie y trabaja flexión/extensión. 15 repeticiones × 3 series cada pie. Prepara para las puntas.' },
          { title: 'Giros: spotting en casa', body: 'Fija un punto en la pared. Practica girar la cabeza rápido manteniendo los ojos en ese punto. 8 hacia la derecha, 8 hacia la izquierda. El secreto de los giros limpios.' },
        ]
      },
      {
        icon: Sparkles, title: 'Creatividad', color: '#9e4a72',
        items: [
          { title: 'Analiza una variación clásica', body: 'Busca en YouTube la variación de Kitri (Don Quijote) o la variación de Aurora (La Bella Durmiente). Identifica los pasos que conoces y los que quieres aprender.' },
          { title: 'Crea un mood board de ballet', body: 'En Pinterest o en papel, colecciona fotos de bailarinas que te inspiren, tutús que te gusten, escenarios que sueñes pisar. La visualización ayuda a definir metas.' },
          { title: 'Escribe tu meta del ciclo', body: '¿Qué quieres lograr este ciclo? ¿Dominar las piruetas? ¿Mejorar tu flexibilidad? Escríbelo y ponlo donde lo veas cada día.' },
        ]
      },
      {
        icon: BookOpen, title: 'Cultura de danza', color: '#2a7f7f',
        items: [
          { title: 'Misty Copeland: rompiendo barreras', body: 'Primera bailarina afroamericana principal del American Ballet Theatre. Empezó a bailar a los 13 años — relativamente tarde. Demostró que la determinación supera cualquier obstáculo.' },
          { title: 'Los métodos de ballet', body: 'Vaganova (ruso), Cecchetti (italiano), RAD (británico), Balanchine (americano). Cada uno tiene su estilo pero todos comparten la misma base técnica que estás aprendiendo.' },
          { title: 'Ballet contemporáneo vs clásico', body: 'El clásico sigue reglas estrictas de técnica y narrativa. El contemporáneo rompe esas reglas para expresar emociones de forma más libre. Ambos requieren la misma base técnica.' },
          { title: 'Anatomía de un grand jeté', body: 'Necesitas: impulso del plié, fuerza de piernas para la elevación, flexibilidad para el split en el aire, y control del core para el aterrizaje suave. Todo conectado.' },
        ]
      },
      {
        icon: Heart, title: 'Bienestar', color: '#c2410c',
        items: [
          { title: 'Recuperación post-clase', body: 'Estirar 10 min después de clase (cuando los músculos están calientes). Foam roller para liberar tensión. Proteína dentro de los 30 min post-entrenamiento para recuperación muscular.' },
          { title: 'Imagen corporal saludable', body: 'Tu cuerpo es tu instrumento, no tu enemigo. Cada cuerpo de bailarina es diferente y hermoso. Lo importante es estar fuerte y sana, no alcanzar un "ideal" imposible.' },
          { title: 'Prevención de lesiones', body: 'Nunca saltar calentamiento. Si algo duele, parar y comunicar a la instructora. Hielo después de clase si hay inflamación. Descansar cuando el cuerpo lo pida — el descanso también es entrenamiento.' },
          { title: 'Salud mental y presión', body: 'Está bien tener días malos en clase. Compararte con otras bailarinas es natural pero no productivo. Tu progreso se mide contra tu versión anterior, no contra las demás.' },
        ]
      }
    ]
  }
}

// Determine age range from student data
function getAgeRange(student) {
  // Use course age_min if available
  const ageMin = student?.age_min ?? student?.ageMin ?? 0
  if (ageMin >= 10) return 'teens'
  if (ageMin >= 6) return 'kids'
  if (ageMin >= 3) return 'baby'

  // Fallback: try to infer from course name
  const name = (student?.course_name || '').toLowerCase()
  if (name.includes('teen')) return 'teens'
  if (name.includes('kid')) return 'kids'
  if (name.includes('baby')) return 'baby'

  return 'kids' // default
}

export default function TabActividades({ students }) {
  const student = students?.[0]
  const ageRange = getAgeRange(student)
  const content = CONTENT[ageRange] || CONTENT.kids
  const [expanded, setExpanded] = useState({})
  const [openSection, setOpenSection] = useState(content.sections[0]?.title || '')

  const toggleItem = (sectionTitle, idx) => {
    const key = `${sectionTitle}-${idx}`
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const studentName = student?.name?.split(' ')[0] || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#551735] px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Actividades</h1>
            <p className="text-[#e8b4cc] text-xs mt-0.5">
              {studentName ? `Para ${studentName}` : content.label} · {content.label.split('(')[1]?.replace(')', '') || ''}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {content.sections.map(section => {
          const Icon = section.icon
          const isOpen = openSection === section.title

          return (
            <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => setOpenSection(isOpen ? '' : section.title)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: section.color + '15' }}
                >
                  <Icon size={17} style={{ color: section.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                  <p className="text-xs text-gray-400">{section.items.length} actividades</p>
                </div>
                {isOpen
                  ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                }
              </button>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-gray-50">
                  {section.items.map((item, idx) => {
                    const key = `${section.title}-${idx}`
                    const itemOpen = expanded[key]

                    return (
                      <div key={idx} className={idx > 0 ? 'border-t border-gray-50' : ''}>
                        <button
                          onClick={() => toggleItem(section.title, idx)}
                          className="w-full text-left px-4 py-3 flex items-start gap-2.5"
                        >
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                            style={{ background: section.color }}
                          />
                          <span className={`text-sm flex-1 ${itemOpen ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                            {item.title}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`mt-0.5 shrink-0 text-gray-300 transition-transform ${itemOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {itemOpen && (
                          <div className="px-4 pb-3 pl-9">
                            <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-300 pt-2 pb-4">
          Contenido adaptado para {content.label}
        </p>
      </div>
    </div>
  )
}
