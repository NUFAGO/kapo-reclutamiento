'use client'

import React, { useState, useEffect } from 'react'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { Phone, Calendar, MapPin, Briefcase, User, DollarSign, FileText, MessageSquare, Save, Edit, File } from 'lucide-react'
import { Input, Textarea, Select, Button, Modal } from '@/components/ui'
import { FaRegFilePdf } from "react-icons/fa";
import type { SelectOption } from '@/components/ui'
import { useEntrevistaLlamadaPorAplicacion, useCrearEntrevistaLlamada, useActualizarEntrevistaLlamada } from '@/hooks'
import { useAuth } from '@/hooks'
import { showSuccess, showError, TOAST_DURATIONS } from '@/lib/toast-utils'
import { graphqlRequest } from '@/lib/graphql-client'
import { GET_CONVOCATORIA_QUERY } from '@/graphql/queries/convocatorias.queries'
import { EntrevistaLlamadaPdf } from '../pdfs/EntrevistaLlamadaPdf'
import { pdf } from '@react-pdf/renderer'


interface LlamadaTabProps {
    aplicacion: AplicacionCandidato
    onValidationChange?: (isValid: boolean) => void
    viewOnly?: boolean
}

export function LlamadaTab({ aplicacion, onValidationChange, viewOnly = false }: LlamadaTabProps) {
    // Hook para obtener información del usuario autenticado
    const { user } = useAuth()

    // Hook para cargar datos
    const { entrevista, loading: loadingEntrevista } = useEntrevistaLlamadaPorAplicacion(aplicacion.id)

    // Report validation when data is loaded
    React.useEffect(() => {
        if (!loadingEntrevista) {
            onValidationChange?.(!!entrevista)
        }
    }, [entrevista, loadingEntrevista])

    // Hooks para operaciones CRUD
    const { crearEntrevista, loading: loadingCrear } = useCrearEntrevistaLlamada()
    const { actualizarEntrevista, loading: loadingActualizar } = useActualizarEntrevistaLlamada()

    // Estado del formulario
    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalData, setOriginalData] = useState<any>(null)
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    const [formData, setFormData] = useState<{
        fecha_entrevista: string
        disponibilidad_actual: string
        residencia_actual: string
        disponibilidad_viajar: 'SI' | 'NO' | undefined
        estudios: string
        estado_civil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE' | undefined
        hijos: number | undefined
        edad: number | undefined
        experiencia_general: string
        experiencia_rubro: 'BAJO' | 'MEDIO' | 'ALTO' | undefined
        busca_estabilidad: string
        retos_profesionales: string
        desenvolvimiento: number | undefined
        conocimiento_perfil: 'SI' | 'NO' | undefined
        interes_puesto: number | undefined
        pretension_monto: number | undefined
        pretension_negociable: 'SI' | 'NO' | undefined
        comentarios: string
        solicitar_referencias: string
        entrevistador_id: string
        entrevistador_nombre: string
        observaciones: string
        resultado: string
    }>({
        fecha_entrevista: new Date().toISOString().split('T')[0],
        disponibilidad_actual: '',
        residencia_actual: '',
        disponibilidad_viajar: undefined,
        estudios: '',
        estado_civil: undefined,
        hijos: undefined,
        edad: undefined,
        experiencia_general: '',
        experiencia_rubro: undefined,
        busca_estabilidad: '',
        retos_profesionales: '',
        desenvolvimiento: undefined,
        conocimiento_perfil: undefined,
        interes_puesto: undefined,
        pretension_monto: undefined,
        pretension_negociable: undefined,
        comentarios: '',
        solicitar_referencias: '',
        entrevistador_id: user?.id || '',
        entrevistador_nombre: user?.nombresA || '',
        observaciones: '',
        resultado: ''
    })

    // Cargar datos cuando existe entrevista
    useEffect(() => {
        if (entrevista) {
            const loadedData = {
                fecha_entrevista: new Date(entrevista.fecha_entrevista).toISOString().split('T')[0],
                disponibilidad_actual: entrevista.disponibilidad_actual,
                residencia_actual: entrevista.residencia_actual,
                disponibilidad_viajar: entrevista.disponibilidad_viajar,
                estudios: entrevista.estudios,
                estado_civil: entrevista.estado_civil,
                hijos: entrevista.hijos,
                edad: entrevista.edad,
                experiencia_general: entrevista.experiencia_general,
                experiencia_rubro: entrevista.experiencia_rubro,
                busca_estabilidad: entrevista.busca_estabilidad,
                retos_profesionales: entrevista.retos_profesionales,
                desenvolvimiento: entrevista.desenvolvimiento,
                conocimiento_perfil: entrevista.conocimiento_perfil as 'SI' | 'NO',
                interes_puesto: entrevista.interes_puesto,
                pretension_monto: entrevista.pretension_monto,
                pretension_negociable: entrevista.pretension_negociable as 'SI' | 'NO',
                comentarios: entrevista.comentarios ?? '',
                solicitar_referencias: entrevista.solicitar_referencias ?? '',
                entrevistador_id: entrevista.entrevistador_id,
                entrevistador_nombre: entrevista.entrevistador_nombre,
                observaciones: entrevista.observaciones,
                resultado: entrevista.resultado
            }

            setFormData(loadedData)
            setOriginalData(loadedData)
            setIsEditMode(false)
            setHasChanges(false)
        }
    }, [entrevista])

    // Detectar cambios en el formulario
    useEffect(() => {
        if (originalData && isEditMode) {
            const hasAnyChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
            setHasChanges(hasAnyChanges)
        } else {
            setHasChanges(false)
        }
    }, [formData, originalData, isEditMode])

    // Generar PDF cuando se abre el modal
    useEffect(() => {
        if (isPdfModalOpen && entrevista && !pdfBlobUrl) {
            generatePdf()
        }

        // Limpiar URL del PDF cuando se cierra el modal
        return () => {
            if (!isPdfModalOpen && pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl)
                setPdfBlobUrl(null)
            }
        }
    }, [isPdfModalOpen, entrevista, pdfBlobUrl])


    // Función para generar el PDF
    const generatePdf = async () => {
        if (!entrevista) return

        setIsGeneratingPdf(true)
        try {
            // Buscar la convocatoria para obtener jefe_inmediato_nombre actualizado
            const convocatoriaResponse = await graphqlRequest(GET_CONVOCATORIA_QUERY, { id: aplicacion.convocatoriaId });
            const jefeInmediato = convocatoriaResponse.convocatoria?.detalle_staff_snapshot?.jefe_inmediato_nombre;

            const pdfDoc = <EntrevistaLlamadaPdf aplicacion={aplicacion} entrevista={entrevista} jefeInmediato={jefeInmediato} />
            const blob = await pdf(pdfDoc).toBlob()
            const blobUrl = URL.createObjectURL(blob)

            setPdfBlobUrl(blobUrl)
        } catch (error) {
            console.error('Error generando PDF:', error)
            showError('Error al generar el PDF', { duration: TOAST_DURATIONS.LONG })
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    // Función para abrir el modal del PDF
    const handleOpenPdfModal = () => {
        setIsPdfModalOpen(true)
    }

    // Función para manejar cambios en inputs
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Función para validar campos requeridos
    const validateForm = (): string[] => {
        const errors: string[] = []

        if (!formData.fecha_entrevista?.trim()) {
            errors.push('Fecha de Entrevista')
        }
        if (!formData.disponibilidad_actual?.trim()) {
            errors.push('Disponibilidad Inmediata')
        }
        if (!formData.residencia_actual?.trim()) {
            errors.push('Residencia')
        }
        if (formData.disponibilidad_viajar === undefined) {
            errors.push('Disponibilidad para Viajar')
        }
        if (!formData.estudios?.trim()) {
            errors.push('Estudios')
        }
        if (formData.estado_civil === undefined) {
            errors.push('Estado Civil')
        }
        if (formData.hijos === undefined) {
            errors.push('Número de Hijos')
        } else if (formData.hijos < 0) {
            errors.push('Número de Hijos (no negativo)')
        }
        if (formData.edad === undefined) {
            errors.push('Edad')
        } else if (formData.edad < 18) {
            errors.push('Edad (mínimo 18)')
        }
        if (!formData.experiencia_general?.trim()) {
            errors.push('Experiencia General')
        }
        if (formData.experiencia_rubro === undefined) {
            errors.push('Experiencia en el Rubro')
        }
        if (!formData.busca_estabilidad?.trim()) {
            errors.push('Busca Estabilidad')
        }
        if (!formData.retos_profesionales?.trim()) {
            errors.push('Retos Profesionales')
        }
        if (formData.desenvolvimiento === undefined) {
            errors.push('Desenvolvimiento')
        } else if (formData.desenvolvimiento < 1 || formData.desenvolvimiento > 10) {
            errors.push('Desenvolvimiento (1-10)')
        }
        if (formData.conocimiento_perfil === undefined) {
            errors.push('Conocimiento Según Perfil')
        }
        if (formData.interes_puesto === undefined) {
            errors.push('Interés en el Puesto')
        } else if (formData.interes_puesto < 1 || formData.interes_puesto > 10) {
            errors.push('Interés en el Puesto (1-10)')
        }
        if (formData.pretension_monto === undefined) {
            errors.push('Monto Solicitado')
        } else if (formData.pretension_monto < 0) {
            errors.push('Monto Solicitado (no negativo)')
        }
        if (formData.pretension_negociable === undefined) {
            errors.push('Pretensión Negociable')
        }
        if (!formData.observaciones?.trim()) {
            errors.push('Observaciones')
        }
        if (!formData.resultado?.trim()) {
            errors.push('Resultado de la Entrevista')
        }
        // Comentarios y solicitar_referencias son opcionales según el usuario

        return errors
    }

    // Función para manejar el modo edición
    const handleEditMode = () => {
        setIsEditMode(true)
    }

    // Función para cancelar edición
    const handleCancelEdit = () => {
        if (originalData) {
            setFormData(originalData)
        }
        setIsEditMode(false)
        setHasChanges(false)
    }

    // Función para guardar/crear entrevista
    const handleSave = async () => {
        // Validar campos requeridos
        const validationErrors = validateForm()
        if (validationErrors.length > 0) {
            let missingFieldsMessage = ''
            if (validationErrors.length <= 2) {
                missingFieldsMessage = validationErrors.join(', ')
            } else {
                missingFieldsMessage = `${validationErrors.slice(0, 2).join(', ')}, etc`
            }
            showError(`Faltan completar los siguientes campos: ${missingFieldsMessage}`, { duration: TOAST_DURATIONS.LONG })
            return
        }

        try {
            // Preparar datos para crear (todos los campos requeridos)
            const crearData = {
                aplicacionCandidatoId: aplicacion.id,
                fecha_entrevista: new Date(formData.fecha_entrevista).toISOString(),
                disponibilidad_actual: formData.disponibilidad_actual,
                residencia_actual: formData.residencia_actual,
                disponibilidad_viajar: formData.disponibilidad_viajar as 'SI' | 'NO',
                estudios: formData.estudios,
                estado_civil: formData.estado_civil as 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE',
                hijos: formData.hijos as number,
                edad: formData.edad as number,
                experiencia_general: formData.experiencia_general,
                experiencia_rubro: formData.experiencia_rubro as 'BAJO' | 'MEDIO' | 'ALTO',
                busca_estabilidad: formData.busca_estabilidad,
                retos_profesionales: formData.retos_profesionales,
                desenvolvimiento: formData.desenvolvimiento as number,
                conocimiento_perfil: formData.conocimiento_perfil as 'SI' | 'NO',
                interes_puesto: formData.interes_puesto as number,
                pretension_monto: formData.pretension_monto as number,
                pretension_negociable: formData.pretension_negociable as 'SI' | 'NO',
                comentarios: formData.comentarios,
                solicitar_referencias: formData.solicitar_referencias,
                entrevistador_id: formData.entrevistador_id,
                entrevistador_nombre: formData.entrevistador_nombre,
                observaciones: formData.observaciones,
                resultado: formData.resultado
            }

            // Preparar datos para actualizar (todos los campos modificables, sin aplicacionCandidatoId)
            const actualizarData = {
                fecha_entrevista: new Date(formData.fecha_entrevista).toISOString(),
                disponibilidad_actual: formData.disponibilidad_actual,
                residencia_actual: formData.residencia_actual,
                disponibilidad_viajar: formData.disponibilidad_viajar as 'SI' | 'NO',
                estudios: formData.estudios,
                estado_civil: formData.estado_civil as 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE',
                hijos: formData.hijos as number,
                edad: formData.edad as number,
                experiencia_general: formData.experiencia_general,
                experiencia_rubro: formData.experiencia_rubro as 'BAJO' | 'MEDIO' | 'ALTO',
                busca_estabilidad: formData.busca_estabilidad,
                retos_profesionales: formData.retos_profesionales,
                desenvolvimiento: formData.desenvolvimiento as number,
                conocimiento_perfil: formData.conocimiento_perfil as 'SI' | 'NO',
                interes_puesto: formData.interes_puesto as number,
                pretension_monto: formData.pretension_monto as number,
                pretension_negociable: formData.pretension_negociable as 'SI' | 'NO',
                comentarios: formData.comentarios,
                solicitar_referencias: formData.solicitar_referencias,
                entrevistador_id: formData.entrevistador_id,
                entrevistador_nombre: formData.entrevistador_nombre,
                observaciones: formData.observaciones,
                resultado: formData.resultado
            }

            if (entrevista) {
                await actualizarEntrevista({ id: entrevista.id, input: actualizarData })
                setIsEditMode(false)
                setHasChanges(false)
                setOriginalData(formData)
                showSuccess('Entrevista actualizada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            } else {
                await crearEntrevista(crearData)
                // Después de crear, recargar los datos para obtener el registro creado
                // Esto permitirá que el botón cambie a "Editar"
                showSuccess('Entrevista creada correctamente', { duration: TOAST_DURATIONS.QUICK })
            }
        } catch (error) {
            console.error('Error al guardar entrevista:', error)
            showError('Error al guardar la entrevista. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    const loading = loadingEntrevista || loadingCrear || loadingActualizar

    // Validar si debe mostrar formulario o mensaje de requerimiento
    // Opciones para selects
    const opcionesSiNo: SelectOption[] = [
        { value: 'SI', label: 'Sí' },
        { value: 'NO', label: 'No' }
    ]

    const opcionesEstadoCivil: SelectOption[] = [
        { value: 'SOLTERO', label: 'Soltero' },
        { value: 'CASADO', label: 'Casado' },
        { value: 'DIVORCIADO', label: 'Divorciado' },
        { value: 'VIUDO', label: 'Viudo' },
        { value: 'CONVIVIENTE', label: 'Conviviente' }
    ]

    const opcionesExperienciaRubro: SelectOption[] = [
        { value: 'BAJO', label: 'Bajo' },
        { value: 'MEDIO', label: 'Medio' },
        { value: 'ALTO', label: 'Alto' }
    ]

    return (
        <div className="space-y-6">
            {/* Información de la Entrevista */}
            <section>
                <div className='flex items-center justify-between'>
                    <h3 className="text-xs uppercase font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Información de la Entrevista
                    </h3>
                    {entrevista && (
                        <Button
                            variant="subtle"
                            color="danger"
                            size="icon"
                            onClick={handleOpenPdfModal}
                        >
                            <FaRegFilePdf className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Fecha de Entrevista */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Fecha de Entrevista
                        </label>
                        <Input
                            type="date"
                            className="h-8 text-xs"
                            value={formData.fecha_entrevista}
                            onChange={(e) => handleInputChange('fecha_entrevista', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Disponibilidad Inmediata */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Disponibilidad Inmediata
                        </label>
                        <Input
                            placeholder="¿Actualmente está laborando o tiene alguna ocupación?"
                            className="h-8 text-xs"
                            value={formData.disponibilidad_actual}
                            onChange={(e) => handleInputChange('disponibilidad_actual', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Información Personal */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Residencia */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Residencia
                        </label>
                        <Input
                            placeholder="¿Dónde vive actualmente?"
                            className="h-8 text-xs"
                            value={formData.residencia_actual}
                            onChange={(e) => handleInputChange('residencia_actual', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Disponibilidad para Viajar */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Disponibilidad para Viajar
                        </label>
                        <Select
                            options={opcionesSiNo}
                            placeholder="Seleccionar..."
                            value={formData.disponibilidad_viajar || ''}
                            onChange={(value) => handleInputChange('disponibilidad_viajar', value === '' ? undefined : value as 'SI' | 'NO')}
                            disabled={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Estudios */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Estudios
                        </label>
                        <Input
                            placeholder="Nivel de estudios"
                            className="h-8 text-xs"
                            value={formData.estudios}
                            onChange={(e) => handleInputChange('estudios', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Estado Civil */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Estado Civil
                        </label>
                        <Select
                            options={opcionesEstadoCivil}
                            placeholder="Seleccionar..."
                            value={formData.estado_civil || ''}
                            onChange={(value) => handleInputChange('estado_civil', value === '' ? undefined : value as 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE')}
                            disabled={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* ¿Tiene hijos? */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            ¿Tiene hijos?
                        </label>
                        <Input
                            type="number"
                            placeholder="Cantidad"
                            className="h-8 text-xs"
                            min="0"
                            value={formData.hijos ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === '') {
                                    handleInputChange('hijos', undefined);
                                } else {
                                    const parsed = parseInt(value);
                                    handleInputChange('hijos', isNaN(parsed) ? undefined : parsed);
                                }
                            }}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Edad */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Edad
                        </label>
                        <Input
                            type="number"
                            placeholder="Edad"
                            className="h-8 text-xs"
                            min="18"
                            max="100"
                            value={formData.edad ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === '') {
                                    handleInputChange('edad', undefined);
                                } else {
                                    const parsed = parseInt(value);
                                    handleInputChange('edad', isNaN(parsed) ? undefined : parsed);
                                }
                            }}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Información Profesional */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    Información Profesional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Experiencia General */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Experiencia General
                        </label>
                        <Input
                            placeholder="Años de experiencia general"
                            className="h-8 text-xs"
                            value={formData.experiencia_general}
                            onChange={(e) => handleInputChange('experiencia_general', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Experiencia en el Rubro */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Experiencia en el Rubro
                        </label>
                        <Select
                            options={opcionesExperienciaRubro}
                            placeholder="Seleccionar..."
                            value={formData.experiencia_rubro || ''}
                            onChange={(value) => handleInputChange('experiencia_rubro', value === '' ? undefined : value as 'BAJO' | 'MEDIO' | 'ALTO')}
                            disabled={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Busca Estabilidad */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Busca Estabilidad
                        </label>
                        <Input
                            placeholder="¿Está buscando estabilidad laboral a largo plazo?"
                            className="h-8 text-xs"
                            value={formData.busca_estabilidad}
                            onChange={(e) => handleInputChange('busca_estabilidad', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Retos Profesionales */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Retos Profesionales
                        </label>
                        <Textarea
                            placeholder="¿Cuáles son sus principales retos o metas profesionales?"
                            rows={3}
                            value={formData.retos_profesionales}
                            onChange={(e) => handleInputChange('retos_profesionales', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Evaluación */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Evaluación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Desenvolvimiento */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Desenvolvimiento (1-10)
                        </label>
                        <Input
                            type="number"
                            placeholder="Calificar del 1 al 10"
                            className="h-8 text-xs"
                            min="1"
                            max="10"
                            value={formData.desenvolvimiento ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === '') {
                                    handleInputChange('desenvolvimiento', undefined);
                                } else {
                                    const parsed = parseInt(value);
                                    handleInputChange('desenvolvimiento', isNaN(parsed) ? undefined : parsed);
                                }
                            }}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Conocimiento Según Perfil */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Conocimiento Según Perfil
                        </label>
                        <Select
                            options={opcionesSiNo}
                            placeholder="¿Cumple con el perfil requerido?"
                            value={formData.conocimiento_perfil || ''}
                            onChange={(value) => handleInputChange('conocimiento_perfil', value === '' ? undefined : value as 'SI' | 'NO')}
                            disabled={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Interés en el Puesto */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Interés en el Puesto (1-10)
                        </label>
                        <Input
                            type="number"
                            placeholder="Calificar del 1 al 10"
                            className="h-8 text-xs"
                            min="1"
                            max="10"
                            value={formData.interes_puesto ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === '') {
                                    handleInputChange('interes_puesto', undefined);
                                } else {
                                    const parsed = parseInt(value);
                                    handleInputChange('interes_puesto', isNaN(parsed) ? undefined : parsed);
                                }
                            }}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Pretensiones Salariales */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Pretensiones Salariales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Monto solicitado */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Monto Solicitado
                        </label>
                        <Input
                            type="number"
                            placeholder="Monto en soles"
                            className="h-8 text-xs"
                            min="0"
                            value={formData.pretension_monto ?? ''}
                            onChange={(e) => {
                                const value = e.target.value.trim();
                                if (value === '') {
                                    handleInputChange('pretension_monto', undefined);
                                } else {
                                    const parsed = parseFloat(value);
                                    handleInputChange('pretension_monto', isNaN(parsed) ? undefined : parsed);
                                }
                            }}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* ¿Es negociable? */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            ¿Es negociable?
                        </label>
                        <Select
                            options={opcionesSiNo}
                            placeholder="Seleccionar..."
                            value={formData.pretension_negociable || ''}
                            onChange={(value) => handleInputChange('pretension_negociable', value === '' ? undefined : value as 'SI' | 'NO')}
                            disabled={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Información Adicional */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Comentarios del Entrevistador */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Comentarios del Entrevistador
                        </label>
                        <Textarea
                            placeholder="Comentarios opcionales"
                            rows={3}
                            value={formData.comentarios}
                            onChange={(e) => handleInputChange('comentarios', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Solicitar Referencias */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Solicitar Referencias
                        </label>
                        <Textarea
                            placeholder="Indicar si se deben solicitar referencias y observaciones"
                            rows={3}
                            value={formData.solicitar_referencias}
                            onChange={(e) => handleInputChange('solicitar_referencias', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Responsable de la Entrevista */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Responsable de la Entrevista
                        </label>
                        <Input
                            placeholder="Nombre del entrevistador"
                            className="h-8 text-xs"
                            readOnly
                            value={user?.nombresA || 'Usuario no identificado'}
                        />
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Observaciones
                        </label>
                        <Textarea
                            placeholder="Observaciones adicionales"
                            rows={3}
                            value={formData.observaciones}
                            onChange={(e) => handleInputChange('observaciones', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>

                    {/* Resultado de la Entrevista */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Resultado de la Entrevista
                        </label>
                        <Textarea
                            placeholder="Resultado final de la entrevista"
                            rows={3}
                            value={formData.resultado}
                            onChange={(e) => handleInputChange('resultado', e.target.value)}
                            readOnly={!isEditMode && !!entrevista}
                        />
                    </div>
                </div>
            </section>

            {/* Botones de acción */}
            {!viewOnly && (
                <section className="" >
                    <div className="flex items-center justify-center gap-3">
                        {isEditMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    color='green'
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="custom"
                                    color="primary"
                                    size="xs"
                                    icon={<Save className="w-4 h-4" />}
                                    onClick={handleSave}
                                    disabled={loading || !hasChanges}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="custom"
                                color="primary"
                                size="xs"
                                icon={entrevista ? <Edit className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                onClick={entrevista ? handleEditMode : handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : (entrevista ? 'Editar' : 'Guardar')}
                            </Button>
                        )}
                    </div>
                </section>
            )}

            {/* Modal del PDF */}
            <Modal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                title="Vista Previa del PDF - Entrevista Telefónica"
                size="lg-tall"
            >
                <div className="h-full w-full">
                    {isGeneratingPdf ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                                <p className="text-sm text-gray-600">Generando PDF...</p>
                            </div>
                        </div>
                    ) : pdfBlobUrl ? (
                        <iframe
                            src={pdfBlobUrl}
                            className="w-full h-full border-0"
                            title="Vista Previa del PDF"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-gray-600">No hay datos de entrevista disponibles</p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}