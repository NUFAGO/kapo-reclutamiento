import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Plus,
  X
} from 'lucide-react';
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
    allowedTypes?: string[];
  };
}

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

interface CampoPersonalizadoFormProps {
  campo?: CampoFormulario | null;
  onSave: (campo: Omit<CampoFormulario, 'id' | 'orden'>) => void;
  onClose: () => void;
}

export const CampoPersonalizadoForm: React.FC<CampoPersonalizadoFormProps> = ({
  campo,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    nombre: campo?.nombre || '',
    etiqueta: campo?.etiqueta || '',
    tipo: campo?.tipo || 'text' as CampoFormulario['tipo'],
    requerido: campo?.requerido || false,
    habilitado: campo?.habilitado !== false,
    opciones: campo?.opciones || [],
    placeholder: campo?.placeholder || '',
    validaciones: campo?.validaciones || {}
  });

  const [nuevaOpcion, setNuevaOpcion] = useState('');

  const handleSave = () => {
    // Validar campos obligatorios
    if (!formData.nombre || formData.nombre.trim() === '') {
      toast.error('El nombre del campo es obligatorio');
      return;
    }

    if (!formData.etiqueta || formData.etiqueta.trim() === '') {
      toast.error('La etiqueta del campo es obligatoria');
      return;
    }

    if (!formData.tipo) {
      toast.error('El tipo de campo es obligatorio');
      return;
    }

    // Validar opciones para campos select
    if (formData.tipo === 'select' && (!formData.opciones || formData.opciones.length === 0)) {
      toast.error('Los campos de tipo lista deben tener al menos una opción');
      return;
    }

    onSave({
      ...formData,
      nombre: formData.nombre.toLowerCase().replace(/\s+/g, '_'),
      opciones: formData.tipo === 'select' ? formData.opciones : undefined
    });

    toast.success('Campo personalizado agregado exitosamente');
  };

  const agregarOpcion = () => {
    if (nuevaOpcion.trim()) {
      setFormData(prev => ({
        ...prev,
        opciones: [...prev.opciones, nuevaOpcion.trim()]
      }));
      setNuevaOpcion('');
    }
  };

  const removerOpcion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.filter((_, i) => i !== index)
    }));
  };

  const modalTitle = (
    <h2 className="text-sm font-semibold text-text-primary">
      {campo ? 'Editar Campo' : 'Agregar Campo Personalizado'}
    </h2>
  );

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
        onClick={handleSave}
      >
        {campo ? 'Actualizar Campo' : 'Agregar Campo'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={modalTitle}
      size="md"
      footer={modalFooter}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre">Nombre del Campo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="ej: anos_experiencia"
            />
            <p className="text-xs text-text-secondary mt-1">
              Solo letras, números y guiones bajos
            </p>
          </div>
          <div>
            <Label htmlFor="tipo">Tipo de Campo *</Label>
            <Select
              value={formData.tipo}
              onChange={(value) =>
                setFormData(prev => ({ ...prev, tipo: value as CampoFormulario['tipo'] }))
              }
              options={[
                { value: 'text', label: 'Texto' },
                { value: 'email', label: 'Email' },
                { value: 'tel', label: 'Teléfono' },
                { value: 'number', label: 'Número' },
                { value: 'textarea', label: 'Texto Largo' },
                { value: 'select', label: 'Lista de Opciones' },
                { value: 'url', label: 'URL' },
                { value: 'file', label: 'Archivo' },
                { value: 'checkbox', label: 'Casilla de Verificación' }
              ]}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="etiqueta">Etiqueta del Campo *</Label>
          <Input
            id="etiqueta"
            value={formData.etiqueta}
            onChange={(e) => setFormData(prev => ({ ...prev, etiqueta: e.target.value }))}
            placeholder="Ej: Años de Experiencia"
          />
        </div>

        <div>
          <Label htmlFor="placeholder">Placeholder (opcional)</Label>
          <Input
            id="placeholder"
            value={formData.placeholder}
            onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
            placeholder="Texto de ayuda..."
          />
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requerido"
                checked={formData.requerido}
                onCheckedChange={(checked: boolean) =>
                  setFormData(prev => ({ ...prev, requerido: checked }))
                }
              />
              <Label htmlFor="requerido">Campo requerido</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="habilitado"
                checked={formData.habilitado}
                onCheckedChange={(checked: boolean) =>
                  setFormData(prev => ({ ...prev, habilitado: checked }))
                }
              />
              <Label htmlFor="habilitado">Campo habilitado</Label>
            </div>
        </div>

        {/* Opciones para campos select */}
        {formData.tipo === 'select' && (
          <div>
            <Label className="text-xs font-medium text-text-primary">Opciones de la Lista</Label>
            <div className="space-y-2">
              {formData.opciones.map((opcion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={opcion} readOnly className="flex-1" />
                  <Button
                    variant="custom"
                    color="red"
                    size="xs"
                    icon={<X className="w-4 h-4" />}
                    onClick={() => removerOpcion(index)}
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  placeholder="Nueva opción..."
                  onKeyPress={(e) => e.key === 'Enter' && agregarOpcion()}
                />
                <Button
                  variant="custom"
                  color="primary"
                  size="xs"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={agregarOpcion}
                />
              </div>
            </div>
          </div>
        )}

        {/* Configuración para campos file */}
        {formData.tipo === 'file' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxFiles">Máximo de Archivos</Label>
                <Input
                  id="maxFiles"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.validaciones.maxFiles || 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    validaciones: {
                      ...prev.validaciones,
                      maxFiles: e.target.value ? Number(e.target.value) : 1
                    }
                  }))}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Número máximo de archivos (1-10)
                </p>
              </div>
              <div>
                <Label htmlFor="maxSize">Tamaño Máximo por Archivo (MB)</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Ej: 5"
                  value={formData.validaciones.maxSize ? Math.round(formData.validaciones.maxSize / (1024 * 1024)) : ''}
                  onChange={(e) => {
                    const mbValue = e.target.value ? Number(e.target.value) : 0;
                    const bytesValue = mbValue > 0 ? mbValue * 1024 * 1024 : undefined;
                    setFormData(prev => ({
                      ...prev,
                      validaciones: {
                        ...prev.validaciones,
                        maxSize: bytesValue
                      }
                    }));
                  }}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Mínimo 1MB, máximo 5MB
                </p>
              </div>
            </div>
            <div>
              <Label>Tipos de Archivo Permitidos</Label>
              <div className="text-sm text-text-primary mt-2 p-3 bg-card-bg rounded-lg border border-border-color">
                <p className="font-medium mb-2">Configurados automáticamente:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">PDF</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">DOC</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">DOCX</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Estos tipos están preconfigurados para seguridad
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validaciones para campos number */}
        {formData.tipo === 'number' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min">Valor Mínimo</Label>
              <Input
                id="min"
                type="number"
                value={formData.validaciones.min || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  validaciones: {
                    ...prev.validaciones,
                    min: e.target.value ? Number(e.target.value) : undefined
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="max">Valor Máximo</Label>
              <Input
                id="max"
                type="number"
                value={formData.validaciones.max || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  validaciones: {
                    ...prev.validaciones,
                    max: e.target.value ? Number(e.target.value) : undefined
                  }
                }))}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CampoPersonalizadoForm;