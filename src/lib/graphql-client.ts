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

// Función para obtener la URL del servicio según el nombre del servicio
function getServiceUrl(serviceName?: string) {
  if (serviceName === 'personal') {
    return PERSONAL_GRAPHQL_ENDPOINT;
  }
  return GRAPHQL_ENDPOINT;
}

// Función helper para hacer requests con manejo de errores
export async function graphqlRequest<T = any>(
  query: string,
  variables?: any,
  serviceName?: string
): Promise<T> {
  const url = getServiceUrl(serviceName);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    // Si hay errores GraphQL, lanzarlos incluso si el status HTTP es 200
    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map((e: any) => e.message).join(', ');
      throw new Error(`GraphQL errors: ${errorMessages}`);
    }

    return result.data;
  } catch (error) {
    throw error;
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