// ============================================================================
// MUTATIONS GRAPHQL - DEBIDA DILIGENCIA
// ============================================================================

export const CREAR_DEBIDA_DILIGENCIA_MUTATION = `
  mutation crearDebidaDiligencia($input: CrearDebidaDiligenciaInput!) {
    crearDebidaDiligencia(input: $input) {
      id
      aplicacionCandidatoId
      candidatoId
      evaluador_id
      nombre_evaluador
      codigo
      fecha_aprobacion
      fecha_evaluacion
      criterios
      puntaje_total
      nivel_riesgo
      accion
      controles {
        criterio
        responsable
        fecha_limite
      }
      created_at
      updated_at
    }
  }
`

export const ACTUALIZAR_DEBIDA_DILIGENCIA_MUTATION = `
  mutation actualizarDebidaDiligencia($id: ID!, $input: ActualizarDebidaDiligenciaInput!) {
    actualizarDebidaDiligencia(id: $id, input: $input) {
      id
      aplicacionCandidatoId
      candidatoId
      evaluador_id
      nombre_evaluador
      codigo
      fecha_aprobacion
      fecha_evaluacion
      criterios
      puntaje_total
      nivel_riesgo
      accion
      controles {
        criterio
        responsable
        fecha_limite
      }
      created_at
      updated_at
    }
  }
`

export const ELIMINAR_DEBIDA_DILIGENCIA_MUTATION = `
  mutation eliminarDebidaDiligencia($id: ID!) {
    eliminarDebidaDiligencia(id: $id)
  }
`
