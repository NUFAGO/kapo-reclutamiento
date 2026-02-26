export const OBTENER_COMUNICACION_ENTRADA_POR_APLICACION_QUERY = `
  query ObtenerComunicacionEntradaPorAplicacion($aplicacionCandidatoId: ID!) {
    obtenerComunicacionEntradaPorAplicacion(aplicacionCandidatoId: $aplicacionCandidatoId) {
      id
      aplicacionCandidatoId
      candidatoId
      llamadaConfirmada
      comunicacionConfirmada
      created_at
      updated_at
    }
  }
`
