import { EstadoKanban, PrioridadConvocatoria } from './kanban.constants'

// Re-exportar tipos desde constants para uso externo
export type { EstadoKanban, PrioridadConvocatoria }

// Entidad Candidato (desde GraphQL)
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
  fechaRegistro: string
  fechaActualizacion: string
}

// Entidad Convocatoria (desde GraphQL)
export interface Convocatoria {
  id: string
  codigoConvocatoria: string
  cargoNombre?: string
  obraNombre?: string
  empresaNombre?: string
  categoria_nombre?: string
  especialidad_nombre?: string
  vacantes: number
  prioridad: string
  estadoConvocatoria: string
  fechaInicio: string
}

// Entidad AplicacionCandidato (desde GraphQL con relaciones)
export interface AplicacionCandidato {
  id: string
  candidatoId: string
  convocatoriaId: string

  // Relaciones resueltas por GraphQL
  candidato?: Candidato
  convocatoria?: Convocatoria

  // Respuestas del formulario dinámico
  respuestasFormulario: Record<string, any>

  // Estado del flujo Kanban
  estadoKanban: EstadoKanban

  // Información específica
  puestoPostula?: string
  aniosExperienciaPuesto: number
  aniosExperienciaGeneral?: number
  medioConvocatoria?: string
  pretensionEconomica: number
  curriculumUrl: string
  fechaAplicacion: string

  // Sistema de posibles candidatos
  ordenPrioridad?: number
  fechaExpiracionPosibles?: string

  // Detección de duplicados
  posibleDuplicado: boolean
  candidatoSimilarId?: string
  similitudPorcentaje?: number
  duplicadoRevisado: boolean

  // Tracking
  esRepostulacion: boolean
  esPosibleCandidatoActivado: boolean
  aplicacionPrincipalRechazadaId?: string

  // Metadata adicional
  tiempoEnEstadoDias?: number
}

// Respuesta paginada para queries con cursor
export interface PaginacionCursor {
  cursor: string
  hasNextPage: boolean
  totalCount: number
}

export interface AplicacionesPorEstadoResponse {
  aplicaciones: AplicacionCandidato[]
  paginacion: PaginacionCursor
}

// Props para componentes
export interface KanbanCardProps {
  aplicacion: AplicacionCandidato
  onClick?: () => void
}

export interface KanbanColumnProps {
  estado: EstadoKanban
  aplicaciones: AplicacionCandidato[]
  isLoading?: boolean
  onLoadMore?: () => void
  hasNextPage?: boolean
  totalCount?: number
}

export interface KanbanBoardProps {
  convocatoriaId?: string
  candidatoId?: string
  aplicacionId?: string
  onAplicacionClick?: (aplicacion: AplicacionCandidato, onMove?: (aplicacionId: string, newEstado: EstadoKanban) => void) => void
  viewMode?: 'main' | 'archived'
}

// Filtros para el kanban
export interface KanbanFilters {
  convocatoria_id?: string
  estado_kanban?: EstadoKanban
  prioridad?: PrioridadConvocatoria
  solo_duplicados_pendientes?: boolean
  fecha_desde?: Date
  fecha_hasta?: Date
}