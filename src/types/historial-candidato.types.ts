// ============================================================================
// TYPES - HISTORIAL CANDIDATO
// ============================================================================

import { EstadoKanban } from '@/app/(dashboard)/kanban/lib/kanban.types';

// ============================================================================
// ENUMERACIONES
// ============================================================================

export type TipoCambioHistorial = 'APROBACION' | 'RECHAZO' | 'MOVIMIENTO' | 'REACTIVACION' | 'FINALIZADO';

// ============================================================================
// ENTIDADES
// ============================================================================

export interface HistorialCandidato {
  id: string;

  // Referencias
  candidatoId: string;           // Referencia al candidato
  aplicacionId: string;          // Referencia a la aplicación

  // Información del cambio
  estadoAnterior: EstadoKanban;  // Estado antes del cambio
  estadoNuevo: EstadoKanban;     // Estado después del cambio
  tipoCambio: TipoCambioHistorial;

  // Quién y cuándo
  realizadoPor: string;          // Usuario que hizo el cambio
  realizadoPorNombre: string;    // Nombre para queries rápidas
  fechaCambio: string;           // Timestamp del cambio (ISO string)

  // Motivos y comentarios (opcionales)
  motivo?: string;               // Razón del cambio
  comentarios?: string;          // Comentarios adicionales

  // Metadata adicional
  tiempoEnEstadoAnterior?: number; // Días en el estado anterior
  etapaProceso?: string;          // Fase del proceso

  // Timestamps
  created_at: string;
}

// ============================================================================
// INPUTS PARA OPERACIONES
// ============================================================================

export interface CrearHistorialInput {
  candidatoId: string;
  aplicacionId: string;
  estadoAnterior: EstadoKanban;
  estadoNuevo: EstadoKanban;
  tipoCambio: TipoCambioHistorial;
  realizadoPor: string;
  realizadoPorNombre: string;
  fechaCambio?: string;
  motivo?: string;
  comentarios?: string;
  tiempoEnEstadoAnterior?: number;
  etapaProceso?: string;
}

export interface HistorialFiltrosInput {
  candidatoId?: string;
  aplicacionId?: string;
  realizadoPor?: string;
  tipoCambio?: TipoCambioHistorial;
  estadoNuevo?: EstadoKanban;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// TIPOS PARA QUERIES Y MUTATIONS
// ============================================================================

export interface HistorialListado {
  historial: HistorialCandidato[];
  total: number;
}

export interface EstadisticasConversion {
  totalMovimientos: number;
  porTipoCambio: Record<string, number>;
  porEstadoDestino: Record<string, number>;
  tiempoPromedioPorEstado: Record<string, number>;
  tasaConversionPorEtapa: Record<string, number>;
}

// ============================================================================
// HOOKS TYPES
// ============================================================================

export interface UseHistorialAplicacionResult {
  historial: HistorialCandidato[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseHistorialCandidatoResult {
  historial: HistorialCandidato[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseListarHistorialResult {
  data: HistorialListado | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseUltimoCambioEstadoResult {
  ultimoCambio: HistorialCandidato | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseEstadisticasConversionResult {
  estadisticas: EstadisticasConversion | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseRegistrarCambioHistorialResult {
  registrarCambio: (input: CrearHistorialInput) => Promise<HistorialCandidato>;
  isLoading: boolean;
  error: string | null;
}