/**
 * 🔗 GRAPHQL CLIENT - Cliente GraphQL para comunicación con backend
 *
 * Responsabilidad: Configurar cliente GraphQL para hacer requests
 * Flujo: Importado por hooks → Cliente HTTP para GraphQL
 */

import { GraphQLClient } from 'graphql-request'

// URL del backend GraphQL (ajustar según configuración)
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'

// URL del servicio PERSONAL
const PERSONAL_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_PERSONAL_GRAPHQL_URL || 'https://personal-production-1128.up.railway.app/graphql'

// Crear cliente GraphQL principal
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    // Aquí se pueden agregar headers de autenticación si es necesario
    // 'Authorization': `Bearer ${token}`,
  },
})

// Crear cliente GraphQL para servicio PERSONAL
export const personalGraphQLClient = new GraphQLClient(PERSONAL_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
})

// Función helper para hacer requests con manejo de errores
export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    return await graphqlClient.request<T>(query, variables)
  } catch (error) {
    console.error('GraphQL Request Error:', error)
    throw error
  }
}

// Función helper específica para requests al servicio PERSONAL
export async function personalGraphQLRequest<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    return await personalGraphQLClient.request<T>(query, variables)
  } catch (error) {
    console.error('Personal GraphQL Request Error:', error)
    throw error
  }
}