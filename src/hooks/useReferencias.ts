import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  LISTAR_REFERENCIAS_QUERY,
  OBTENER_REFERENCIA_QUERY,
  LISTAR_REFERENCIAS_POR_APLICACION_QUERY
} from '@/graphql/queries'
import {
  CREAR_REFERENCIA_MUTATION,
  ACTUALIZAR_REFERENCIA_MUTATION,
  ELIMINAR_REFERENCIA_MUTATION
} from '@/graphql/mutations'

// Interfaces
export interface Referencia {
  id: string
  aplicacionCandidatoId: string
  candidatoId: string
  numero_telefono: string
  nombresyapellidos: string
  detalles?: string
  empresa?: string
  comentarios?: string
  archivosurl?: any[]
  created_at: string
  updated_at: string
}

export interface CrearReferenciaInput {
  aplicacionCandidatoId: string
  candidatoId: string
  numero_telefono: string
  nombresyapellidos: string
  detalles?: string
  empresa?: string
  comentarios?: string
  archivosurl?: any[]
}

export interface ActualizarReferenciaInput {
  numero_telefono?: string
  nombresyapellidos?: string
  detalles?: string
  empresa?: string
  comentarios?: string
  archivosurl?: any[]
}

// Hook para listar referencias con filtros
export function useReferencias(filtros?: {
  aplicacionCandidatoId?: string
  candidatoId?: string
  empresa?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['referencias', filtros],
    queryFn: async () => {
      const response = await graphqlRequest<{ listarReferencias: Referencia[] }>(
        LISTAR_REFERENCIAS_QUERY,
        { filtros }
      )
      return response.listarReferencias
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para obtener una referencia por ID
export function useReferencia(id: string, enabled = true) {
  return useQuery({
    queryKey: ['referencia', id],
    queryFn: async () => {
      const response = await graphqlRequest<{ obtenerReferencia: Referencia }>(
        OBTENER_REFERENCIA_QUERY,
        { id }
      )
      return response.obtenerReferencia
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para listar referencias por aplicación
export function useReferenciasPorAplicacion(aplicacionCandidatoId: string, enabled = true) {
  return useQuery({
    queryKey: ['referencias-aplicacion', aplicacionCandidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{ listarReferenciasPorAplicacion: Referencia[] }>(
        LISTAR_REFERENCIAS_POR_APLICACION_QUERY,
        { aplicacionCandidatoId }
      )
      return response.listarReferenciasPorAplicacion
    },
    enabled: !!aplicacionCandidatoId && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook para crear referencia
export function useCrearReferencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CrearReferenciaInput) => {
      const response = await graphqlRequest<{ crearReferencia: Referencia }>(
        CREAR_REFERENCIA_MUTATION,
        { input }
      )
      return response.crearReferencia
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['referencias'] })
      queryClient.invalidateQueries({
        queryKey: ['referencias-aplicacion', data.aplicacionCandidatoId]
      })
    },
  })
}

// Hook para actualizar referencia
export function useActualizarReferencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ActualizarReferenciaInput }) => {
      const response = await graphqlRequest<{ actualizarReferencia: Referencia }>(
        ACTUALIZAR_REFERENCIA_MUTATION,
        { id, input }
      )
      return response.actualizarReferencia
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['referencia', data.id] })
      queryClient.invalidateQueries({ queryKey: ['referencias'] })
      queryClient.invalidateQueries({
        queryKey: ['referencias-aplicacion', data.aplicacionCandidatoId]
      })
    },
  })
}

// Hook para eliminar referencia
export function useEliminarReferencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await graphqlRequest<{ eliminarReferencia: boolean }>(
        ELIMINAR_REFERENCIA_MUTATION,
        { id }
      )
      return response.eliminarReferencia
    },
    onSuccess: (_, id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['referencia', id] })
      queryClient.invalidateQueries({ queryKey: ['referencias'] })
      // Nota: No podemos saber la aplicacionCandidatoId aquí, así que invalidamos todas las referencias por aplicación
      queryClient.invalidateQueries({ queryKey: ['referencias-aplicacion'] })
    },
  })
}