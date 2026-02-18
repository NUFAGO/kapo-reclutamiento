// ============================================================================
// QUERIES GRAPHQL - ENTREVISTAS REGULARES
// ============================================================================

export const OBTENER_ENTREVISTA_REGULAR_QUERY = `
  query obtenerEntrevistaRegular($id: ID!) {
    obtenerEntrevistaRegular(id: $id) {
      id
      aplicacionCandidatoId
      candidatoId
      tipo_entrevista
      fecha_entrevista
      hora_entrevista
      correo_contacto
      entrevistador_id
      entrevistador_nombre
      observaciones
      resultado
      created_at
      updated_at
    }
  }
`

export const OBTENER_ENTREVISTA_REGULAR_POR_APLICACION_QUERY = `
  query obtenerEntrevistaRegularPorAplicacion($aplicacionCandidatoId: ID!, $tipo_entrevista: TipoEntrevista!) {
    obtenerEntrevistaRegularPorAplicacion(aplicacionCandidatoId: $aplicacionCandidatoId, tipo_entrevista: $tipo_entrevista) {
      id
      aplicacionCandidatoId
      candidatoId
      tipo_entrevista
      fecha_entrevista
      hora_entrevista
      correo_contacto
      entrevistador_id
      entrevistador_nombre
      observaciones
      resultado
      created_at
      updated_at
    }
  }
`

export const EXISTE_ENTREVISTA_REGULAR_PARA_APLICACION_QUERY = `
  query existeEntrevistaRegularParaAplicacion($aplicacionCandidatoId: ID!, $tipo_entrevista: TipoEntrevista!) {
    existeEntrevistaRegular(aplicacionCandidatoId: $aplicacionCandidatoId, tipo_entrevista: $tipo_entrevista)
  }
`

export const LISTAR_ENTREVISTAS_REGULARES_QUERY = `
  query listarEntrevistasRegulares($filtros: EntrevistaRegularFiltrosInput) {
    listarEntrevistasRegulares(filtros: $filtros) {
      id
      aplicacionCandidatoId
      candidatoId
      tipo_entrevista
      fecha_entrevista
      hora_entrevista
      correo_contacto
      entrevistador_id
      entrevistador_nombre
      observaciones
      resultado
      created_at
      updated_at
    }
  }
`

export const CONTAR_ENTREVISTAS_REGULARES_QUERY = `
  query contarEntrevistasRegulares($filtros: EntrevistaRegularFiltrosInput) {
    contarEntrevistasRegulares(filtros: $filtros)
  }
`