import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, Copy, CheckCircle, Upload, Clock, History, CreditCard, BookOpen, RefreshCw, Shield, ExternalLink, Banknote, AlertCircle, Bell } from 'lucide-react'
import UploadTransfer from './UploadTransfer'
import PaymentHistory from './PaymentHistory'

// ═══════ SKELETON LOADING COMPONENT ═══════
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-3">
            <div className="h-4 w-32 bg-white/20 rounded-md" />
            <div className="h-3 w-24 bg-white/10 rounded-md mt-1.5" />
          </div>
          <div className="h-5 w-16 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Financial skeleton */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-purple-50 rounded-xl p-3 flex flex-col items-center">
            <div className="skeleton h-2.5 w-16 mb-2" />
            <div className="skeleton h-6 w-20" />
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center">
            <div className="skeleton h-2.5 w-20 mb-2" />
            <div className="skeleton h-4 w-24 mt-1" />
          </div>
        </div>
        {/* Payment buttons skeleton */}
        <div className="pt-1">
          <div className="skeleton h-2.5 w-24 mb-2" />
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton h-20 w-full rounded-xl" />
            <div className="skeleton h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════ DANCE LOADING SCREEN ═══════
function DanceLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">
      {/* Ballet dancer silhouette animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center"
          style={{ animation: 'dancerFloat 2s ease-in-out infinite' }}>
          <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ballet dancer silhouette */}
            <circle cx="32" cy="12" r="6" fill="#7e22ce"/>
            <path d="M32 18 C32 18 28 24 26 30 C24 36 20 42 16 46" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M32 18 C32 18 34 26 34 32 C34 38 32 44 32 50" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M32 24 C32 24 40 20 46 18" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M32 24 C32 24 22 22 18 24" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M32 50 C32 50 28 54 24 56" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M32 50 C32 50 36 54 40 52" stroke="#7e22ce" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-300"
          style={{ animation: 'pirouette 1.2s linear infinite' }} />
      </div>

      <p className="text-purple-800 font-semibold text-base mb-1">Cargando tu portal</p>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            style={{ animation: `dotWave 1.4s ease-in-out ${i * 0.16}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

// ═══════ PAYPHONE RETURN BANNER ═══════
function PayphoneReturnBanner({ onConfirm, onDismiss }) {
  return (
    <div className="animate-slideInTop bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">¿Completaste tu pago?</p>
            <p className="text-[11px] text-white/80">Notifica al estudio para que lo verifiquen</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={onDismiss}
            className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            No aún
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-white hover:bg-green-50 text-green-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Bell size={14} />
            Sí, notificar
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════ MAIN DASHBOARD ═══════
export default function Dashboard({ students: initialStudents, cedula, phoneLast4, onLogout, onSessionUpdate }) {
  const [liveStudents, setLiveStudents] = useState(initialStudents)
  const students = liveStudents
  const [bankInfo, setBankInfo] = useState(null)
  const [requests, setRequests] = useState({})
  const [showUpload, setShowUpload] = useState(null)
  const [showHistory, setShowHistory] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedPayment, setExpandedPayment] = useState({})
  const [ppConfirm, setPpConfirm] = useState({})
  const [ppLoading, setPpLoading] = useState({})
  const [ppSuccess, setPpSuccess] = useState({})
  const [ppError, setPpError] = useState({})
  const [ppAmount, setPpAmount] = useState({})
  const [copiedField, setCopiedField] = useState(null)
  // PayPhone return detection
  const [showReturnBanner, setShowReturnBanner] = useState(false)
  const payphoneOpenedRef = useRef(false)

  // Fetch bank info
  useEffect(() => {
    const fetchBank = async () => {
      const { data } = await supabase.rpc('rpc_client_get_bank_info')
      if (data && data.length > 0) setBankInfo(data[0])
    }
    fetchBank()
  }, [])

  // Auto-refresh student data (payment status, balance, classes, etc.)
  // Runs on mount + every 30s + after any payment action
  useEffect(() => {
    const refreshStudents = async () => {
      try {
        const { data, error } = await supabase.rpc('rpc_client_login', {
          p_cedula: cedula,
          p_phone_last4: phoneLast4
        })
        if (!error && data && data.length > 0) {
          setLiveStudents(data)
          onSessionUpdate?.(data)
        }
      } catch { /* silent */ }
    }
    // Refresh immediately (get latest status)
    refreshStudents()
    // Then every 30 seconds
    const interval = setInterval(refreshStudents, 30000)
    return () => clearInterval(interval)
  }, [cedula, phoneLast4, refreshKey])

  // Fetch transfer requests + end loading
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
      setLoading(false)
    }
    fetchRequests()
  }, [students, cedula, phoneLast4, refreshKey])

  // ─── PayPhone return detection ───
  // When user taps "Pagar con Tarjeta" link, we flag it.
  // When user comes back (visibility change), we show the banner.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && payphoneOpenedRef.current) {
        payphoneOpenedRef.current = false
        // Small delay to let the app stabilize
        setTimeout(() => setShowReturnBanner(true), 600)
      }
    }

    // Also check sessionStorage in case the app was killed/reloaded
    const ppFlag = sessionStorage.getItem('pp_payment_started')
    if (ppFlag) {
      sessionStorage.removeItem('pp_payment_started')
      setTimeout(() => setShowReturnBanner(true), 800)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handlePayphoneLinkClick = () => {
    payphoneOpenedRef.current = true
    sessionStorage.setItem('pp_payment_started', '1')
  }

  const handleReturnConfirm = () => {
    setShowReturnBanner(false)
    // Auto-expand card payment for first student and show confirm form
    const firstStudent = students[0]
    if (firstStudent) {
      setExpandedPayment(prev => ({ ...prev, [firstStudent.id]: 'card' }))
      setPpConfirm(prev => ({ ...prev, [firstStudent.id]: true }))
      // Scroll to student card
      setTimeout(() => {
        document.getElementById(`student-${firstStudent.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') return { label: 'Al día', color: 'bg-green-100 text-green-700' }
    if (status === 'partial') return { label: 'Abono parcial', color: 'bg-yellow-100 text-yellow-700' }
    if (status === 'pending') return { label: 'Pendiente', color: 'bg-red-100 text-red-700' }
    return { label: status || 'N/A', color: 'bg-gray-100 text-gray-600' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Por definir'
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const isCycleBased = (student) => {
    const pt = student.price_type
    return pt === 'paquete' || pt === 'programa' || pt === 'clase'
  }

  const togglePaymentMethod = (studentId, method) => {
    setExpandedPayment(prev => ({
      ...prev,
      [studentId]: prev[studentId] === method ? null : method
    }))
  }

  const handlePayphoneConfirm = async (studentId) => {
    const amount = ppAmount[studentId]
    setPpError(prev => ({ ...prev, [studentId]: '' }))

    if (!amount || parseFloat(amount) <= 0) {
      setPpError(prev => ({ ...prev, [studentId]: 'Ingrese el monto pagado' }))
      return
    }

    setPpLoading(prev => ({ ...prev, [studentId]: true }))
    try {
      const { error: rpcError } = await supabase.rpc('rpc_client_submit_transfer', {
        p_cedula: cedula,
        p_phone_last4: phoneLast4,
        p_student_id: studentId,
        p_amount: parseFloat(amount),
        p_bank_name: 'PayPhone (Tarjeta)',
        p_receipt_image_url: null,
        p_notes: 'Pago con tarjeta vía PayPhone'
      })
      if (rpcError) throw rpcError
      setPpSuccess(prev => ({ ...prev, [studentId]: true }))
      setRefreshKey(k => k + 1)
      setTimeout(() => {
        setPpSuccess(prev => ({ ...prev, [studentId]: false }))
        setPpConfirm(prev => ({ ...prev, [studentId]: false }))
        setPpAmount(prev => ({ ...prev, [studentId]: '' }))
      }, 3000)
    } catch (err) {
      console.error('PayPhone confirm error:', err)
      setPpError(prev => ({ ...prev, [studentId]: 'Error al registrar. Intente de nuevo.' }))
    } finally {
      setPpLoading(prev => ({ ...prev, [studentId]: false }))
    }
  }

  // ═══════ LOADING STATE ═══════
  if (loading) {
    return <DanceLoader />
  }

  return (
    <div className="min-h-screen bg-gray-100 animate-fadeIn">
      {/* PayPhone Return Banner */}
      {showReturnBanner && (
        <PayphoneReturnBanner
          onConfirm={handleReturnConfirm}
          onDismiss={() => setShowReturnBanner(false)}
        />
      )}

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
        {/* Student Cards */}
        {students.map((student, idx) => {
          const badge = getStatusBadge(student.payment_status)
          const allStudentRequests = requests[student.id] || []
          // Only show pending and approved requests to client (hide rejected)
          const studentRequests = allStudentRequests.filter(r => r.status !== 'rejected')
          const pendingReqs = allStudentRequests.filter(r => r.status === 'pending')
          const cycleMode = isCycleBased(student)
          const hasClassInfo = cycleMode && student.classes_per_cycle > 0
          const classesUsed = student.classes_used || 0
          const classesTotal = student.classes_per_cycle || 0
          const progressPct = hasClassInfo ? Math.min((classesUsed / classesTotal) * 100, 100) : 0
          const activeMethod = expandedPayment[student.id]

          return (
            <div
              key={student.id}
              id={`student-${student.id}`}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both` }}
            >
              {/* ───── Student Identity + Status ───── */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-3">
                    <h3 className="font-bold text-white text-base truncate">{student.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{student.course_name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* ───── Financial Summary ───── */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-purple-600 uppercase font-medium tracking-wider">
                      {cycleMode ? 'Inversión' : 'Mensualidad'}
                    </p>
                    <p className="text-xl font-bold text-purple-800 mt-0.5">
                      ${parseFloat(student.monthly_fee || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wider flex items-center justify-center gap-1">
                      {cycleMode ? (
                        <>
                          <RefreshCw size={9} />
                          Renovación
                        </>
                      ) : (
                        'Próximo pago'
                      )}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${student.next_payment_date ? 'text-gray-800' : 'text-gray-400'}`}>
                      {formatDate(student.next_payment_date)}
                    </p>
                  </div>
                </div>

                {/* Balance Alert */}
                {student.balance > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertCircle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Saldo pendiente</p>
                      <p className="text-lg font-bold text-amber-700">${parseFloat(student.balance).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Classes Progress */}
                {hasClassInfo && (
                  <div className="bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-purple-800 flex items-center gap-1.5">
                        <BookOpen size={13} className="text-purple-600" />
                        Clases del ciclo
                      </p>
                      <span className="text-xs font-bold text-purple-700">
                        {classesUsed} / {classesTotal}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          progressPct >= 100 ? 'bg-red-500' : progressPct >= 75 ? 'bg-amber-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {progressPct >= 90 && (
                      <p className="text-[10px] text-amber-700 mt-1.5 font-medium">
                        {progressPct >= 100 ? 'Ciclo completado — Hora de renovar' : 'Quedan pocas clases'}
                      </p>
                    )}
                  </div>
                )}

                {/* Pending requests */}
                {pendingReqs.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2">
                    <Clock size={14} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700">
                      {pendingReqs.length} pago{pendingReqs.length > 1 ? 's' : ''} pendiente{pendingReqs.length > 1 ? 's' : ''} de verificación
                    </p>
                  </div>
                )}

                {/* ═══════ PAYMENT OPTIONS ═══════ */}
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-2">Realizar pago</p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Transfer */}
                    <button
                      onClick={() => togglePaymentMethod(student.id, 'transfer')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        activeMethod === 'transfer'
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        activeMethod === 'transfer' ? 'bg-purple-600' : 'bg-purple-100'
                      }`}>
                        <Banknote size={18} className={activeMethod === 'transfer' ? 'text-white' : 'text-purple-600'} />
                      </div>
                      <span className={`text-xs font-semibold ${activeMethod === 'transfer' ? 'text-purple-700' : 'text-gray-700'}`}>
                        Transferencia
                      </span>
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => togglePaymentMethod(student.id, 'card')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        activeMethod === 'card'
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        activeMethod === 'card' ? 'bg-green-600' : 'bg-green-100'
                      }`}>
                        <CreditCard size={18} className={activeMethod === 'card' ? 'text-white' : 'text-green-600'} />
                      </div>
                      <span className={`text-xs font-semibold ${activeMethod === 'card' ? 'text-green-700' : 'text-gray-700'}`}>
                        Tarjeta
                      </span>
                    </button>
                  </div>

                  {/* ── Transfer Expanded ── */}
                  {activeMethod === 'transfer' && (
                    <div className="mt-3 bg-purple-50 rounded-xl border border-purple-200 overflow-hidden animate-slideDown">
                      {bankInfo?.bank_account_number && (
                        <div className="p-3 space-y-1">
                          <p className="text-[10px] text-purple-600 uppercase font-semibold tracking-wider mb-1.5">Datos bancarios</p>
                          {[
                            { label: 'Banco', value: bankInfo.bank_name, key: `banco-${student.id}` },
                            { label: 'Nro. Cuenta', value: bankInfo.bank_account_number, key: `cuenta-${student.id}`, mono: true },
                            { label: 'Tipo', value: bankInfo.bank_account_type, key: `tipo-${student.id}` },
                            { label: 'Titular', value: bankInfo.bank_account_holder, key: `titular-${student.id}` },
                            { label: 'Cédula', value: '0915553630', key: `ced-${student.id}`, mono: true },
                          ].map(({ label, value, key, mono }) => (
                            <button
                              key={key}
                              onClick={() => copyToClipboard(value, key)}
                              className="w-full bg-white hover:bg-purple-100 active:bg-purple-200 rounded-lg px-3 py-2 transition-colors text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1 mr-2">
                                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
                                  <p className={`text-xs font-medium text-gray-800 mt-0.5 break-words ${mono ? 'font-mono tracking-wide' : ''}`}>
                                    {value}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  {copiedField === key ? (
                                    <span className="flex items-center gap-0.5 text-green-600 text-[9px] font-medium">
                                      <CheckCircle size={12} />
                                    </span>
                                  ) : (
                                    <Copy size={12} className="text-gray-300" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                          <p className="text-[9px] text-purple-400 text-center mt-1">Toque para copiar</p>
                        </div>
                      )}
                      <button
                        onClick={() => setShowUpload(student.id)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm transition-colors"
                      >
                        <Upload size={16} />
                        Ya transferí — Subir comprobante
                      </button>
                    </div>
                  )}

                  {/* ── Card Expanded ── */}
                  {activeMethod === 'card' && (
                    <div className="mt-3 bg-green-50 rounded-xl border border-green-200 overflow-hidden animate-slideDown">
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield size={14} className="text-green-600" />
                          <p className="text-xs text-gray-600">
                            Pago seguro vía Produbanco y PayPhone. Datos encriptados (PCI DSS 4.0).
                          </p>
                        </div>

                        <a
                          href="https://ppls.me/8IycwXygt2iTUEYuTLiyQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handlePayphoneLinkClick}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                          <CreditCard size={16} />
                          Pagar con Tarjeta
                          <ExternalLink size={13} className="opacity-70" />
                        </a>

                        {/* PayPhone Confirmation */}
                        {!ppConfirm[student.id] ? (
                          <button
                            onClick={() => setPpConfirm(prev => ({ ...prev, [student.id]: true }))}
                            className="w-full mt-2.5 py-2.5 text-green-700 text-xs font-semibold bg-green-100 hover:bg-green-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Bell size={13} />
                            Ya pagué — Notificar al estudio
                          </button>
                        ) : ppSuccess[student.id] ? (
                          <div className="mt-2.5 bg-green-100 border border-green-300 rounded-xl p-3 text-center">
                            <CheckCircle size={22} className="text-green-600 mx-auto mb-1" />
                            <p className="text-sm font-semibold text-green-800">Pago registrado</p>
                            <p className="text-[11px] text-green-600">El estudio verificará su pago</p>
                          </div>
                        ) : (
                          <div className="mt-2.5 bg-white border border-green-200 rounded-xl p-3 space-y-2 animate-slideDown">
                            <p className="text-xs font-medium text-gray-700">Confirmar pago con tarjeta:</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={ppAmount[student.id] || ''}
                                onChange={(e) => setPpAmount(prev => ({ ...prev, [student.id]: e.target.value }))}
                                className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Monto pagado"
                              />
                            </div>
                            {ppError[student.id] && (
                              <p className="text-red-600 text-xs bg-red-50 rounded-lg p-2">{ppError[student.id]}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setPpConfirm(prev => ({ ...prev, [student.id]: false }))
                                  setPpError(prev => ({ ...prev, [student.id]: '' }))
                                }}
                                className="flex-1 py-2.5 text-gray-500 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handlePayphoneConfirm(student.id)}
                                disabled={ppLoading[student.id]}
                                className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {ppLoading[student.id] ? (
                                  <span style={{ animation: 'gentlePulse 1s ease-in-out infinite' }}>Enviando...</span>
                                ) : (
                                  <>
                                    <CheckCircle size={14} />
                                    Confirmar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-green-100/50 px-3 py-1.5 flex items-center justify-center gap-1.5">
                        <Shield size={10} className="text-green-700" />
                        <span className="text-[9px] text-green-700 font-medium">Transacción segura · PCI DSS 4.0 · No almacena datos</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ───── Recent Requests ───── */}
                {studentRequests.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Últimas solicitudes</p>
                    {studentRequests.slice(0, 3).map(req => (
                      <div key={req.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">${parseFloat(req.amount).toFixed(2)}</span>
                          <span className="text-gray-400 ml-1.5 text-[10px]">{req.bank_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {req.status === 'pending' && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-600 rounded text-[10px] flex items-center gap-0.5">
                              <Clock size={9} />En revisión
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-[10px] flex items-center gap-0.5">
                              <CheckCircle size={10} />Aprobada
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History Button */}
              <div className="border-t">
                <button
                  onClick={() => setShowHistory(student.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <History size={15} />
                  Ver historial de pagos
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
