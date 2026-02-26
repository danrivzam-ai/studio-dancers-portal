import { CreditCard, Lightbulb, BookOpen } from 'lucide-react'

const TABS = [
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
  { id: 'courses', label: 'Cursos', icon: BookOpen }
]

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md mx-auto flex">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-2.5 transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
