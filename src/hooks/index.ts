

// Hooks de autenticación (viene del context)
export { useAuth } from '@/context/auth-context';

// Hooks de conectividad
export {
  useOnline,
  useIsOnline,
  useRequireOnline,
} from './use-online';

// Hooks de convocatorias
export {
  useConvocatorias,
  useConvocatoria,
  useConvocatoriaPorRequerimiento,
  type Convocatoria,
} from './useConvocatorias';

// Hooks de entrevistas de llamada
export {
  useEntrevistaLlamadaPorAplicacion,
  useEntrevistaLlamada,
  useCrearEntrevistaLlamada,
  useActualizarEntrevistaLlamada,
  useEliminarEntrevistaLlamada,
  type EntrevistaLlamada,
  type CrearEntrevistaLlamadaInput,
  type ActualizarEntrevistaLlamadaInput,
} from './useEntrevistasLlamada';

// Hooks de entrevistas regulares (primera/segunda)
export {
  useEntrevistaRegularPorAplicacion,
  useEntrevistaRegular,
  useCrearEntrevistaRegular,
  useActualizarEntrevistaRegular,
  type EntrevistaRegular,
  type CrearEntrevistaRegularInput,
  type ActualizarEntrevistaRegularInput,
} from './useEntrevistasRegulares';

// Hooks de aplicaciones
export {
  useCambiarEstadoKanban,
  type AplicacionBasica,
} from './useAplicaciones';

// Hooks de historial de candidato
export {
  useHistorialAplicacion,
  useHistorialCandidato,
  useListarHistorial,
  useUltimoCambioEstado,
  useEstadisticasConversion,
  useRegistrarCambioHistorial,
  useLimpiarHistorico,
  type HistorialCandidato,
  type CrearHistorialInput,
  type HistorialListado,
  type EstadisticasConversion,
  type TipoCambioHistorial,
} from './useHistorialCandidato';

// Hooks de empleados (servicio PERSONAL)
export {
  useEmpleados,
  type EmpleadoBasico,
} from './useEmpleados';

// Hooks de usuarios (servicio AUTH)
export {
  useUsuarios,
  type Usuario,
  type PaginationInput,
  type UsuarioFilterInput,
  type PaginationInfo,
  type ListUsuariosPaginatedResponse,
  searchUsuarios,
} from './useUsuarios';

export {
  useReferencias,
  useReferencia,
  useReferenciasPorAplicacion,
  useCrearReferencia,
  useActualizarReferencia,
  useEliminarReferencia,
  type Referencia,
  type CrearReferenciaInput,
  type ActualizarReferenciaInput,
} from './useReferencias';

// Hooks de debida diligencia
export {
  useExisteDebidaDiligencia,
  useDebidaDiligenciaPorAplicacion,
  useDebidaDiligencia,
  useCrearDebidaDiligencia,
  useActualizarDebidaDiligencia,
  type DebidaDiligencia,
  type ControlEvaluacion,
  type CrearDebidaDiligenciaInput,
  type ActualizarDebidaDiligenciaInput,
  type CrearControlEvaluacionInput,
} from './useDebidaDiligencia';
