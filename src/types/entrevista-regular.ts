// ============================================================================
// TIPOS PARA ENTREVISTAS REGULARES - Frontend
// ============================================================================

export type TipoEntrevista = 'PRIMERA' | 'SEGUNDA'

export interface EntrevistaRegular {
  id: string
  aplicacionCandidatoId: string
  candidatoId: string
  tipo_entrevista: TipoEntrevista
  fecha_entrevista: string
  hora_entrevista: string
  correo_contacto: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones?: string
  resultado?: string
  created_at: string
  updated_at: string
}

export interface CrearEntrevistaRegularInput {
  aplicacionCandidatoId: string
  candidatoId: string
  tipo_entrevista: TipoEntrevista
  fecha_entrevista: string
  hora_entrevista: string
  correo_contacto: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones?: string
  resultado?: string
}

export interface ActualizarEntrevistaRegularInput {
  fecha_entrevista?: string
  hora_entrevista?: string
  correo_contacto?: string
  entrevistador_id?: string
  entrevistador_nombre?: string
  observaciones?: string
  resultado?: string
}