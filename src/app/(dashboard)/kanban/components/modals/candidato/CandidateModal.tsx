import React, { useState } from 'react'
import { Modal, NotificationModal, Button, type CheckboxOption } from '@/components/ui'
import { SelectSearch } from '@/components/ui/select-search'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { KANBAN_ESTADOS, type EstadoKanban, ESTADO_LABELS } from '@/app/(dashboard)/kanban/lib/kanban.constants'

// Estados archivados que necesitan consultar el historial para determinar el estado efectivo
const ESTADOS_ARCHIVADOS = [
    KANBAN_ESTADOS.RECHAZADO_POR_CANDIDATO,
    KANBAN_ESTADOS.DESCARTADO,
    KANBAN_ESTADOS.POSIBLES_CANDIDATOS
] as const

// Función helper para verificar si un estado está archivado
const esEstadoArchivado = (estado: EstadoKanban): boolean => {
    return ESTADOS_ARCHIVADOS.includes(estado as any)
}
import { RecepcionCVTab } from './tabs/RecepcionCVTab'
import { LlamadaTab } from './tabs/LlamadaTab'
import { PrimeraEntrevistaTab } from './tabs/PrimeraEntrevistaTab'
import { SegundoEntrevistaTab } from './tabs/SegundaEntrevistaTab'
import { ReferenciaTab } from './tabs/ReferenciaTab'
import { EvaluacionTab } from './tabs/EvaluacionTab'
import { User, FileText, Phone, Calendar, CheckCircle, XCircle, History, Check, X } from 'lucide-react'
import { CgArrowsExchange } from "react-icons/cg";
import { useConvocatorias, useCambiarEstadoKanban, useReactivarAplicacion } from '@/hooks'
import { showSuccess, showError, showWarning, TOAST_DURATIONS } from '@/lib/toast-utils'
import { getTabColorStyles } from '@/app/(dashboard)/kanban/utils/colors'
import { useMutation } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/graphql-client'
import { CREAR_COMUNICACION_ENTRADA_MUTATION, ACTUALIZAR_APLICACION_MUTATION } from '@/graphql/mutations'
import { OBTENER_HISTORIAL_APLICACION_QUERY, OBTENER_ULTIMO_HISTORIAL_POR_APLICACION_QUERY } from '@/graphql/queries'
import HistorialAplicacionModal from './HistorialAplicacionModal'
import { useQueryClient } from '@tanstack/react-query'

interface CandidateModalProps {
    isOpen: boolean
    onClose: () => void
    aplicacion: AplicacionCandidato
    headerBackground?: string
    onAplicacionStateChanged?: (aplicacionId: string, newEstado: EstadoKanban) => void
    viewOnly?: boolean
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

export default function CandidateModal({ isOpen, onClose, aplicacion, headerBackground, onAplicacionStateChanged, viewOnly = false }: CandidateModalProps) {
    const [activeTab, setActiveTab] = useState(() => {
        const initialTab = getInitialTab(aplicacion.estadoKanban);
        return initialTab;
    })
    const [showRejectionModal, setShowRejectionModal] = useState(false)
    const [showFinalizadaModal, setShowFinalizadaModal] = useState(false)
    const [loadingFinalizada, setLoadingFinalizada] = useState(false)
    const [tabValidations, setTabValidations] = useState<Record<string, boolean>>({})
    const [showHistorialModal, setShowHistorialModal] = useState(false)
    const [showExchangeButtons, setShowExchangeButtons] = useState(false)
    const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<string>('')

    // State for effective state (for discarded applications, use previous state)
    const [effectiveState, setEffectiveState] = useState(aplicacion.estadoKanban)
    const [loadingEffectiveState, setLoadingEffectiveState] = useState(false)

    // Checkboxes for finalizada confirmation
    const [finalizadaCheckboxes, setFinalizadaCheckboxes] = useState<CheckboxOption[]>([
        { id: 'llamadaConfirmada', label: 'Llamada Confirmada', checked: false },
        { id: 'comunicacionConfirmada', label: 'Comunicación Confirmada', checked: false }
    ])

    // Extraer color sólido del degradado para usar en tabs
    const headerColor = headerBackground ? getSolidColorFromGradient(headerBackground) : 'var(--primary-color)';

    // Hook para invalidar queries
    const queryClient = useQueryClient()

    // Actualizar el tab activo cuando cambie la aplicación
    React.useEffect(() => {
        const newTab = getInitialTab(effectiveState);
        setActiveTab(newTab);
        setTabValidations({});
        // Resetear estado de cambio de convocatoria cuando cambie la aplicación
        setShowExchangeButtons(false);
        setSelectedConvocatoriaId('');
    }, [aplicacion.id, aplicacion.estadoKanban, effectiveState])

    // Fetch effective state for archived applications
    React.useEffect(() => {
        if (esEstadoArchivado(aplicacion.estadoKanban) && aplicacion.candidato) {
            setLoadingEffectiveState(true)
            graphqlRequest<{ obtenerUltimoHistorialPorAplicacion: any }>(OBTENER_ULTIMO_HISTORIAL_POR_APLICACION_QUERY, { aplicacionId: aplicacion.id })
                .then(response => {
                    const historial = response.obtenerUltimoHistorialPorAplicacion
                    if (historial) {
                        setEffectiveState(historial.estadoAnterior)
                    } else {
                        setEffectiveState(aplicacion.estadoKanban)
                    }
                })
                .catch(error => {
                    console.error('Error fetching historial:', error)
                    setEffectiveState(aplicacion.estadoKanban)
                })
                .finally(() => {
                    setLoadingEffectiveState(false)
                })
        } else {
            setEffectiveState(aplicacion.estadoKanban)
            setLoadingEffectiveState(false)
        }
    }, [aplicacion.id, aplicacion.estadoKanban])

    // Resetear estado cuando se abre/cierra el modal
    React.useEffect(() => {
        if (!isOpen) {
            // Cuando el modal se cierra, resetear todos los estados
            setShowExchangeButtons(false);
            setSelectedConvocatoriaId('');
            setShowRejectionModal(false);
            setShowFinalizadaModal(false);
            setShowHistorialModal(false);
            setLoadingFinalizada(false);
            setLoadingEffectiveState(false);
            setTabValidations({});
            setFinalizadaCheckboxes([
                { id: 'llamadaConfirmada', label: 'Llamada Confirmada', checked: false },
                { id: 'comunicacionConfirmada', label: 'Comunicación Confirmada', checked: false }
            ]);
        }
    }, [isOpen])

    // Hook para cambiar estado kanban
    const { cambiarEstado, loading: loadingCambioEstado } = useCambiarEstadoKanban()

    // Hook para reactivar aplicación
    const { reactivarAplicacion, loading: loadingReactivacion } = useReactivarAplicacion()

    // Hook para obtener convocatorias disponibles
    const { convocatorias, loading: loadingConvocatorias } = useConvocatorias({ limit: 100 })

    // Hook para actualizar aplicación (cambiar convocatoria)
    const actualizarAplicacionMutation = useMutation({
        mutationFn: async (input: { convocatoriaId: string }) => {
            const response = await graphqlRequest<{
                actualizarAplicacion: AplicacionCandidato
            }>(ACTUALIZAR_APLICACION_MUTATION, {
                id: aplicacion.id,
                input: {
                    convocatoriaId: input.convocatoriaId
                }
            })
            return response.actualizarAplicacion
        },
        onSuccess: () => {
            // Invalidar cache de kanban-data para refrescar el kanban
            queryClient.invalidateQueries({ queryKey: ['kanban-data'] })
        }
    })

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

    // Función para obtener el tab id correspondiente a un estado
    const getTabIdForEstado = (estado: EstadoKanban): string | null => {
        switch (estado) {
            case KANBAN_ESTADOS.CVS_RECIBIDOS:
                return 'recepcion'
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
                return null
        }
    }

    // Función para aprobar candidato (pasar al siguiente estado)
    const handleAprobar = async () => {
        // Check if the current state's tab data is filled
        const tabId = getTabIdForEstado(aplicacion.estadoKanban)
        if (tabId && tabValidations[tabId] === false) {
            showWarning('Completa los datos requeridos antes de continuar', { duration: TOAST_DURATIONS.NORMAL })
            return
        }

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
                comentarios,
                estadoAnterior: aplicacion.estadoKanban
            })
            showSuccess('Candidato aprobado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            onClose()
            if (onAplicacionStateChanged) {
                setTimeout(() => {
                    onAplicacionStateChanged(aplicacion.id, siguienteEstado)
                }, 300)
            } else {
                console.log('CandidateModal: onAplicacionStateChanged is not defined')
            }
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
                comentarios: comentario,
                estadoAnterior: aplicacion.estadoKanban
            })
            showSuccess('Candidato rechazado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            setShowRejectionModal(false)
            onClose()
            if (onAplicacionStateChanged) {
                setTimeout(() => onAplicacionStateChanged(aplicacion.id, KANBAN_ESTADOS.DESCARTADO), 300)
            }
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
                comentarios,
                estadoAnterior: aplicacion.estadoKanban
            })

            showSuccess('Candidato finalizado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            setShowFinalizadaModal(false)
            onClose()
            if (onAplicacionStateChanged) {
                setTimeout(() => onAplicacionStateChanged(aplicacion.id, KANBAN_ESTADOS.FINALIZADA), 300)
            }
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

    // Función para mostrar/ocultar botones de cambio de convocatoria
    const handleToggleExchangeButtons = () => {
        setShowExchangeButtons(!showExchangeButtons)
    }

    // Función para confirmar cambio de convocatoria
    const handleConfirmExchange = async () => {
        if (!selectedConvocatoriaId) {
            showError('Selecciona una convocatoria primero', { duration: TOAST_DURATIONS.NORMAL })
            return
        }

        if (selectedConvocatoriaId === aplicacion.convocatoriaId) {
            showWarning('La convocatoria seleccionada es la misma que la actual', { duration: TOAST_DURATIONS.NORMAL })
            setShowExchangeButtons(false)
            return
        }

        try {
            const result = await actualizarAplicacionMutation.mutateAsync({
                convocatoriaId: selectedConvocatoriaId
            })

            showSuccess('Convocatoria actualizada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            setShowExchangeButtons(false)
            setSelectedConvocatoriaId('')

            // Esperar un poco para que la invalidación de cache se complete antes de cerrar
            setTimeout(() => {
                onClose()
                if (onAplicacionStateChanged) {
                    onAplicacionStateChanged(aplicacion.id, aplicacion.estadoKanban)
                }
            }, 500)
        } catch (error) {
            console.error('Error al cambiar convocatoria:', error)
            showError('Error al cambiar convocatoria. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    // Función para cancelar cambio de convocatoria
    const handleCancelExchange = () => {
        setShowExchangeButtons(false)
    }

    // Función para reactivar aplicación desde estado archivado
    const handleReactivar = async () => {
        const motivo = `Reactivación desde ${ESTADO_LABELS[aplicacion.estadoKanban]}`
        const comentarios = 'Candidato reactivado para continuar con el proceso de selección'

        try {
            const result = await reactivarAplicacion({
                id: aplicacion.id,
                motivo,
                comentarios
            })
            showSuccess('Candidato reactivado correctamente', { duration: TOAST_DURATIONS.NORMAL })
            onClose()
            // Usar el estado retornado por la mutación (determinado por el historial)
            if (onAplicacionStateChanged) {
                setTimeout(() => onAplicacionStateChanged(aplicacion.id, result.estadoKanban), 300)
            }
        } catch (error) {
            console.error('Error al reactivar candidato:', error)
            showError('Error al reactivar candidato. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    const nombreCompleto = aplicacion.candidato
        ? `${aplicacion.candidato.nombres} ${aplicacion.candidato.apellidoPaterno} ${aplicacion.candidato.apellidoMaterno}`.trim()
        : 'Candidato'

    const tabs = loadingEffectiveState ? [] : getTabsForEstado(effectiveState)

    // Renderizar contenido del tab activo
    const renderTabContent = () => {
        const validationCallback = (isValid: boolean) => {
            setTabValidations(prev => ({ ...prev, [activeTab]: isValid }))
        }

        const tabViewOnly = viewOnly || isArchived

        switch (activeTab) {
            case 'recepcion':
                return <RecepcionCVTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'llamada':
                return <LlamadaTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'entrevista1':
                return <PrimeraEntrevistaTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'entrevista2':
                return <SegundoEntrevistaTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'referencias':
                return <ReferenciaTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'documentos':
                return <EvaluacionTab aplicacion={aplicacion} onValidationChange={validationCallback} viewOnly={tabViewOnly} />
            case 'aprobacion':
                return <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>Tab de Aprobación (próximamente)</div>
            default:
                return null
        }
    }

    const modalTitle = (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center">
                    <User className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                </div>
                <div className='flex items-start flex-col'>
                    <h2 className="text-sm font-bold text-left w-full">
                        {nombreCompleto}
                    </h2>

                    <div className='flex items-center gap-1'>
                        {!showExchangeButtons || viewOnly ? (
                            <p className="text-xs text-left w-full" style={{ color: 'var(--text-secondary)' }}>
                                {aplicacion.convocatoria?.cargoNombre || 'Sin cargo'} {aplicacion.convocatoria?.especialidad_nombre ? `(${aplicacion.convocatoria.especialidad_nombre})` : ''}
                            </p>
                        ) : (
                            <div className="w-48">
                                <SelectSearch
                                    value={selectedConvocatoriaId}
                                    onChange={(value) => setSelectedConvocatoriaId(value || '')}
                                    placeholder="Seleccionar..."
                                    disabled={loadingConvocatorias}
                                    isLoading={loadingConvocatorias}
                                    showSearchIcon={true}
                                    options={[
                                        ...convocatorias.map((convocatoria) => ({
                                            value: convocatoria.id,
                                            label: `${convocatoria.cargo_nombre || 'Sin cargo'} ${convocatoria.especialidad_nombre ? `(${convocatoria.especialidad_nombre})` : ''} - ${convocatoria.prioridad}`.trim()
                                        }))
                                    ]}
                                />
                            </div>
                        )}
                        {!viewOnly && !showExchangeButtons ? (
                            <button 
                                className='rounded-[5px] bg-gray-300/20 dark:bg-gray-100/10 hover:bg-gray-50/30 dark:hover:bg-gray-300/20'
                                onClick={handleToggleExchangeButtons}
                                title="Cambiar convocatoria"
                            >
                                <CgArrowsExchange className="size-5" />
                            </button>
                        ) : !viewOnly && showExchangeButtons ? (
                            <div className="flex items-center gap-1">
                                <button 
                                    className='rounded-[5px] bg-green-500/20 hover:bg-green-600/40 text-green-600'
                                    onClick={handleConfirmExchange}
                                    title="Confirmar cambio"
                                >
                                    <Check className="size-4" />
                                </button>
                                <button 
                                    className='rounded-[5px] bg-red-500/20 hover:bg-red-600/40 text-red-600'
                                    onClick={handleCancelExchange}
                                    title="Cancelar cambio"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

                <button
                    className=' p-1.5 rounded-full mr-3 bg-gray-300/50 dark:bg-gray-100/10 hover:bg-gray-50/30 dark:hover:bg-gray-300/20'
                    onClick={() => setShowHistorialModal(true)}
                    title="Ver historial de cambios"
                >
                    <History className='size-4' />
                </button>

        </div>
    )

    // Determinar textos de los botones según el estado actual
    const getTextoBotonAprobar = (estadoActual: EstadoKanban): string => {
        const siguienteEstado = getSiguienteEstadoAprobacion(estadoActual)
        if (siguienteEstado === estadoActual) {
            return 'Aprobar' // Fallback si no hay siguiente estado
        }
        return `Avanzar`
    }

    // Determinar si mostrar botón de reactivación (todos los estados archivados)
    const mostrarBotonReactivar = aplicacion.estadoKanban === KANBAN_ESTADOS.RECHAZADO_POR_CANDIDATO ||
        aplicacion.estadoKanban === KANBAN_ESTADOS.DESCARTADO ||
        aplicacion.estadoKanban === KANBAN_ESTADOS.POSIBLES_CANDIDATOS

    const isArchived = mostrarBotonReactivar

    const modalFooter = (
        <div className="flex items-center justify-between px-4">
            <div></div>
            <div className="flex gap-2">
                {aplicacion.estadoKanban !== KANBAN_ESTADOS.DESCARTADO && (
                    <Button
                        variant="custom"
                        color="danger"
                        size="xs"
                        icon={<XCircle className="w-4 h-4" />}
                        onClick={handleRechazar}
                        disabled={loadingCambioEstado || loadingReactivacion}
                    >
                        {loadingCambioEstado || loadingReactivacion ? 'Procesando...' : 'Descartar'}
                    </Button>
                )}
                {mostrarBotonReactivar ? (
                    <Button
                        variant="custom"
                        color="success"
                        size="xs"
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={handleReactivar}
                        disabled={loadingCambioEstado || loadingReactivacion}
                    >
                        {loadingReactivacion ? 'Reactivando...' : 'Reactivar'}
                    </Button>
                ) : (
                    <Button
                        variant="custom"
                        color="primary"
                        size="xs"
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={handleAprobar}
                        disabled={loadingCambioEstado || loadingReactivacion}
                    >
                        {loadingCambioEstado ? 'Procesando...' : getTextoBotonAprobar(aplicacion.estadoKanban)}
                    </Button>
                )}
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
                footer={(viewOnly && !isArchived) ? undefined : modalFooter}
                headerBackground={headerBackground}
            >
                {/* Tabs */}
                <div className="border-b mb-6 -mt-4" style={{ borderColor: 'var(--border-color)' }}>
                    {loadingEffectiveState ? (
                        <div className="flex gap-1 overflow-x-auto">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-3 text-xs border-b-2 animate-pulse">
                                    <div className="w-3.5 h-3.5 bg-gray-300 rounded"></div>
                                    <div className="h-3 w-16 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
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
                    )}
                </div>

                {/* Contenido del tab activo */}
                <div className="min-h-100">
                    {loadingEffectiveState ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-pulse text-center">
                                <div className="h-4 w-32 bg-gray-300 rounded mx-auto mb-2"></div>
                                <div className="h-3 w-48 bg-gray-300 rounded mx-auto"></div>
                            </div>
                        </div>
                    ) : (
                        renderTabContent()
                    )}
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

            {/* Modal de historial de aplicación */}
            <HistorialAplicacionModal
                isOpen={showHistorialModal}
                onClose={() => setShowHistorialModal(false)}
                aplicacionId={aplicacion.id}
                candidatoNombre={nombreCompleto}
            />
        </>
    )
}