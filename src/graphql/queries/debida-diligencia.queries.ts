// ============================================================================
// QUERIES GRAPHQL - DEBIDA DILIGENCIA
// ============================================================================

export const OBTENER_DEBIDA_DILIGENCIA_QUERY = `
  query obtenerDebidaDiligencia($id: ID!) {
    obtenerDebidaDiligencia(id: $id) {
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
        nombre_responsable
        fecha_limite
      }
      created_at
      updated_at
    }
  }
`

export const OBTENER_DEBIDA_DILIGENCIA_POR_APLICACION_QUERY = `
  query obtenerDebidaDiligenciaPorAplicacion($aplicacionCandidatoId: ID!) {
    obtenerDebidaDiligenciaPorAplicacion(aplicacionCandidatoId: $aplicacionCandidatoId) {
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
        nombre_responsable
        fecha_limite
      }
      created_at
      updated_at
    }
  }
`

export const EXISTE_DEBIDA_DILIGENCIA_QUERY = `
  query existeDebidaDiligencia($aplicacionCandidatoId: ID!) {
    existeDebidaDiligencia(aplicacionCandidatoId: $aplicacionCandidatoId)
  }
`

export const LISTAR_DEBIDAS_DILIGENCIAS_QUERY = `
  query listarDebidasDiligencias($filtros: FiltrosDebidaDiligencia) {
    listarDebidasDiligencias(filtros: $filtros) {
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
        nombre_responsable
        fecha_limite
      }
      created_at
      updated_at
    }
  }
`

export const CONTAR_DEBIDAS_DILIGENCIAS_QUERY = `
  query contarDebidasDiligencias($filtros: FiltrosDebidaDiligencia) {
    contarDebidasDiligencias(filtros: $filtros)
  }
`
