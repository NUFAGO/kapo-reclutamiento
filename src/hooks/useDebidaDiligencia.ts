// ============================================================================
// HOOKS DEBIDA DILIGENCIA - Queries y Mutations para evaluaciones de debida diligencia
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  OBTENER_DEBIDA_DILIGENCIA_QUERY,
  OBTENER_DEBIDA_DILIGENCIA_POR_APLICACION_QUERY,
  EXISTE_DEBIDA_DILIGENCIA_QUERY
} from '@/graphql/queries/debida-diligencia.queries'
import {
  CREAR_DEBIDA_DILIGENCIA_MUTATION,
  ACTUALIZAR_DEBIDA_DILIGENCIA_MUTATION
} from '@/graphql/mutations/debida-diligencia.mutations'

// Interfaces para los hooks
export interface DebidaDiligencia {
  id: string
  aplicacionCandidatoId: string
  candidatoId: string
  evaluador_id: string
  nombre_evaluador: string
  codigo: string
  fecha_aprobacion?: string
  fecha_evaluacion: string
  criterios: Record<string, any>
  puntaje_total: number
  nivel_riesgo: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO'
  accion?: 'NO_ESTABLECER' | 'SUSPENDER' | 'TERMINAR' | 'ACEPTAR_CON_CONTROLES'
  controles?: ControlEvaluacion[]
  created_at: string
  updated_at: string
}

export interface ControlEvaluacion {
  criterio: string
  responsable: string
  nombre_responsable: string
  fecha_limite: string
}

export interface CrearDebidaDiligenciaInput {
  aplicacionCandidatoId: string
  candidatoId: string
  evaluador_id: string
  nombre_evaluador: string
  codigo: string
  fecha_aprobacion?: string
  fecha_evaluacion: string
  criterios: Record<string, any>
  puntaje_total: number
  nivel_riesgo: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO'
  accion?: 'NO_ESTABLECER' | 'SUSPENDER' | 'TERMINAR' | 'ACEPTAR_CON_CONTROLES'
  controles?: CrearControlEvaluacionInput[]
}

export interface ActualizarDebidaDiligenciaInput {
  evaluador_id?: string
  nombre_evaluador?: string
  fecha_aprobacion?: string
  fecha_evaluacion?: string
  criterios?: Record<string, any>
  puntaje_total?: number
  nivel_riesgo?: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO'
  accion?: 'NO_ESTABLECER' | 'SUSPENDER' | 'TERMINAR' | 'ACEPTAR_CON_CONTROLES'
  controles?: CrearControlEvaluacionInput[]
}

export interface CrearControlEvaluacionInput {
  criterio: string
  responsable: string
  nombre_responsable: string
  fecha_limite: string
}

/**
 * Hook para verificar si existe una debida diligencia para una aplicación específica
 */
export function useExisteDebidaDiligencia(aplicacionId: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['existe-debida-diligencia', aplicacionId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        existeDebidaDiligencia: boolean
      }>(EXISTE_DEBIDA_DILIGENCIA_QUERY, { aplicacionCandidatoId: aplicacionId })
      return response.existeDebidaDiligencia
    },
    enabled: enabled && !!aplicacionId,
    staleTime: 30 * 1000, // 30 segundos
  })

  return {
    existe: data || false,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener debida diligencia por aplicación
 */
export function useDebidaDiligenciaPorAplicacion(aplicacionId: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['debida-diligencia-por-aplicacion', aplicacionId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerDebidaDiligenciaPorAplicacion: DebidaDiligencia
      }>(OBTENER_DEBIDA_DILIGENCIA_POR_APLICACION_QUERY, { aplicacionCandidatoId: aplicacionId })
      return response.obtenerDebidaDiligenciaPorAplicacion
    },
    enabled: enabled && !!aplicacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    debidaDiligencia: data,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener debida diligencia por ID
 */
export function useDebidaDiligencia(id: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['debida-diligencia', id],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerDebidaDiligencia: DebidaDiligencia
      }>(OBTENER_DEBIDA_DILIGENCIA_QUERY, { id })
      return response.obtenerDebidaDiligencia
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    debidaDiligencia: data,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para crear una nueva debida diligencia
 */
export function useCrearDebidaDiligencia() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (input: CrearDebidaDiligenciaInput) => {
      const response = await graphqlRequest<{
        crearDebidaDiligencia: DebidaDiligencia
      }>(CREAR_DEBIDA_DILIGENCIA_MUTATION, { input })
      return response.crearDebidaDiligencia
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['existe-debida-diligencia', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['debida-diligencia-por-aplicacion', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['debidas-diligencias'] })
    },
  })

  return {
    crearDebidaDiligencia: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

/**
 * Hook para actualizar una debida diligencia existente
 */
export function useActualizarDebidaDiligencia() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ActualizarDebidaDiligenciaInput }) => {
      const response = await graphqlRequest<{
        actualizarDebidaDiligencia: DebidaDiligencia
      }>(ACTUALIZAR_DEBIDA_DILIGENCIA_MUTATION, { id, input })
      return response.actualizarDebidaDiligencia
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['debida-diligencia', data.id] })
      queryClient.invalidateQueries({ queryKey: ['debida-diligencia-por-aplicacion', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['debidas-diligencias'] })
    },
  })

  return {
    actualizarDebidaDiligencia: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}
