'use client'

import React from 'react'
import { Modal, Button } from '@/components/ui'
import { useHistorialAplicacion } from '@/hooks'
import { HistorialCandidato } from '@/types/historial-candidato.types'
import { EstadoKanban, ESTADO_LABELS } from '@/app/(dashboard)/kanban/lib/kanban.constants'
import {
    Clock,
    User,
    ArrowRight,
    CheckCircle,
    XCircle,
    RotateCcw,
    Move,
    Calendar,
    FileText,
    Loader2
} from 'lucide-react'

interface HistorialAplicacionModalProps {
    isOpen: boolean
    onClose: () => void
    aplicacionId: string
    candidatoNombre: string
}

const getTipoCambioIcon = (tipo: string) => {
    switch (tipo) {
        case 'APROBACION':
            return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'RECHAZO':
            return <XCircle className="w-4 h-4 text-red-500" />
        case 'MOVIMIENTO':
            return <Move className="w-4 h-4 text-blue-500" />
        case 'REACTIVACION':
            return <RotateCcw className="w-4 h-4 text-orange-500" />
        default:
            return <Clock className="w-4 h-4 text-gray-500" />
    }
}

const getTipoCambioLabel = (tipo: string) => {
    switch (tipo) {
        case 'APROBACION':
            return 'Aprobación'
        case 'RECHAZO':
            return 'Rechazo'
        case 'MOVIMIENTO':
            return 'Movimiento'
        case 'REACTIVACION':
            return 'Reactivación'
        default:
            return tipo
    }
}

const HistorialAplicacionModal: React.FC<HistorialAplicacionModalProps> = ({
    isOpen,
    onClose,
    aplicacionId,
    candidatoNombre
}) => {
    const { historial, isLoading, error } = useHistorialAplicacion(aplicacionId)

    const formatFecha = (fecha: string) => {
        try {
            const date = new Date(fecha)
            return new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date)
        } catch {
            return fecha
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Historial de ${candidatoNombre}`}
            size="lg-tall"
        >
            <div className="p-4 h-full">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-2">Cargando historial...</span>
                    </div>
                )}

                {error && (
                    <div className="border border-red-200 rounded-lg p-4" style={{ background: 'var(--error-bg)', borderColor: 'var(--error-border)' }}>
                        <div className="flex items-center justify-center flex-row">
                            <XCircle className="w-5 h-5 text-xs text-red-500 mr-2" />
                            <span style={{ color: 'var(--error-text)' }}>Error al cargar el historial: {error}</span>
                        </div>
                    </div>
                )}

                {!isLoading && !error && historial.length === 0 && (
                    <div className=" border border-gray-200 rounded-lg p-8 text-center h-full flex justify-center items-center" style={{ borderColor: 'var(--border-color)' }}>

                        <div>
                            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className='text-xs' style={{ color: 'var(--text-secondary)' }}>No hay historial disponible para esta aplicación.</p>
                        </div>
                    </div>
                )}

                {!isLoading && !error && historial.length > 0 && (
                    <div className="space-y-3 h-full overflow-y-auto">
                        {historial
                            .sort((a, b) => new Date(b.fechaCambio).getTime() - new Date(a.fechaCambio).getTime())
                            .map((item: HistorialCandidato, index: number) => (
                                <div
                                    key={item.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                    style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getTipoCambioIcon(item.tipoCambio)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1 text-xs">
                                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                                        {getTipoCambioLabel(item.tipoCambio)}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {formatFecha(item.fechaCambio)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 mb-2 text-xs">
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                                        {ESTADO_LABELS[item.estadoAnterior]}
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                                        {ESTADO_LABELS[item.estadoNuevo]}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                                        <span>{item.realizadoPorNombre}</span>
                                                    </div>

                                                    {item.tiempoEnEstadoAnterior && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                                            <span>{item.tiempoEnEstadoAnterior} días</span>
                                                        </div>
                                                    )}

                                                    {item.etapaProceso && (
                                                        <div className="flex items-center gap-1.5">
                                                            <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                                            <span>{item.etapaProceso}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {item.motivo && (
                                                    <div className="mt-2">
                                                        <span className='text-xs' style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Motivo:</span>
                                                        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{item.motivo}</p>
                                                    </div>
                                                )}

                                                {item.comentarios && (
                                                    <div className="mt-2">
                                                        <span className='text-xs' style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Comentarios:</span>
                                                        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{item.comentarios}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default HistorialAplicacionModal