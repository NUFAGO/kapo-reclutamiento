'use client'

import { AplicacionCandidato } from '../lib/kanban.types'
import { ESTADO_COLORES, PRIORIDAD_COLORES, COMPONENTE_COLORES, KANBAN_ESTADOS } from '../lib/kanban.constants'
import { User, MapPin, DollarSign , Trophy, AlertTriangle, FileText, Eye, FileSymlink } from 'lucide-react'

// Genera un color determinístico y estable a partir de un id (convocatoriaId)
// - No varía entre renders
// - Usa colores con intensidad similar a los botones (opacidad baja)
// - Compatible con temas claros y oscuros
function getConvocatoriaColor(id: string): string {
  let hash = 0

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  const hue = Math.abs(hash) % 360

  // Usamos HSL con alpha para mantener consistencia con el patrón bg-{color}-500/10
  const saturation = 65 + (Math.abs(hash >> 3) % 20) // 65–84% (similar a 500)
  const lightness = 45 + (Math.abs(hash >> 6) % 25)  // 45–69% (similar a 500)

  // Opacidad del 10% como los botones (bg-{color}-500/10)
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`
}


interface KanbanCardProps {
  aplicacion: AplicacionCandidato
  onClick?: () => void
}

export function KanbanCard({ aplicacion, onClick }: KanbanCardProps) {
  const nombreCompleto = aplicacion.candidato
    ? `${aplicacion.candidato.nombres} ${aplicacion.candidato.apellidoPaterno} ${aplicacion.candidato.apellidoMaterno}`.trim()
    : 'Candidato sin información'

  // Formatear pretensión económica
  const pretensionFormateada = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
  }).format(aplicacion.pretensionEconomica)

  // Extraer nombre del CV
  const nombreCV = aplicacion.curriculumUrl 
    ? (() => {
        const fileName = aplicacion.curriculumUrl.split('/').pop();
        return fileName ? (fileName.length > 25 ? fileName.substring(0, 16) + '...' : fileName) : 'Sin CV';
      })()
    : 'Sin CV'

  // Calcular días en estado actual
  const diasEnEstado = aplicacion.tiempoEnEstadoDias || 0

  // Determinar si es posible candidato
  const esPosibleCandidato = aplicacion.estadoKanban === KANBAN_ESTADOS.POSIBLES_CANDIDATOS

  // Id de convocatoria estable: preferimos el objeto `convocatoria.id`, si no existe usar `convocatoriaId`
  const identificadorConvocatoria = aplicacion.convocatoria?.id ?? aplicacion.convocatoriaId

  return (
    <div
      onDoubleClick={onClick}
      className={`
        relative border rounded-lg p-4 pl-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden
        ${esPosibleCandidato ? 'border-amber-300 shadow-amber-100' : ''}
        ${onClick ? 'hover:border-blue-300 hover:scale-[1.02]' : ''}
      `}
      style={{
        backgroundColor: esPosibleCandidato ? COMPONENTE_COLORES.POSIBLES_CANDIDATOS.background : 'var(--card-bg)',
        borderColor: esPosibleCandidato ? COMPONENTE_COLORES.POSIBLES_CANDIDATOS.border : 'var(--border-color)'
      }}
     
    >
      
      {/* Barra vertical que identifica la convocatoria: más delgada y sutil */}
      {identificadorConvocatoria && (
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[2px] z-10 rounded-l-sm"
          style={{
            backgroundColor: getConvocatoriaColor(identificadorConvocatoria),
            opacity: 0.9,
            boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.04)'
          }}
        />
      )}

      {/* Botón para móvil - visible solo en pantallas pequeñas */}
      {onClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
          className="block md:hidden absolute bottom-2 right-2 p-1.5 rounded-full bg-white/70 hover:bg-white shadow-sm border border-gray-200 touch-manipulation z-20"
          aria-label="Ver detalles"
        >
          <Eye className="w-3 h-3 text-gray-600" />
        </button>
      )}

      {/* Header con nombre y avatar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: COMPONENTE_COLORES.AVATAR }}>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-on-content-bg-heading)' }}>
              {nombreCompleto}
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
              {aplicacion.candidato?.correo || 'Sin correo'}
            </p>
          </div>
        </div>

        {/* Badge de prioridad para posibles candidatos */}
        {esPosibleCandidato && aplicacion.ordenPrioridad && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: COMPONENTE_COLORES.POSIBLES_CANDIDATOS.background, color: COMPONENTE_COLORES.POSIBLES_CANDIDATOS.text }}>
            <Trophy className="w-3 h-3" />
            #{aplicacion.ordenPrioridad}
          </div>
        )}
      </div>

      {/* Información principal */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
            {aplicacion.convocatoria?.cargoNombre || 'Sin cargo'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
            {aplicacion.aniosExperienciaPuesto} años exp.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {pretensionFormateada}
          </span>
        </div>
      </div>

      {/* Alerta de duplicado */}
      {aplicacion.posibleDuplicado && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-md" style={{ backgroundColor: COMPONENTE_COLORES.DUPLICADO.background, border: `1px solid ${COMPONENTE_COLORES.DUPLICADO.border}` }}>
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-medium" style={{ color: COMPONENTE_COLORES.DUPLICADO.text }}>
            Posible duplicado ({aplicacion.similitudPorcentaje?.toFixed(0)}%)
          </span>
        </div>
      )}

      {/* Footer con nombre del CV */}
      <div className="flex items-center justify-between " style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-1">
          <FileSymlink className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          <a 
            href={aplicacion.curriculumUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs hover:underline cursor-pointer transition-colors duration-200 text-blue-600 dark:text-blue-400" 
            onClick={(e) => {
              if (!aplicacion.curriculumUrl) {
                e.preventDefault();
                return;
              }
            }}
          >
            {nombreCV}
          </a>
        </div>

        {/* Badge de repostulación */}
        {aplicacion.esRepostulacion && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: COMPONENTE_COLORES.REPOSTULACION.background, color: COMPONENTE_COLORES.REPOSTULACION.text }}>
            Repostulación
          </span>
        )}

        {/* Badge de posible candidato activado */}
        {aplicacion.esPosibleCandidatoActivado && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: COMPONENTE_COLORES.ACTIVADO.background, color: COMPONENTE_COLORES.ACTIVADO.text }}>
            Activado
          </span>
        )}
      </div>

      {/* Información de expiración para posibles candidatos */}
      {esPosibleCandidato && aplicacion.fechaExpiracionPosibles && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: COMPONENTE_COLORES.POSIBLES_CANDIDATOS.border }}>
          <div className="text-xs" style={{ color: COMPONENTE_COLORES.POSIBLES_CANDIDATOS.text }}>
            Expira: {new Date(aplicacion.fechaExpiracionPosibles).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>
      )}
    </div>
  )
}