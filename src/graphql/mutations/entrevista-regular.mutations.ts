// ============================================================================
// MUTATIONS GRAPHQL - ENTREVISTAS REGULARES
// ============================================================================

export const CREAR_ENTREVISTA_REGULAR_MUTATION = `
  mutation crearEntrevistaRegular($input: CrearEntrevistaRegularInput!) {
    crearEntrevistaRegular(input: $input) {
      id
      aplicacionCandidatoId
      candidatoId
      tipo_entrevista
      modalidad
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

export const ACTUALIZAR_ENTREVISTA_REGULAR_MUTATION = `
  mutation actualizarEntrevistaRegular($id: ID!, $input: ActualizarEntrevistaRegularInput!) {
    actualizarEntrevistaRegular(id: $id, input: $input) {
      id
      aplicacionCandidatoId
      candidatoId
      tipo_entrevista
      modalidad
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

export const ELIMINAR_ENTREVISTA_REGULAR_MUTATION = `
  mutation eliminarEntrevistaRegular($id: ID!) {
    eliminarEntrevistaRegular(id: $id)
  }
`