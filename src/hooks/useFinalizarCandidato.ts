// HOOKS - FINALIZAR CANDIDATO
// ============================================================================

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { FINALIZAR_CANDIDATO_MUTATION } from '@/graphql/mutations'

export interface FinalizarCandidatoResult {
    success: boolean
    aplicacion: any
    candidato: any
    convocatoria: any
    personalId: string
}

export function useFinalizarCandidato() {
    const queryClient = useQueryClient()
    const [isExecuting, setIsExecuting] = React.useState(false)

    const mutation = useMutation({
        mutationFn: async ({ aplicacionId, usuarioId }: { aplicacionId: string; usuarioId?: string }) => {
            if (isExecuting) {
                return Promise.reject(new Error('Operación ya en curso'))
            }
            
            setIsExecuting(true)
            
            try {
                const response = await graphqlRequest<{
                    finalizarCandidato: FinalizarCandidatoResult
                }>(
                    FINALIZAR_CANDIDATO_MUTATION,
                    { aplicacionId, usuarioId }
                )
                return response.finalizarCandidato
            } catch (error) {
                throw error
            } finally {
                setTimeout(() => {
                    setIsExecuting(false)
                }, 500)
            }
        },
        onSuccess: (data) => {
            // Invalidar queries relevantes
            queryClient.invalidateQueries({ queryKey: ['aplicaciones'] })
            queryClient.invalidateQueries({ queryKey: ['candidatos'] })
            queryClient.invalidateQueries({ queryKey: ['convocatorias'] })

            // Si la convocatoria se finalizó completamente, limpiar todas las aplicaciones del kanban con update optimista
            if (data.convocatoria.estadoConvocatoria === 'FINALIZADA') {
                const convocatoriaId = data.convocatoria.id

                // Función para limpiar aplicaciones de una query específica
                const limpiarAplicacionesConvocatoria = (queryKey: (string | undefined)[]) => {
                    queryClient.setQueryData(queryKey, (oldData: any) => {
                        if (!oldData?.getKanbanData) return oldData

                        const newData = { ...oldData, getKanbanData: { ...oldData.getKanbanData } }

                        // Filtrar aplicaciones de cada estado
                        Object.keys(newData.getKanbanData).forEach(estado => {
                            const columna = newData.getKanbanData[estado]
                            if (columna.aplicaciones) {
                                columna.aplicaciones = columna.aplicaciones.filter((app: any) => 
                                    app.convocatoriaId !== convocatoriaId
                                )
                                columna.total = columna.aplicaciones.length
                            }
                        })

                        return newData
                    })
                }

                // Limpiar tanto para la convocatoria específica como para 'all'
                limpiarAplicacionesConvocatoria(['kanban-data', convocatoriaId])
                limpiarAplicacionesConvocatoria(['kanban-data', 'all'])
            }
        },
        onError: (error) => {
            setIsExecuting(false)
        }
    })

    return {
        finalizarCandidato: (aplicacionId: string, usuarioId?: string, options?: any) => {
            if (mutation.isPending || isExecuting) {
                return
            }
            
            mutation.mutate({ aplicacionId, usuarioId }, options)
        },
        isLoading: mutation.isPending || isExecuting,
        error: mutation.error,
        data: mutation.data
    }
}
