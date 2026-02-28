/**
 * 🎣 USE CONVOCATORIAS - Hook personalizado para gestión de convocatorias
 *
 * Responsabilidad: Manejar estado y operaciones de convocatorias
 * Flujo: Importado por componentes → Conecta con GraphQL backend
 */

import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  GET_CONVOCATORIAS_QUERY,
  GET_CONVOCATORIA_QUERY,
  GET_CONVOCATORIA_POR_REQUERIMIENTO_QUERY
} from '@/graphql/queries'

export interface Convocatoria {
  id: string
  requerimiento_personal_id: string
  codigo_convocatoria: string
  tipo_requerimiento: 'obra' | 'staff'
  estado_convocatoria: 'ACTIVA' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA'
  cargo_nombre?: string
  categoria_nombre?: string
  especialidad_nombre?: string
  obra_nombre?: string
  empresa_nombre?: string
  vacantes: number
  prioridad: string
  requisitos?: any
  cargo_categoria_especialidad_id?: string
  obra_id?: string
  empresa_id?: string
  detalle_staff_snapshot?: any
  link_formulario?: string
  token_formulario?: string
  fecha_creacion: string
  fecha_actualizacion: string
  ganadores_ids: string[]
}

export interface UseConvocatoriasOptions {
  limit?: number
  offset?: number
  filters?: any
  enabled?: boolean
}

export interface UseConvocatoriasReturn {
  convocatorias: Convocatoria[]
  loading: boolean
  error: any
  refetch: () => void
  totalCount: number
}

/**
 * Hook para obtener lista de convocatorias con paginación
 */
export function useConvocatorias(options: UseConvocatoriasOptions = {}): UseConvocatoriasReturn {
  const { limit = 20, offset = 0, filters, enabled = true } = options

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['convocatorias', { limit, offset, filters }],
    queryFn: async () => {
      const response = await graphqlRequest<{
        convocatorias: {
          convocatorias: Convocatoria[]
          totalCount: number
        }
      }>(GET_CONVOCATORIAS_QUERY, { limit, offset, filters })
      return response
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    convocatorias: data?.convocatorias.convocatorias || [],
    loading: isLoading,
    error,
    refetch,
    totalCount: data?.convocatorias.totalCount || 0,
  }
}

/**
 * Hook para obtener una sola convocatoria por ID
 */
export function useConvocatoria(id: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['convocatoria', id],
    queryFn: async () => {
      const response = await graphqlRequest<{
        convocatoria: Convocatoria
      }>(GET_CONVOCATORIA_QUERY, { id })
      return response
    },
    enabled: enabled && !!id,
  })

  return {
    convocatoria: data?.convocatoria,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener convocatoria por requerimiento personal ID
 */
export function useConvocatoriaPorRequerimiento(requerimientoPersonalId: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['convocatoria-por-requerimiento', requerimientoPersonalId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        convocatoriaPorRequerimientoPersonalId: Convocatoria
      }>(GET_CONVOCATORIA_POR_REQUERIMIENTO_QUERY, { requerimientoPersonalId })
      return response
    },
    enabled: enabled && !!requerimientoPersonalId,
  })

  return {
    convocatoria: data?.convocatoriaPorRequerimientoPersonalId,
    loading: isLoading,
    error,
    refetch,
  }
}