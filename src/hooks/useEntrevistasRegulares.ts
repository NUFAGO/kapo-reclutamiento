// ============================================================================
// HOOKS ENTREVISTAS REGULARES - Queries y Mutations para entrevistas presenciales
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  OBTENER_ENTREVISTA_REGULAR_QUERY,
  OBTENER_ENTREVISTA_REGULAR_POR_APLICACION_QUERY,
  EXISTE_ENTREVISTA_REGULAR_PARA_APLICACION_QUERY
} from '@/graphql/queries/entrevista-regular.queries'
import {
  CREAR_ENTREVISTA_REGULAR_MUTATION,
  ACTUALIZAR_ENTREVISTA_REGULAR_MUTATION
} from '@/graphql/mutations/entrevista-regular.mutations'
import { TipoEntrevista } from '@/types/entrevista-regular'

// Interfaces para los hooks
export interface EntrevistaRegular {
  id: string
  aplicacionCandidatoId: string
  candidatoId: string
  tipo_entrevista: TipoEntrevista
  fecha_entrevista: string
  hora_entrevista: string
  correo_contacto: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones?: string
  resultado?: string
  created_at: string
  updated_at: string
}

export interface CrearEntrevistaRegularInput {
  aplicacionCandidatoId: string
  candidatoId: string
  tipo_entrevista: TipoEntrevista
  fecha_entrevista: string
  hora_entrevista: string
  correo_contacto: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones?: string
  resultado?: string
}

export interface ActualizarEntrevistaRegularInput {
  fecha_entrevista?: string
  hora_entrevista?: string
  correo_contacto?: string
  entrevistador_id?: string
  entrevistador_nombre?: string
  observaciones?: string
  resultado?: string
}

/**
 * Hook para verificar si existe una entrevista regular para una aplicación y tipo específicos
 */
export function useExisteEntrevistaRegular(aplicacionId: string, tipo: TipoEntrevista, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['existe-entrevista-regular', aplicacionId, tipo],
    queryFn: async () => {
      const response = await graphqlRequest<{
        existeEntrevistaRegular: boolean
      }>(EXISTE_ENTREVISTA_REGULAR_PARA_APLICACION_QUERY, { aplicacionCandidatoId: aplicacionId, tipo_entrevista: tipo })
      return response.existeEntrevistaRegular
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
 * Hook para obtener entrevista regular por aplicación y tipo
 */
export function useEntrevistaRegularPorAplicacion(aplicacionId: string, tipo: TipoEntrevista, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entrevista-regular-por-aplicacion', aplicacionId, tipo],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerEntrevistaRegularPorAplicacion: EntrevistaRegular
      }>(OBTENER_ENTREVISTA_REGULAR_POR_APLICACION_QUERY, { aplicacionCandidatoId: aplicacionId, tipo_entrevista: tipo })
      return response.obtenerEntrevistaRegularPorAplicacion
    },
    enabled: enabled && !!aplicacionId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    entrevista: data,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para obtener entrevista regular por ID
 */
export function useEntrevistaRegular(id: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entrevista-regular', id],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerEntrevistaRegular: EntrevistaRegular
      }>(OBTENER_ENTREVISTA_REGULAR_QUERY, { id })
      return response.obtenerEntrevistaRegular
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    entrevista: data,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Hook para crear una nueva entrevista regular
 */
export function useCrearEntrevistaRegular() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (input: CrearEntrevistaRegularInput) => {
      const response = await graphqlRequest<{
        crearEntrevistaRegular: EntrevistaRegular
      }>(CREAR_ENTREVISTA_REGULAR_MUTATION, { input })
      return response.crearEntrevistaRegular
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['existe-entrevista-regular', data.aplicacionCandidatoId, data.tipo_entrevista] })
      queryClient.invalidateQueries({ queryKey: ['entrevista-regular-por-aplicacion', data.aplicacionCandidatoId, data.tipo_entrevista] })
      queryClient.invalidateQueries({ queryKey: ['entrevistas-regulares'] })
    },
  })

  return {
    crearEntrevista: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

/**
 * Hook para actualizar una entrevista regular existente
 */
export function useActualizarEntrevistaRegular() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ActualizarEntrevistaRegularInput }) => {
      const response = await graphqlRequest<{
        actualizarEntrevistaRegular: EntrevistaRegular
      }>(ACTUALIZAR_ENTREVISTA_REGULAR_MUTATION, { id, input })
      return response.actualizarEntrevistaRegular
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['entrevista-regular', data.id] })
      queryClient.invalidateQueries({ queryKey: ['entrevista-regular-por-aplicacion', data.aplicacionCandidatoId, data.tipo_entrevista] })
      queryClient.invalidateQueries({ queryKey: ['entrevistas-regulares'] })
    },
  })

  return {
    actualizarEntrevista: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}