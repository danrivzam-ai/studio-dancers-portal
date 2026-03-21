import { useState, useEffect } from 'react'
import { Lightbulb, Calendar } from 'lucide-react'
import { getTips, toggleReaction } from '../lib/adultas'

const EMOJIS = ['👏', '❤️', '💪', '🩰']

export default function TabRecursos({ students, cedula, phoneLast4 }) {
  const student = students?.[0]
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student?.course_id) return
    const load = async () => {
      setLoading(true)
      const { data } = await getTips(cedula, phoneLast4, student.course_id)
      setTips(data)
      setLoading(false)
    }
    load()
  }, [student?.course_id, cedula, phoneLast4])

  const handleReaction = async (tipId, emoji) => {
    // Optimistic update
    setTips(prev => prev.map(t => {
      if (t.id !== tipId) return t
      const wasSelected = t.my_reaction === emoji
      const counts = { ...t }
      // Decrement old reaction if exists
      if (t.my_reaction === '👏') counts.reaction_applause = Math.max(0, (counts.reaction_applause || 0) - 1)
      if (t.my_reaction === '❤️') counts.reaction_heart = Math.max(0, (counts.reaction_heart || 0) - 1)
      if (t.my_reaction === '💪') counts.reaction_strong = Math.max(0, (counts.reaction_strong || 0) - 1)
      if (t.my_reaction === '🩰') counts.reaction_ballet = Math.max(0, (counts.reaction_ballet || 0) - 1)
      // Increment new reaction (unless toggling off)
      if (!wasSelected) {
        if (emoji === '👏') counts.reaction_applause = (counts.reaction_applause || 0) + 1
        if (emoji === '❤️') counts.reaction_heart = (counts.reaction_heart || 0) + 1
        if (emoji === '💪') counts.reaction_strong = (counts.reaction_strong || 0) + 1
        if (emoji === '🩰') counts.reaction_ballet = (counts.reaction_ballet || 0) + 1
      }
      return { ...counts, my_reaction: wasSelected ? null : emoji }
    }))
    // Fire and forget
    await toggleReaction(cedula, phoneLast4, tipId, emoji)
  }

  const getCount = (tip, emoji) => {
    if (emoji === '👏') return tip.reaction_applause || 0
    if (emoji === '❤️') return tip.reaction_heart || 0
    if (emoji === '💪') return tip.reaction_strong || 0
    if (emoji === '🩰') return tip.reaction_ballet || 0
    return 0
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-EC', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  // Time greeting
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = student?.name?.split(' ')[0] || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#551735] px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Recursos</h1>
            <p className="text-[#e8b4cc] text-xs mt-0.5">
              {firstName ? `${greeting}, ${firstName}` : 'Tips de tu instructora'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#e8b4cc] border-t-[#6b2145] rounded-full animate-spin" />
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-14 px-4">
            <Lightbulb size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-base font-semibold text-gray-700 mb-1">Próximamente</p>
            <p className="text-xs text-gray-400">Tu instructora compartirá tips y recursos aquí.</p>
          </div>
        ) : (
          tips.map(tip => (
            <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tip header */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">{tip.title}</h3>
                  <span className="shrink-0 text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(tip.week_start)}
                  </span>
                </div>
                {tip.instructor_name && (
                  <p className="text-xs text-[#7e2d55] mt-1">Por {tip.instructor_name}</p>
                )}
              </div>

              {/* Tip body */}
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{tip.body}</p>
              </div>

              {/* Emoji reactions */}
              <div className="px-4 pb-3 flex items-center gap-2">
                {EMOJIS.map(emoji => {
                  const count = getCount(tip, emoji)
                  const isSelected = tip.my_reaction === emoji
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(tip.id, emoji)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#f9e8f0] border-2 border-[#7e2d55]'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className={`text-xs font-medium ${isSelected ? 'text-[#551735]' : 'text-gray-500'}`}>{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
