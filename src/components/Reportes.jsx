import { useState, useEffect } from 'react'
import { FileText, Download, ChevronRight, LogOut, User } from 'lucide-react'
import { getReportesAprobados, getEvaluacionesCiclo } from '../lib/reportes'
import { generateReportePDF } from './ReportePDF'

const MONTHS = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m)]}`
}

export default function Reportes({ students, onLogout }) {
  const [reportes,    setReportes]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [downloading, setDownloading] = useState({}) // { [id]: true }

  useEffect(() => {
    if (!students?.length) { setLoading(false); return }
    const ids = students.map(s => s.id)
    getReportesAprobados(ids).then(({ data }) => {
      setReportes(data || [])
      setLoading(false)
    })
  }, [students])

  async function handleDownload(reporte) {
    setDownloading(d => ({ ...d, [reporte.id]: true }))
    try {
      const { evaluations } = await getEvaluacionesCiclo(reporte.cycle_id, reporte.student_id)
      await generateReportePDF(reporte, evaluations)
    } catch (err) {
      console.error('PDF error:', err)
    }
    setDownloading(d => ({ ...d, [reporte.id]: false }))
  }

  // Group reports by student
  const byStudent = {}
  reportes.forEach(r => {
    if (!byStudent[r.student_id]) {
      byStudent[r.student_id] = { name: r.student_name, id: r.student_id, reports: [] }
    }
    byStudent[r.student_id].reports.push(r)
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #551735 0%, #6b2145 50%, #7e2d55 100%)' }}>

      {/* Header */}
      <div className="shrink-0 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Reportes</h1>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-white/60 hover:text-white/90 text-xs transition-colors"
          >
            <LogOut size={14} />
            <span>Salir</span>
          </button>
        </div>
        <p className="text-white/70 text-sm">Reportes de progreso por ciclo</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl px-4 pt-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#c07a9a] border-t-[#551735] rounded-full animate-spin" />
          </div>
        ) : reportes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f9e8f0] flex items-center justify-center mb-4">
              <FileText size={28} className="text-[#9e4a72]" />
            </div>
            <p className="font-semibold text-gray-700">Sin reportes disponibles</p>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Los reportes de ciclo aparecerán aquí una vez que la instructora los genere y el admin los apruebe.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(byStudent).map(student => (
              <div key={student.id}>
                {/* Student header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#f9e8f0] flex items-center justify-center shrink-0">
                    <User size={13} className="text-[#6b2145]" />
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                </div>

                {/* Reports list */}
                <div className="space-y-2">
                  {student.reports.map(r => (
                    <div
                      key={r.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-[#fdf2f7] flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-[#7e2d55]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            Ciclo {r.numero_ciclo}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {r.course_name}
                            {r.fecha_inicio && (
                              <span className="ml-1">
                                · {fmtDate(r.fecha_inicio)}{r.fecha_fin ? ` – ${fmtDate(r.fecha_fin)}` : ''}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.asistencias_count}/{r.total_clases} clases · {r.total_clases ? Math.round((r.asistencias_count / r.total_clases) * 100) : 0}% asistencia
                          </p>
                        </div>

                        {/* Download button */}
                        <button
                          onClick={() => handleDownload(r)}
                          disabled={downloading[r.id]}
                          className="shrink-0 flex items-center gap-1.5 bg-[#6b2145] text-white rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-60 hover:bg-[#551735] active:scale-95 transition-all"
                        >
                          {downloading[r.id] ? (
                            <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          <span>{downloading[r.id] ? 'PDF…' : 'PDF'}</span>
                        </button>
                      </div>

                      {/* Preview snippet */}
                      {r.observacion_profesora && (
                        <div className="px-4 pb-3">
                          <p className="text-xs text-gray-500 line-clamp-2 italic border-t border-gray-50 pt-2">
                            "{r.observacion_profesora}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
