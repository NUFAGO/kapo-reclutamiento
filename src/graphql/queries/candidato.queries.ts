// ============================================================================
// QUERIES - CANDIDATO
// ============================================================================

// Queries normales (dashboard empresa)
export const LISTAR_CANDIDATOS_QUERY = `
  query ListarCandidatos(
    $dni: String
    $nombres: String
    $correo: String
    $telefono: String
    $fechaRegistroDesde: DateTime
    $fechaRegistroHasta: DateTime
    $limit: Int
    $offset: Int
  ) {
    listarCandidatos(
      dni: $dni
      nombres: $nombres
      correo: $correo
      telefono: $telefono
      fechaRegistroDesde: $fechaRegistroDesde
      fechaRegistroHasta: $fechaRegistroHasta
      limit: $limit
      offset: $offset
    ) {
      candidatos {
        id
        dni
        nombres
        apellidoPaterno
        apellidoMaterno
        correo
        telefono
        totalAplicaciones
        aplicacionesGanadas
      }
      total
    }
  }
`;

export const BUSCAR_CANDIDATO_POR_DNI_QUERY = `
  query BuscarCandidatoPorDNI($dni: String!) {
    buscarCandidatoPorDNI(dni: $dni) {
      id
      dni
      nombres
      apellidoPaterno
      apellidoMaterno
      correo
      telefono
    }
  }
`;

// Queries encriptadas (público)
export const LISTAR_CANDIDATOS_ENCRYPTED_QUERY = `
  query ListarCandidatosEncriptados(
    $dni: String
    $nombres: String
    $correo: String
    $telefono: String
    $fechaRegistroDesde: DateTime
    $fechaRegistroHasta: DateTime
    $limit: Int
    $offset: Int
  ) {
    listarCandidatosEncriptados(
      dni: $dni
      nombres: $nombres
      correo: $correo
      telefono: $telefono
      fechaRegistroDesde: $fechaRegistroDesde
      fechaRegistroHasta: $fechaRegistroHasta
      limit: $limit
      offset: $offset
    ) {
      candidatos {
        id
        dni
        nombres
        apellidoPaterno
        apellidoMaterno
        correo
        telefono
        totalAplicaciones
        aplicacionesGanadas
      }
      total
    }
  }
`;

export const OBTENER_CANDIDATO_ENCRYPTED_QUERY = `
  query ObtenerCandidatoEncriptado($id: ID!) {
    obtenerCandidatoEncriptado(id: $id) {
      id
      dni
      nombres
      apellidoPaterno
      apellidoMaterno
      correo
      telefono
      lugarResidencia
      curriculumUrl
      totalAplicaciones
      aplicacionesGanadas
      fechaRegistro
      fechaActualizacion
      correosHistoricos
      telefonosHistoricos
    }
  }
`;
