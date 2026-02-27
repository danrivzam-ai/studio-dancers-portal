import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, Copy, CheckCircle, Upload, Clock, XCircle, History, CreditCard, BookOpen, RefreshCw, Shield, ExternalLink } from 'lucide-react'
import UploadTransfer from './UploadTransfer'
import PaymentHistory from './PaymentHistory'

export default function Dashboard({ students, cedula, phoneLast4, onLogout }) {
  const [bankInfo, setBankInfo] = useState(null)
  const [requests, setRequests] = useState({})
  const [showUpload, setShowUpload] = useState(null)
  const [showHistory, setShowHistory] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch bank info
  useEffect(() => {
    const fetchBank = async () => {
      const { data } = await supabase.rpc('rpc_client_get_bank_info')
      if (data && data.length > 0) setBankInfo(data[0])
    }
    fetchBank()
  }, [])

  // Fetch transfer requests for each student
  useEffect(() => {
    const fetchRequests = async () => {
      const allReqs = {}
      for (const s of students) {
        const { data } = await supabase.rpc('rpc_client_get_requests', {
          p_cedula: cedula,
          p_phone_last4: phoneLast4,
          p_student_id: s.id
        })
        allReqs[s.id] = data || []
      }
      setRequests(allReqs)
    }
    fetchRequests()
  }, [students, cedula, phoneLast4, refreshKey])

  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Al dia', color: 'bg-green-100 text-green-700' }
    if (status === 'partial') return { label: 'Abono parcial', color: 'bg-yellow-100 text-yellow-700' }
    if (status === 'pending') return { label: 'Pendiente', color: 'bg-red-100 text-red-700' }
    return { label: status || 'N/A', color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Check if course is cycle/package based
  const isCycleBased = (student) => {
    const pt = student.price_type
    return pt === 'paquete' || pt === 'programa' || pt === 'clase'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{bankInfo?.school_name || 'Studio Dancers'}</h1>
            <p className="text-xs text-white/70">Portal de Pagos</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Salir"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Bank Info Card - Vertical layout for better mobile readability */}
        {bankInfo?.bank_account_number && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={16} className="text-purple-600" />
              Datos para Transferencia
            </h2>
            <div className="space-y-1.5">
              {[
                { label: 'Banco', value: bankInfo.bank_name, key: 'banco' },
                { label: 'Nro. Cuenta', value: bankInfo.bank_account_number, key: 'cuenta', mono: true },
                { label: 'Tipo de Cuenta', value: bankInfo.bank_account_type, key: 'tipo' },
                { label: 'Titular', value: bankInfo.bank_account_holder, key: 'titular' },
                { label: 'Cedula', value: '0915553630', key: 'cedula', mono: true },
              ].map(({ label, value, key, mono }) => (
                <button
                  key={key}
                  onClick={() => copyToClipboard(value, key)}
                  className="w-full bg-gray-50 hover:bg-purple-50 active:bg-purple-100 rounded-lg px-3 py-2.5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className={`text-sm font-medium text-gray-800 mt-0.5 break-words ${mono ? 'font-mono tracking-wide' : ''}`}>
                        {value}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {copiedField === key ? (
                        <span className="flex items-center gap-1 text-green-600 text-[10px] font-medium">
                          <CheckCircle size={14} />
                          Copiado
                        </span>
                      ) : (
                        <Copy size={14} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Toque cualquier campo para copiar</p>
          </div>
        )}

        {/* PayPhone Online Payment */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Shield size={16} className="text-green-600" />
              Pago con Tarjeta
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Pago 100% seguro via Produbanco y PayPhone. Datos encriptados (PCI DSS 4.0). Sin guardar info de tu tarjeta.
            </p>
            <a
              href="https://ppls.me/8IycwXygt2iTUEYuTLiyQ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              <CreditCard size={18} />
              Pagar con Tarjeta
              <ExternalLink size={14} className="opacity-70" />
            </a>
          </div>
          <div className="bg-green-100/50 px-4 py-2 flex items-center justify-center gap-2">
            <Shield size={11} className="text-green-700" />
            <span className="text-[10px] text-green-700 font-medium">Transaccion segura · PCI DSS 4.0 · No almacena datos</span>
          </div>
        </div>

        {/* Student Cards */}
        {students.map(student => {
          const badge = getStatusBadge(student.payment_status)
          const studentRequests = requests[student.id] || []
          const pendingReqs = studentRequests.filter(r => r.status === 'pending')
          const cycleMode = isCycleBased(student)
          const hasClassInfo = cycleMode && student.classes_per_cycle > 0
          const classesUsed = student.classes_used || 0
          const classesTotal = student.classes_per_cycle || 0
          const progressPct = hasClassInfo ? Math.min((classesUsed / classesTotal) * 100, 100) : 0

          return (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Student Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1 mr-2">
                    <h3 className="font-bold text-gray-800 truncate">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.course_name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Classes Progress (for cycle/package courses) */}
                {hasClassInfo && (
                  <div className="bg-purple-50 rounded-lg p-3 mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-purple-800 flex items-center gap-1.5">
                        <BookOpen size={13} className="text-purple-600" />
                        Clases del ciclo
                      </p>
                      <span className="text-xs font-bold text-purple-700">
                        {classesUsed} / {classesTotal}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progressPct >= 100 ? 'bg-red-500' : progressPct >= 75 ? 'bg-amber-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {progressPct >= 90 && (
                      <p className="text-[10px] text-amber-700 mt-1 font-medium">
                        {progressPct >= 100 ? 'Ciclo completado - Hora de renovar' : 'Quedan pocas clases'}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">
                      {cycleMode ? 'Inversion' : 'Mensualidad'}
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      ${parseFloat(student.monthly_fee || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1">
                      {cycleMode ? (
                        <>
                          <RefreshCw size={9} />
                          Renovacion
                        </>
                      ) : (
                        'Proximo pago'
                      )}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(student.next_payment_date)}
                    </p>
                  </div>
                </div>

                {student.balance > 0 && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-yellow-700">Saldo pendiente: <span className="font-bold">${parseFloat(student.balance).toFixed(2)}</span></p>
                  </div>
                )}

                {/* Pending requests */}
                {pendingReqs.length > 0 && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-xs text-blue-700 flex items-center gap-1">
                      <Clock size={12} />
                      {pendingReqs.length} transferencia{pendingReqs.length > 1 ? 's' : ''} pendiente{pendingReqs.length > 1 ? 's' : ''} de verificacion
                    </p>
                  </div>
                )}

                {/* Recent requests */}
                {studentRequests.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Ultimas solicitudes</p>
                    {studentRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">${parseFloat(req.amount).toFixed(2)}</span>
                          <span className="text-gray-400 ml-2">{req.bank_name}</span>
                        </div>
                        {req.status === 'pending' && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px] shrink-0 ml-2">Pendiente</span>}
                        {req.status === 'approved' && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] flex items-center gap-0.5 shrink-0 ml-2"><CheckCircle size={10} />Aprobada</span>}
                        {req.status === 'rejected' && (
                          <div className="flex flex-col items-end shrink-0 ml-2">
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] flex items-center gap-0.5">
                              <XCircle size={10} />Rechazada
                            </span>
                            {req.rejection_reason && (
                              <p className="text-[10px] text-red-500 mt-0.5 text-right max-w-[180px]">
                                {req.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t flex divide-x">
                <button
                  onClick={() => setShowUpload(student.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  <Upload size={16} />
                  Ya transferi
                </button>
                <button
                  onClick={() => setShowHistory(student.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <History size={16} />
                  Historial
                </button>
              </div>
            </div>
          )
        })}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-2 pb-6">
          Si tiene dudas, contacte al estudio.
        </p>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadTransfer
          studentId={showUpload}
          studentName={students.find(s => s.id === showUpload)?.name}
          cedula={cedula}
          phoneLast4={phoneLast4}
          onClose={() => { setShowUpload(null); setRefreshKey(k => k + 1) }}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <PaymentHistory
          studentId={showHistory}
          studentName={students.find(s => s.id === showHistory)?.name}
          cedula={cedula}
          phoneLast4={phoneLast4}
          onClose={() => setShowHistory(null)}
        />
      )}
    </div>
  )
}
