export const OBTENER_FORMULARIO_CONFIG_QUERY = `
  query ObtenerFormularioConfig($convocatoriaId: ID!) {
    formularioConfigPorConvocatoria(convocatoriaId: $convocatoriaId) {
      id
      convocatoriaId
      titulo
      descripcion
      campos {
        id
        nombre
        etiqueta
        tipo
        requerido
        habilitado
        orden
        opciones
        placeholder
        validaciones {
          min
          max
          patron
          maxLength
        }
      }
      estado
      urlPublico
      tokenJwt
      fechaPublicacion
      fechaExpiracion
      creadoPor
      fechaCreacion
      fechaModificacion
      version
    }
  }
`;

export const OBTENER_FORMULARIO_CONFIG_POR_ID_QUERY = `
  query ObtenerFormularioConfigPorId($id: ID!) {
    formularioConfigPorId(id: $id) {
      id
      convocatoriaId
      titulo
      descripcion
      campos {
        id
        nombre
        etiqueta
        tipo
        requerido
        habilitado
        orden
        opciones
        placeholder
        validaciones {
          min
          max
          patron
          maxLength
        }
      }
      estado
      fechaExpiracion
    }
  }
`;

export const LISTAR_FORMULARIOS_CONFIG_QUERY = `
  query ListarFormulariosConfig($estado: EstadoFormularioConfig, $creadoPor: ID, $limit: Int, $offset: Int) {
    listarFormulariosConfig(estado: $estado, creadoPor: $creadoPor, limit: $limit, offset: $offset) {
      configuraciones {
        id
        convocatoriaId
        titulo
        descripcion
        estado
        urlPublico
        fechaPublicacion
        fechaExpiracion
        creadoPor
        fechaCreacion
        version
      }
      total
    }
  }
`;