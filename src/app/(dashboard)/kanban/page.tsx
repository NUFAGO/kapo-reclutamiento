'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AplicacionCandidato, EstadoKanban } from './lib/kanban.types'
import { KanbanHeader } from './components/KanbanHeader'
import { KanbanBoard } from './KanbanBoard'
import CandidateModal from './components/modals/candidato/CandidateModal'

// Genera un color determinístico y estable a partir de un id (convocatoriaId)
// Devuelve un degradado con el color para el header del modal
function getConvocatoriaColor(id: string): string {
  let hash = 0

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  const hue = Math.abs(hash) % 360

  // Colores con saturación y lightness similares a los botones
  const saturation = 65 + (Math.abs(hash >> 3) % 20) // 65–84% (similar a 500)
  const lightness = 45 + (Math.abs(hash >> 6) % 25)  // 45–69% (similar a 500)

  const baseColor = `hsla(${hue}, ${saturation}%, ${lightness}%, `

  // Crear degradado con diferentes opacidades del mismo color
  return `linear-gradient(135deg, ${baseColor}0.075) 0%, ${baseColor}0.035) 50%, ${baseColor}0.075) 100%)`
}

export default function KanbanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<string | null>(null)
  const [mostrarSoloDuplicados, setMostrarSoloDuplicados] = useState(false)
  const [selectedAplicacion, setSelectedAplicacion] = useState<AplicacionCandidato | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewModeState] = useState<'main' | 'archived'>('main')
  const onAplicacionStateChangedRef = useRef<((aplicacionId: string, newEstado: EstadoKanban) => void) | undefined>(undefined)

  // Inicializar viewMode desde URL params
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam === 'archived') {
      setViewModeState('archived')
    } else {
      setViewModeState('main')
    }
  }, [searchParams])

  // Función para cambiar viewMode y actualizar URL
  const setViewMode = (newViewMode: 'main' | 'archived') => {
    setViewModeState(newViewMode)
    
    // Actualizar URL params
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (newViewMode === 'archived') {
      newSearchParams.set('view', 'archived')
    } else {
      newSearchParams.delete('view')
    }
    
    const newUrl = newSearchParams.toString() 
      ? `?${newSearchParams.toString()}`
      : window.location.pathname
    
    router.push(newUrl, { scroll: false })
  }

 

  // Handler para cuando se hace click en una aplicación
  const handleAplicacionClick = (aplicacion: AplicacionCandidato, onMove?: (aplicacionId: string, newEstado: EstadoKanban) => void) => {
    setSelectedAplicacion(aplicacion)
    onAplicacionStateChangedRef.current = onMove
    setIsModalOpen(true)
  }

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAplicacion(null)
  }

  // Handler para cambio de convocatoria
  const handleConvocatoriaChange = (convocatoriaId: string | null) => {
    setConvocatoriaSeleccionada(convocatoriaId)
    console.log('Convocatoria seleccionada:', convocatoriaId)
  }

  // Handler para toggle de duplicados
  const handleToggleDuplicados = (soloDuplicados: boolean) => {
    setMostrarSoloDuplicados(soloDuplicados)
    console.log('Mostrar solo duplicados:', soloDuplicados)
  }

  return (
    <div className="flex flex-col h-full" >
      {/* Header con filtros */}
      <KanbanHeader
        convocatoriaSeleccionada={convocatoriaSeleccionada}
        onConvocatoriaChange={handleConvocatoriaChange}
        onToggleDuplicados={handleToggleDuplicados}
        mostrarSoloDuplicados={mostrarSoloDuplicados}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Board principal */}
      <div className="flex-1 overflow-hidden -mb-6">
        <KanbanBoard
          convocatoriaId={convocatoriaSeleccionada || undefined}
          onAplicacionClick={handleAplicacionClick}
          viewMode={viewMode}
        />
      </div>

      {/* Modal de detalle del candidato */}
      {selectedAplicacion && (
        <CandidateModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          aplicacion={selectedAplicacion}
          headerBackground={getConvocatoriaColor(selectedAplicacion.convocatoriaId || '')}
          onAplicacionStateChanged={onAplicacionStateChangedRef.current}
        />
      )}
    </div>
  )
}