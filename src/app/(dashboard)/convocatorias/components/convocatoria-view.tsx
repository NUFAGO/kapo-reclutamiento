'use client';

import React from 'react';
import Modal from '@/components/ui/modal';
import {
  Calendar,
  MapPin,
  Building,
  Users,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  Briefcase,
  Clock,
  Target,
  User,
  GraduationCap,
  ListChecks,
  Plane,
  FileCheck,
  Building2
} from 'lucide-react';

interface ConvocatoriaViewProps {
  isOpen: boolean;
  onClose: () => void;
  convocatoria: any;
}

export default function ConvocatoriaView({ isOpen, onClose, convocatoria }: ConvocatoriaViewProps) {
  if (!convocatoria) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      'ACTIVA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'FINALIZADA': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'CANCELADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getPrioridadColor = (prioridad: number) => {
    if (prioridad <= 3) return 'text-red-600 dark:text-red-400';
    if (prioridad <= 7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const detalle = convocatoria.detalle_staff_snapshot || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <span className="text-sm font-semibold text-text-primary">
              {convocatoria.cargo_nombre || 'Convocatoria'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Código: {convocatoria.codigo_convocatoria}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${getEstadoColor(convocatoria.estado_convocatoria)}`}>
                {convocatoria.estado_convocatoria?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted hover:bg-accent border border-border rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
      size="lg"
    >
      <div className="space-y-4">
        {/* Información Principal */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs">Información Principal</h3>
          <div className="p-2 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 border border-border rounded">
                <Briefcase className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{convocatoria.cargo_nombre || "-"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {convocatoria.categoria_nombre || "-"} | {convocatoria.especialidad_nombre || "-"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 border border-border rounded">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Ubicación</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {convocatoria.empresa_nombre || "-"} | {convocatoria.obra_nombre || "-"}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 border border-border rounded">
                <Users className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">Vacantes y Prioridad</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {convocatoria.vacantes || 0} vacantes | Nivel {convocatoria.prioridad || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Datos de la Convocatoria */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs">Datos de la Convocatoria</h3>
          <div className="p-2 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Código</label>
                <div className="text-xs font-medium text-primary p-1 bg-muted rounded">
                  {convocatoria.codigo_convocatoria || "-"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Tipo</label>
                <div className="text-xs font-medium text-primary p-1 bg-gray-200 rounded">
                  {convocatoria.tipo_requerimiento || "-"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Estado</label>
                <div className={`text-xs font-medium p-1 rounded ${getEstadoColor(convocatoria.estado_convocatoria)}`}>
                  {convocatoria.estado_convocatoria?.replace('_', ' ') || "-"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Publicado</label>
                <div className="text-xs font-medium text-text-secondary p-1 bg-[var(--muted)] rounded">
                  {convocatoria.fecha_creacion ? formatShortDate(convocatoria.fecha_creacion) : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la Solicitud */}
        {detalle && Object.keys(detalle).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-xs">Detalles de la Solicitud</h3>
            <div className="p-2 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {detalle.fecha_contratacion_deseada && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Fecha Deseada</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded">
                      {formatShortDate(detalle.fecha_contratacion_deseada)}
                    </div>
                  </div>
                )}
                
                {detalle.area_solicitante_nombre && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Área Solicitante</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded">
                      {detalle.area_solicitante_nombre}
                    </div>
                  </div>
                )}
                
                {detalle.jefe_inmediato_nombre && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Jefe Inmediato</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded">
                      {detalle.jefe_inmediato_nombre}
                    </div>
                  </div>
                )}
                
                {detalle.encargado_induccion_nombre && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Encargado Inducción</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded">
                      {detalle.encargado_induccion_nombre}
                    </div>
                  </div>
                )}
                
                {detalle.tipo_para_cubrir && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tipo para Cubrir</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded capitalize">
                      {detalle.tipo_para_cubrir.replace('_', ' ')}
                    </div>
                  </div>
                )}
                
                {detalle.horario_tiempo && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Horario</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded capitalize">
                      {detalle.horario_tiempo}
                    </div>
                  </div>
                )}
                
                {detalle.equipo_asignado && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Equipo Asignado</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded capitalize">
                      {detalle.equipo_asignado}
                    </div>
                  </div>
                )}
                
                {detalle.lugar_trabajo && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Lugar de Trabajo</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded capitalize">
                      {detalle.lugar_trabajo}
                    </div>
                  </div>
                )}
                
                {typeof detalle.disponibilidad_viajar === 'boolean' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Disponibilidad para Viajar</label>
                    <div className="text-xs text-muted-foreground p-1 bg-muted rounded">
                      {detalle.disponibilidad_viajar ? 'Sí' : 'No'}
                    </div>
                  </div>
                )}
              </div>

              {/* Formación Académica */}
              {detalle.formacion_academica && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <label className="text-xs font-semibold">Formación Requerida</label>
                  </div>
                  <div className="space-y-1">
                    {detalle.formacion_academica.universitario?.length > 0 && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        <span className="font-medium">Universitario:</span> {detalle.formacion_academica.universitario.join(', ')}
                      </div>
                    )}
                    {detalle.formacion_academica.tecnico?.length > 0 && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        <span className="font-medium">Técnico:</span> {detalle.formacion_academica.tecnico.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Campos de texto largo */}
              {detalle.experiencia_laboral_requerida && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <label className="text-xs font-semibold">Experiencia Requerida</label>
                  </div>
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded whitespace-pre-line">
                    {detalle.experiencia_laboral_requerida}
                  </div>
                </div>
              )}

              {detalle.motivo_solicitud && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <label className="text-xs font-semibold">Motivo de la Solicitud</label>
                  </div>
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded whitespace-pre-line">
                    {detalle.motivo_solicitud}
                  </div>
                </div>
              )}

              {detalle.requisitos_minimos && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    <label className="text-xs font-semibold">Requisitos Mínimos</label>
                  </div>
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded whitespace-pre-line">
                    {detalle.requisitos_minimos}
                  </div>
                </div>
              )}

              {detalle.funciones_principales && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <label className="text-xs font-semibold">Funciones Principales</label>
                  </div>
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded whitespace-pre-line">
                    {detalle.funciones_principales}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de Postulación */}
        {convocatoria.link_formulario && (
          <div className="space-y-2">
            <h3 className="font-bold text-xs">Postulación</h3>
            <div className="p-3 rounded-lg border border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Para postularte a esta convocatoria, completa el formulario en el siguiente enlace:
                </p>
                <a
                  href={convocatoria.link_formulario}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors text-xs font-semibold"
                >
                  <LinkIcon className="w-4 h-4" />
                  Ir al Formulario de Postulación
                </a>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </Modal>
  );
}
