/**
 * 🎣 USE ENTREVISTAS LLAMADA - Hook personalizado para gestión de entrevistas telefónicas iniciales
 *
 * Responsabilidad: Manejar estado y operaciones de entrevistas de llamada
 * Flujo: Importado por componentes → Conecta con GraphQL backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import {
  OBTENER_ENTREVISTA_LLAMADA_POR_APLICACION_QUERY,
  EXISTE_ENTREVISTA_LLAMADA_PARA_APLICACION_QUERY,
  OBTENER_ENTREVISTA_LLAMADA_QUERY,
  LISTAR_ENTREVISTAS_LLAMADA_QUERY
} from '@/graphql/queries'
import {
  CREAR_ENTREVISTA_LLAMADA_MUTATION,
  ACTUALIZAR_ENTREVISTA_LLAMADA_MUTATION,
  ELIMINAR_ENTREVISTA_LLAMADA_MUTATION
} from '@/graphql/mutations'

export interface EntrevistaLlamada {
  id: string
  aplicacionCandidatoId: string
  fecha_entrevista: string
  disponibilidad_actual: string
  residencia_actual: string
  disponibilidad_viajar: 'SI' | 'NO'
  estudios: string
  estado_civil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE'
  hijos: number
  edad: number
  experiencia_general: string
  experiencia_rubro: 'BAJO' | 'MEDIO' | 'ALTO'
  busca_estabilidad: string
  retos_profesionales: string
  desenvolvimiento: number
  conocimiento_perfil: string
  interes_puesto: number
  pretension_monto: number
  pretension_negociable: string
  comentarios?: string
  solicitar_referencias?: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones: string
  resultado: string
  created_at: string
  updated_at: string
}

export interface CrearEntrevistaLlamadaInput {
  aplicacionCandidatoId: string
  fecha_entrevista: string
  disponibilidad_actual: string
  residencia_actual: string
  disponibilidad_viajar: 'SI' | 'NO'
  estudios: string
  estado_civil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE'
  hijos: number
  edad: number
  experiencia_general: string
  experiencia_rubro: 'BAJO' | 'MEDIO' | 'ALTO'
  busca_estabilidad: string
  retos_profesionales: string
  desenvolvimiento: number
  conocimiento_perfil: string
  interes_puesto: number
  pretension_monto: number
  pretension_negociable: string
  comentarios?: string
  solicitar_referencias?: string
  entrevistador_id: string
  entrevistador_nombre: string
  observaciones: string
  resultado: string
}

export interface ActualizarEntrevistaLlamadaInput {
  aplicacionCandidatoId?: string
  fecha_entrevista?: string
  disponibilidad_actual?: string
  residencia_actual?: string
  disponibilidad_viajar?: 'SI' | 'NO'
  estudios?: string
  estado_civil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE'
  hijos?: number
  edad?: number
  experiencia_general?: string
  experiencia_rubro?: 'BAJO' | 'MEDIO' | 'ALTO'
  busca_estabilidad?: string
  retos_profesionales?: string
  desenvolvimiento?: number
  conocimiento_perfil?: string
  interes_puesto?: number
  pretension_monto?: number
  pretension_negociable?: string
  comentarios?: string
  solicitar_referencias?: string
  entrevistador_id?: string
  entrevistador_nombre?: string
  observaciones?: string
  resultado?: string
}

/**
 * Hook para verificar si existe una entrevista de llamada para una aplicación específica
 */
export function useExisteEntrevistaLlamada(aplicacionCandidatoId: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['existe-entrevista-llamada', aplicacionCandidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        existeEntrevistaParaAplicacionCandidato: boolean
      }>(EXISTE_ENTREVISTA_LLAMADA_PARA_APLICACION_QUERY, { aplicacionCandidatoId })
      return response.existeEntrevistaParaAplicacionCandidato
    },
    enabled: enabled && !!aplicacionCandidatoId,
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
 * Hook para obtener entrevista de llamada por aplicación candidata
 */
export function useEntrevistaLlamadaPorAplicacion(aplicacionCandidatoId: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entrevista-llamada-por-aplicacion', aplicacionCandidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerEntrevistaPorAplicacionCandidato: EntrevistaLlamada
      }>(OBTENER_ENTREVISTA_LLAMADA_POR_APLICACION_QUERY, { aplicacionCandidatoId })
      return response.obtenerEntrevistaPorAplicacionCandidato
    },
    enabled: enabled && !!aplicacionCandidatoId,
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
 * Hook para obtener entrevista de llamada por ID
 */
export function useEntrevistaLlamada(id: string, enabled: boolean = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entrevista-llamada', id],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerEntrevista: EntrevistaLlamada
      }>(OBTENER_ENTREVISTA_LLAMADA_QUERY, { id })
      return response.obtenerEntrevista
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
 * Hook para crear una nueva entrevista de llamada
 */
export function useCrearEntrevistaLlamada() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (input: CrearEntrevistaLlamadaInput) => {
      const response = await graphqlRequest<{
        crearEntrevista: EntrevistaLlamada
      }>(CREAR_ENTREVISTA_LLAMADA_MUTATION, { input })
      return response.crearEntrevista
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['existe-entrevista-llamada', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['entrevista-llamada-por-aplicacion', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['entrevistas-llamada'] })
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
 * Hook para actualizar una entrevista de llamada existente
 */
export function useActualizarEntrevistaLlamada() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ActualizarEntrevistaLlamadaInput }) => {
      const response = await graphqlRequest<{
        actualizarEntrevista: EntrevistaLlamada
      }>(ACTUALIZAR_ENTREVISTA_LLAMADA_MUTATION, { id, input })
      return response.actualizarEntrevista
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['entrevista-llamada', data.id] })
      queryClient.invalidateQueries({ queryKey: ['entrevista-llamada-por-aplicacion', data.aplicacionCandidatoId] })
      queryClient.invalidateQueries({ queryKey: ['entrevistas-llamada'] })
    },
  })

  return {
    actualizarEntrevista: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

/**
 * Hook para eliminar una entrevista de llamada
 */
export function useEliminarEntrevistaLlamada() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await graphqlRequest<{
        eliminarEntrevista: boolean
      }>(ELIMINAR_ENTREVISTA_LLAMADA_MUTATION, { id })
      return response.eliminarEntrevista
    },
    onSuccess: (_, id) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['entrevista-llamada', id] })
      queryClient.invalidateQueries({ queryKey: ['entrevistas-llamada'] })
    },
  })

  return {
    eliminarEntrevista: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  }
}