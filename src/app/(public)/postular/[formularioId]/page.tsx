'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { graphqlRequest } from '@/lib/graphql-client';
import { OBTENER_FORMULARIO_CONFIG_POR_ID_QUERY } from '@/graphql/queries';
import { CREAR_APLICACION_MUTATION } from '@/graphql/mutations';
import toast from 'react-hot-toast';
import { Button, Input, LoadingSpinner, Select } from '@/components/ui';
import { useFileUpload, UPLOAD_CONFIGS } from '@/hooks/useFileUpload';

interface CampoFormulario {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'url' | 'file' | 'checkbox';
  requerido: boolean;
  habilitado: boolean;
  orden: number;
  opciones?: string[];
  placeholder?: string;
  validaciones?: {
    min?: number;
    max?: number;
    patron?: string;
    maxSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
  };
}

interface FormularioConfig {
  id: string;
  convocatoriaId: string;
  titulo: string;
  descripcion?: string;
  campos: CampoFormulario[];
  estado: string;
  fechaExpiracion?: string;
}

export default function PostularPage() {
  const params = useParams();
  const formularioId = params.formularioId as string;

  const [config, setConfig] = useState<FormularioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Hook para subir archivos
  const { uploadFile, uploadMultipleFiles, isUploading, error: uploadError, clearError } = useFileUpload();

  useEffect(() => {
    const loadFormConfig = async () => {
      try {
        const response = await graphqlRequest(OBTENER_FORMULARIO_CONFIG_POR_ID_QUERY, {
          id: formularioId
        });

        const formConfig = response.formularioConfigPorId;

        if (!formConfig) {
          setError('Formulario no encontrado');
          return;
        }

        if (formConfig.estado !== 'ACTIVO') {
          setError('Este formulario no está disponible');
          return;
        }

        if (formConfig.fechaExpiracion && new Date() > new Date(formConfig.fechaExpiracion)) {
          setError('Este formulario ha expirado');
          return;
        }

        setConfig(formConfig);

        const initialData: Record<string, any> = {};
        formConfig.campos.forEach((campo: CampoFormulario) => {
          if (campo.tipo === 'checkbox') {
            initialData[campo.nombre] = false;
          } else {
            initialData[campo.nombre] = '';
          }
        });
        setFormData(initialData);

      } catch (err) {
        console.error('Error al cargar formulario:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };

    if (formularioId) {
      loadFormConfig();
    }
  }, [formularioId]);

  const handleFieldChange = (fieldName: string, value: any) => {
    // Sanitización básica en frontend
    let sanitizedValue = value;

    if (typeof value === 'string') {
      // Remover caracteres potencialmente peligrosos
      sanitizedValue = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
        .replace(/<[^>]*>/g, '') // Remover HTML tags
        .replace(/javascript:/gi, '') // Remover javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remover event handlers
      // .trim(); // Removido para permitir espacios al inicio/final

      // Limitar longitud máxima
      if (sanitizedValue.length > 10000) {
        sanitizedValue = sanitizedValue.substring(0, 10000);
      }
    }

    setFormData(prev => ({ ...prev, [fieldName]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!config) return;

    // Rate limiting básico - prevenir envíos muy rápidos (reducido para mejor UX)
    const now = Date.now();
    const lastSubmit = localStorage.getItem('lastSubmitTime');
    if (lastSubmit && now - parseInt(lastSubmit) < 1000) { // 5 segundos mínimo entre envíos
      toast.error('Por favor espera unos segundos antes de enviar otra postulación');
      setSubmitting(false);
      return;
    }
    localStorage.setItem('lastSubmitTime', now.toString());

    const errors: string[] = [];

    // Validación de honeypot (campo oculto para detectar bots)
    if (honeypot.trim() !== '') {
      errors.push('Error de validación');
      setSubmitting(false);
      return; // No mostrar el error real para no alertar a los bots
    }

    // Validación de seguridad adicional
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i, /<object/i, /<embed/i,
      /\b(eval|alert|confirm|prompt)\b/i, /document\./i, /window\./i,
      /base64,/i, /data:text/i, /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\b/i
    ];

    Object.values(formData).forEach(value => {
      if (typeof value === 'string') {
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            errors.push('Se detectaron caracteres no permitidos en el formulario');
            return;
          }
        });
      }
    });

    config.campos.forEach(campo => {
      // Validación para campos requeridos (excepto archivos que se validan específicamente abajo)
      if (campo.requerido && campo.tipo !== 'file' && !formData[campo.nombre]) {
        errors.push(`${campo.etiqueta} es obligatorio`);
      }
      
      // Validación específica para campos de archivo requeridos
      if (campo.tipo === 'file' && campo.requerido) {
        const archivos = formData[campo.nombre];
        if (!archivos || (Array.isArray(archivos) && archivos.length === 0)) {
          errors.push(`${campo.etiqueta} es obligatorio`);
        }
      }

      if (campo.tipo === 'email' && formData[campo.nombre]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[campo.nombre])) {
          errors.push(`${campo.etiqueta} no es un correo válido`);
        }
        // Validación adicional de email
        if (formData[campo.nombre].length > 254) {
          errors.push(`${campo.etiqueta} es demasiado largo`);
        }
      }

      if (campo.tipo === 'url' && formData[campo.nombre]) {
        try {
          new URL(formData[campo.nombre]);
        } catch {
          errors.push(`${campo.etiqueta} no es una URL válida`);
        }
      }

      // Validación específica para DNI
      if (campo.nombre === 'dni' && formData[campo.nombre]) {
        const dniValue = formData[campo.nombre].toString();
        if (!/^\d{8}$/.test(dniValue)) {
          errors.push(`${campo.etiqueta} debe tener exactamente 8 dígitos numéricos`);
        }
      }

      if (campo.tipo === 'number' && formData[campo.nombre]) {
        const numValue = Number(formData[campo.nombre]);
        if (isNaN(numValue)) {
          errors.push(`${campo.etiqueta} debe ser un número válido`);
        } else if (numValue < 0) {
          errors.push(`${campo.etiqueta} no puede ser un número negativo`);
        } else if (!Number.isFinite(numValue)) {
          errors.push(`${campo.etiqueta} contiene un valor numérico inválido`);
        } else {
          // Validar límites si están definidos y son números válidos
          if (campo.validaciones?.min !== undefined && campo.validaciones.min !== null && numValue < campo.validaciones.min) {
            errors.push(`${campo.etiqueta} debe ser mayor o igual a ${campo.validaciones.min}`);
          }
          if (campo.validaciones?.max !== undefined && campo.validaciones.max !== null && numValue > campo.validaciones.max) {
            errors.push(`${campo.etiqueta} debe ser menor o igual a ${campo.validaciones.max}`);
          }
        }
      }

      if ((campo.tipo === 'text' || campo.tipo === 'textarea') && formData[campo.nombre]) {
        const textValue = formData[campo.nombre];
        // Validar longitud razonable
        if (textValue.length > 5000) {
          errors.push(`${campo.etiqueta} es demasiado largo (máximo 5000 caracteres)`);
        }
        // Detectar URLs sospechosas
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = textValue.match(urlRegex);
        if (urls && urls.length > 3) {
          errors.push(`${campo.etiqueta} contiene demasiadas URLs`);
        }
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
      setSubmitting(false);
      return;
    }

    try {
      // Verificar que la configuración esté cargada (aunque el botón ya está deshabilitado)
      if (!config.convocatoriaId) {
        toast.error('Error: ID de convocatoria no encontrado');
        setSubmitting(false);
        return;
      }

      // NUEVO: Subir archivos antes de crear la aplicación
      const archivosSubidos: Record<string, string | string[]> = {};
      
      // Buscar campos de archivo en el formulario y subirlos
      for (const campo of config.campos) {
        if (campo.tipo === 'file' && formData[campo.nombre]) {
          const archivos = Array.isArray(formData[campo.nombre]) 
            ? formData[campo.nombre] 
            : [formData[campo.nombre]];
          
          if (archivos.length > 0) {
            // Determinar tipo de configuración según el campo
            let uploadTipo: 'CV_DOCUMENTOS' | 'FOTOS_CANDIDATO' | 'IMAGENES' = 'CV_DOCUMENTOS';
            
            if (campo.etiqueta.toLowerCase().includes('foto') || campo.etiqueta.toLowerCase().includes('imagen')) {
              uploadTipo = 'FOTOS_CANDIDATO';
            } else if (campo.etiqueta.toLowerCase().includes('cv') || campo.etiqueta.toLowerCase().includes('currículum') || campo.etiqueta.toLowerCase().includes('documento')) {
              uploadTipo = 'CV_DOCUMENTOS';
            } else {
              // Por defecto usar CV_DOCUMENTOS para permitir PDFs y documentos
              uploadTipo = 'CV_DOCUMENTOS';
            }

            // Subir archivos
            const resultado = await uploadMultipleFiles(archivos, { tipo: uploadTipo });
            
            if (resultado.successful.length > 0) {
              // Guardar URLs de los archivos subidos
              if (archivos.length === 1) {
                archivosSubidos[campo.nombre] = resultado.successful[0].url;
              } else {
                archivosSubidos[campo.nombre] = resultado.successful.map(f => f.url);
              }
            }
            
            if (resultado.failed.length > 0) {
              toast.error(`Error al subir ${resultado.failed.length} archivo(s) del campo "${campo.etiqueta}"`);
              setSubmitting(false);
              return;
            }
          }
        }
      }

      // Preparar datos para la aplicación
      // Identificar campos específicos con búsqueda flexible en formData
      const findValue = (keywords: string[]): any => {
        const key = Object.keys(formData).find(k =>
          keywords.some(keyword => k.toLowerCase().includes(keyword.toLowerCase()))
        );
        return key ? formData[key] : undefined;
      };

      const valExpPuesto = Number(formData['anios_experiencia_puesto']) || findValue(['experiencia_puesto']) || 0;
      const valExpGeneral = Number(formData['anios_experiencia_general']) || Number(formData['experiencia_general']) || findValue(['experiencia_general']) || 0;
      const valMedio = formData['medio_convocatoria'] || formData['medio_enterado'] || findValue(['medio', 'enterado']) || 'Otro';
      const valPretension = Number(formData['pretension_economica']) || findValue(['pretension', 'economica', 'salario']) || 0;

      // 🔥 NUEVO: Usar URLs de archivos subidos en lugar del hardcode
      const curriculumUrl = archivosSubidos.curriculum || archivosSubidos.cv || archivosSubidos['cv-documento'] || 'simulado-cv.pdf';

      // Preparar datos para la aplicación
      const aplicacionData = {
        convocatoriaId: config.convocatoriaId,
        candidatoData: {
          dni: formData.dni,
          nombres: formData.nombres,
          apellidoPaterno: formData.apellido_paterno,
          apellidoMaterno: formData.apellido_materno,
          correo: formData.correo,
          telefono: formData.telefono,
          lugarResidencia: formData.lugar_residencia,
          curriculumUrl: curriculumUrl // ✅ Ahora usa URL real
        },
        // Enviar TODOS los datos del formulario como respuestas dinámicas
        respuestasFormulario: {
          ...formData,
          ...archivosSubidos, // ✅ Incluir URLs de archivos subidos
          medio_convocatoria: valMedio,
          anios_experiencia_general: Number(valExpGeneral) || 0,
        },
        // Campos específicos normalizados
        camposEspecificos: {
          aniosExperienciaPuesto: Number(valExpPuesto) || 0,
          aniosExperienciaGeneral: Number(valExpGeneral) || 0,
          medioConvocatoria: String(valMedio),
          pretensionEconomica: Number(valPretension) || 0,
          curriculumUrl: curriculumUrl // ✅ Ahora usa URL real
        },
        aplicadoPor: 'CANDIDATO' as const
      };

      console.log('Enviando aplicacionData:', aplicacionData);

      // Enviar datos a través de GraphQL
      const response = await graphqlRequest(CREAR_APLICACION_MUTATION, {
        input: aplicacionData
      });

      console.log('Aplicación creada:', response);
      toast.success('¡Postulación enviada exitosamente!');
    } catch (error) {
      console.error('Error al enviar postulación:', error);
      toast.error('Error al enviar la postulación. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} showText={true} text="Cargando..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl border border-gray-200">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">No encontrado</h1>
          <p className="text-sm text-gray-500">El formulario no está disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header minimalista */}
        <div className="mb-2 rounded-2xl backdrop-blur-xs px-5 py-2 border">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-700">Postulación</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
            {config.titulo}
          </h1>
          {config.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
              {config.descripcion}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            {/* Campo honeypot oculto para detectar bots */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="space-y-6">
              {config.campos
                .filter(campo => campo.habilitado)
                .filter(campo => !campo.etiqueta.toLowerCase().includes('términos') && !campo.etiqueta.toLowerCase().includes('terminos'))
                .sort((a, b) => a.orden - b.orden)
                .map((campo, index) => (
                  <FormField
                    key={campo.id}
                    campo={campo}
                    value={formData[campo.nombre]}
                    onChange={(value) => handleFieldChange(campo.nombre, value)}
                  />
                ))}

              {/* Campo de términos siempre al final */}
              {config.campos
                .filter(campo => campo.habilitado)
                .find(campo => campo.etiqueta.toLowerCase().includes('términos') || campo.etiqueta.toLowerCase().includes('terminos')) && (
                  <FormField
                    key={config.campos.find(campo => campo.etiqueta.toLowerCase().includes('términos') || campo.etiqueta.toLowerCase().includes('terminos'))!.id}
                    campo={config.campos.find(campo => campo.etiqueta.toLowerCase().includes('términos') || campo.etiqueta.toLowerCase().includes('terminos'))!}
                    value={formData[config.campos.find(campo => campo.etiqueta.toLowerCase().includes('términos') || campo.etiqueta.toLowerCase().includes('terminos'))!.nombre]}
                    onChange={(value) => handleFieldChange(config.campos.find(campo => campo.etiqueta.toLowerCase().includes('términos') || campo.etiqueta.toLowerCase().includes('terminos'))!.nombre, value)}
                    isTerminosField={true}
                  />
                )}
            </div>

            {/* Divider */}
            <div className="my-8 border-t border-gray-100"></div>

            {/* Submit Button */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={!config || loading || submitting || isUploading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-3.5 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                {submitting || isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size={16} showText={false} />
                    {isUploading ? 'Subiendo archivos...' : 'Enviando postulación...'}
                  </span>
                ) : (
                  'Enviar postulación'
                )}
              </button>
              <p className="text-xs text-center text-gray-500">
                Los campos con <span className="text-red-500">*</span> son obligatorios
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            ¿Necesitas ayuda? Contáctanos
          </p>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  campo: CampoFormulario;
  value: any;
  onChange: (value: any) => void;
  isTerminosField?: boolean;
}

interface FileUploadComponentProps {
  campo: CampoFormulario;
  value: any;
  onChange: (value: any) => void;
}

function FormField({ campo, value, onChange, isTerminosField = false }: FormFieldProps) {
  const textareaClasses = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400 text-gray-900 resize-vertical";

  // Convertir opciones del campo a formato SelectOption
  const selectOptions = campo.opciones?.map((opcion) => ({
    value: opcion,
    label: opcion,
  }));

  if (campo.tipo === 'checkbox') {
    return (
      <div className={`flex items-start gap-3 group text-xs`}>
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            required={campo.requerido}
            className="w-4 h-4 text-gray-900 focus:ring-2 focus:ring-gray-900 border-gray-300 rounded transition-colors cursor-pointer"
            id={campo.id}
          />
        </div>
        <label htmlFor={campo.id} className="text-xs text-gray-700 cursor-pointer flex-1 leading-relaxed">
          {campo.etiqueta}
          {campo.requerido && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
        {campo.etiqueta}
        {campo.requerido && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {campo.tipo === 'text' && (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || `Ingresa tu ${campo.etiqueta.toLowerCase()}`}
          required={campo.requerido}
        />
      )}

      {campo.tipo === 'email' && (
        <Input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || 'tu@email.com'}
          required={campo.requerido}
        />
      )}

      {campo.tipo === 'tel' && (
        <Input
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || '+51 999 999 999'}
          required={campo.requerido}
        />
      )}

      {campo.tipo === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            // Validar que sea un número positivo y no contenga letras
            if (newValue === '' || (!isNaN(Number(newValue)) && Number(newValue) >= 0)) {
              onChange(newValue);
            }
          }}
          onKeyDown={(e) => {
            // Prevenir la letra 'e' en cualquier posición
            if (e.key === 'e' || e.key === 'E') {
              e.preventDefault();
              return;
            }
            // Prevenir el signo '-' excepto al inicio cuando está vacío
            if (e.key === '-' && (e.currentTarget.value !== '' || e.currentTarget.selectionStart !== 0)) {
              e.preventDefault();
              return;
            }
            // Prevenir cualquier letra que no sea número
            if (e.key.length === 1 && !/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
              return;
            }
          }}
          placeholder={campo.placeholder}
          required={campo.requerido}
          min={campo.validaciones?.min}
          max={campo.validaciones?.max}
        />
      )}

      {campo.tipo === 'textarea' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || `Escribe aquí...`}
          required={campo.requerido}
          rows={4}
          className={textareaClasses}
        />
      )}

      {campo.tipo === 'select' && selectOptions && (
        <Select
          value={value || null}
          onChange={(newValue: string | null) => onChange(newValue || '')}
          options={selectOptions}
          placeholder="Selecciona una opción"
        />
      )}

      {campo.tipo === 'file' && (
        <div className="space-y-3">
          <FileUploadComponent
            campo={campo}
            value={value}
            onChange={onChange}
          />
        </div>
      )}

      {campo.tipo === 'url' && (
        <Input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={campo.placeholder || 'https://ejemplo.com'}
          required={campo.requerido}
          pattern={campo.validaciones?.patron}
        />
      )}
    </div>
  );
}

function FileUploadComponent({ campo, value, onChange }: FileUploadComponentProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>(value ? (Array.isArray(value) ? value : [value]) : []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFiles = campo.validaciones?.maxFiles || 1;
  const maxSize = campo.validaciones?.maxSize || (5 * 1024 * 1024); // 5MB por defecto
  const allowedTypes = campo.validaciones?.allowedTypes || [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize) {
      return `El archivo "${file.name}" supera el límite de ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      return `El archivo "${file.name}" no es un tipo permitido (PDF, DOC, DOCX)`;
    }

    return null;
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach(file => {
      // Verificar límite de archivos
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Solo se permiten ${maxFiles} archivo(s) máximo`);
        return;
      }

      // Verificar si el archivo ya existe
      const exists = [...files, ...newFiles].some(f => f.name === file.name && f.size === file.size);
      if (exists) {
        errors.push(`El archivo "${file.name}" ya ha sido seleccionado`);
        return;
      }

      // Validar archivo
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        return;
      }

      newFiles.push(file);
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange(maxFiles === 1 ? updatedFiles[0] : updatedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange(maxFiles === 1 ? updatedFiles[0] || null : updatedFiles);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(1);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-${campo.id}`}
        required={campo.requerido && files.length === 0}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          group relative flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200 bg-white
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className={`w-8 h-8 mb-3 transition-colors duration-200 ${isDragOver ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-900'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <div className="text-center">
          <p className={`text-sm font-medium mb-1 transition-colors duration-200 ${isDragOver ? 'text-blue-700' : 'text-gray-900'
            }`}>
            {files.length > 0
              ? `${files.length} archivo${files.length > 1 ? 's' : ''} seleccionado${files.length > 1 ? 's' : ''}`
              : `${campo.etiqueta}${campo.requerido ? '*' : ''}`
            }
          </p>
          <p className="text-xs text-gray-500">
            {isDragOver
              ? 'Suelta para subir'
              : `Arrastra y suelta o haz click • PDF, DOC, DOCX • Hasta ${maxFiles} archivo${maxFiles > 1 ? 's' : ''} • Máx ${Math.round(maxSize / (1024 * 1024))}MB cada uno`
            }
          </p>
        </div>

        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl pointer-events-none" />
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-green-600 flex-shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(1)}MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {files.length > 1 && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Total: {files.length} archivo{files.length > 1 ? 's' : ''} • {totalSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}