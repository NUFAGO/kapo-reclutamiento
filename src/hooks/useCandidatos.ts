// ============================================================================
// HOOK - USE CANDIDATOS
// ============================================================================

import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { SelectSearchOption } from '@/components/ui/select-search'

export interface Candidato {
  id: string
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  correo: string
  telefono: string
  lugarResidencia?: string
  curriculumUrl: string
  totalAplicaciones?: number
  aplicacionesGanadas?: number
  fechaRegistro?: string
  fechaActualizacion?: string
}

export interface CandidatoFilterInput {
  dni?: string
  nombres?: string
  correo?: string
  telefono?: string
  limit?: number
  offset?: number
}

export interface UseCandidatosOptions {
  filtros?: CandidatoFilterInput
  enabled?: boolean
}

export interface UseCandidatosReturn {
  candidatos: Candidato[]
  loading: boolean
  error: any
  refetch: () => void
  totalCount: number
}

// Query para listar candidatos con filtros
export const LISTAR_CANDIDATOS_QUERY = `
  query ListarCandidatos(
    $dni: String
    $nombres: String
    $correo: String
    $telefono: String
    $limit: Int
    $offset: Int
  ) {
    listarCandidatos(
      dni: $dni
      nombres: $nombres
      correo: $correo
      telefono: $telefono
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
        lugarResidencia
        curriculumUrl
        totalAplicaciones
        aplicacionesGanadas
        fechaRegistro
        fechaActualizacion
      }
      total
    }
  }
`;

// Query para buscar candidato por DNI
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
      lugarResidencia
      curriculumUrl
      totalAplicaciones
      aplicacionesGanadas
      fechaRegistro
      fechaActualizacion
    }
  }
`;

/**
 * Hook para obtener candidatos con filtros
 */
export function useCandidatos(options: UseCandidatosOptions = {}): UseCandidatosReturn {
  const {
    filtros,
    enabled = true
  } = options

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['candidatos', filtros],
    queryFn: async () => {
      const response = await graphqlRequest<{
        listarCandidatos: {
          candidatos: Candidato[]
          total: number
        }
      }>(LISTAR_CANDIDATOS_QUERY, filtros)

      return response.listarCandidatos
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  return {
    candidatos: data?.candidatos || [],
    loading: isLoading,
    error,
    refetch,
    totalCount: data?.total || 0
  }
}

/**
 * Hook para buscar un candidato específico por DNI
 */
export function useCandidatoPorDNI(dni: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['candidato-dni', dni],
    queryFn: async () => {
      const response = await graphqlRequest<{
        buscarCandidatoPorDNI: Candidato
      }>(BUSCAR_CANDIDATO_POR_DNI_QUERY, { dni })

      return response.buscarCandidatoPorDNI
    },
    enabled: enabled && !!dni,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    candidato: data,
    loading: isLoading,
    error,
    refetch
  }
}

/**
 * Función de búsqueda de candidatos para SelectSearch
 */
export async function searchCandidatos(searchTerm: string): Promise<SelectSearchOption[]> {
  try {
    const response = await graphqlRequest<{
      listarCandidatos: {
        candidatos: Candidato[]
        total: number
      }
    }>(LISTAR_CANDIDATOS_QUERY, {
      nombres: searchTerm,
      limit: 50
    })

    const candidatos = response.listarCandidatos.candidatos

    return candidatos.map(candidato => ({
      value: candidato.id,
      label: `${candidato.nombres} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`.trim()
    }))
  } catch (error) {
    console.error('Error buscando candidatos:', error)
    return []
  }
}
