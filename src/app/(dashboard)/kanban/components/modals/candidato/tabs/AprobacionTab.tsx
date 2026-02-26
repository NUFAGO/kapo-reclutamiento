import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { OBTENER_HISTORIAL_APLICACION_QUERY } from '@/graphql/queries'
import { KANBAN_ESTADOS } from '@/app/(dashboard)/kanban/lib/kanban.constants'
import { CheckCircle, Clock, Phone, MessageSquare } from 'lucide-react'
import { useComunicacionEntradaPorAplicacion } from '@/hooks/useComunicacionEntrada'

interface AprobacionTabProps {
  aplicacionId: string
  onValidationChange?: (isValid: boolean) => void
  viewOnly?: boolean
}

interface HistorialEntry {
  id: string
  fechaCambio: string
  realizadoPorNombre: string
  tipoCambio: string
  estadoAnterior: string
  estadoNuevo: string
  motivo?: string
  comentarios?: string
}

interface ComunicacionEntrada {
  id: string
  llamadaConfirmada: boolean
  comunicacionConfirmada: boolean
  created_at: string
}

export default function AprobacionTab({ aplicacionId, onValidationChange, viewOnly = false }: AprobacionTabProps) {
  const { data: historialData, isLoading: loadingHistorial, error: errorHistorial } = useQuery({
    queryKey: ['historial-aplicacion', aplicacionId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerHistorialAplicacion: HistorialEntry[]
      }>(OBTENER_HISTORIAL_APLICACION_QUERY, { aplicacionId })
      return response.obtenerHistorialAplicacion
    },
    enabled: !!aplicacionId
  })

  const { data: comunicacionData, isLoading: loadingComunicacion, error: errorComunicacion } = useComunicacionEntradaPorAplicacion(aplicacionId)

  // Filtrar entradas de aprobación de gerencia
  const aprobacionesGerencia = historialData?.filter(entry =>
    entry.tipoCambio === 'APROBACION' &&
    entry.estadoAnterior === KANBAN_ESTADOS.APROBACION_GERENCIA &&
    entry.estadoNuevo === KANBAN_ESTADOS.LLAMAR_COMUNICAR_ENTRADA
  ) || []

  React.useEffect(() => {
    // Siempre válido ya que es solo visualización
    onValidationChange?.(true)
  }, [])

  const isLoading = loadingHistorial || loadingComunicacion
  const hasError = errorHistorial || errorComunicacion

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mx-auto mb-4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        Error al cargar datos
      </div>
    )
  }

  const comunicacionConfirmada = comunicacionData?.llamadaConfirmada && comunicacionData?.comunicacionConfirmada

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          Aprobaciones Recibidas
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Historial de aprobaciones de gerencia
        </p>
      </div>

      
      {/* Historial de aprobaciones */}
      <div>


        {aprobacionesGerencia.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-600 dark:text-green-400" />
            <p>No hay aprobaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {aprobacionesGerencia.map((entry) => (
              <div key={entry.id} className="rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">Aprobado por gerencia</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.fechaCambio).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                  <strong className="text-gray-900 dark:text-white">Por:</strong> {entry.realizadoPorNombre}
                </div>

                {entry.comentarios && (
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Comentarios:</strong> {entry.comentarios}
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                  {entry.estadoAnterior} → {entry.estadoNuevo}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado de comunicación */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Estado de Comunicación
        </h4>
        <div className={`p-3 ${comunicacionConfirmada ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'} rounded-lg`}>
          <div className="flex items-center gap-2">
            {comunicacionConfirmada ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  Sí se le llamó y comunicó entrada
                </span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Pendiente de llamada y comunicación
                </span>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
