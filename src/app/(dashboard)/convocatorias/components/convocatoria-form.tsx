import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getPublicFormUrl } from '@/lib/utils';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Save,
  X,
  FileText,
  Mail,
  Phone,
  Hash,
  Type,
  List,
  Link,
  CheckSquare,
  Upload
} from 'lucide-react';
import { CampoPersonalizadoForm } from './campo-personalizado-form';
import toast from 'react-hot-toast';

// Tipos basados en la entidad del backend
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
    maxLength?: number;
    allowedTypes?: string[];
  };
}

interface FormularioConfig {
  id?: string;
  convocatoriaId: string;
  titulo: string;
  descripcion?: string;
  campos: CampoFormulario[];
  estado: 'ACTIVO' | 'INACTIVO';
  urlPublico?: string;
  tokenJwt?: string;
  fechaPublicacion?: Date;
  fechaExpiracion?: Date;
}

// Campos base que no se pueden eliminar
const CAMPOS_BASE: CampoFormulario[] = [
  {
    id: 'dni',
    nombre: 'dni',
    etiqueta: 'DNI',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 1,
    placeholder: 'Ingrese su número de DNI',
    validaciones: {
      patron: '^\\d{8}$',
      maxLength: 8
    }
  },
  {
    id: 'nombres',
    nombre: 'nombres',
    etiqueta: 'NOMBRES',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 2,
    placeholder: 'Ingrese sus nombres completos'
  },
  {
    id: 'apellido_paterno',
    nombre: 'apellido_paterno',
    etiqueta: 'APELLIDO PATERNO',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 3,
    placeholder: 'Ingrese su apellido paterno'
  },
  {
    id: 'apellido_materno',
    nombre: 'apellido_materno',
    etiqueta: 'APELLIDO MATERNO',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 4,
    placeholder: 'Ingrese su apellido materno'
  },
  {
    id: 'correo',
    nombre: 'correo',
    etiqueta: 'CORREO ELECTRÓNICO',
    tipo: 'email',
    requerido: true,
    habilitado: true,
    orden: 5,
    placeholder: 'correo@ejemplo.com'
  },
  {
    id: 'telefono',
    nombre: 'telefono',
    etiqueta: 'TELÉFONO',
    tipo: 'tel',
    requerido: true,
    habilitado: true,
    orden: 6,
    placeholder: '+51 XXX XXX XXX'
  },
  {
    id: 'medio_convocatoria',
    nombre: 'medio_convocatoria',
    etiqueta: 'POR QUE MEDIO SE ENTERO DE LA CONVOCATORIA',
    tipo: 'select',
    requerido: true,
    habilitado: true,
    orden: 7,
    opciones: [
      'Redes Sociales',
      'Sitio Web de la Empresa',
      'Referencia de un conocido',
      'Bolsa de trabajo',
      'LinkedIn',
      'Otro'
    ]
  },
  {
    id: 'anios_experiencia_puesto',
    nombre: 'anios_experiencia_puesto',
    etiqueta: 'AÑOS DE EXPERIENCIA EN EL PUESTO',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 8,
    validaciones: { min: 0, max: 50 }
  },
  {
    id: 'anios_experiencia_general',
    nombre: 'anios_experiencia_general',
    etiqueta: 'AÑOS DE EXPERIENCIA PROFESIONAL GRAL.',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 9,
    validaciones: { min: 0, max: 50 }
  },
  {
    id: 'pretension_economica',
    nombre: 'pretension_economica',
    etiqueta: 'PRETENSIÓN ECONÓMICA',
    tipo: 'number',
    requerido: true,
    habilitado: true,
    orden: 10,
    validaciones: { min: 0 },
    placeholder: 'S/ 0.00'
  },
  {
    id: 'lugar_residencia',
    nombre: 'lugar_residencia',
    etiqueta: 'LUGAR DE RESIDENCIA',
    tipo: 'text',
    requerido: true,
    habilitado: true,
    orden: 11,
    placeholder: 'Ciudad, Provincia'
  },
  {
    id: 'curriculum',
    nombre: 'curriculum',
    etiqueta: 'CURRICULUM',
    tipo: 'file',
    requerido: true,
    habilitado: true,
    orden: 12,
    validaciones: {
      maxSize: 5242880, // 5MB en bytes
      maxFiles: 1, // Por defecto 1 archivo, pero configurable
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
  },
  {
    id: 'terminos_aceptados',
    nombre: 'terminos_aceptados',
    etiqueta: 'ACEPTO LOS TÉRMINOS DE USO',
    tipo: 'checkbox',
    requerido: true,
    habilitado: true,
    orden: 13
  }
];

interface FormularioConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: FormularioConfig) => Promise<void>;
  convocatoriaId: string;
  tituloConvocatoria?: string;
  configExistente?: FormularioConfig | null;
}

const getTipoIcon = (tipo: CampoFormulario['tipo']) => {
  switch (tipo) {
    case 'text': return <Type className="w-4 h-4" />;
    case 'email': return <Mail className="w-4 h-4" />;
    case 'tel': return <Phone className="w-4 h-4" />;
    case 'number': return <Hash className="w-4 h-4" />;
    case 'textarea': return <FileText className="w-4 h-4" />;
    case 'select': return <List className="w-4 h-4" />;
    case 'url': return <Link className="w-4 h-4" />;
    case 'file': return <Upload className="w-4 h-4" />;
    case 'checkbox': return <CheckSquare className="w-4 h-4" />;
    default: return <Type className="w-4 h-4" />;
  }
};

const getTipoLabel = (tipo: CampoFormulario['tipo']) => {
  switch (tipo) {
    case 'text': return 'Texto';
    case 'email': return 'Email';
    case 'tel': return 'Teléfono';
    case 'number': return 'Número';
    case 'textarea': return 'Texto Largo';
    case 'select': return 'Lista de Opciones';
    case 'url': return 'URL';
    case 'file': return 'Archivo';
    case 'checkbox': return 'Casilla de Verificación';
    default: return 'Texto';
  }
};

// Componentes simplificados usando elementos HTML tradicionales
const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({
  htmlFor,
  children,
  className = ""
}) => (
  <label htmlFor={htmlFor} className={`block text-xs font-medium text-text-primary mb-1 ${className}`}>
    {children}
  </label>
);


const Checkbox: React.FC<{
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ id, checked, onCheckedChange }) => (
  <input
    id={id}
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="w-4 h-4 text-primary border-border-color rounded focus:ring-primary/50"
  />
);

const Textarea: React.FC<{
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}> = ({ id, value, onChange, placeholder, rows = 3, className = "" }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`w-full px-3 py-2 border border-border-color rounded-md bg-card-bg text-text-primary text-xs placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary resize-none ${className}`}
  />
);


const Badge: React.FC<{ variant?: 'default' | 'secondary' | 'outline'; children: React.ReactNode; className?: string }> = ({
  variant = 'default',
  children,
  className = ""
}) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border-color text-text-primary'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const FormularioConfigModal: React.FC<FormularioConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  convocatoriaId,
  tituloConvocatoria,
  configExistente
}) => {
  const [config, setConfig] = useState<FormularioConfig>({
    convocatoriaId,
    titulo: tituloConvocatoria ? `Postulación ${tituloConvocatoria}` : 'Formulario de Postulación',
    descripcion: '',
    campos: [...CAMPOS_BASE],
    estado: 'ACTIVO',
    fechaPublicacion: new Date()
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<CampoFormulario | null>(null);

  // Cargar configuración existente
  useEffect(() => {
    if (configExistente) {
      setConfig({
        ...configExistente,
        // Asegurar que los campos opcionales se manejen correctamente
        urlPublico: configExistente.urlPublico || undefined,
        tokenJwt: configExistente.tokenJwt || undefined,
        fechaPublicacion: configExistente.fechaPublicacion ? new Date(configExistente.fechaPublicacion) : new Date(),
        fechaExpiracion: configExistente.fechaExpiracion ? new Date(configExistente.fechaExpiracion) : undefined
      });
    } else {
      // Configuración por defecto
      setConfig({
        convocatoriaId,
        titulo: tituloConvocatoria ? `Postulación ${tituloConvocatoria}` : 'Formulario de Postulación',
        descripcion: '',
        campos: [...CAMPOS_BASE],
        estado: 'ACTIVO',
        fechaPublicacion: new Date()
      });
    }
  }, [configExistente, convocatoriaId, tituloConvocatoria]);

  const handleSave = async () => {
    // Validar campos obligatorios
    if (!config.titulo || config.titulo.trim() === '') {
      toast.error('El título del formulario es obligatorio');
      return;
    }

    if (!config.fechaPublicacion) {
      toast.error('La fecha de publicación es obligatoria');
      return;
    }

    if (!config.fechaExpiracion) {
      toast.error('La fecha de expiración es obligatoria');
      return;
    }

    // Validar que la fecha de expiración sea posterior a la de publicación
    if (config.fechaExpiracion <= config.fechaPublicacion) {
      toast.error('La fecha de expiración debe ser posterior a la fecha de publicación');
      return;
    }

    if (!config.estado) {
      toast.error('El estado del formulario es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(config);
      toast.success('¡Configuración de formulario guardada exitosamente!');
      onClose();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error('Error al guardar la configuración del formulario');
    } finally {
      setIsSaving(false);
    }
  };

  const addCampoPersonalizado = (nuevoCampo: Omit<CampoFormulario, 'id' | 'orden'>) => {
    const maxOrden = Math.max(...config.campos.map(c => c.orden), 0);
    const campo: CampoFormulario = {
      ...nuevoCampo,
      id: `campo_${Date.now()}`,
      orden: maxOrden + 1
    };

    setConfig(prev => ({
      ...prev,
      campos: [...prev.campos, campo]
    }));
    setShowAddField(false);
  };

  const updateCampo = (campoId: string, updates: Partial<CampoFormulario>) => {
    setConfig(prev => ({
      ...prev,
      campos: prev.campos.map(campo =>
        campo.id === campoId ? { ...campo, ...updates } : campo
      )
    }));
  };

  const removeCampo = (campoId: string) => {
    const campo = config.campos.find(c => c.id === campoId);
    if (campo && CAMPOS_BASE.some(cb => cb.nombre === campo.nombre)) {
      return; // No eliminar campos base
    }

    setConfig(prev => ({
      ...prev,
      campos: prev.campos.filter(campo => campo.id !== campoId)
    }));
  };

  const moveCampo = (fromIndex: number, toIndex: number) => {
    const campos = [...config.campos];
    const [moved] = campos.splice(fromIndex, 1);
    campos.splice(toIndex, 0, moved);

    // Reasignar órdenes
    campos.forEach((campo, index) => {
      campo.orden = index + 1;
    });

    setConfig(prev => ({ ...prev, campos }));
  };

  const isCampoBase = (campo: CampoFormulario) => {
    return CAMPOS_BASE.some(cb => cb.nombre === campo.nombre);
  };

  const modalFooter = (
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        size="xs"
        onClick={onClose}
      >
        Cancelar
      </Button>
          <Button
            variant="custom"
            color="primary"
            size="xs"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : config.id ? 'Guardar Configuración' : 'Generar Formulario'}
          </Button>
    </div>
  );

  const modalTitle = (
    <div>
      <h2 className="text-sm font-semibold text-text-primary">
        Configurar Formulario
      </h2>
      {tituloConvocatoria && (
        <p className="text-xs text-text-secondary mt-1">
          {tituloConvocatoria}
        </p>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={modalFooter}
    >
      <div className="space-y-6 mb-4">
        {/* Información General */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título del Formulario</Label>
            <Input
              id="titulo"
              value={config.titulo}
              onChange={(e) => setConfig(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Formulario de Postulación"
            />
          </div>

          {/* Fechas de Vigencia */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaPublicacion">Fecha de Publicación</Label>
              <Input
                id="fechaPublicacion"
                type="date"
                value={config.fechaPublicacion ? config.fechaPublicacion.toISOString().split('T')[0] : ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  fechaPublicacion: e.target.value ? new Date(e.target.value) : undefined
                }))}
              />
            </div>
            <div>
              <div>
                <Label htmlFor="fechaExpiracion">Fecha de Expiración</Label>
                <Input
                  id="fechaExpiracion"
                  type="date"
                  value={config.fechaExpiracion ? config.fechaExpiracion.toISOString().split('T')[0] : ''}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    fechaExpiracion: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={config.estado}
              onChange={(value) =>
                setConfig(prev => ({ ...prev, estado: value as 'ACTIVO' | 'INACTIVO' }))
              }
              options={[
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'INACTIVO', label: 'Inactivo' }
              ]}
            />
          </div>

          {/* URL del Formulario Público - Solo en modo edición */}
          {config.id && (
            <div>
              <Label>URL del Formulario Público</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={config.urlPublico ? getPublicFormUrl(config.urlPublico) : ''}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    if (config.urlPublico) {
                      navigator.clipboard.writeText(getPublicFormUrl(config.urlPublico));
                      toast.success('URL copiada al portapapeles');
                    }
                  }}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-[10px] text-text-secondary">
                Comparte esta URL para que los candidatos puedan acceder al formulario
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={config.descripcion || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el propósito del formulario..."
              rows={3}
            />
          </div>

        </div>

        {/* Campos del Formulario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="custom"
              color="primary"
              size="xs"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddField(true)}
            >
              Agregar Campo
            </Button>
          </div>
          <div className="space-y-3">
            {config.campos
              .sort((a, b) => a.orden - b.orden)
              .map((campo, index) => (
                <div
                  key={campo.id}
                  className="flex items-center gap-3 p-3 border border-border-color rounded-lg bg-card-bg"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-text-secondary cursor-move" />
                    <span className="text-xs text-text-secondary font-medium">
                      {campo.orden}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getTipoIcon(campo.tipo)}
                    <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs text-text-primary truncate">
                          {campo.etiqueta}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {getTipoLabel(campo.tipo)} • {campo.nombre}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {campo.requerido && (
                      <Badge variant="secondary" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                    {isCampoBase(campo) && (
                      <Badge variant="outline" className="text-xs">
                        Base
                      </Badge>
                    )}
                    <Button
                      variant="custom"
                      color="gray"
                      size="xs"
                      icon={<Settings className="w-4 h-4" />}
                      onClick={() => setEditingField(campo)}
                      disabled={isCampoBase(campo)}
                    />
                    <Button
                      variant="custom"
                      color="red"
                      size="xs"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeCampo(campo.id)}
                      disabled={isCampoBase(campo)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar campo */}
      {(showAddField || editingField) && (
        <CampoPersonalizadoForm
          campo={editingField}
          onSave={(campoData) => {
            if (editingField) {
              updateCampo(editingField.id, campoData);
              setEditingField(null);
            } else {
              addCampoPersonalizado(campoData);
            }
          }}
          onClose={() => {
            setShowAddField(false);
            setEditingField(null);
          }}
        />
      )}
    </Modal>
  );
};


export default FormularioConfigModal;