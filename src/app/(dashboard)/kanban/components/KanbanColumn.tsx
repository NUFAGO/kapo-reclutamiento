'use client'

import { useEffect, useRef, useState } from 'react'
import { AplicacionCandidato, KanbanColumnProps } from '../lib/kanban.types'
import { ESTADO_COLORES, ESTADO_LABELS, KANBAN_ESTADOS } from '../lib/kanban.constants'
import { KanbanCard } from './KanbanCard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function KanbanColumn({
  estado,
  aplicaciones: aplicacionesIniciales,
  isLoading = false,
  onLoadMore,
  hasNextPage = false,
  totalCount = 0,
  onAplicacionClick,
}: KanbanColumnProps & { onAplicacionClick?: (aplicacion: AplicacionCandidato) => void }) {
  const [aplicaciones, setAplicaciones] = useState<AplicacionCandidato[]>(aplicacionesIniciales)
  const [loadingMore, setLoadingMore] = useState(false)
  const columnRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Actualizar aplicaciones cuando cambian las props
  useEffect(() => {
    setAplicaciones(aplicacionesIniciales)
  }, [aplicacionesIniciales])

  // Función para cargar más aplicaciones
  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage || !onLoadMore) return

    setLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setLoadingMore(false)
    }
  }

  // Intersection Observer para scroll infinito
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, loadingMore])

  // Ordenar aplicaciones: el backend ya ordena por fechaAplicacion descendente,
  // pero para posibles candidatos necesitamos ordenar por prioridad
  const aplicacionesOrdenadas = estado === KANBAN_ESTADOS.POSIBLES_CANDIDATOS
    ? [...aplicaciones].sort((a, b) => {
        // Para posibles candidatos, ordenar por prioridad (1, 2, 3...)
        const prioridadA = a.ordenPrioridad || 999
        const prioridadB = b.ordenPrioridad || 999
        return prioridadA - prioridadB
      })
    : aplicaciones // Para otros estados, usar el orden del backend (fechaAplicacion DESC)

  const estadoColor = ESTADO_COLORES[estado]
  const estadoLabel = ESTADO_LABELS[estado]

  return (
    <div className="flex flex-col bg-amber-200 rounded-lg h-full shadow-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
      {/* Header de la columna */}
      <div className={`p-2 border-b rounded-t-lg shrink-0 ${estadoColor}`} style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">
              {estadoLabel}
            </h3>
            
          </div>

          {/* Badge de conteo */}
          <div className="text-xs font-bold px-2 py-1 rounded-full min-w-6 text-center bg-white/80 dark:bg-gray-700 dark:text-white">
            {totalCount}
          </div>
        </div>
      </div>

      {/* Contenedor de cards con scroll */}
      <div
        ref={columnRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {/* Loading inicial */}
        {isLoading && aplicaciones.length === 0 && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Cards de aplicaciones */}
        {aplicacionesOrdenadas.map((aplicacion) => (
          <KanbanCard
            key={aplicacion.id}
            aplicacion={aplicacion}
            onClick={() => onAplicacionClick?.(aplicacion)}
          />
        ))}

        {/* Mensaje cuando no hay aplicaciones */}
        {!isLoading && aplicaciones.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <div className="text-sm">No hay candidatos</div>
          </div>
        )}

        {/* Trigger para cargar más */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {loadingMore ? (
              <LoadingSpinner />
            ) : (
              <button
                onClick={handleLoadMore}
                className="text-xs underline hover:opacity-80 transition-opacity text-gray-600 dark:text-gray-400"
              >
 
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}