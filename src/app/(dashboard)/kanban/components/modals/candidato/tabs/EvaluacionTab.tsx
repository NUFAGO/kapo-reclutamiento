'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Plus, Check, Save, Edit } from 'lucide-react'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { Select } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { Button, Textarea, Input, Modal } from '@/components/ui'
import { FaRegFilePdf } from "react-icons/fa";
import { useEmpleados, searchEmpleados } from '@/hooks/useEmpleados'
import { SelectSearch } from '@/components/ui/select-search'
import { useDebidaDiligenciaPorAplicacion, useCrearDebidaDiligencia, useActualizarDebidaDiligencia, type DebidaDiligencia, type CrearDebidaDiligenciaInput, type ActualizarDebidaDiligenciaInput } from '@/hooks'
import { showSuccess, showError, TOAST_DURATIONS } from '@/lib/toast-utils'
import { DebidaDiligenciaPdf } from '../pdfs/DebidaDiligenciaPdf'
import { pdf } from '@react-pdf/renderer'

interface EvaluacionTabProps {
    aplicacion: AplicacionCandidato
    onValidationChange?: (isValid: boolean) => void
}

export function EvaluacionTab({ aplicacion, onValidationChange }: EvaluacionTabProps) {
    const nombreCompleto = aplicacion.candidato
        ? `${aplicacion.candidato.nombres} ${aplicacion.candidato.apellidoPaterno} ${aplicacion.candidato.apellidoMaterno}`.trim()
        : 'Candidato'

    // Opciones para respuestas
    const opcionesRespuesta: SelectOption[] = [
        { value: 'SI', label: 'SI' },
        { value: 'NO', label: 'NO' },
        { value: 'NA', label: 'NA' }
    ]

    // Estado para fechas y evaluador
    const [fechaAprobacion, setFechaAprobacion] = useState(new Date().toISOString().split('T')[0])
    const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0])
    const [version, setVersion] = useState(1)
    const [evaluadorId, setEvaluadorId] = useState('')
    const [evaluadorNombre, setEvaluadorNombre] = useState('')

    // Código hardcoded
    const codigo = 'FO-ADM-018'

    // Estado para criterios de evaluación
    const [criterios, setCriterios] = useState<{
        [key: string]: { ponderacion: number; respuesta: 'SI' | 'NO' | 'NA' | '', puntaje: number }
    }>({
        item01: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item02: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item03: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item04: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item05: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item06: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item07: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item08: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item09: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item10: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item11: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item12: { ponderacion: 2, respuesta: '', puntaje: 0 },
        item13: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item14: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item15: { ponderacion: 1, respuesta: '', puntaje: 0 },
        item16: { ponderacion: 2, respuesta: '', puntaje: 0 }
    })

    // Estado para puntaje total (calculado)
    const [puntajeTotal, setPuntajeTotal] = useState(0)
    const [nivelRiesgo, setNivelRiesgo] = useState('BAJO')

    // Estados para modo edición
    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalData, setOriginalData] = useState<{
        fechaAprobacion: string
        fechaEvaluacion: string
        evaluadorId: string
        evaluadorNombre: string
        selectedAction: string
        criterios: typeof criterios
        controles: typeof controles
    } | null>(null)

    // Calcular puntaje total y nivel de riesgo cuando criterios cambian
    useEffect(() => {
        let total = 0
        for (const key in criterios) {
            const criterio = criterios[key]
            if (criterio.respuesta === 'SI') total += criterio.puntaje
            else if (criterio.respuesta === 'NO') total += 0
            else if (criterio.respuesta === 'NA') total += 0
        }
        
        let nivel = 'BAJO'
        if (total >= 16) nivel = 'CRITICO'
        else if (total >= 11) nivel = 'ALTO'
        else if (total >= 6) nivel = 'MODERADO'
        else nivel = 'BAJO'
        
        setPuntajeTotal(total)
        setNivelRiesgo(nivel)
    }, [criterios])

    // Estado para acción seleccionada
    const [selectedAction, setSelectedAction] = useState('')

    // Estados para controles
    const [controles, setControles] = useState<{item: number, control: string, responsable: string, fechaLimite: string}[]>([])

    // Estados para PDF
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

    // Hooks para empleados
    const { empleados, loading: loadingEmpleados } = useEmpleados()

    // Hooks para debida diligencia
    const { debidaDiligencia: existingDebidaDiligencia, loading: loadingDebidaDiligencia } = useDebidaDiligenciaPorAplicacion(aplicacion.id)
    const { crearDebidaDiligencia, loading: loadingCrear } = useCrearDebidaDiligencia()
    const { actualizarDebidaDiligencia, loading: loadingActualizar } = useActualizarDebidaDiligencia()

    // Report validation when data is loaded
    useEffect(() => {
        if (!loadingDebidaDiligencia) {
            onValidationChange?.(!!existingDebidaDiligencia)
        }
    }, [existingDebidaDiligencia, loadingDebidaDiligencia])

    // Cargar datos existentes cuando estén disponibles
    useEffect(() => {
        if (existingDebidaDiligencia) {
            setFechaAprobacion(existingDebidaDiligencia.fecha_aprobacion ? new Date(existingDebidaDiligencia.fecha_aprobacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
            setFechaEvaluacion(existingDebidaDiligencia.fecha_evaluacion ? new Date(existingDebidaDiligencia.fecha_evaluacion).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
            setVersion(existingDebidaDiligencia.created_at ? 1 : 1) // TODO: Implementar versionado
            setEvaluadorId(existingDebidaDiligencia.evaluador_id)
            setEvaluadorNombre(existingDebidaDiligencia.nombre_evaluador)
            setSelectedAction(existingDebidaDiligencia.accion || '')

            // Cargar criterios
            const criteriosLoaded = { ...criterios }
            for (const key in existingDebidaDiligencia.criterios) {
                if (criteriosLoaded[key]) {
                    criteriosLoaded[key] = existingDebidaDiligencia.criterios[key]
                }
            }
            setCriterios(criteriosLoaded)

            // Cargar controles
            if (existingDebidaDiligencia.controles) {
                setControles(existingDebidaDiligencia.controles.map(control => ({
                    item: controles.length + 1,
                    control: control.criterio,
                    responsable: control.responsable || '',
                    fechaLimite: control.fecha_limite ? new Date(control.fecha_limite).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })))
            }

            // Guardar datos originales
            setOriginalData({
                fechaAprobacion,
                fechaEvaluacion,
                evaluadorId,
                evaluadorNombre,
                selectedAction,
                criterios: criteriosLoaded,
                controles: existingDebidaDiligencia.controles?.map(control => ({
                    item: controles.length + 1,
                    control: control.criterio,
                    responsable: control.responsable || '',
                    fechaLimite: control.fecha_limite ? new Date(control.fecha_limite).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })) || []
            })
            setIsEditMode(false)
            setHasChanges(false)
        }
    }, [existingDebidaDiligencia])

    // Detectar cambios en el formulario cuando está en modo edición
    useEffect(() => {
        if (originalData && isEditMode) {
            const currentData = {
                fechaAprobacion,
                fechaEvaluacion,
                evaluadorId,
                evaluadorNombre,
                selectedAction,
                criterios,
                controles
            }
            const hasAnyChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
            setHasChanges(hasAnyChanges)
        } else {
            setHasChanges(false)
        }
    }, [fechaAprobacion, fechaEvaluacion, evaluadorId, evaluadorNombre, selectedAction, criterios, controles, originalData, isEditMode])

    // Generar PDF cuando se abre el modal
    useEffect(() => {
        if (isPdfModalOpen && existingDebidaDiligencia && !pdfBlobUrl) {
            generatePdf()
        }

        // Limpiar URL del PDF cuando se cierra el modal
        return () => {
            if (!isPdfModalOpen && pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl)
                setPdfBlobUrl(null)
            }
        }
    }, [isPdfModalOpen, existingDebidaDiligencia, pdfBlobUrl])

    const addControl = () => {
        const newItem = controles.length + 1
        setControles([...controles, {
            item: newItem,
            control: '',
            responsable: '',
            fechaLimite: new Date().toISOString().split('T')[0]
        }])
    }
    const handleEditMode = () => {
        setIsEditMode(true)
    }

    // Función para cancelar edición
    const handleCancelEdit = () => {
        if (originalData) {
            setFechaAprobacion(originalData.fechaAprobacion)
            setFechaEvaluacion(originalData.fechaEvaluacion)
            setEvaluadorId(originalData.evaluadorId)
            setEvaluadorNombre(originalData.evaluadorNombre)
            setSelectedAction(originalData.selectedAction)
            setCriterios(originalData.criterios)
            setControles(originalData.controles)
        }
        setIsEditMode(false)
        setHasChanges(false)
    }

    // Función para guardar la debida diligencia
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
            const baseInput = {
                evaluador_id: evaluadorId,
                nombre_evaluador: evaluadorNombre,
                fecha_aprobacion: fechaAprobacion || undefined,
                fecha_evaluacion: fechaEvaluacion,
                criterios,
                puntaje_total: puntajeTotal,
                nivel_riesgo: nivelRiesgo as 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO',
                accion: selectedAction as 'NO_ESTABLECER' | 'SUSPENDER' | 'TERMINAR' | 'ACEPTAR_CON_CONTROLES' | undefined,
                controles: controles.map(control => ({
                    criterio: control.control,
                    responsable: control.responsable,
                    fecha_limite: control.fechaLimite
                })).filter(control => control.criterio && control.responsable && control.fecha_limite)
            }

            if (existingDebidaDiligencia) {
                console.log('Updating DebidaDiligencia:', baseInput)
                await actualizarDebidaDiligencia({ id: existingDebidaDiligencia.id, input: baseInput })
                showSuccess('Evaluación actualizada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            } else {
                const createInput = {
                    ...baseInput,
                    aplicacionCandidatoId: aplicacion.id,
                    candidatoId: aplicacion.candidatoId,
                    codigo,
                }
                console.log('Creating DebidaDiligencia:', createInput)
                await crearDebidaDiligencia(createInput)
                showSuccess('Evaluación creada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            }

            // Reset edit mode and update original data
            setIsEditMode(false)
            setOriginalData({
                fechaAprobacion,
                fechaEvaluacion,
                evaluadorId,
                evaluadorNombre,
                selectedAction,
                criterios,
                controles
            })
            setHasChanges(false)
        } catch (error) {
            console.error('Error saving debida diligencia:', error)
        }
    }

    // Función para actualizar control
    const updateControl = (index: number, field: keyof typeof controles[0], value: string) => {
        setControles(controles.map((c, i) => i === index ? { ...c, [field]: value } : c))
    }

    // Función para eliminar control
    const removeControl = (index: number) => {
        setControles(controles.filter((_, i) => i !== index))
    }

    // Función para generar el PDF
    const generatePdf = async () => {
        if (!existingDebidaDiligencia) return

        setIsGeneratingPdf(true)
        try {
            const pdfDoc = <DebidaDiligenciaPdf aplicacion={aplicacion} debidaDiligencia={existingDebidaDiligencia} />
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

    // Función para validar campos requeridos
    const validateForm = (): string[] => {
        const errors: string[] = []

        if (!evaluadorId?.trim()) {
            errors.push('Evaluador')
        }

        // Verificar que todos los 16 criterios estén seleccionados
        const criteriosKeys = Object.keys(criterios) as Array<keyof typeof criterios>
        const missingCriterios = criteriosKeys.filter(key => !criterios[key].respuesta)
        if (missingCriterios.length > 0) {
            errors.push(`Faltan ${missingCriterios.length} criterios`)
        }

        // Verificar que se seleccione una acción si el puntaje total es mayor a 5
        if (puntajeTotal > 5 && !selectedAction) {
            errors.push('Seleccionar una acción')
        }

        if (selectedAction === 'ACEPTAR_CON_CONTROLES') {
            // Verificar que exista al menos una fila de control completamente rellenada
            const completeControles = controles.filter(control =>
                control.control?.trim() && control.responsable?.trim() && control.fechaLimite?.trim()
            )
            if (completeControles.length === 0) {
                errors.push('Agregar al menos 1 control completo')
            }

            // Verificar que las filas añadidas estén completamente rellenadas
            if (controles.length > 0) {
                const incompleteControles = controles.filter(control =>
                    !control.control?.trim() || !control.responsable?.trim() || !control.fechaLimite?.trim()
                )
                if (incompleteControles.length > 0) {
                    errors.push('Todas las filas de controles deben estar completamente rellenadas')
                }
            }
        }

        return errors
    }

    // Función para calcular puntaje basado en respuesta y item específico
    const calcularPuntajeItem = (item: string, respuesta: 'SI' | 'NO' | 'NA' | ''): number => {
        const ponderaciones: { [key: string]: number } = {
            item01: 1, item02: 1, item03: 2, item04: 2, item05: 1, item06: 2,
            item07: 2, item08: 2, item09: 2, item10: 2, item11: 2, item12: 2,
            item13: 1, item14: 1, item15: 1, item16: 2
        }
        const ponderacion = ponderaciones[item] || 0

        switch (item) {
            case 'item01':
            case 'item02':
                return respuesta === 'SI' ? ponderacion : 0
            case 'item03':
                return respuesta === 'SI' ? 2 : respuesta === 'NO' ? 1 : 0
            case 'item04':
            case 'item05':
            case 'item06':
            case 'item08':
            case 'item09':
            case 'item10':
            case 'item12':
                return respuesta === 'SI' ? ponderacion : 0
            case 'item07':
            case 'item11':
                return respuesta === 'SI' ? 0 : respuesta === 'NO' ? 2 : 0
            case 'item13':
            case 'item14':
            case 'item15':
                return respuesta === 'SI' ? 0 : respuesta === 'NO' ? 1 : 0
            case 'item16':
                return respuesta === 'SI' ? 0 : respuesta === 'NO' ? 2 : 0
            default:
                return 0
        }
    }

    // Función para actualizar respuesta
    const handleRespuestaChange = (item: string, value: string | null) => {
        const nuevaRespuesta = (value || '') as 'SI' | 'NO' | 'NA' | ''
        const puntaje = calcularPuntajeItem(item, nuevaRespuesta)

        setCriterios(prev => ({
            ...prev,
            [item]: { ...prev[item], respuesta: nuevaRespuesta, puntaje }
        }))
    }

    // Función para determinar el nivel de riesgo
    const getRiskLevel = (score: number): string => {
        if (score >= 16) return 'CRÍTICO';
        if (score >= 11) return 'ALTO';
        if (score >= 6) return 'MODERADO';
        return 'BAJO';
    };

    const activeLevel = getRiskLevel(puntajeTotal);

    // Función para obtener el estilo de color
    const getColorStyle = (level: string, fullColor: string): React.CSSProperties => {
        return {
            backgroundColor: activeLevel === level ? fullColor : `${fullColor}33` // 33 is 20% opacity
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <section className="border rounded-lg p-3" style={{ borderColor: 'var(--border-color)' }}>
                <div className='flex gap-2 justify-between items-center'>
                    <table className="w-full border-collapse text-xs">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2 font-bold">Código</td>
                                <td className="border border-gray-300 p-2">{codigo}</td>
                                <td className="border border-gray-300 p-2 font-bold">Versión</td>
                                <td className="border border-gray-300 p-2">{version}</td>
                                <td className="border border-gray-300 p-2 font-bold">Fecha de Aprobación</td>
                                <td className="border border-gray-300 p-2">
                                    <Input
                                        type="date"
                                        value={fechaAprobacion}
                                        onChange={(e) => setFechaAprobacion(e.target.value)}
                                        className="h-6 text-xs"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {existingDebidaDiligencia && (
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
                
                <div className="flex items-center justify-center mt-2">
                    <div className="text-md font-bold">
                        DEBIDA DILIGENCIA AL PERSONAL
                    </div>
                </div>
            </section>

            {/* Datos del Personal */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3">DATOS DEL PERSONAL</h3>
                <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)' }}>
                    <table className="w-full border-collapse text-xs">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2 font-bold">Nombre y Apellidos</td>
                                <td className="border border-gray-300 p-2">{nombreCompleto}</td>
                                <td className="border border-gray-300 p-2 font-bold">N° DNI</td>
                                <td className="border border-gray-300 p-2">{aplicacion.candidato?.dni || ''}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 font-bold">Puesto al que Postula</td>
                                <td className="border border-gray-300 p-2">{aplicacion.convocatoria?.cargoNombre || ''}</td>
                                <td className="border border-gray-300 p-2 font-bold">Evaluador</td>
                                <td className="border border-gray-300 p-2">
                                    <SelectSearch
                                        value={evaluadorNombre}
                                        onChange={(value) => {
                                            setEvaluadorNombre(value || '')
                                            // Buscar el ID correspondiente
                                            const selected = empleados.find(e => `${e.nombres} ${e.ap_paterno} ${e.ap_materno}`.trim() === value?.trim())
                                            setEvaluadorId(selected?.id || '')
                                        }}
                                        placeholder="Seleccionar evaluador..."
                                        className="h-8 text-xs"
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        showSearchIcon={true}
                                        options={empleados.map(empleado => ({
                                            value: `${empleado.nombres} ${empleado.ap_paterno} ${empleado.ap_materno}`.trim(),
                                            label: `${empleado.nombres} ${empleado.ap_paterno} ${empleado.ap_materno}`.trim()
                                        }))}
                                        isLoading={loadingEmpleados}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 font-bold">Fecha</td>
                                <td className="border border-gray-300 p-2" colSpan={3}>
                                    <Input
                                        type="date"
                                        value={fechaAprobacion}
                                        onChange={(e) => setFechaAprobacion(e.target.value)}
                                        readOnly={!isEditMode && !!existingDebidaDiligencia}
                                        className="h-6 text-xs"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Nivel de Riesgo */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3 text-center">NIVEL DE RIESGO</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 rounded text-center font-bold text-xs" style={getColorStyle('CRÍTICO', '#ff0000')}>
                        CRÍTICO 16 a 25 {activeLevel === 'CRÍTICO' && <Check className="inline w-3 h-3 ml-1" />}
                    </div>
                    <div className="p-2 rounded text-center font-bold text-xs" style={getColorStyle('ALTO', '#ffc000')}>
                        ALTO 11 a 15 {activeLevel === 'ALTO' && <Check className="inline w-3 h-3 ml-1" />}
                    </div>
                    <div className="p-2 rounded text-center font-bold text-xs" style={getColorStyle('MODERADO', '#ffc000')}>
                        MODERADO 6 a 10 {activeLevel === 'MODERADO' && <Check className="inline w-3 h-3 ml-1" />}
                    </div>
                    <div className="p-2 rounded text-center font-bold text-xs" style={getColorStyle('BAJO', '#92d050')}>
                        BAJO 1 a 5 {activeLevel === 'BAJO' && <Check className="inline w-3 h-3 ml-1" />}
                    </div>
                </div>
            </section>

            {/* Criterios de Evaluación */}
            <section>
                <h3 className="text-xs uppercase font-medium mb-3">CRITERIOS DE EVALUACIÓN</h3>
                <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800/60 font-bold">
                                <th className="border p-2 text-center" style={{ width: '45px' }}>ITEM</th>
                                <th className="border p-2">CRITERIOS</th>
                                <th className="border p-2 text-center" style={{ width: '110px' }}>PONDERACIÓN</th>
                                <th className="border p-2 text-center" style={{ width: '100px' }}>RESPUESTA</th>
                                <th className="border p-2 text-center" style={{ width: '80px' }}>PUNTAJE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-gray-100 dark:bg-gray-800/60 font-bold">
                                <td colSpan={5} className="border border-gray-300 dark:border-gray-600 p-2">UBICACIÓN GEOGRÁFICA</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">1</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2">¿La empresa de la que procede el postulante presenta casos de corrupción, denuncias o mala imagen o se tiene una alta percepción de mala reputación de la misma?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item01.ponderacion}</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center" style={{ verticalAlign: 'middle' }}>
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item01.respuesta}
                                        onChange={(value) => handleRespuestaChange('item01', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item01.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">2</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2">¿La ciudad en la que se desarrollará o se desarrolla el postulante o trabajador hay percepción de corrupción?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item02.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item02.respuesta}
                                        onChange={(value) => handleRespuestaChange('item02', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item02.puntaje}</td>
                            </tr>

                            <tr className="bg-gray-100 dark:bg-gray-800/60 font-bold">
                                <td colSpan={5} className="border border-gray-300 dark:border-gray-600 p-2">TRABAJADOR O POSTULANTE</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">3</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2">El postulante o trabajador llegó a INACONS por recomendación (SI: 2 puntos) - convocatoria (NO: 1 punto) - cambio de puesto (NA: 0 puntos)</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item03.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item03.respuesta}
                                        onChange={(value) => handleRespuestaChange('item03', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item03.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">4</td>
                                <td className="border border-gray-300 p-2">¿El Postulante o Trabajador tiene malas recomendaciones por su ética o incorrecta labor por un anterior jefe? (Si ya es trabajador colocar NA)</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item04.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item04.respuesta}
                                        onChange={(value) => handleRespuestaChange('item04', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item04.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">5</td>
                                <td className="border border-gray-300 p-2">¿El postulante o trabajador actuará en representación de INACONS ante el estado, entidades públicas o privadas, funcionarios?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item05.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item05.respuesta}
                                        onChange={(value) => handleRespuestaChange('item05', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item05.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">6</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2">¿Ha realizado comentarios indicando que cualquier pago particular, contribución u otra actividad es necesaria para "obtener beneficios" o "hacer arreglos"?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item06.ponderacion}</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item06.respuesta}
                                        onChange={(value) => handleRespuestaChange('item06', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item06.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">7</td>
                                <td className="border border-gray-300 p-2">¿El perfil de LinkedIn es igual o similar al que consigna en su CV? (Si no tiene perfil consignar NA)</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item07.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item07.respuesta}
                                        onChange={(value) => handleRespuestaChange('item07', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item07.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">8</td>
                                <td className="border border-gray-300 p-2">¿Según indagaciones iniciales presenta deudas en la SBS? Adjuntar evidencia.</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item08.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item08.respuesta}
                                        onChange={(value) => handleRespuestaChange('item08', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item08.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">9</td>
                                <td className="border border-gray-300 p-2">¿Ha sido sujeto de procesos policiales, penales o judiciales? (Adjuntar declaración jurada)</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item09.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item09.respuesta}
                                        onChange={(value) => handleRespuestaChange('item09', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item09.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">10</td>
                                <td className="border border-gray-300 p-2">¿Tendrá interacción frecuente con funcionarios del gobierno o clase política relacionadas con INACONS?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item10.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item10.respuesta}
                                        onChange={(value) => handleRespuestaChange('item10', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item10.puntaje}</td>
                            </tr>

                            <tr className="bg-gray-100 dark:bg-gray-800/60 font-bold">
                                <td colSpan={5} className="border border-gray-300 p-2">SOBRE SUS FUNCIONES</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">11</td>
                                <td className="border border-gray-300 p-2">¿No tiene experiencia o no cubre expectativas para el puesto?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item11.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item11.respuesta}
                                        onChange={(value) => handleRespuestaChange('item11', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item11.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">12</td>
                                <td className="border border-gray-300 p-2">¿Existe conflicto de interés o riesgo de incumplimiento en la relación laboral?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item12.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item12.respuesta}
                                        onChange={(value) => handleRespuestaChange('item12', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item12.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">13</td>
                                <td className="border border-gray-300 p-2">¿El título se encuentra registrado en SUNEDU?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item13.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item13.respuesta}
                                        onChange={(value) => handleRespuestaChange('item13', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item13.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">14</td>
                                <td className="border border-gray-300 p-2">¿Ha pasado por evaluación de desempeño?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item14.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item14.respuesta}
                                        onChange={(value) => handleRespuestaChange('item14', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item14.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">15</td>
                                <td className="border border-gray-300 p-2">¿En última evaluación obtuvo ≥ 71%?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item15.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item15.respuesta}
                                        onChange={(value) => handleRespuestaChange('item15', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item15.puntaje}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-center">16</td>
                                <td className="border border-gray-300 p-2">¿Mantiene buena relación con todos los niveles de la organización?</td>
                                <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{criterios.item16.ponderacion}</td>
                                <td className="border border-gray-300 p-2">
                                    <Select
                                        options={opcionesRespuesta}
                                        value={criterios.item16.respuesta}
                                        onChange={(value) => handleRespuestaChange('item16', value)}
                                        disabled={!isEditMode && !!existingDebidaDiligencia}
                                        className='text-center h-7 flex items-center justify-center text-[10px]'
                                        placeholder='Seleccionar'
                                    />
                                </td>
                                <td className="border border-gray-300 p-2 text-center">{criterios.item16.puntaje}</td>
                            </tr>
                            <tr className="font-bold">
                                <td colSpan={4} className="border border-gray-300 p-2 text-right">TOTAL DEL PROCESO DE EVALUACIÓN</td>
                                <td className="border border-gray-300 p-2 text-center">{puntajeTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {puntajeTotal > 5 && (
                <>
                    {/* Acciones a Tomar */}
                    <section>
                        <h3 className="text-xs uppercase font-medium mb-3">ACCIONES A TOMAR SI EL RIESGO ES CRÍTICO, ALTO O MODERADO</h3>
                        <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-color)' }}>
                            <table className="w-full text-xs">
                                <tbody>
                                    <tr>
                                        <td className="p-2">
                                            <label className="flex items-center space-x-2">
                                                <input type="radio" name="acciones" value="NO_ESTABLECER" checked={selectedAction === 'NO_ESTABLECER'} onChange={(e) => setSelectedAction(e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                                <span>No establecer la relación con el Postulante</span>
                                            </label>
                                        </td>
                                        <td className="p-2">
                                            <label className="flex items-center space-x-2">
                                                <input type="radio" name="acciones" value="SUSPENDER" checked={selectedAction === 'SUSPENDER'} onChange={(e) => setSelectedAction(e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                                <span>Suspender la relación con el Trabajador</span>
                                            </label>
                                        </td>
                                        <td className="p-2">
                                            <label className="flex items-center space-x-2">
                                                <input type="radio" name="acciones" value="TERMINAR" checked={selectedAction === 'TERMINAR'} onChange={(e) => setSelectedAction(e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                                <span>Terminar la relación con el Trabajador</span>
                                            </label>
                                        </td>
                                        <td className="p-2">
                                            <label className="flex items-center space-x-2">
                                                <input type="radio" name="acciones" value="ACEPTAR_CON_CONTROLES" checked={selectedAction === 'ACEPTAR_CON_CONTROLES'} onChange={(e) => setSelectedAction(e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                                <span>Aceptar la relación y establecer controles</span>
                                            </label>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {selectedAction === 'ACEPTAR_CON_CONTROLES' && (
                <>
                    {/* Controles */}
                    <section>
                        <h3 className="text-xs uppercase font-medium mb-3">CONTROLES (SI SE APRUEBA CONTINUAR)</h3>
                        <div className="rounded-lg overflow-x-auto">
                            <table className="w-full border-collapse text-xs border border-gray-300 dark:border-gray-600">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800/60 font-bold">
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">ITEM</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">CRITERIOS</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">RESPONSABLE</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">RESPUESTA</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {controles.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center p-2">
                                                <Button onClick={addControl} variant="outline" color="blue" disabled={!isEditMode && !!existingDebidaDiligencia} icon={<Plus className="w-4 h-4" />}>Agregar</Button>
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {controles.map((control, index) => (
                                                <tr key={index} className="">
                                                    <td className="border border-gray-300 p-2 text-center">{control.item}</td>
                                                    <td className="border border-gray-300 p-2">
                                                        <Textarea value={control.control} onChange={(e) => updateControl(index, 'control', e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="w-full p-1 text-xs" />
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-center">
                                                        <Input
                                                            value={control.responsable}
                                                            onChange={(e) => updateControl(index, 'responsable', e.target.value)}
                                                            placeholder="Escribir responsable..."
                                                            disabled={!isEditMode && !!existingDebidaDiligencia}
                                                            className="h-8 text-xs"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-center">
                                                        <input type="date" value={control.fechaLimite} onChange={(e) => updateControl(index, 'fechaLimite', e.target.value)} disabled={!isEditMode && !!existingDebidaDiligencia} className="border border-gray-300 p-1 text-xs" />
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-center">
                                                        <button onClick={() => removeControl(index)} disabled={!isEditMode && !!existingDebidaDiligencia} className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed">X</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={5} className="text-center p-2">
                                                    <Button onClick={addControl} variant="outline" icon={<Plus className="w-4 h-4" />}>Agregar</Button>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {/* Botones de acción */}
            <section>
                <div className="flex items-center justify-center gap-3">
                    {isEditMode ? (
                        <>
                            <Button
                                variant="outline"
                                size="xs"
                                color='green'
                                onClick={handleCancelEdit}
                                disabled={loadingCrear || loadingActualizar || loadingDebidaDiligencia}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="custom"
                                color="primary"
                                size="xs"
                                icon={<Save className="w-4 h-4" />}
                                onClick={handleSave}
                                disabled={loadingCrear || loadingActualizar || loadingDebidaDiligencia || !hasChanges}
                            >
                                {loadingCrear || loadingActualizar ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="custom"
                            color="primary"
                            size="xs"
                            icon={existingDebidaDiligencia ? <Edit className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            onClick={existingDebidaDiligencia ? handleEditMode : handleSave}
                            disabled={loadingCrear || loadingActualizar || loadingDebidaDiligencia}
                        >
                            {loadingCrear || loadingActualizar || loadingDebidaDiligencia ? 'Cargando...' : (existingDebidaDiligencia ? 'Editar' : 'Crear Evaluación')}
                        </Button>
                    )}
                </div>
            </section>

            {/* Modal del PDF */}
            <Modal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                title="PDF de Debida Diligencia"
                size="lg-tall"
            >
                {isGeneratingPdf ? (
                    <div className="flex items-center justify-center h-64">
                        <p>Generando PDF...</p>
                    </div>
                ) : pdfBlobUrl ? (
                    <iframe
                        src={pdfBlobUrl}
                        className="w-full h-full border-0"
                        title="PDF de Debida Diligencia"
                    />
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p>Error al cargar el PDF</p>
                    </div>
                )}
            </Modal>
        </div>
    )
}
