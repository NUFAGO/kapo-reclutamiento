

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { CAMBIAR_ESTADO_KANBAN_MUTATION, REACTIVAR_APLICACION_MUTATION } from '@/graphql/mutations'
import { EstadoKanban, KANBAN_ESTADOS } from '@/app/(dashboard)/kanban/lib/kanban.constants'
import { useAuth } from '@/context/auth-context'
import { useRegistrarCambioHistorial, TipoCambioHistorial } from './useHistorialCandidato'
import { OBTENER_APLICACIONES_POR_CANDIDATO_QUERY } from '@/graphql/queries/aplicacion.queries'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'

export interface AplicacionBasica {
  id: string
  estadoKanban: EstadoKanban
}

/**
 * Hook para cambiar el estado kanban de una aplicación
 */
export function useCambiarEstadoKanban() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { registrarCambio } = useRegistrarCambioHistorial()

  // Función auxiliar para determinar el tipo de cambio
  const determinarTipoCambio = (estadoAnterior: EstadoKanban, estadoNuevo: EstadoKanban): TipoCambioHistorial => {
    // Aprobaciones específicas
    if (estadoAnterior === KANBAN_ESTADOS.ENTREVISTA_PREVIA || estadoAnterior === KANBAN_ESTADOS.APROBACION_GERENCIA) {
      return 'APROBACION'
    }

    // Rechazos
    if (estadoNuevo === 'DESCARTADO' as EstadoKanban || estadoNuevo === 'RECHAZADO_POR_CANDIDATO' as EstadoKanban || estadoNuevo === 'POSIBLES_CANDIDATOS' as EstadoKanban) {
      return 'RECHAZO'
    }

    // Reactivaciones
    if ((estadoAnterior === 'DESCARTADO' as EstadoKanban || estadoAnterior === 'RECHAZADO_POR_CANDIDATO' as EstadoKanban)
        && estadoNuevo !== 'DESCARTADO' as EstadoKanban && estadoNuevo !== 'RECHAZADO_POR_CANDIDATO' as EstadoKanban) {
      return 'REACTIVACION'
    }

    // Movimientos normales en el proceso
    return 'MOVIMIENTO'
  }

  const mutation = useMutation({
    mutationFn: async ({
      id,
      estadoKanban,
      motivo,
      comentarios,
      candidatoId,
      estadoAnterior
    }: {
      id: string;
      estadoKanban: EstadoKanban;
      motivo?: string;
      comentarios?: string;
      candidatoId?: string;
      estadoAnterior?: EstadoKanban;
    }) => {
      // Usar estadoAnterior proporcionado o fallback
      const estadoAnteriorFinal = estadoAnterior || 'CVS_RECIBIDOS'

      // Ejecutar el cambio de estado
      const response = await graphqlRequest<{
        cambiarEstadoKanban: AplicacionBasica
      }>(CAMBIAR_ESTADO_KANBAN_MUTATION, { id, estadoKanban })

      // Registrar en el historial
      try {
        await registrarCambio({
          candidatoId: candidatoId || '',
          aplicacionId: id,
          estadoAnterior: estadoAnteriorFinal,
          estadoNuevo: estadoKanban,
          tipoCambio: determinarTipoCambio(estadoAnteriorFinal, estadoKanban),
          realizadoPor: user?.id || '',
          realizadoPorNombre: user?.nombresA || 'Sistema',
          motivo,
          comentarios
        })
      } catch (error) {
        console.error('Error al registrar cambio en historial:', error)
        // No fallar la operación principal por error en logging
      }

      return response.cambiarEstadoKanban
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para refrescar datos
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['aplicaciones'] })
        queryClient.invalidateQueries({ queryKey: ['estadisticas-convocatoria'] })
        queryClient.invalidateQueries({ queryKey: ['historial'] }) // Invalidar cache del historial
        queryClient.invalidateQueries({ queryKey: ['ultimo-historial-por-aplicacion', variables.id] })
      }, 0)
    },
  })

  return {
    cambiarEstado: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

/**
 * Hook para reactivar una aplicación desde estados archivados
 */
export function useReactivarAplicacion() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: async ({
      id,
      motivo,
      comentarios
    }: {
      id: string;
      motivo?: string;
      comentarios?: string;
    }) => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      const response = await graphqlRequest<{
        reactivarAplicacion: AplicacionBasica & {
          candidato: {
            id: string;
            nombres: string;
            apellidoPaterno: string;
            apellidoMaterno: string;
          }
        }
      }>(REACTIVAR_APLICACION_MUTATION, {
        id,
        realizadoPor: user.id,
        realizadoPorNombre: user.nombresA || 'Usuario',
        motivo,
        comentarios
      })

      return response.reactivarAplicacion
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para refrescar datos
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['aplicaciones'] })
        queryClient.invalidateQueries({ queryKey: ['estadisticas-convocatoria'] })
        queryClient.invalidateQueries({ queryKey: ['historial'] }) // Invalidar cache del historial
        queryClient.invalidateQueries({ queryKey: ['ultimo-historial-por-aplicacion', variables.id] })
      }, 0)
    },
  })

  return {
    reactivarAplicacion: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}

/**
 * Hook para obtener aplicaciones por candidato
 */
export function useAplicacionesPorCandidato(candidatoId: string) {
  return useQuery({
    queryKey: ['aplicaciones-candidato', candidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerAplicacionesPorCandidato: AplicacionCandidato[]
      }>(OBTENER_APLICACIONES_POR_CANDIDATO_QUERY, { candidatoId })
      return response.obtenerAplicacionesPorCandidato
    },
    enabled: !!candidatoId
  })
}

/**
 * Hook para obtener todas las aplicaciones por candidato (sin filtrar por estado de convocatoria)
 */
export function useTodasAplicacionesPorCandidato(candidatoId: string) {
  return useQuery({
    queryKey: ['todas-aplicaciones-candidato', candidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerAplicacionesPorCandidato: AplicacionCandidato[]
      }>(OBTENER_APLICACIONES_POR_CANDIDATO_QUERY, { candidatoId })
      return response.obtenerAplicacionesPorCandidato
    },
    enabled: !!candidatoId
  })
}