import { CreditCard, Sparkles, Target, BookHeart, FileText, CalendarDays, BookOpen, Lightbulb } from 'lucide-react'

const TABS_ADULTAS = [
  { id: 'payments',   label: 'Pagos',      icon: CreditCard   },
  { id: 'bienestar',  label: 'Bienestar',  icon: Sparkles     },
  { id: 'retos',      label: 'Retos',      icon: Target       },
  { id: 'diario',     label: 'Mi diario',  icon: BookHeart    },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'recursos',   label: 'Recursos',   icon: Lightbulb    },
]

const TABS_NINAS = [
  { id: 'payments',     label: 'Pagos',        icon: CreditCard   },
  { id: 'calendario',   label: 'Calendario',   icon: CalendarDays },
  { id: 'actividades',  label: 'Actividades',  icon: Sparkles     },
  { id: 'glosario',     label: 'Glosario',     icon: BookOpen     },
  { id: 'reportes',     label: 'Reportes',     icon: FileText     },
]

export default function BottomNav({ activeTab, onChangeTab, isAdultas, hasNewTips }) {
  const tabs   = isAdultas ? TABS_ADULTAS : TABS_NINAS
  // Con 6 tabs usamos iconos e interlineado más compactos
  const compact = tabs.length >= 6

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" role="tablist" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center transition-colors ${
                compact ? 'py-2 pt-2.5' : 'py-2 pt-2.5'
              } ${isActive ? 'text-[#6b2145]' : 'text-gray-400'}`}
            >
              <span className="relative">
                <Icon size={compact ? 19 : 22} strokeWidth={isActive ? 2.5 : 2} />
                {tab.id === 'recursos' && hasNewTips && !isActive && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </span>
              <span className={`mt-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'} ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
