import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { X, History } from 'lucide-react'

export default function PaymentHistory({ studentId, studentName, cedula, phoneLast4, onClose }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.rpc('rpc_client_payment_history', {
          p_cedula: cedula,
          p_phone_last4: phoneLast4,
          p_student_id: studentId
        })
        if (error) throw error
        setPayments(data || [])
      } catch (err) {
        console.error('Error fetching history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [studentId, cedula, phoneLast4])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Historial de Pagos</h3>
              <p className="text-xs text-gray-500">{studentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No hay pagos registrados</div>
          ) : (
            <div className="divide-y">
              {payments.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">${parseFloat(p.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.payment_date)} • {p.payment_method}</p>
                    {p.receipt_number && (
                      <p className="text-[10px] text-gray-400">Recibo: {p.receipt_number}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    p.payment_type === 'full' ? 'bg-green-100 text-green-700' :
                    p.payment_type === 'installment' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {p.payment_type === 'full' ? 'Completo' : p.payment_type === 'installment' ? 'Abono' : p.payment_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
