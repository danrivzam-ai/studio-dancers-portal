import { Flame, Shirt, Star, Brain, Droplets, Zap, LogOut, Music2, Music, Activity, Sparkles, ExternalLink } from 'lucide-react'

const BALLET_TIPS = [
  {
    id: 'warmup',
    icon: Flame,
    title: 'Preparación Física',
    accent: 'border-orange-400',
    iconColor: 'bg-orange-100 text-orange-500',
    tips: [
      { heading: 'Tu cuerpo es tu instrumento', body: 'Llega 10 minutos antes para entrar en sintonía con el espacio.' },
      { heading: 'Activa, no fuerces', body: 'Inicia con rotaciones articulares suaves: cuello, hombros, tobillos.' },
      { heading: 'Regla de oro', body: 'Nunca estires un músculo en frío. El estiramiento profundo se hace al final de la clase.' }
    ]
  },
  {
    id: 'attire',
    icon: Shirt,
    title: 'Indumentaria y Disciplina',
    accent: 'border-pink-400',
    iconColor: 'bg-pink-100 text-pink-500',
    tips: [
      { heading: 'El uniforme tiene un propósito', body: 'La ropa ajustada permite a tus maestros ver y corregir tu alineación ósea.' },
      { heading: 'Cabello impecable', body: 'Un moño firme te da equilibrio en los giros y despeja tu línea del cuello.' },
      { heading: 'Cuidado del calzado', body: 'Usa tus zapatillas de media punta exclusivamente dentro del salón para protegerlas.' }
    ]
  },
  {
    id: 'posture',
    icon: Star,
    title: 'Presencia Escénica',
    accent: 'border-purple-400',
    iconColor: 'bg-purple-100 text-purple-500',
    tips: [
      { heading: 'Proyecta elegancia', body: 'Mantén los hombros relajados, presionando suavemente hacia abajo y atrás.' },
      { heading: 'El hilo invisible', body: 'Imagina que una cuerda tira de tu coronilla hacia el techo, alargando tu columna.' },
      { heading: 'Centro activo', body: 'Tu fuerza nace del core; mantén el ombligo ligeramente contraído hacia la espalda.' }
    ]
  },
  {
    id: 'mindset',
    icon: Brain,
    title: 'Mentalidad de Bailarín',
    accent: 'border-yellow-400',
    iconColor: 'bg-yellow-100 text-yellow-600',
    tips: [
      { heading: 'La excelencia es un hábito', body: 'La maestría se logra repitiendo lo básico hasta que parezca fácil.' },
      { heading: 'Baila con el cerebro', body: 'Escucha las correcciones que el maestro le da a otras compañeras y aplícalas a ti misma.' },
      { heading: 'Paciencia y constancia', body: 'Tu mayor competencia es la bailarina que eras ayer.' }
    ]
  },
  {
    id: 'hydration',
    icon: Droplets,
    title: 'Hidratación Inteligente',
    accent: 'border-blue-400',
    iconColor: 'bg-blue-100 text-blue-500',
    tips: [
      { heading: 'No esperes a tener sed', body: 'Bebe sorbos pequeños antes, durante y después de tu rutina.' },
      { heading: 'Agua es vida', body: 'Evita jugos artificiales o bebidas azucaradas que te generen pesadez.' },
      { heading: 'Sé autosuficiente', body: 'Lleva siempre tu propia botella identificada al salón.' }
    ]
  },
  {
    id: 'nutrition',
    icon: Zap,
    title: 'Combustible y Energía',
    accent: 'border-green-400',
    iconColor: 'bg-green-100 text-green-600',
    tips: [
      { heading: 'Energía limpia', body: 'Consume un snack ligero (fruta o frutos secos) entre 1 y 2 horas antes de bailar.' },
      { heading: 'Evita la fatiga', body: 'Bailar en ayunas prolongadas o tras una comida pesada afecta tu rendimiento.' }
    ]
  }
]

const PLAYLISTS = [
  {
    id: 'clasica',
    icon: Music,
    title: 'Música Clásica · Ballet',
    description: 'Tchaikovsky, Delibes, Minkus. Ideal para practicar barra y combinaciones.',
    accent: 'border-purple-400',
    iconColor: 'bg-purple-100 text-purple-600',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX4PkVkn6ZiRR',
  },
  {
    id: 'stretching',
    icon: Activity,
    title: 'Estiramiento · Relax',
    description: 'Música suave y continua para el estiramiento final y la recuperación muscular.',
    accent: 'border-teal-400',
    iconColor: 'bg-teal-100 text-teal-600',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m',
  },
  {
    id: 'baby',
    icon: Sparkles,
    title: 'Baby Ballet · Primeros pasos',
    description: 'Melodías alegres y dinámicas para las mas pequeñas.',
    accent: 'border-pink-400',
    iconColor: 'bg-pink-100 text-pink-500',
    url: 'https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa',
  },
]

export default function BalletTips({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Secretos del Bailarín</h1>
            <p className="text-xs text-white/70">Lo que los profesionales saben y aplican</p>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-24 space-y-3">
        {BALLET_TIPS.map(category => {
          const Icon = category.icon
          return (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${category.accent} overflow-hidden`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${category.iconColor}`}>
                  <Icon size={17} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm tracking-tight">{category.title}</h3>
              </div>

              {/* Tips list */}
              <div className="px-4 pb-4 space-y-3">
                {category.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="text-purple-300 font-bold text-xs mt-0.5 shrink-0">✦</span>
                    <div>
                      <span className="text-[12px] font-semibold text-gray-800">{tip.heading}: </span>
                      <span className="text-[12px] text-gray-500 leading-snug">{tip.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* ───── Playlists de Spotify ───── */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <Music2 size={15} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 leading-tight">Playlists para bailar</p>
              <p className="text-[10px] text-gray-400">Curadas por el estudio · abre en Spotify</p>
            </div>
          </div>

          <div className="space-y-2">
            {PLAYLISTS.map(pl => {
              const PlIcon = pl.icon
              return (
              <a
                key={pl.id}
                href={pl.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${pl.accent} px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${pl.iconColor}`}>
                  <PlIcon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 leading-tight">{pl.title}</p>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{pl.description}</p>
                </div>
                <ExternalLink size={13} className="text-gray-300 shrink-0" />
              </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
