import { Flame, User, Shirt, Droplets, Star, Apple, LogOut } from 'lucide-react'

const BALLET_TIPS = [
  {
    id: 'warmup',
    icon: Flame,
    title: 'Calentamiento',
    color: 'bg-orange-100 text-orange-600',
    tips: [
      'Llegue 10 minutos antes de clase para calentar',
      'Comience con ejercicios suaves de cuello y hombros',
      'Nunca estire en frío — primero active los músculos'
    ]
  },
  {
    id: 'posture',
    icon: User,
    title: 'Postura',
    color: 'bg-purple-100 text-purple-600',
    tips: [
      'Mantenga los hombros relajados y hacia abajo',
      'Imagine un hilo que jala desde la coronilla',
      'Active el core: ombligo hacia la columna'
    ]
  },
  {
    id: 'attire',
    icon: Shirt,
    title: 'Vestimenta',
    color: 'bg-pink-100 text-pink-600',
    tips: [
      'Use ropa ajustada que permita ver la alineación',
      'Zapatillas de media punta para principiantes',
      'Cabello recogido en moño firme'
    ]
  },
  {
    id: 'hydration',
    icon: Droplets,
    title: 'Hidratación',
    color: 'bg-blue-100 text-blue-600',
    tips: [
      'Beba agua antes, durante y después de clase',
      'Evite bebidas azucaradas antes de bailar',
      'Lleve su propia botella de agua'
    ]
  },
  {
    id: 'technique',
    icon: Star,
    title: 'Técnica',
    color: 'bg-yellow-100 text-yellow-600',
    tips: [
      'La repetición es clave: practique lo básico',
      'No fuerce el turnout — respete su anatomía',
      'Escuche a su cuerpo: dolor no es progreso'
    ]
  },
  {
    id: 'nutrition',
    icon: Apple,
    title: 'Alimentación',
    color: 'bg-green-100 text-green-600',
    tips: [
      'Coma algo ligero 1-2 horas antes de clase',
      'Incluya proteína para recuperación muscular',
      'Evite comer pesado justo antes de bailar'
    ]
  }
]

export default function BalletTips({ onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Tips de Ballet</h1>
            <p className="text-xs text-white/70">Consejos para mejorar tu práctica</p>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {BALLET_TIPS.map(category => {
            const Icon = category.icon
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${category.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2">{category.title}</h3>
                <ul className="space-y-1.5">
                  {category.tips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-gray-600 leading-snug flex items-start gap-1.5">
                      <span className="text-purple-400 mt-px">-</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
