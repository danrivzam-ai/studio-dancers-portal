import { useEffect } from 'react'
import { Trophy, Award, Gift, Star } from 'lucide-react'

// Tier icon component — no emojis
function TierIcon({ tier, color }) {
  const props = { size: 48, color, strokeWidth: 1.5 }
  if (tier === 'oro')    return <Trophy {...props} />
  if (tier === 'plata')  return <Award  {...props} />
  return                        <Star   {...props} />   // bronce
}

const TIER_CFG = {
  bronce: {
    label: 'Bronce',
    months: 3,
    discount: 5,
    bgFrom: '#fff7ed',
    bgTo: '#ffedd5',
    border: '#fb923c',
    titleColor: '#9a3412',
    subtitleColor: '#c2410c',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    badgeBorder: '#fdba74',
    barFrom: '#f97316',
    barTo: '#ea580c',
    iconColor: '#f97316',
    confetti: ['#f97316', '#fb923c', '#fdba74', '#fff7ed', '#fbbf24'],
    nextTier: 'Plata',
    nextDiscount: 10,
    nextMonths: 6,
  },
  plata: {
    label: 'Plata',
    months: 6,
    discount: 10,
    bgFrom: '#f8fafc',
    bgTo: '#e2e8f0',
    border: '#94a3b8',
    titleColor: '#1e293b',
    subtitleColor: '#475569',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    badgeBorder: '#cbd5e1',
    barFrom: '#94a3b8',
    barTo: '#475569',
    iconColor: '#64748b',
    confetti: ['#94a3b8', '#cbd5e1', '#64748b', '#e2e8f0', '#c0c0c0'],
    nextTier: 'Oro',
    nextDiscount: 15,
    nextMonths: 12,
  },
  oro: {
    label: 'Oro',
    months: 12,
    discount: 15,
    bgFrom: '#fffbeb',
    bgTo: '#fef3c7',
    border: '#f59e0b',
    titleColor: '#78350f',
    subtitleColor: '#92400e',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
    badgeBorder: '#fcd34d',
    barFrom: '#f59e0b',
    barTo: '#d97706',
    iconColor: '#d97706',
    confetti: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#d97706'],
    nextTier: null,
    nextDiscount: null,
    nextMonths: null,
  },
}

function Confetti({ cfg }) {
  const particles = Array.from({ length: 18 }, (_, i) => {
    const color = cfg.confetti[i % cfg.confetti.length]
    const left = `${5 + i * 5}%`
    const delay = `${(i * 0.12).toFixed(2)}s`
    const size = i % 3 === 0 ? 8 : i % 3 === 1 ? 6 : 5
    const duration = `${1.0 + (i % 4) * 0.2}s`
    return { color, left, delay, size, duration }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '-10px',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            background: p.color,
            animation: `confettiFall ${p.duration} ease-in ${p.delay} both`,
          }}
        />
      ))}
    </div>
  )
}

export default function MilestoneModal({ tier, studentName, onClose }) {
  const cfg = TIER_CFG[tier]
  if (!cfg) return null

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const firstName = studentName?.split(' ')[0] || 'Alumna'

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-5 z-50"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(145deg, ${cfg.bgFrom} 0%, ${cfg.bgTo} 100%)`,
          border: `2px solid ${cfg.border}`,
          animation: 'milestonePopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        <Confetti cfg={cfg} />

        <div className="relative z-10 px-6 pt-8 pb-6 text-center">
          {/* Tier icon */}
          <div
            className="flex justify-center mb-3"
            style={{ animation: 'milestonePopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
          >
            <TierIcon tier={tier} color={cfg.iconColor} />
          </div>

          <p
            className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: cfg.subtitleColor }}
          >
            Nuevo nivel desbloqueado
          </p>
          <h2
            className="text-2xl font-extrabold mb-1"
            style={{ color: cfg.titleColor }}
          >
            Nivel {cfg.label}
          </h2>
          <p className="text-sm mb-5" style={{ color: cfg.subtitleColor }}>
            {firstName}, llevas {cfg.months} meses de puntualidad impecable.
          </p>

          {/* Discount pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
            style={{ background: cfg.badgeBg, color: cfg.badgeText, border: `1px solid ${cfg.badgeBorder}` }}
          >
            <Gift size={14} />
            <span>{cfg.discount}% de descuento desbloqueado</span>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: '100%',
                  background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})`,
                  animation: 'barFillIn 0.8s ease-out 0.3s both',
                }}
              />
            </div>
            {cfg.nextTier ? (
              <p className="text-[10px] mt-1.5 text-center" style={{ color: cfg.subtitleColor }}>
                {cfg.nextMonths - cfg.months} {cfg.nextMonths - cfg.months === 1 ? 'mes' : 'meses'} mas para {cfg.nextTier} · {cfg.nextDiscount}% de descuento
              </p>
            ) : (
              <p className="text-[10px] mt-1.5 text-center" style={{ color: cfg.subtitleColor }}>
                Nivel maximo alcanzado. Gracias por tu fidelidad.
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: `linear-gradient(90deg, ${cfg.barFrom}, ${cfg.barTo})` }}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
