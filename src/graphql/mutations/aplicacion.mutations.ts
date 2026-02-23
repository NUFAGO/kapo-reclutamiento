export const CREAR_APLICACION_MUTATION = `
  mutation CrearAplicacion($input: CrearAplicacionCompletaInput!) {
    crearAplicacion(input: $input) {
      id
      candidatoId
      convocatoriaId
      aniosExperienciaPuesto
      aniosExperienciaGeneral
      pretensionEconomica
      medioConvocatoria
      curriculumUrl
      respuestasFormulario
      estadoKanban
      fechaAplicacion
      aplicadoPor
      posibleDuplicado
      duplicadoRevisado
      esRepostulacion
      esPosibleCandidatoActivado
    }
  }
`

export const CAMBIAR_ESTADO_KANBAN_MUTATION = `
  mutation CambiarEstadoKanban($id: ID!, $estadoKanban: EstadoKanban!) {
    cambiarEstadoKanban(id: $id, estadoKanban: $estadoKanban) {
      id
      estadoKanban
    }
  }
`

export const REACTIVAR_APLICACION_MUTATION = `
  mutation ReactivarAplicacion($id: ID!, $realizadoPor: ID!, $realizadoPorNombre: String!, $motivo: String, $comentarios: String) {
    reactivarAplicacion(id: $id, realizadoPor: $realizadoPor, realizadoPorNombre: $realizadoPorNombre, motivo: $motivo, comentarios: $comentarios) {
      id
      estadoKanban
      candidato {
        id
        nombres
        apellidoPaterno
        apellidoMaterno
      }
    }
  }
`

export const ACTUALIZAR_APLICACION_MUTATION = `
  mutation ActualizarAplicacion($id: ID!, $input: ActualizarAplicacionInput!) {
    actualizarAplicacion(id: $id, input: $input) {
      id
      candidatoId
      convocatoriaId
      estadoKanban
      aniosExperienciaPuesto
      aniosExperienciaGeneral
      pretensionEconomica
      medioConvocatoria
      curriculumUrl
      posibleDuplicado
      duplicadoRevisado
      esRepostulacion
      esPosibleCandidatoActivado
      fechaAplicacion
      convocatoria {
        cargoNombre
        obraNombre
        empresaNombre
        categoria_nombre
        especialidad_nombre
      }
    }
  }
`