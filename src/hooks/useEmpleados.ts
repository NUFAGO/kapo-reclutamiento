

import { useQuery } from '@tanstack/react-query'
import { personalGraphQLRequest } from '@/lib/graphql-client'
import { BUSCAR_EMPLEADOS_QUERY } from '@/graphql/queries'
import { SelectSearchOption } from '@/components/ui/select-search'

export interface EmpleadoBasico {
  id: string
  dni: string
  nombres: string
  ap_paterno: string
  ap_materno: string
}

export interface BuscarEmpleadosResponse {
  empleados: EmpleadoBasico[]
  total: number
}

export interface UseEmpleadosOptions {
  enabled?: boolean
}

export interface UseEmpleadosReturn {
  empleados: EmpleadoBasico[]
  loading: boolean
  error: any
  refetch: () => void
}

/**
 * Hook para buscar empleados básicos desde el servicio PERSONAL
 */
export function useEmpleados(options: UseEmpleadosOptions = {}): UseEmpleadosReturn {
  const { enabled = true } = options

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['empleados'],
    queryFn: async () => {
      const response = await personalGraphQLRequest<{
        listEmpleadoCH: BuscarEmpleadosResponse
      }>(BUSCAR_EMPLEADOS_QUERY, {
        filter: {
          // estado: true // Incluir todos los empleados
        }
      })

      return response.listEmpleadoCH
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    empleados: data?.empleados || [],
    loading: isLoading,
    error,
    refetch
  }
}

/**
 * Función de búsqueda de empleados que devuelve objetos completos
 */
export async function searchEmpleadosFull(searchTerm: string): Promise<EmpleadoBasico[]> {
  try {
    const response = await personalGraphQLRequest<{
      listEmpleadoCH: BuscarEmpleadosResponse
    }>(BUSCAR_EMPLEADOS_QUERY, {
      filter: {
        nombres: searchTerm, // Buscar por nombres que contengan el término
        // estado: true // Incluir todos los empleados, no solo activos
      }
    })

    return response.listEmpleadoCH.empleados
  } catch (error) {
    console.error('Error buscando empleados:', error)
    return []
  }
}