/**
 * Consultas para consumir datos de REFERENCIAS
 */

export const LISTAR_REFERENCIAS_QUERY = `
  query ListarReferencias($filtros: ReferenciaFiltrosInput) {
    listarReferencias(filtros: $filtros) {
      id
      aplicacionCandidatoId
      candidatoId
      numero_telefono
      nombresyapellidos
      detalles
      empresa
      comentarios
      archivosurl
      created_at
      updated_at
    }
  }
`;

export const OBTENER_REFERENCIA_QUERY = `
  query ObtenerReferencia($id: ID!) {
    obtenerReferencia(id: $id) {
      id
      aplicacionCandidatoId
      candidatoId
      numero_telefono
      nombresyapellidos
      detalles
      empresa
      comentarios
      archivosurl
      created_at
      updated_at
    }
  }
`;

export const LISTAR_REFERENCIAS_POR_APLICACION_QUERY = `
  query ListarReferenciasPorAplicacion($aplicacionCandidatoId: ID!) {
    listarReferenciasPorAplicacion(aplicacionCandidatoId: $aplicacionCandidatoId) {
      id
      aplicacionCandidatoId
      candidatoId
      numero_telefono
      nombresyapellidos
      detalles
      empresa
      comentarios
      archivosurl
      created_at
      updated_at
    }
  }
`;