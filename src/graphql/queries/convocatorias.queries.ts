
export const GET_CONVOCATORIAS_QUERY = `
  query GetConvocatorias($limit: Int, $offset: Int, $filters: ConvocatoriaFilters) {
    convocatorias(limit: $limit, offset: $offset, filters: $filters) {
      convocatorias {
        id
        requerimiento_personal_id
        codigo_convocatoria
        tipo_requerimiento
        estado_convocatoria
        cargo_nombre
        categoria_nombre
        especialidad_nombre
        obra_nombre
        empresa_nombre
        vacantes
        prioridad
        requisitos
        cargo_categoria_especialidad_id
        obra_id
        empresa_id
        detalle_staff_snapshot
        link_formulario
        token_formulario
        fecha_creacion
        fecha_actualizacion
        ganadores_ids
      }
      totalCount
    }
  }
`

export const GET_CONVOCATORIA_QUERY = `
  query GetConvocatoria($id: ID!) {
    convocatoria(id: $id) {
      id
      requerimiento_personal_id
      codigo_convocatoria
      tipo_requerimiento
      estado_convocatoria
      cargo_nombre
      categoria_nombre
      especialidad_nombre
      obra_nombre
      empresa_nombre
      vacantes
      prioridad
      requisitos
      cargo_categoria_especialidad_id
      obra_id
      empresa_id
      detalle_staff_snapshot
      link_formulario
      token_formulario
      fecha_creacion
      fecha_actualizacion
      ganadores_ids
    }
  }
`

export const GET_CONVOCATORIA_POR_REQUERIMIENTO_QUERY = `
  query GetConvocatoriaPorRequerimientoPersonalId($requerimientoPersonalId: String!) {
    convocatoriaPorRequerimientoPersonalId(requerimientoPersonalId: $requerimientoPersonalId) {
      id
      requerimiento_personal_id
      codigo_convocatoria
      tipo_requerimiento
      estado_convocatoria
      cargo_nombre
      categoria_nombre
      especialidad_nombre
      obra_nombre
      empresa_nombre
      vacantes
      prioridad
      requisitos
      cargo_categoria_especialidad_id
      obra_id
      empresa_id
      detalle_staff_snapshot
      link_formulario
      token_formulario
      fecha_creacion
      fecha_actualizacion
      ganadores_ids
    }
  }
`