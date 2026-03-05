import { supabase } from './supabase'

export async function getBienestar(cedula, phone4, studentId, limit = 20, offset = 0) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_bienestar', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId,
    p_limit: limit, p_offset: offset
  })
  return { data: data || [], error }
}

export async function getRetos(cedula, phone4, studentId, limit = 20) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_retos', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId, p_limit: limit
  })
  return { data: data || [], error }
}

export async function getDiarioList(cedula, phone4, studentId, limit = 20, offset = 0) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_diario_list', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId,
    p_limit: limit, p_offset: offset
  })
  return { data: data || [], error }
}

export async function createDiarioEntry(cedula, phone4, studentId, fecha, contenido, estadoAnimo = null) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_diario_create', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId,
    p_fecha: fecha, p_contenido: contenido, p_estado_animo: estadoAnimo
  })
  return { data: data?.[0] || null, error }
}

export async function updateDiarioEntry(cedula, phone4, studentId, entradaId, contenido, estadoAnimo = null) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_diario_update', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId,
    p_entrada_id: entradaId, p_contenido: contenido, p_estado_animo: estadoAnimo
  })
  return { data, error }
}

export async function deleteDiarioEntry(cedula, phone4, studentId, entradaId) {
  const { data, error } = await supabase.rpc('rpc_client_adultas_diario_delete', {
    p_cedula: cedula, p_phone4: phone4, p_student_id: studentId,
    p_entrada_id: entradaId
  })
  return { data, error }
}
