import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Award,
  Download,
  Eye
} from 'lucide-react';
import { FaRegFilePdf } from 'react-icons/fa';
import { BsFiletypeDocx } from "react-icons/bs";
import { Button } from '@/components/ui/button';
import { Candidato } from '@/hooks';
import { useTodasAplicacionesPorCandidato } from '@/hooks';
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types';
import CandidateModal from '@/app/(dashboard)/kanban/components/modals/candidato/CandidateModal';

interface CandidatoViewProps {
  isOpen: boolean;
  onClose: () => void;
  candidato: Candidato | null;
}

// Genera un color determinístico y estable a partir de un id (convocatoriaId)
// Devuelve un degradado con el color para el header del modal
function getConvocatoriaColor(id: string): string {
  let hash = 0

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  const hue = Math.abs(hash) % 360

  // Colores con saturación y lightness similares a los botones
  const saturation = 65 + (Math.abs(hash >> 3) % 20) // 65–84% (similar a 500)
  const lightness = 45 + (Math.abs(hash >> 6) % 25)  // 45–69% (similar a 500)

  const baseColor = `hsla(${hue}, ${saturation}%, ${lightness}%, `

  // Crear degradado con diferentes opacidades del mismo color
  return `linear-gradient(135deg, ${baseColor}0.075) 0%, ${baseColor}0.035) 50%, ${baseColor}0.075) 100%)`
}

const AplicacionesCandidato = ({ candidatoId, onApplicationClick }: { candidatoId: string, onApplicationClick?: (aplicacion: AplicacionCandidato) => void }) => {
  const { data: aplicaciones, isLoading, error } = useTodasAplicacionesPorCandidato(candidatoId)

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Cargando aplicaciones...</div>
  }

  if (error) {
    return <div className="text-xs text-red-500">Error al cargar aplicaciones</div>
  }

  if (!aplicaciones || aplicaciones.length === 0) {
    return <div className="text-xs text-muted-foreground">No hay aplicaciones registradas</div>
  }

  return (
    <div className="space-y-2">
      {aplicaciones.map((app) => (
        <div key={app.id} className="p-2 border border-border rounded text-xs flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium">{app.convocatoria?.cargoNombre}</div>
            <div className="text-muted-foreground">{app.convocatoria?.obraNombre}</div>
            <div className="flex justify-between mt-1">
              <span>Estado: {app.estadoKanban}</span>
              <span>{new Date(app.fechaAplicacion).toLocaleDateString()}</span>
            </div>
          </div>
          {onApplicationClick && (
            <button
              onClick={() => onApplicationClick(app)}
              className="ml-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Ver detalles de la aplicación"
            >
              <Eye className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function CandidatoView({ isOpen, onClose, candidato }: CandidatoViewProps) {
  if (!candidato) return null;

  const [showCVModal, setShowCVModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AplicacionCandidato | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const handleApplicationClick = (aplicacion: AplicacionCandidato) => {
    setSelectedApplication(aplicacion);
    setShowApplicationModal(true);
  };

  const handleApplicationModalClose = () => {
    setShowApplicationModal(false);
    setSelectedApplication(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPdf = candidato.curriculumUrl?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex  items-center w-full gap-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <span className="text-sm font-semibold text-text-primary">
                  {`${candidato.nombres} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`.trim()}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    DNI: {candidato.dni}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-0'>
              {candidato.curriculumUrl && (
                isPdf ? (
                  <Button
                    variant="subtle"
                    color="primary"
                    size="sm"
                    className="flex items-center gap-1 h-1"
                    onClick={() => setShowCVModal(true)}
                  >
                    <FaRegFilePdf className="h-4 w-4 text-red-600" />
                    <span className='text-[10px] font-bold leading-none text-red-600'>
                      CV
                    </span>
                  </Button>
                ) : (
                  <a
                    href={candidato.curriculumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title='Ver CV'
                  >
                    <Button
                      variant="subtle"
                      color="success"
                      size="sm"
                      className="flex items-center gap-1 h-auto p-1"
                    >
                      <BsFiletypeDocx className="h-4 w-4 text-blue-600" />
                      <span className='text-[10px] font-bold leading-none text-blue-600'>
                        CV
                      </span>
                    </Button>
                  </a>
                )
              )}
            </div>


          </div>
        }
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground bg-gray-100/60 dark:bg-[black]/10 hover:bg-accent border border-border rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        }
        size="lg"
      >
        <div className="space-y-4">
          {/* Información Personal */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs">Información Personal</h3>
            <div className="p-2 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 border border-border rounded">
                  <User className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Nombre Completo</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {`${candidato.nombres} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`.trim()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 border border-border rounded">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Correo</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {candidato.correo}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 border border-border rounded">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">Teléfono</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {candidato.telefono}
                    </div>
                  </div>
                </div>

                {candidato.lugarResidencia && (
                  <div className="flex items-center gap-2 p-2 border border-border rounded">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">Lugar de Residencia</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {candidato.lugarResidencia}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs">Estadísticas</h3>
            <div className="p-2 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Aplicaciones</label>
                  <div className="text-xs font-medium text-primary p-1 bg-gray-100/60 dark:bg-[black]/10 rounded">
                    {candidato.totalAplicaciones || 0}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Aplicaciones Ganadas</label>
                  <div className="text-xs font-medium text-primary p-1 bg-gray-100/60 dark:bg-[black]/10 rounded">
                    {candidato.aplicacionesGanadas || 0}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Fecha de Registro</label>
                  <div className="text-xs font-medium text-text-secondary p-1 bg-gray-100/60 dark:bg-[black]/10 rounded">
                    {formatShortDate(candidato.fechaRegistro?.toString()) || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aplicaciones del Candidato */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs">Aplicaciones del Candidato</h3>
            <div className="p-2 rounded-lg border border-border">
              <AplicacionesCandidato candidatoId={candidato.id} onApplicationClick={handleApplicationClick} />
            </div>
          </div>

        </div>
      </Modal>

      {/* Modal para ver CV */}
      <Modal
        isOpen={showCVModal}
        onClose={() => setShowCVModal(false)}
        title={
          <div className="flex justify-between items-center w-full">
            <span>Curriculum Vitae</span>
            <Button
              variant="subtle"
              color="success"
              size="icon"
            >
              <a
                href={candidato?.curriculumUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4" />
              </a>
            </Button>
          </div>
        }
        size="lg-tall"
        headerBackground="bg-gradient-to-r from-blue-600 to-purple-600"
      >
        <div className="w-full h-full">
          {candidato?.curriculumUrl ? (
            <iframe
              src={candidato.curriculumUrl}
              className="w-full h-[80vh] border-0 rounded-lg"
              title="Curriculum Vitae"
            />
          ) : (
            <div className="flex items-center justify-center h-[80vh]">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  No hay curriculum adjunto
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para ver detalles de la aplicación */}
      {selectedApplication && (
        <CandidateModal
          isOpen={showApplicationModal}
          onClose={handleApplicationModalClose}
          aplicacion={selectedApplication}
          headerBackground={getConvocatoriaColor(selectedApplication.convocatoriaId || '')}
          viewOnly={true}
        />
      )}
    </>
  );
}
