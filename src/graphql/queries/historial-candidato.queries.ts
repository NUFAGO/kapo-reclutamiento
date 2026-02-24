
export const HISTORIAL_CANDIDATO_FIELDS = `
  fragment HistorialCandidatoFields on HistorialCandidato {
    id
    candidatoId
    aplicacionId
    estadoAnterior
    estadoNuevo
    tipoCambio
    realizadoPor
    realizadoPorNombre
    fechaCambio
    motivo
    comentarios
    tiempoEnEstadoAnterior
    etapaProceso
    created_at
  }
`;

export const HISTORIAL_LISTADO_FIELDS = `
  fragment HistorialListadoFields on HistorialListado {
    historial {
      ...HistorialCandidatoFields
    }
    total
  }
  ${HISTORIAL_CANDIDATO_FIELDS}
`;

export const ESTADISTICAS_CONVERSION_FIELDS = `
  fragment EstadisticasConversionFields on EstadisticasConversion {
    totalMovimientos
    porTipoCambio
    porEstadoDestino
    tiempoPromedioPorEstado
    tasaConversionPorEtapa
  }
`;

// ============================================================================
// QUERIES
// ============================================================================

export const OBTENER_HISTORIAL_APLICACION_QUERY = `
  query ObtenerHistorialAplicacion($aplicacionId: ID!) {
    obtenerHistorialAplicacion(aplicacionId: $aplicacionId) {
      ...HistorialCandidatoFields
    }
  }
  ${HISTORIAL_CANDIDATO_FIELDS}
`;

export const OBTENER_HISTORIAL_CANDIDATO_QUERY = `
  query ObtenerHistorialCandidato($candidatoId: ID!) {
    obtenerHistorialCandidato(candidatoId: $candidatoId) {
      ...HistorialCandidatoFields
    }
  }
  ${HISTORIAL_CANDIDATO_FIELDS}
`;

export const LISTAR_HISTORIAL_QUERY = `
  query ListarHistorial($filtros: HistorialFiltrosInput) {
    listarHistorial(filtros: $filtros) {
      ...HistorialListadoFields
    }
  }
  ${HISTORIAL_LISTADO_FIELDS}
`;

export const OBTENER_ULTIMO_CAMBIO_ESTADO_QUERY = `
  query ObtenerUltimoCambioEstado($aplicacionId: ID!) {
    obtenerUltimoCambioEstado(aplicacionId: $aplicacionId) {
      ...HistorialCandidatoFields
    }
  }
  ${HISTORIAL_CANDIDATO_FIELDS}
`;

export const OBTENER_ULTIMO_HISTORIAL_POR_APLICACION_QUERY = `
  query ObtenerUltimoHistorialPorAplicacion($aplicacionId: ID!) {
    obtenerUltimoHistorialPorAplicacion(aplicacionId: $aplicacionId) {
      ...HistorialCandidatoFields
    }
  }
  ${HISTORIAL_CANDIDATO_FIELDS}
`;

export const GENERAR_ESTADISTICAS_CONVERSION_QUERY = `
  query GenerarEstadisticasConversion(
    $convocatoriaId: ID
    $fechaDesde: DateTime
    $fechaHasta: DateTime
  ) {
    generarEstadisticasConversion(
      convocatoriaId: $convocatoriaId
      fechaDesde: $fechaDesde
      fechaHasta: $fechaHasta
    ) {
      ...EstadisticasConversionFields
    }
  }
  ${ESTADISTICAS_CONVERSION_FIELDS}
`;

// ============================================================================
// QUERY TYPES (para uso interno en hooks)
// ============================================================================

export type ObtenerHistorialAplicacionQueryVariables = {
  aplicacionId: string;
};

export type ObtenerHistorialCandidatoQueryVariables = {
  candidatoId: string;
};

export type ListarHistorialQueryVariables = {
  filtros?: {
    candidatoId?: string;
    aplicacionId?: string;
    realizadoPor?: string;
    tipoCambio?: string;
    estadoNuevo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    limit?: number;
    offset?: number;
  };
};

export type ObtenerUltimoCambioEstadoQueryVariables = {
  aplicacionId: string;
};

export type ObtenerUltimoHistorialPorAplicacionQueryVariables = {
  aplicacionId: string;
};

export type GenerarEstadisticasConversionQueryVariables = {
  convocatoriaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
};