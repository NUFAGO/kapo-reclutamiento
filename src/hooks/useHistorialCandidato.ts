// ============================================================================
// HOOKS - HISTORIAL CANDIDATO
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { graphqlRequest } from '@/lib/graphql-client';

// Importar queries y mutations
import {
  OBTENER_HISTORIAL_APLICACION_QUERY,
  OBTENER_HISTORIAL_CANDIDATO_QUERY,
  LISTAR_HISTORIAL_QUERY,
  OBTENER_ULTIMO_CAMBIO_ESTADO_QUERY,
  GENERAR_ESTADISTICAS_CONVERSION_QUERY
} from '../graphql/queries/historial-candidato.queries';

import {
  REGISTRAR_CAMBIO_HISTORIAL_MUTATION,
  LIMPIAR_HISTORICO_MUTATION
} from '../graphql/mutations/historial-candidato.mutations';

// Importar types
import {
  HistorialCandidato,
  HistorialListado,
  EstadisticasConversion,
  CrearHistorialInput,
  UseHistorialAplicacionResult,
  UseHistorialCandidatoResult,
  UseListarHistorialResult,
  UseUltimoCambioEstadoResult,
  UseEstadisticasConversionResult,
  UseRegistrarCambioHistorialResult
} from '../types/historial-candidato.types';

// ============================================================================
// HOOKS PARA QUERIES
// ============================================================================

/**
 * Hook para obtener historial de una aplicación
 */
export function useHistorialAplicacion(aplicacionId: string): UseHistorialAplicacionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['historial-aplicacion', aplicacionId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerHistorialAplicacion: HistorialCandidato[]
      }>(OBTENER_HISTORIAL_APLICACION_QUERY, { aplicacionId });
      return response.obtenerHistorialAplicacion;
    },
    enabled: !!aplicacionId
  });

  return {
    historial: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook para obtener historial de un candidato
 */
export function useHistorialCandidato(candidatoId: string): UseHistorialCandidatoResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['historial-candidato', candidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerHistorialCandidato: HistorialCandidato[]
      }>(OBTENER_HISTORIAL_CANDIDATO_QUERY, { candidatoId });
      return response.obtenerHistorialCandidato;
    },
    enabled: !!candidatoId
  });

  return {
    historial: data || [],
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook para listar historial con filtros
 */
export function useListarHistorial(filtros?: any): UseListarHistorialResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listar-historial', filtros],
    queryFn: async () => {
      const response = await graphqlRequest<{
        listarHistorial: HistorialListado
      }>(LISTAR_HISTORIAL_QUERY, { filtros });
      return response.listarHistorial;
    }
  });

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook para obtener último cambio de estado
 */
export function useUltimoCambioEstado(aplicacionId: string): UseUltimoCambioEstadoResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ultimo-cambio-estado', aplicacionId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerUltimoCambioEstado: HistorialCandidato | null
      }>(OBTENER_ULTIMO_CAMBIO_ESTADO_QUERY, { aplicacionId });
      return response.obtenerUltimoCambioEstado;
    },
    enabled: !!aplicacionId
  });

  return {
    ultimoCambio: data || null,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

/**
 * Hook para generar estadísticas de conversión
 */
export function useEstadisticasConversion(
  convocatoriaId?: string,
  fechaDesde?: string,
  fechaHasta?: string
): UseEstadisticasConversionResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['estadisticas-conversion', convocatoriaId, fechaDesde, fechaHasta],
    queryFn: async () => {
      const response = await graphqlRequest<{
        generarEstadisticasConversion: EstadisticasConversion
      }>(GENERAR_ESTADISTICAS_CONVERSION_QUERY, {
        convocatoriaId,
        fechaDesde,
        fechaHasta
      });
      return response.generarEstadisticasConversion;
    }
  });

  return {
    estadisticas: data || null,
    isLoading,
    error: error?.message || null,
    refetch
  };
}

// ============================================================================
// HOOKS PARA MUTATIONS
// ============================================================================

/**
 * Hook para registrar cambio en el historial
 */
export function useRegistrarCambioHistorial(): UseRegistrarCambioHistorialResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CrearHistorialInput) => {
      const response = await graphqlRequest<{
        registrarCambioHistorial: HistorialCandidato
      }>(REGISTRAR_CAMBIO_HISTORIAL_MUTATION, { input });
      return response.registrarCambioHistorial;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['historial-aplicacion', data.aplicacionId] });
      queryClient.invalidateQueries({ queryKey: ['historial-candidato', data.candidatoId] });
      queryClient.invalidateQueries({ queryKey: ['ultimo-cambio-estado', data.aplicacionId] });
      queryClient.invalidateQueries({ queryKey: ['listar-historial'] });

      // No mostrar toast de éxito ya que se asume
    },
    onError: (error) => {
      toast.error(`Error al registrar cambio: ${error.message}`);
    }
  });

  return {
    registrarCambio: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null
  };
}

/**
 * Hook para limpiar historial antiguo
 */
export function useLimpiarHistorico() {
  const mutation = useMutation({
    mutationFn: async (fechaLimite: string) => {
      const response = await graphqlRequest<{
        limpiarHistorico: number
      }>(LIMPIAR_HISTORICO_MUTATION, { fechaLimite });
      return response.limpiarHistorico;
    },
    onSuccess: (eliminados) => {
      toast.success(`${eliminados} registros antiguos eliminados`);
    },
    onError: (error) => {
      toast.error(`Error al limpiar historial: ${error.message}`);
    }
  });

  return {
    limpiarHistorico: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null
  };
}

// ============================================================================
// RE-EXPORTACIÓN DE TIPOS PARA FACILITAR IMPORTS
// ============================================================================

export type {
  HistorialCandidato,
  CrearHistorialInput,
  HistorialListado,
  EstadisticasConversion,
  TipoCambioHistorial,
  UseHistorialAplicacionResult,
  UseHistorialCandidatoResult,
  UseListarHistorialResult,
  UseUltimoCambioEstadoResult,
  UseEstadisticasConversionResult,
  UseRegistrarCambioHistorialResult
} from '../types/historial-candidato.types';