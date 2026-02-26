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
