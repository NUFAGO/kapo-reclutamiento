// Fragment reutilizable para campos de aplicación
const APLICACION_FIELDS = `
  id
  candidatoId
  convocatoriaId
  estadoKanban
  fechaAplicacion
  candidato {
    dni
    nombres
    apellidoPaterno
    apellidoMaterno
    correo
    telefono
    lugarResidencia
  }
  convocatoria {
    cargoNombre
    obraNombre
    empresaNombre
    categoria_nombre
    especialidad_nombre
  }
  aniosExperienciaPuesto
  aniosExperienciaGeneral
  medioConvocatoria
  pretensionEconomica
  curriculumUrl
  posibleDuplicado
  ordenPrioridad
  respuestasFormulario
`

export const LISTAR_APLICACIONES_QUERY = `
  query ListarAplicaciones(
    $estadoKanban: EstadoKanban
    $convocatoriaId: ID
    $candidatoId: ID
    $fechaDesde: DateTime
    $fechaHasta: DateTime
    $limit: Int
    $offset: Int
  ) {
    listarAplicaciones(
      estadoKanban: $estadoKanban
      convocatoriaId: $convocatoriaId
      candidatoId: $candidatoId
      fechaDesde: $fechaDesde
      fechaHasta: $fechaHasta
      limit: $limit
      offset: $offset
    ) {
      aplicaciones {
        ${APLICACION_FIELDS}
      }
      total
    }
  }
`

export const OBTENER_APLICACION_QUERY = `
  query ObtenerAplicacion($id: ID!) {
    obtenerAplicacion(id: $id) {
      id
      candidatoId
      convocatoriaId
      estadoKanban
      fechaAplicacion
      candidato {
        nombres
        apellidoPaterno
        apellidoMaterno
        correo
        telefono
      }
      convocatoria {
        cargoNombre
        obraNombre
        empresaNombre
      }
      aniosExperienciaPuesto
      pretensionEconomica
      curriculumUrl
      posibleDuplicado
      ordenPrioridad
      respuestasFormulario
    }
  }
`

export const OBTENER_ESTADISTICAS_CONVOCATORIA_QUERY = `
  query ObtenerEstadisticasConvocatoria($convocatoriaId: ID!) {
    obtenerEstadisticasConvocatoria(convocatoriaId: $convocatoriaId) {
      total
      porEstadoKanban
      porPosiblesCandidatos
      duplicadosPendientes
    }
  }
`

export const GET_KANBAN_DATA_QUERY = `
  query GetKanbanData($convocatoriaId: ID) {
    getKanbanData(convocatoriaId: $convocatoriaId) {
      CVS_RECIBIDOS {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      POR_LLAMAR {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      ENTREVISTA_PREVIA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      PROGRAMAR_1RA_ENTREVISTA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      PROGRAMAR_2DA_ENTREVISTA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      REFERENCIAS {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      EVALUACION_ANTISOBORNO {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      APROBACION_GERENCIA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      LLAMAR_COMUNICAR_ENTRADA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      FINALIZADA {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      RECHAZADO_POR_CANDIDATO {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      DESCARTADO {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
      POSIBLES_CANDIDATOS {
        aplicaciones {
          ${APLICACION_FIELDS}
        }
        total
        hasNextPage
      }
    }
  }
`