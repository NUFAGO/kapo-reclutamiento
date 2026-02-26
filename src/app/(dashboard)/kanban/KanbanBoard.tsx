'use client'

import { useEffect, useState, useCallback } from 'react'
import { AplicacionCandidato, KanbanBoardProps } from './lib/kanban.types'
import { KANBAN_ESTADOS } from './lib/kanban.constants'
import { EstadoKanban } from './lib/kanban.types'
import { KanbanColumn } from './components/KanbanColumn'
import { KanbanSkeleton } from './components/KanbanSkeleton'
import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { GET_KANBAN_DATA_QUERY, LISTAR_APLICACIONES_QUERY } from '@/graphql/queries'

interface EstadoColumnData {
  aplicaciones: AplicacionCandidato[]
  cursor?: string
  hasNextPage: boolean
  totalCount: number
  isLoading: boolean
}

export function KanbanBoard({ convocatoriaId, onAplicacionClick, viewMode = 'main' }: KanbanBoardProps) {
  const [columnasData, setColumnasData] = useState<Record<string, EstadoColumnData>>({})
  const [hasLoaded, setHasLoaded] = useState(false)
  const [processingMoves, setProcessingMoves] = useState<Set<string>>(new Set())
  const [referenceRawData, setReferenceRawData] = useState<Record<string, { aplicaciones: AplicacionCandidato[] }> | null>(null)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, EstadoKanban>>({})
  const [previousColumnasData, setPreviousColumnasData] = useState<Record<string, EstadoColumnData>>({})

  // Estados del kanban en orden de flujo, filtrados por viewMode
  const ESTADOS_ORDENADOS = viewMode === 'archived' ? [
    KANBAN_ESTADOS.RECHAZADO_POR_CANDIDATO,
    KANBAN_ESTADOS.DESCARTADO,
    KANBAN_ESTADOS.POSIBLES_CANDIDATOS,
  ] : [
    KANBAN_ESTADOS.CVS_RECIBIDOS,
    KANBAN_ESTADOS.POR_LLAMAR,
    KANBAN_ESTADOS.ENTREVISTA_PREVIA,
    KANBAN_ESTADOS.PROGRAMAR_1RA_ENTREVISTA,
    KANBAN_ESTADOS.PROGRAMAR_2DA_ENTREVISTA,
    KANBAN_ESTADOS.REFERENCIAS,
    KANBAN_ESTADOS.EVALUACION_ANTISOBORNO,
    KANBAN_ESTADOS.APROBACION_GERENCIA,
    KANBAN_ESTADOS.LLAMAR_COMUNICAR_ENTRADA,
    KANBAN_ESTADOS.FINALIZADA,
  ]

  // Cargar datos iniciales con GraphQL - UNA SOLA QUERY PARA TODAS LAS COLUMNAS
  const { data: kanbanData, isLoading: isInitialLoading, error, refetch } = useQuery({
    queryKey: ['kanban-data', convocatoriaId || 'all'],
    queryFn: async () => {
      const response = await graphqlRequest<{
        getKanbanData: Record<string, {
          aplicaciones: AplicacionCandidato[]
          total: number
          hasNextPage: boolean
        }>
      }>(GET_KANBAN_DATA_QUERY, {
        convocatoriaId, // Puede ser undefined para mostrar todas las convocatorias
      })
      return response
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // Procesar datos estructurados por columnas (ya vienen organizados del backend)
  useEffect(() => {
    // Limpiar el estado local cuando cambia el viewMode para evitar conflictos con actualizaciones optimistas
    setColumnasData({})
    setHasLoaded(false)
    
    if (!kanbanData?.getKanbanData) {
      // Si no hay datos, inicializar columnas vacías
      const columnasVacias: Record<string, EstadoColumnData> = {}
      ESTADOS_ORDENADOS.forEach(estado => {
        columnasVacias[estado] = {
          aplicaciones: [],
          cursor: '0',
          hasNextPage: false,
          totalCount: 0,
          isLoading: false,
        }
      })
      setColumnasData(columnasVacias)
      return
    }

    // Aplicar updates optimistas antes de procesar las columnas
    const serverDataWithOptimisticUpdates = { ...kanbanData.getKanbanData }
    
    // Aplicar cada update optimista
    Object.entries(optimisticUpdates).forEach(([appId, newEstado]) => {
      // Encontrar la aplicación en los datos del servidor
      let foundInEstado = null
      let appToMove = null
      
      for (const [estado, data] of Object.entries(serverDataWithOptimisticUpdates)) {
        if (data.aplicaciones) {
          const appIndex = data.aplicaciones.findIndex(app => app.id === appId)
          if (appIndex !== -1) {
            appToMove = data.aplicaciones[appIndex]
            foundInEstado = estado
            // Remover de la columna original
            data.aplicaciones.splice(appIndex, 1)
            break
          }
        }
      }
      
      // Agregar a la nueva columna
      if (appToMove && foundInEstado) {
        const updatedApp = { ...appToMove, estadoKanban: newEstado }
        
        if (!serverDataWithOptimisticUpdates[newEstado]) {
          serverDataWithOptimisticUpdates[newEstado] = { aplicaciones: [], total: 0, hasNextPage: false }
        }
        
        serverDataWithOptimisticUpdates[newEstado].aplicaciones.unshift(updatedApp) // Agregar al inicio
      }
    })

    const nuevasColumnasData: Record<string, EstadoColumnData> = {}

    // Procesar cada columna que viene del backend (ya con updates optimistas aplicados)
    ESTADOS_ORDENADOS.forEach(estado => {
      const columnaData = serverDataWithOptimisticUpdates[estado]
      if (columnaData && columnaData.aplicaciones) {
        // Eliminar duplicados por ID para evitar errores de claves React
        const aplicacionesUnicas = columnaData.aplicaciones.filter((app, index, self) => 
          index === self.findIndex(a => a.id === app.id)
        )
        
        nuevasColumnasData[estado] = {
          aplicaciones: aplicacionesUnicas,
          cursor: aplicacionesUnicas.length.toString(),
          hasNextPage: columnaData.hasNextPage || false,
          totalCount: columnaData.total || aplicacionesUnicas.length,
          isLoading: false,
        }
      } else {
        // Fallback por si falta alguna columna
        nuevasColumnasData[estado] = {
          aplicaciones: [],
          cursor: '0',
          hasNextPage: false,
          totalCount: 0,
          isLoading: false,
        }
      }
    })

    setColumnasData(nuevasColumnasData)

    // Guardar datos RAW del backend como referencia
    if (kanbanData?.getKanbanData) {
      setReferenceRawData(kanbanData.getKanbanData)
    }
  }, [kanbanData, viewMode])

  useEffect(() => {
    if (kanbanData && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [kanbanData, hasLoaded])

  // Función para mover una aplicación entre columnas localmente
  const handleAplicacionStateChanged = useCallback((aplicacionId: string, newEstado: EstadoKanban, isFinalized?: boolean) => {
    console.log(`[DEBUG] handleAplicacionStateChanged llamado: aplicacionId=${aplicacionId}, newEstado=${newEstado}`)
    
    // Limpiar cualquier procesamiento anterior para esta aplicación
    setProcessingMoves(prev => {
      const newSet = new Set(prev)
      newSet.delete(aplicacionId)
      return newSet
    })
    
    // Marcar como procesando
    setProcessingMoves(prev => new Set(prev).add(aplicacionId))
    console.log(`[DEBUG] Marcado como procesando: ${aplicacionId}`)

    // Registrar el update optimista para persistirlo entre vistas
    setOptimisticUpdates(prev => ({
      ...prev,
      [aplicacionId]: newEstado
    }))
    console.log(`[DEBUG] Update optimista registrado para ${aplicacionId} a ${newEstado}`)

    setColumnasData(prev => {
      const newColumnasData = { ...prev }
      let aplicacionToMove: AplicacionCandidato | null = null
      let oldEstado: string | null = null

      // Encontrar la aplicación en la columna actual
      for (const estado in newColumnasData) {
        const columna = newColumnasData[estado]
        const appIndex = columna.aplicaciones.findIndex(app => app.id === aplicacionId)
        if (appIndex !== -1) {
          aplicacionToMove = columna.aplicaciones[appIndex]
          oldEstado = estado
          
          // Remover de la columna actual
          newColumnasData[estado] = {
            ...columna,
            aplicaciones: columna.aplicaciones.filter(app => app.id !== aplicacionId),
            totalCount: columna.totalCount - 1,
          }
          console.log(`[DEBUG] Aplicacion ${aplicacionId} removida de columna ${estado}, count: ${columna.totalCount - 1}`)
          break
        }
      }

      if (aplicacionToMove && oldEstado) {
        // Actualizar el estado de la aplicación
        const updatedAplicacion = { 
          ...aplicacionToMove, 
          estadoKanban: newEstado,
          ...(isFinalized && { procesoFinalizadoCompleto: true })
        }

        // Agregar a la nueva columna
        const newColumna = newColumnasData[newEstado] || {
          aplicaciones: [],
          cursor: '0',
          hasNextPage: false,
          totalCount: 0,
          isLoading: false,
        }
        newColumnasData[newEstado] = {
          ...newColumna,
          aplicaciones: [updatedAplicacion, ...newColumna.aplicaciones], // Agregar al inicio
          totalCount: newColumna.totalCount + 1,
        }
        console.log(`[DEBUG] Aplicacion ${aplicacionId} agregada a columna ${newEstado}, count: ${newColumna.totalCount + 1}`)
      } else {
        console.warn(`[DEBUG] No se pudo mover aplicacion ${aplicacionId}: not found or no oldEstado`)
      }

      return newColumnasData
    })

    // Limpiar el flag de procesamiento después de un breve delay
    setTimeout(() => {
      setProcessingMoves(prev => {
        const newSet = new Set(prev)
        newSet.delete(aplicacionId)
        console.log(`[DEBUG] Procesamiento limpiado para ${aplicacionId}`)
        return newSet
      })
    }, 1000)
  }, [viewMode, processingMoves])

  // Función para cargar más aplicaciones en una columna específica
  const handleLoadMore = async (estado: string) => {
    const columnaActual = columnasData[estado]
    if (!columnaActual || !columnaActual.hasNextPage) return

    // Marcar como cargando
    setColumnasData(prev => ({
      ...prev,
      [estado]: {
        ...prev[estado],
        isLoading: true,
      },
    }))

    try {
      // Cargar más aplicaciones del mismo estado con offset
      const offset = columnaActual.aplicaciones.length
      const response = await graphqlRequest<{
        listarAplicaciones: {
          aplicaciones: AplicacionCandidato[]
          total: number
        }
      }>(LISTAR_APLICACIONES_QUERY, {
        estadoKanban: estado as any, // Type assertion para GraphQL enum
        convocatoriaId,
        limit: 20,
        offset,
      })

      const nuevasAplicaciones = response?.listarAplicaciones?.aplicaciones || []

      setColumnasData(prev => {
        // Combinar aplicaciones existentes con nuevas y eliminar duplicados
        const aplicacionesExistentes = prev[estado].aplicaciones
        const todasAplicaciones = [...aplicacionesExistentes, ...nuevasAplicaciones]
        const aplicacionesUnicas = todasAplicaciones.filter((app, index, self) => 
          index === self.findIndex(a => a.id === app.id)
        )

        return {
          ...prev,
          [estado]: {
            aplicaciones: aplicacionesUnicas,
            cursor: (offset + nuevasAplicaciones.length).toString(),
            hasNextPage: nuevasAplicaciones.length >= 20,
            totalCount: prev[estado].totalCount,
            isLoading: false,
          },
        }
      })
    } catch (error) {
      console.error(`Error cargando más aplicaciones para ${estado}:`, error)
      setColumnasData(prev => ({
        ...prev,
        [estado]: {
          ...prev[estado],
          isLoading: false,
        },
      }))
    }
  }

  // Nota: Ahora siempre se muestran aplicaciones (todas las convocatorias si no hay filtro)

  return (
    <div className="h-full flex gap-3 overflow-x-auto py-3" >
      {ESTADOS_ORDENADOS.map((estado) => {
        const columnaData = columnasData[estado]
        const showSkeleton = (isInitialLoading && !hasLoaded) || !columnaData

        return (
          <div key={estado} className="shrink-0 w-65">
            {showSkeleton ? (
              <KanbanSkeleton />
            ) : (
              <KanbanColumn
                estado={estado}
                aplicaciones={columnaData.aplicaciones}
                isLoading={columnaData.isLoading}
                onLoadMore={() => handleLoadMore(estado)}
                hasNextPage={columnaData.hasNextPage}
                totalCount={columnaData.totalCount}
                onAplicacionClick={(aplicacion) => onAplicacionClick?.(aplicacion, handleAplicacionStateChanged)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}