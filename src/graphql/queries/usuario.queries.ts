/**
 * Consultas para consumir datos de usuarios desde el servicio AUTH
 */

export const LIST_USUARIOS_PAGINATED_QUERY = `
  query ListUsuariosPaginated($pagination: PaginationInput!, $filters: UsuarioFilterInput) {
    listUsuariosPaginated(pagination: $pagination, filters: $filters) {
      data {
        id
        nombres
        apellidos
        usuario
        dni
        cargo_id {
          id
          nombre
          descripcion
          gerarquia
        }
        rol_id
        empresa_id {
          id
          nombre_comercial
          razon_social
          ruc
        }
        obra_id {
          id
          titulo
          nombre
          descripcion
          ubicacion
        }
        telefono
        firma
        foto_perfil
        email
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
`
