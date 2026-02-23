'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font
} from '@react-pdf/renderer';

interface ConvocatoriaPdfProps {
  isOpen: boolean;
  onClose: () => void;
  convocatoria: any;
}

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30, // Márgenes más amplios para documento formal
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 6,
  },
  title: {
    fontSize: 12, // Reduced from 14
    fontWeight: 'semibold',
    color: '#1f2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10, // Reduced from 12
    color: '#6b7280',
    marginBottom: 6,
  },
  status: {
    fontSize: 9, // Reduced from 10
    color: '#065f46',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 10, // Reduced from 12
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 10, // Reduced from 12
    color: '#6b7280',
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10, // Reduced from 12
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '32%',
    marginBottom: 8,
  },
  infoField: {
    backgroundColor: '#f9fafb',
    padding: 4,
    borderRadius: 3,
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 10, // Reduced from 12
    color: '#6b7280',
    fontWeight: 'semibold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10, // Reduced from 12
    color: '#1f2937',
    fontWeight: 'medium',
  },
  infoValueContainer: {
    backgroundColor: '#f9fafb',
    padding: 4,
    borderRadius: 3,
    marginBottom: 2,
  },
  detailsSection: {
    marginTop: 6,
  },
  detailsTitle: {
    fontSize: 10, // Reduced from 12
    fontWeight: 'semibold',
    color: '#1f2937',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsContent: {
    fontSize: 10, // Reduced from 12
    color: '#374151',
    lineHeight: 1.3,
  },
  detailsContentContainer: {
    backgroundColor: '#f9fafb',
    padding: 4,
    borderRadius: 3,
    marginBottom: 2,
  },
});

// Componente PDF
const ConvocatoriaPDFDocument = ({ convocatoria }: { convocatoria: any }) => {
  if (!convocatoria) return null;

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const detalle = convocatoria.detalle_staff_snapshot || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {convocatoria.cargo_nombre || 'Convocatoria'}
          </Text>
          <Text style={styles.subtitle}>
            Código: {convocatoria.codigo_convocatoria}
          </Text>
          <Text style={styles.status}>
            {convocatoria.estado_convocatoria?.replace('_', ' ')}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{convocatoria.vacantes}</Text>
            <Text style={styles.statLabel}>Vacantes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Nivel {convocatoria.prioridad}</Text>
            <Text style={styles.statLabel}>Prioridad</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatShortDate(convocatoria.fecha_creacion)}
            </Text>
            <Text style={styles.statLabel}>Publicado</Text>
          </View>
        </View>

        {/* Información Principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Principal</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '48%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Cargo</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>{convocatoria.cargo_nombre || "-"}</Text>
              </View>
            </View>
            <View style={{ width: '48%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Categoría | Especialidad</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>
                  {convocatoria.categoria_nombre || "-"} | {convocatoria.especialidad_nombre || "-"}
                </Text>
              </View>
            </View>
            <View style={{ width: '48%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Ubicación</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>
                  {convocatoria.empresa_nombre || "-"} | {convocatoria.obra_nombre || "-"}
                </Text>
              </View>
            </View>
            <View style={{ width: '48%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Vacantes y Prioridad</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>
                  {convocatoria.vacantes || 0} vacantes | Nivel {convocatoria.prioridad || "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Datos de la Convocatoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la Convocatoria</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '23%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Código</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>{convocatoria.codigo_convocatoria || "-"}</Text>
              </View>
            </View>
            <View style={{ width: '23%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>{convocatoria.tipo_requerimiento || "-"}</Text>
              </View>
            </View>
            <View style={{ width: '23%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Estado</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>{convocatoria.estado_convocatoria?.replace('_', ' ') || "-"}</Text>
              </View>
            </View>
            <View style={{ width: '23%', marginBottom: 8 }}>
              <Text style={styles.infoLabel}>Publicado</Text>
              <View style={styles.infoField}>
                <Text style={styles.infoValue}>
                  {convocatoria.fecha_creacion ? formatShortDate(convocatoria.fecha_creacion) : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Detalles de la Solicitud */}
        {detalle && Object.keys(detalle).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles de la Solicitud</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {detalle.fecha_contratacion_deseada && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Fecha Deseada</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>
                      {formatShortDate(detalle.fecha_contratacion_deseada)}
                    </Text>
                  </View>
                </View>
              )}

              {detalle.area_solicitante_nombre && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Área Solicitante</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.area_solicitante_nombre}</Text>
                  </View>
                </View>
              )}

              {detalle.jefe_inmediato_nombre && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Jefe Inmediato</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.jefe_inmediato_nombre}</Text>
                  </View>
                </View>
              )}

              {detalle.encargado_induccion_nombre && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Encargado Inducción</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.encargado_induccion_nombre}</Text>
                  </View>
                </View>
              )}

              {detalle.tipo_para_cubrir && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Tipo para Cubrir</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.tipo_para_cubrir.replace('_', ' ')}</Text>
                  </View>
                </View>
              )}

              {detalle.horario_tiempo && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Horario</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.horario_tiempo}</Text>
                  </View>
                </View>
              )}

              {detalle.equipo_asignado && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Equipo Asignado</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.equipo_asignado}</Text>
                  </View>
                </View>
              )}

              {detalle.lugar_trabajo && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Lugar de Trabajo</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>{detalle.lugar_trabajo}</Text>
                  </View>
                </View>
              )}

              {typeof detalle.disponibilidad_viajar === 'boolean' && (
                <View style={{ width: '25%', marginBottom: 16 }}>
                  <Text style={styles.infoLabel}>Disponibilidad para Viajar</Text>
                  <View style={styles.infoField}>
                    <Text style={styles.infoValue}>
                      {detalle.disponibilidad_viajar ? 'Sí' : 'No'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Formación Académica */}
            {detalle.formacion_academica && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8 }}>
                <Text style={styles.detailsTitle}>Formación Requerida</Text>
                <View style={styles.detailsContentContainer}>
                  {detalle.formacion_academica.universitario?.length > 0 && (
                    <Text style={styles.detailsContent}>
                      Universitario: {detalle.formacion_academica.universitario.join(', ')}
                    </Text>
                  )}
                  {detalle.formacion_academica.tecnico?.length > 0 && (
                    <Text style={styles.detailsContent}>
                      Técnico: {detalle.formacion_academica.tecnico.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Experiencia Laboral Requerida */}
            {detalle.experiencia_laboral_requerida && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8 }}>
                <Text style={styles.detailsTitle}>Experiencia Requerida</Text>
                <View style={styles.detailsContentContainer}><Text style={styles.detailsContent}>
                  {detalle.experiencia_laboral_requerida}
                </Text></View>
              </View>
            )}

            {/* Motivo de la Solicitud */}
            {detalle.motivo_solicitud && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8 }}>
                <Text style={styles.detailsTitle}>Motivo de la Solicitud</Text>
                <View style={styles.detailsContentContainer}><Text style={styles.detailsContent}>
                  {detalle.motivo_solicitud}
                </Text></View>
              </View>
            )}

            {/* Requisitos Mínimos */}
            {detalle.requisitos_minimos && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8 }}>
                <Text style={styles.detailsTitle}>Requisitos Mínimos</Text>
                <View style={styles.detailsContentContainer}><Text style={styles.detailsContent}>
                  {detalle.requisitos_minimos}
                </Text></View>
              </View>
            )}

            {/* Funciones Principales */}
            {detalle.funciones_principales && (
              <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#d1d5db', paddingTop: 8 }}>
                <Text style={styles.detailsTitle}>Funciones Principales</Text>
                <View style={styles.detailsContentContainer}><Text style={styles.detailsContent}>
                  {detalle.funciones_principales}
                </Text></View>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default function ConvocatoriaPdf({ isOpen, onClose, convocatoria }: ConvocatoriaPdfProps) {
  if (!convocatoria) return null;

  const getEstadoColor = (estado: string) => {
    const colors = {
      'ACTIVA': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'FINALIZADA': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'CANCELADA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <span className="text-sm font-semibold text-text-primary">
              {convocatoria.cargo_nombre || 'Convocatoria'} - PDF
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
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground bg-gray-100/60 dark:bg-[black]/10 hover:bg-accent border border-border rounded transition-colors"
          >
            Cerrar
          </button>
          <PDFDownloadLink
            document={<ConvocatoriaPDFDocument convocatoria={convocatoria} />}
            fileName={`${convocatoria.cargo_nombre || 'Convocatoria'}.pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-semibold"
          >
            {({ loading }) => (
              <>
                <Download className="h-4 w-4" />
                {loading ? 'Generando...' : 'Descargar PDF'}
              </>
            )}
          </PDFDownloadLink>
        </div>
      }
    >
      <div className="h-[70vh] w-full">
        <PDFDownloadLink
          document={<ConvocatoriaPDFDocument convocatoria={convocatoria} />}
          fileName={`${convocatoria.cargo_nombre || 'Convocatoria'}.pdf`}
        >
          {({ blob, url, loading, error }) => {
            if (loading) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-sm text-text-secondary">Generando PDF...</p>
                  </div>
                </div>
              );
            }

            if (error) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-sm text-red-500">Error al generar el PDF</p>
                  </div>
                </div>
              );
            }

            return url ? (
              <iframe
                src={url}
                className="w-full h-full border-0 rounded-lg"
                title={`PDF - ${convocatoria.cargo_nombre || 'Convocatoria'}`}
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-text-secondary mx-auto mb-4" />
                  <p className="text-sm text-text-secondary">Cargando PDF...</p>
                </div>
              </div>
            );
          }}
        </PDFDownloadLink>
      </div>
    </Modal>
  );
}