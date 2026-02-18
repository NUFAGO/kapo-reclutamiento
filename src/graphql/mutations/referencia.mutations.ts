/**
 * Mutaciones para REFERENCIAS
 */

export const CREAR_REFERENCIA_MUTATION = `
  mutation CrearReferencia($input: CrearReferenciaInput!) {
    crearReferencia(input: $input) {
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

export const ACTUALIZAR_REFERENCIA_MUTATION = `
  mutation ActualizarReferencia($id: ID!, $input: ActualizarReferenciaInput!) {
    actualizarReferencia(id: $id, input: $input) {
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

export const ELIMINAR_REFERENCIA_MUTATION = `
  mutation EliminarReferencia($id: ID!) {
    eliminarReferencia(id: $id)
  }
`;