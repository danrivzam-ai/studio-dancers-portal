import { supabase } from './supabase'

// Las tablas reportes_ciclo / cycle_evaluations solo son legibles por el personal
// (RLS v38c/v42). El portal las consulta con RPC SECURITY DEFINER (v46) que
// validan cédula + teléfono y devuelven solo los datos de esa familia.

// ── Reportes aprobados de los alumnos del portal ──────────────────
export async function getReportesAprobados(cedula, phoneLast4) {
  if (!cedula || !phoneLast4) return { data: [] }
  const { data, error } = await supabase.rpc('rpc_client_reportes', {
    p_cedula: cedula,
    p_phone_last4: phoneLast4
  })
  return { data: data || [], error }
}

// ── Evaluaciones de competencias de un ciclo/alumno ───────────────
export async function getEvaluacionesCiclo(cedula, phoneLast4, cycleId, studentId) {
  const { data, error } = await supabase.rpc('rpc_client_cycle_evaluations', {
    p_cedula: cedula,
    p_phone_last4: phoneLast4,
    p_cycle_id: String(cycleId),
    p_student_id: String(studentId)
  })
  const map = {}
  if (data) data.forEach(r => { map[r.competency] = { estado: r.estado, observacion: r.observacion || '' } })
  return { evaluations: map, error }
}
