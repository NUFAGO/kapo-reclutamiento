import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { OBTENER_COMUNICACION_ENTRADA_POR_APLICACION_QUERY } from '@/graphql/queries/comunicacion.queries'

interface ComunicacionEntrada {
  id: string
  aplicacionCandidatoId: string
  candidatoId: string
  llamadaConfirmada: boolean
  comunicacionConfirmada: boolean
  created_at: string
  updated_at: string
}

export function useComunicacionEntradaPorAplicacion(aplicacionCandidatoId: string) {
  return useQuery({
    queryKey: ['comunicacion-entrada', aplicacionCandidatoId],
    queryFn: async () => {
      const response = await graphqlRequest<{
        obtenerComunicacionEntradaPorAplicacion: ComunicacionEntrada | null
      }>(OBTENER_COMUNICACION_ENTRADA_POR_APLICACION_QUERY, { aplicacionCandidatoId })
      return response.obtenerComunicacionEntradaPorAplicacion
    },
    enabled: !!aplicacionCandidatoId,
    staleTime: 0,
    refetchOnMount: 'always'
  })
}
