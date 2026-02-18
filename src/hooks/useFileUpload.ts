/**
 * HOOK PERSONALIZADO - Subida de Archivos
 * 
 * Responsabilidad: Manejar subida de archivos al backend GraphQL
 * Flujo: Archivo(s) → Mutación GraphQL → Storage → URL generada
 */

import { useState, useCallback } from 'react';
import { graphqlRequest } from '@/lib/graphql-client';
import toast from 'react-hot-toast';
import {
  ELIMINAR_ARCHIVO_MUTATION,
  SUBIR_ARCHIVO_MUTATION,
  SUBIR_MULTIPLES_ARCHIVOS_MUTATION
} from '@/graphql/mutations';

// Tipos para el hook
export interface FileUploadConfig {
  tipo: 'CV_DOCUMENTOS' | 'FOTOS_CANDIDATO' | 'EVIDENCIAS_ENTREVISTA' | 'DOCUMENTOS_CONVOCATORIA' | 'IMAGENES';
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface FileUploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface BatchUploadResult {
  successful: FileUploadResult[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File, config?: FileUploadConfig) => Promise<FileUploadResult | null>;
  uploadMultipleFiles: (files: File[], config?: FileUploadConfig) => Promise<BatchUploadResult>;
  deleteFile: (url: string) => Promise<{success: boolean, error?: string}>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

// Configuraciones predefinidas
const UPLOAD_CONFIGS: Record<string, { maxFileSize: number; allowedTypes: string[]; accept: string }> = {
  CV_DOCUMENTOS: {
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    accept: '.pdf,.doc,.docx'
  },
  FOTOS_CANDIDATO: {
    maxFileSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    accept: 'image/*'
  },
  EVIDENCIAS_ENTREVISTA: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    accept: 'image/*,.pdf'
  },
  DOCUMENTOS_CONVOCATORIA: {
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    accept: '.pdf,.doc,.docx,.xls,.xlsx'
  },
  IMAGENES: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    accept: 'image/*'
  }
};

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Validar archivo antes de subir
  const validateFile = useCallback((file: File, config: FileUploadConfig): string | null => {
    const defaultConfig = UPLOAD_CONFIGS[config.tipo];
    const maxSize = config.maxFileSize || defaultConfig.maxFileSize;
    const allowedTypes = config.allowedTypes || defaultConfig.allowedTypes;

    // Validar tamaño
    if (file.size > maxSize) {
      return `El archivo "${file.name}" supera el límite de ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      return `El archivo "${file.name}" no es un tipo permitido. Tipos permitidos: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, []);

  // Subir un archivo individual
  const uploadFile = useCallback(async (file: File, config?: FileUploadConfig): Promise<FileUploadResult | null> => {
    if (!config) {
      setError('Se requiere configuración para subir el archivo');
      return null;
    }

    // Validar archivo
    const validationError = validateFile(file, config);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Crear FormData para el archivo
      const formData = new FormData();
      
      // 1. Primero agregar operations
      formData.append('operations', JSON.stringify({
        query: SUBIR_ARCHIVO_MUTATION,
        variables: {
          file: null,
          config: {
            tipo: config.tipo,
            ...(config.maxFileSize && { maxFileSize: config.maxFileSize }),
            ...(config.allowedTypes && { allowedTypes: config.allowedTypes })
          }
        }
      }));

      // 2. Segundo agregar map
      formData.append('map', JSON.stringify({ '0': ['variables.file'] }));

      // 3. Tercero agregar el archivo (después de map)
      formData.append('0', file);

      // Hacer la petición fetch directamente para soportar multipart/form-data
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type, el navegador lo establece automáticamente para FormData
        }
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error al subir archivo');
      }

      const uploadResult = result.data.subirArchivo;
      
      toast.success(`Archivo "${file.name}" subido exitosamente`);
      return uploadResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir archivo';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile]);

  // Subir múltiples archivos
  const uploadMultipleFiles = useCallback(async (files: File[], config?: FileUploadConfig): Promise<BatchUploadResult> => {
    if (!config) {
      setError('Se requiere configuración para subir los archivos');
      return { successful: [], failed: files.map(f => ({ filename: f.name, error: 'Configuración requerida' })) };
    }

    // Validar todos los archivos
    const errors: string[] = [];
    files.forEach(file => {
      const validationError = validateFile(file, config);
      if (validationError) {
        errors.push(validationError);
      }
    });

    if (errors.length > 0) {
      const errorMessage = errors.join('\n');
      setError(errorMessage);
      toast.error(errorMessage);
      return { 
        successful: [], 
        failed: files.map(f => ({ filename: f.name, error: 'Validación fallida' })) 
      };
    }

    setIsUploading(true);
    setError(null);

    try {
      // Crear FormData para múltiples archivos
      const formData = new FormData();
      const filesMap: { [key: string]: string[] } = {};

      // Preparar el mapa de archivos
      files.forEach((file, index) => {
        filesMap[index.toString()] = [`variables.files.${index}`];
      });

      // 1. Primero agregar operations
      formData.append('operations', JSON.stringify({
        query: SUBIR_MULTIPLES_ARCHIVOS_MUTATION,
        variables: {
          files: new Array(files.length).fill(null),
          config: {
            tipo: config.tipo,
            ...(config.maxFileSize && { maxFileSize: config.maxFileSize }),
            ...(config.allowedTypes && { allowedTypes: config.allowedTypes })
          }
        }
      }));

      // 2. Segundo agregar map
      formData.append('map', JSON.stringify(filesMap));

      // 3. Tercero agregar los archivos (después de map)
      files.forEach((file, index) => {
        formData.append(index.toString(), file);
      });

      // Hacer la petición fetch
      const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type, el navegador lo establece automáticamente para FormData
        }
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error al subir archivos');
      }

      const uploadResult = result.data.subirMultiplesArchivos;
      
      // Mostrar notificaciones
      if (uploadResult.successful.length > 0) {
        toast.success(`${uploadResult.successful.length} archivo(s) subido(s) exitosamente`);
      }
      
      if (uploadResult.failed.length > 0) {
        toast.error(`${uploadResult.failed.length} archivo(s) fallaron`);
      }

      return uploadResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir archivos';
      setError(errorMessage);
      toast.error(errorMessage);
      return { 
        successful: [], 
        failed: files.map(f => ({ filename: f.name, error: errorMessage })) 
      };
    } finally {
      setIsUploading(false);
    }
  }, [validateFile]);

  // Eliminar un archivo
  const deleteFile = useCallback(async (url: string): Promise<{success: boolean, error?: string}> => {
    try {
      const result = await graphqlRequest(ELIMINAR_ARCHIVO_MUTATION, { url });
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error al eliminar archivo');
      }
      toast.success('Archivo eliminado exitosamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar archivo';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    error,
    clearError
  };
}

// Exportar configuraciones para uso en componentes
export { UPLOAD_CONFIGS };
