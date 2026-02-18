// ============================================================================
// MUTACIONES COMUNICACION ENTRADA - GraphQL mutations para comunicaciones de entrada
// ============================================================================

export const CREAR_COMUNICACION_ENTRADA_MUTATION = `
  mutation CrearComunicacionEntrada($input: CrearComunicacionEntradaInput!) {
    crearComunicacionEntrada(input: $input) {
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

export const ACTUALIZAR_COMUNICACION_ENTRADA_MUTATION = `
  mutation ActualizarComunicacionEntrada($id: ID!, $input: ActualizarComunicacionEntradaInput!) {
    actualizarComunicacionEntrada(id: $id, input: $input) {
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
