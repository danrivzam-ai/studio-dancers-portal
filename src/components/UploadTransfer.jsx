import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { BANKS } from '../lib/banks'
import { X, Upload, CheckCircle, Camera } from 'lucide-react'

export default function UploadTransfer({ studentId, studentName, cedula, phoneLast4, onClose }) {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 1200
          const scale = Math.min(1, maxWidth / img.width)
          canvas.width = img.width * scale
          canvas.height = img.height * scale
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(resolve, 'image/jpeg', 0.7)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Compress
    const compressed = await compressImage(file)
    setImage(compressed)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Ingrese el monto transferido')
      return
    }
    if (!bankName) {
      setError('Seleccione el banco')
      return
    }
    if (!image) {
      setError('Suba una foto del comprobante')
      return
    }

    setLoading(true)
    try {
      // Upload image to Supabase Storage
      const fileName = `${cedula}_${studentId}_${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('transfer-receipts')
        .upload(fileName, image, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('transfer-receipts')
        .getPublicUrl(fileName)

      const receiptUrl = urlData.publicUrl

      // Submit transfer request via RPC
      const { data, error: rpcError } = await supabase.rpc('rpc_client_submit_transfer', {
        p_cedula: cedula,
        p_phone_last4: phoneLast4,
        p_student_id: studentId,
        p_amount: parseFloat(amount),
        p_bank_name: bankName,
        p_receipt_image_url: receiptUrl,
        p_notes: notes || null
      })

      if (rpcError) throw rpcError

      setSuccess(true)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Error al enviar. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Comprobante enviado</h3>
          <p className="text-sm text-gray-500 mb-6">
            Su comprobante será verificado por el estudio. Le notificaremos cuando sea aprobado.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium"
          >
            Entendido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Enviar Comprobante</h3>
            <p className="text-xs text-gray-500">{studentName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto transferido *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                placeholder="0.00"
                autoFocus
              />
            </div>
          </div>

          {/* Bank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco de origen *
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Seleccionar banco...</option>
              {BANKS.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto del comprobante *
            </label>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Comprobante" className="w-full rounded-xl border max-h-48 object-contain bg-gray-50" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null) }}
                  className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow"
                >
                  <X size={14} className="text-gray-600" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-colors">
                <Camera size={28} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Toque para subir foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              placeholder="Ej: Pago de febrero"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <>
                <Upload size={18} />
                Enviar Comprobante
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
