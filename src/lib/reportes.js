import { supabase } from './supabase'

// ── Reportes aprobados de los alumnos del portal ──────────────────
export async function getReportesAprobados(studentIds) {
  if (!studentIds?.length) return { data: [] }
  const { data, error } = await supabase
    .from('reportes_ciclo')
    .select('*')
    .in('student_id', studentIds)
    .eq('estado', 'aprobado')
    .order('numero_ciclo', { ascending: false })
  return { data: data || [], error }
}

// ── Evaluaciones de competencias de un ciclo/alumno ───────────────
export async function getEvaluacionesCiclo(cycleId, studentId) {
  const { data, error } = await supabase
    .from('cycle_evaluations')
    .select('competency, estado, observacion')
    .eq('cycle_id', cycleId)
    .eq('student_id', studentId)
  const map = {}
  if (data) data.forEach(r => { map[r.competency] = { estado: r.estado, observacion: r.observacion || '' } })
  return { evaluations: map, error }
}
