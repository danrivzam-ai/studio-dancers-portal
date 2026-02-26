import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, Copy, CheckCircle, Upload, Clock, XCircle, History, CreditCard } from 'lucide-react'
import UploadTransfer from './UploadTransfer'
import PaymentHistory from './PaymentHistory'

export default function Dashboard({ students, cedula, phoneLast4, onLogout }) {
  const [bankInfo, setBankInfo] = useState(null)
  const [requests, setRequests] = useState({})
  const [showUpload, setShowUpload] = useState(null) // student id or null
  const [showHistory, setShowHistory] = useState(null)
  const [copied, setCopied] = useState(false)
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

  const copyAccount = () => {
    if (bankInfo?.bank_account_number) {
      navigator.clipboard.writeText(bankInfo.bank_account_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Al día', color: 'bg-green-100 text-green-700' }
    if (status === 'partial') return { label: 'Abono parcial', color: 'bg-yellow-100 text-yellow-700' }
    if (status === 'pending') return { label: 'Pendiente', color: 'bg-red-100 text-red-700' }
    return { label: status || 'N/A', color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
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
        {/* Bank Info Card */}
        {bankInfo?.bank_account_number && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CreditCard size={16} className="text-purple-600" />
              Datos para Transferencia
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Banco:</span>
                <span className="font-medium text-gray-800">{bankInfo.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium text-gray-800">{bankInfo.bank_account_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cuenta:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-800">{bankInfo.bank_account_number}</span>
                  <button
                    onClick={copyAccount}
                    className="p-1 hover:bg-purple-50 rounded transition-colors"
                    title="Copiar número de cuenta"
                  >
                    {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} className="text-purple-500" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Titular:</span>
                <span className="font-medium text-gray-800">{bankInfo.bank_account_holder}</span>
              </div>
            </div>
          </div>
        )}

        {/* Student Cards */}
        {students.map(student => {
          const badge = getStatusBadge(student.payment_status)
          const studentRequests = requests[student.id] || []
          const pendingReqs = studentRequests.filter(r => r.status === 'pending')

          return (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Student Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.course_name}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Mensualidad</p>
                    <p className="text-lg font-bold text-gray-800">${parseFloat(student.monthly_fee || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Próximo pago</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(student.next_payment_date)}</p>
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
                      {pendingReqs.length} transferencia{pendingReqs.length > 1 ? 's' : ''} pendiente{pendingReqs.length > 1 ? 's' : ''} de verificación
                    </p>
                  </div>
                )}

                {/* Recent requests */}
                {studentRequests.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Últimas solicitudes</p>
                    {studentRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-700">${parseFloat(req.amount).toFixed(2)}</span>
                          <span className="text-gray-400 ml-2">{req.bank_name}</span>
                        </div>
                        {req.status === 'pending' && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px]">Pendiente</span>}
                        {req.status === 'approved' && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] flex items-center gap-0.5"><CheckCircle size={10} />Aprobada</span>}
                        {req.status === 'rejected' && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] flex items-center gap-0.5" title={req.rejection_reason}>
                            <XCircle size={10} />Rechazada
                          </span>
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
                  Ya transferí
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
