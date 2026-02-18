import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { LIST_USUARIOS_PAGINATED_QUERY } from '@/graphql/queries'
import { SelectSearchOption } from '@/components/ui/select-search'

export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  usuario: string
  dni: string
  cargo_id: {
    id: string
    nombre: string
    descripcion: string
    gerarquia: number
  } | null
  rol_id: string
  empresa_id: {
    id: string
    nombre_comercial: string
    razon_social: string
    ruc: string
  }[] | null
  obra_id: {
    id: string
    titulo: string
    nombre: string
    descripcion: string
    ubicacion: string
  }[] | null
  telefono: string
  firma: string
  foto_perfil: string
  email: string | null
}

export interface PaginationInput {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UsuarioFilterInput {
  dni?: string
  _id?: string
  nombres?: string
  apellidos?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ListUsuariosPaginatedResponse {
  data: Usuario[]
  pagination: PaginationInfo
}

export interface UseUsuariosOptions {
  pagination?: PaginationInput
  filters?: UsuarioFilterInput
  enabled?: boolean
}

export interface UseUsuariosReturn {
  usuarios: Usuario[]
  pagination: PaginationInfo | null
  loading: boolean
  error: any
  refetch: () => void
}

/**
 * Hook para obtener usuarios paginados desde el servicio AUTH
 */
export function useUsuarios(options: UseUsuariosOptions = {}): UseUsuariosReturn {
  const {
    pagination = { page: 1, limit: 10 },
    filters,
    enabled = true
  } = options

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['usuarios', pagination, filters],
    queryFn: async () => {
      const response = await graphqlRequest<{
        listUsuariosPaginated: ListUsuariosPaginatedResponse
      }>(LIST_USUARIOS_PAGINATED_QUERY, {
        pagination,
        filters
      })

      return response.listUsuariosPaginated
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    usuarios: data?.data || [],
    pagination: data?.pagination || null,
    loading: isLoading,
    error,
    refetch
  }
}

/**
 * Función de búsqueda de usuarios para SelectSearch
 */
export async function searchUsuarios(searchTerm: string): Promise<SelectSearchOption[]> {
  try {
    const response = await graphqlRequest<{
      listUsuariosPaginated: ListUsuariosPaginatedResponse
    }>(LIST_USUARIOS_PAGINATED_QUERY, {
      pagination: { page: 1, limit: 50 },
      filters: { nombres: searchTerm }
    })

    const usuarios = response.listUsuariosPaginated.data

    return usuarios.map(usuario => ({
      value: usuario.id,
      label: `${usuario.nombres} ${usuario.apellidos}`.trim()
    }))
  } catch (error) {
    console.error('Error buscando usuarios:', error)
    return []
  }
}
