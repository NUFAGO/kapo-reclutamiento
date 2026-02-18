'use client'

import React, { useState } from 'react'
import { Modal, NotificationModal, Button, type CheckboxOption } from '@/components/ui'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { KANBAN_ESTADOS, type EstadoKanban, ESTADO_LABELS } from '@/app/(dashboard)/kanban/lib/kanban.constants'
import { RecepcionCVTab } from './tabs/RecepcionCVTab'
import { LlamadaTab } from './tabs/LlamadaTab'
import { PrimeraEntrevistaTab } from './tabs/PrimeraEntrevistaTab'
import { SegundoEntrevistaTab } from './tabs/SegundaEntrevistaTab'
import { ReferenciaTab } from './tabs/ReferenciaTab'
import { EvaluacionTab } from './tabs/EvaluacionTab'
import { User, FileText, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { useCambiarEstadoKanban } from '@/hooks'
import { showSuccess, showError, TOAST_DURATIONS } from '@/lib/toast-utils'
import { getTabColorStyles } from '@/app/(dashboard)/kanban/utils/colors'
import { useMutation } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { CREAR_COMUNICACION_ENTRADA_MUTATION } from '@/graphql/mutations'

interface CandidateModalProps {
    isOpen: boolean
    onClose: () => void
    aplicacion: AplicacionCandidato
    headerBackground?: string
}

// Configuración de tabs según el estado
const getTabsForEstado = (estado: EstadoKanban) => {
    const allTabs = [
        { id: 'recepcion', label: 'Recepción CV', icon: FileText, estados: [KANBAN_ESTADOS.CVS_RECIBIDOS] as EstadoKanban[] },
        { id: 'llamada', label: 'Llamada', icon: Phone, estados: [KANBAN_ESTADOS.POR_LLAMAR, KANBAN_ESTADOS.ENTREVISTA_PREVIA] as EstadoKanban[] },
        { id: 'entrevista1', label: '1ra Entrevista', icon: Calendar, estados: [KANBAN_ESTADOS.PROGRAMAR_1RA_ENTREVISTA] as EstadoKanban[] },
        { id: 'entrevista2', label: '2da Entrevista', icon: Calendar, estados: [KANBAN_ESTADOS.PROGRAMAR_2DA_ENTREVISTA] as EstadoKanban[] },
        { id: 'referencias', label: 'Referencias', icon: CheckCircle, estados: [KANBAN_ESTADOS.REFERENCIAS] as EstadoKanban[] },
        { id: 'documentos', label: 'Evaluación', icon: FileText, estados: [KANBAN_ESTADOS.EVALUACION_ANTISOBORNO] as EstadoKanban[] },
        { id: 'aprobacion', label: 'Aprobación', icon: CheckCircle, estados: [KANBAN_ESTADOS.APROBACION_GERENCIA] as EstadoKanban[] },
    ]

    // Filtrar tabs según el estado actual
    // Por ejemplo, si está en CVS_RECIBIDOS, solo muestra el primer tab
    // Si está en POR_LLAMAR, muestra recepcion + llamada, etc.

    const estadosArray = Object.values(KANBAN_ESTADOS)
    const estadoIndex = estadosArray.indexOf(estado)

    const filteredTabs = allTabs.filter(tab => {
        const tabMaxEstado = Math.max(...tab.estados.map(e => estadosArray.indexOf(e)))
        const shouldShow = tabMaxEstado <= estadoIndex || tab.estados.includes(estado);
        return shouldShow;
    });

    return filteredTabs;
}

// Función para determinar el tab inicial según el estado
const getInitialTab = (estado: EstadoKanban): string => {
    switch (estado) {
        case KANBAN_ESTADOS.POR_LLAMAR:
        case KANBAN_ESTADOS.ENTREVISTA_PREVIA:
            return 'llamada'
        case KANBAN_ESTADOS.PROGRAMAR_1RA_ENTREVISTA:
            return 'entrevista1'
        case KANBAN_ESTADOS.PROGRAMAR_2DA_ENTREVISTA:
            return 'entrevista2'
        case KANBAN_ESTADOS.REFERENCIAS:
            return 'referencias'
        case KANBAN_ESTADOS.EVALUACION_ANTISOBORNO:
            return 'documentos'
        case KANBAN_ESTADOS.APROBACION_GERENCIA:
            return 'aprobacion'
        default:
            return 'recepcion'
    }
}

// Función para extraer color sólido del degradado con 60% transparencia
const getSolidColorFromGradient = (gradient: string): string => {
    // El degradado tiene formato: linear-gradient(135deg, hsla(hue, sat%, light%, 0.13) 0%, ...)
    const hslMatch = gradient.match(/hsla\((\d+),\s*(\d+)%,\s*(\d+)%/);
    if (hslMatch) {
        const [, hue, saturation, lightness] = hslMatch;
        // Retorna el color con 60% transparencia (40% opacidad)
        return `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;
    }
    // Fallback si no puede parsear
    return 'var(--primary-color)';
};

export default function CandidateModal({ isOpen, onClose, aplicacion, headerBackground }: CandidateModalProps) {
    const [activeTab, setActiveTab] = useState(() => {
        const initialTab = getInitialTab(aplicacion.estadoKanban);
        return initialTab;
    })
    const [showRejectionModal, setShowRejectionModal] = useState(false)
    const [showFinalizadaModal, setShowFinalizadaModal] = useState(false)
    const [loadingFinalizada, setLoadingFinalizada] = useState(false)

    // Checkboxes for finalizada confirmation
    const [finalizadaCheckboxes, setFinalizadaCheckboxes] = useState<CheckboxOption[]>([
        { id: 'llamadaConfirmada', label: 'Llamada Confirmada', checked: false },
        { id: 'comunicacionConfirmada', label: 'Comunicación Confirmada', checked: false }
    ])

    // Extraer color sólido del degradado para usar en tabs
    const headerColor = headerBackground ? getSolidColorFromGradient(headerBackground) : 'var(--primary-color)';

    // Actualizar el tab activo cuando cambie la aplicación
    React.useEffect(() => {
        const newTab = getInitialTab(aplicacion.estadoKanban);
        setActiveTab(newTab);
    }, [aplicacion.id, aplicacion.estadoKanban])

    // Hook para cambiar estado kanban
    const { cambiarEstado, loading: loadingCambioEstado } = useCambiarEstadoKanban()

    // Hook para crear comunicación de entrada
    const crearComunicacionEntradaMutation = useMutation({
        mutationFn: async (input: { aplicacionCandidatoId: string; candidatoId: string; llamadaConfirmada: boolean; comunicacionConfirmada: boolean }) => {
            const response = await graphqlRequest<{
                crearComunicacionEntrada: {
                    id: string;
                    aplicacionCandidatoId: string;
                    candidatoId: string;
                    llamadaConfirmada: boolean;
                    comunicacionConfirmada: boolean;
                    created_at: string;
                    updated_at: string;
                }
            }>(CREAR_COMUNICACION_ENTRADA_MUTATION, { input })
            return response.crearComunicacionEntrada
        }
    })

    // Función para determinar el siguiente estado de aprobación según el estado actual
    const getSiguienteEstadoAprobacion = (estadoActual: EstadoKanban): EstadoKanban => {
        switch (estadoActual) {
            case KANBAN_ESTADOS.CVS_RECIBIDOS:
                return KANBAN_ESTADOS.POR_LLAMAR
            case KANBAN_ESTADOS.POR_LLAMAR:
                return KANBAN_ESTADOS.ENTREVISTA_PREVIA
            case KANBAN_ESTADOS.ENTREVISTA_PREVIA:
                return KANBAN_ESTADOS.PROGRAMAR_1RA_ENTREVISTA
            case KANBAN_ESTADOS.PROGRAMAR_1RA_ENTREVISTA:
                return KANBAN_ESTADOS.PROGRAMAR_2DA_ENTREVISTA
            case KANBAN_ESTADOS.PROGRAMAR_2DA_ENTREVISTA:
                return KANBAN_ESTADOS.REFERENCIAS
            case KANBAN_ESTADOS.REFERENCIAS:
                return KANBAN_ESTADOS.EVALUACION_ANTISOBORNO
            case KANBAN_ESTADOS.EVALUACION_ANTISOBORNO:
                return KANBAN_ESTADOS.APROBACION_GERENCIA
            case KANBAN_ESTADOS.APROBACION_GERENCIA:
                return KANBAN_ESTADOS.LLAMAR_COMUNICAR_ENTRADA
            case KANBAN_ESTADOS.LLAMAR_COMUNICAR_ENTRADA:
                return KANBAN_ESTADOS.FINALIZADA
            default:
                return estadoActual // No cambiar si no hay siguiente estado
        }
    }

    // Función para aprobar candidato (pasar al siguiente estado)
    const handleAprobar = async () => {
        const siguienteEstado = getSiguienteEstadoAprobacion(aplicacion.estadoKanban)

        // Si el siguiente estado es FINALIZADA, mostrar modal de confirmación
        if (siguienteEstado === KANBAN_ESTADOS.FINALIZADA) {
            setShowFinalizadaModal(true)
            return
        }

        const motivo = `Aprobación desde ${ESTADO_LABELS[aplicacion.estadoKanban]}`
        const comentarios = 'Candidato aprobado para continuar con el proceso'

        try {
            await cambiarEstado({
                id: aplicacion.id,
                estadoKanban: siguienteEstado,
                candidatoId: aplicacion.candidatoId,
                motivo,
                comentarios
            })
            showSuccess('Candidato aprobado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            onClose()
        } catch (error) {
            console.error('Error al aprobar candidato:', error)
            showError('Error al aprobar candidato. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    // Función para mostrar el modal de confirmación de rechazo
    const handleRechazar = () => {
        setShowRejectionModal(true)
    }

    // Función para confirmar el rechazo con comentario
    const handleConfirmRechazo = async (comentario?: string) => {
        if (!comentario) return;

        try {
            await cambiarEstado({
                id: aplicacion.id,
                estadoKanban: KANBAN_ESTADOS.DESCARTADO,
                candidatoId: aplicacion.candidatoId,
                motivo: 'Rechazo manual desde recepción de CV',
                comentarios: comentario
            })
            showSuccess('Candidato rechazado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            setShowRejectionModal(false)
            onClose()
        } catch (error) {
            console.error('Error al rechazar candidato:', error)
            showError('Error al rechazar candidato. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    // Función para cancelar el rechazo
    const handleCancelRechazo = () => {
        setShowRejectionModal(false)
    }

    // Función para confirmar la finalización con checkboxes
    const handleConfirmFinalizada = async (comment?: string, checkboxes?: CheckboxOption[]) => {
        if (!checkboxes || !checkboxes.every(cb => cb.checked)) {
            showError('Debes marcar ambas confirmaciones para finalizar.', { duration: TOAST_DURATIONS.NORMAL })
            return
        }

        setLoadingFinalizada(true)
        try {
            // Primero crear el registro de comunicación de entrada
            await crearComunicacionEntradaMutation.mutateAsync({
                aplicacionCandidatoId: aplicacion.id,
                candidatoId: aplicacion.candidatoId,
                llamadaConfirmada: true,
                comunicacionConfirmada: true
            })

            // Luego cambiar el estado a FINALIZADA
            const motivo = `Finalización desde ${ESTADO_LABELS[aplicacion.estadoKanban]}`
            const comentarios = 'Candidato finalizado con comunicación confirmada'

            await cambiarEstado({
                id: aplicacion.id,
                estadoKanban: KANBAN_ESTADOS.FINALIZADA,
                candidatoId: aplicacion.candidatoId,
                motivo,
                comentarios
            })

            showSuccess('Candidato finalizado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            setShowFinalizadaModal(false)
            onClose()
        } catch (error) {
            console.error('Error al finalizar candidato:', error)
            showError('Error al finalizar candidato. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        } finally {
            setLoadingFinalizada(false)
        }
    }

    // Función para cancelar la finalización
    const handleCancelFinalizada = () => {
        setShowFinalizadaModal(false)
    }

    const nombreCompleto = aplicacion.candidato
        ? `${aplicacion.candidato.nombres} ${aplicacion.candidato.apellidoPaterno} ${aplicacion.candidato.apellidoMaterno}`.trim()
        : 'Candidato'

    const tabs = getTabsForEstado(aplicacion.estadoKanban)

    // Renderizar contenido del tab activo
    const renderTabContent = () => {
        switch (activeTab) {
            case 'recepcion':
                return <RecepcionCVTab aplicacion={aplicacion} />
            case 'llamada':
                return <LlamadaTab aplicacion={aplicacion} />
            case 'entrevista1':
                return <PrimeraEntrevistaTab aplicacion={aplicacion} />
            case 'entrevista2':
                return <SegundoEntrevistaTab aplicacion={aplicacion} />
            case 'referencias':
                return <ReferenciaTab aplicacion={aplicacion} />
            case 'documentos':
                return <EvaluacionTab aplicacion={aplicacion} />
            case 'aprobacion':
                return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>Tab de Aprobación (próximamente)</div>
            default:
                return null
        }
    }

    const modalTitle = (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center">
                <User className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
            </div>
            <div className='flex justify-center items-center flex-col'>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-on-content-bg-heading)' }}>
                    {nombreCompleto}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {aplicacion.convocatoria?.cargoNombre || 'Sin cargo'}
                </p>
            </div>
        </div>
    )

    // Determinar textos de los botones según el estado actual
    const getTextoBotonAprobar = (estadoActual: EstadoKanban): string => {
        const siguienteEstado = getSiguienteEstadoAprobacion(estadoActual)
        if (siguienteEstado === estadoActual) {
            return 'Aprobar' // Fallback si no hay siguiente estado
        }
        return `Avanzar a ${ESTADO_LABELS[siguienteEstado]}`
    }

    const modalFooter = (
        <div className="flex items-center justify-between px-4">
            <div></div>
            <div className="flex gap-2">
                <Button
                    variant="custom"
                    color="danger"
                    size="xs"
                    icon={<XCircle className="w-4 h-4" />}
                    onClick={handleRechazar}
                    disabled={loadingCambioEstado}
                >
                    {loadingCambioEstado ? 'Procesando...' : 'Descartar'}
                </Button>
                <Button
                    variant="custom"
                    color="primary"
                    size="xs"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={handleAprobar}
                    disabled={loadingCambioEstado}
                >
                    {loadingCambioEstado ? 'Procesando...' : getTextoBotonAprobar(aplicacion.estadoKanban)}
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={modalTitle}
                size="lg-tall"
                footer={modalFooter}
                headerBackground={headerBackground}
            >
                {/* Tabs */}
                <div className="border-b mb-6 -mt-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="flex items-center gap-1.5 px-3 py-3 text-xs transition-colors border-b-2 hover:bg-gray-50/50"
                                    style={getTabColorStyles(aplicacion.convocatoriaId, isActive)}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Contenido del tab activo */}
                <div className="min-h-100">
                    {renderTabContent()}
                </div>
            </Modal>

            {/* Modal de confirmación de rechazo */}
            <NotificationModal
                isOpen={showRejectionModal}
                onClose={handleCancelRechazo}
                type="error"
                description="El candidato será movido a la columna de descartados."
                confirmText="Descartar Candidato"
                cancelText="Cancelar"
                onConfirm={handleConfirmRechazo}
                onCancel={handleCancelRechazo}
                showCommentInput={true}
                commentPlaceholder="Escribe el motivo del rechazo..."
            />

            {/* Modal de confirmación de finalización */}
            <NotificationModal
                isOpen={showFinalizadaModal}
                onClose={handleCancelFinalizada}
                type="warning"
                message="Confirmar Finalización"
                description="Para finalizar el proceso de selección, confirma que se realizó la comunicación de entrada."
                confirmText="Finalizar Candidato"
                cancelText="Cancelar"
                onConfirm={handleConfirmFinalizada}
                onCancel={handleCancelFinalizada}
                showCheckboxes={true}
                checkboxes={finalizadaCheckboxes}
                onCheckboxChange={setFinalizadaCheckboxes}
                loading={loadingFinalizada}
            />
        </>
    )
}