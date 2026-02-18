'use client'

import { useState, useEffect } from 'react'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { Calendar, Mail, Clock, Save, Edit } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { showSuccess, showError, TOAST_DURATIONS } from '@/lib/toast-utils'
import {
    useEntrevistaRegularPorAplicacion,
    useCrearEntrevistaRegular,
    useActualizarEntrevistaRegular
} from '@/hooks/useEntrevistasRegulares'
import { useAuth, useUsuarios, Usuario } from '@/hooks'
import { SelectSearch } from '@/components/ui/select-search'

interface SegundoEntrevistaTabProps {
    aplicacion: AplicacionCandidato
    usuariosOptions?: Usuario[]
    loadingUsuarios?: boolean
    loadingEntrevista?: boolean
}

interface FormData {
    fecha: string
    hora: string
    correo: string
    entrevistadorId: string
}

export function SegundoEntrevistaTab({ aplicacion }: SegundoEntrevistaTabProps) {
    const { user } = useAuth()

    // Cargar usuarios inicialmente para el SelectSearch
    const { usuarios: usuariosOptions, loading: loadingUsuarios } = useUsuarios({ pagination: { page: 1, limit: 10000 } })

    // Hook para manejar la entrevista
    const { entrevista, loading: loadingEntrevista } = useEntrevistaRegularPorAplicacion(aplicacion.id, 'SEGUNDA')
    const { crearEntrevista, loading: loadingCrear } = useCrearEntrevistaRegular()
    const { actualizarEntrevista, loading: loadingActualizar } = useActualizarEntrevistaRegular()

    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalData, setOriginalData] = useState<FormData | null>(null)

    const [formData, setFormData] = useState<FormData>({
        fecha: '',
        hora: '',
        correo: '',
        entrevistadorId: ''
    })

    // Cargar datos cuando existe entrevista
    useEffect(() => {
        if (entrevista) {
            const loadedData = {
                fecha: new Date(entrevista.fecha_entrevista).toISOString().split('T')[0],
                hora: entrevista.hora_entrevista,
                correo: entrevista.correo_contacto,
                entrevistadorId: entrevista.entrevistador_nombre || ''
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

    // Función para manejar cambios en inputs
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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

    // Función para validar formato de correo electrónico
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Función para validar campos requeridos
    const validateForm = (): string[] => {
        const errors: string[] = []

        if (!formData.entrevistadorId?.trim()) {
            errors.push('Entrevistador')
        }
        if (!formData.fecha?.trim()) {
            errors.push('Fecha de Entrevista')
        }
        if (!formData.hora?.trim()) {
            errors.push('Hora de Entrevista')
        }
        if (formData.correo?.trim() && !isValidEmail(formData.correo)) {
            errors.push('Correo Electrónico (formato inválido)')
        }

        return errors
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
            // Encontrar el usuario seleccionado por nombre
            const selectedUser = usuariosOptions.find(u => `${u.nombres} ${u.apellidos}`.trim() === formData.entrevistadorId.trim())

            const saveData = {
                aplicacionCandidatoId: aplicacion.id,
                candidatoId: aplicacion.candidatoId,
                tipo_entrevista: 'SEGUNDA' as const,
                fecha_entrevista: new Date(formData.fecha).toISOString(),
                hora_entrevista: formData.hora,
                correo_contacto: formData.correo,
                entrevistador_id: selectedUser?.id || user?.id || '',
                entrevistador_nombre: formData.entrevistadorId || user?.nombresA || 'Usuario no identificado'
            }

            if (entrevista) {
                // Actualizar entrevista existente
                await actualizarEntrevista({ id: entrevista.id, input: {
                    fecha_entrevista: saveData.fecha_entrevista,
                    hora_entrevista: saveData.hora_entrevista,
                    correo_contacto: saveData.correo_contacto,
                    entrevistador_id: saveData.entrevistador_id,
                    entrevistador_nombre: saveData.entrevistador_nombre
                }})
                showSuccess('Entrevista actualizada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            } else {
                // Crear nueva entrevista
                await crearEntrevista(saveData)
                showSuccess('Entrevista creada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            }

            setOriginalData(formData)
            setIsEditMode(false)
            setHasChanges(false)
        } catch (error) {
            console.error('Error saving interview:', error)
            showError('Error al guardar la entrevista. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    const loading = loadingEntrevista || loadingCrear || loadingActualizar

    // Renderizar sección de entrevista
    const renderEntrevistaSection = (title: string) => (
        <section>
            <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                {title}
            </h3>
            <div className="grid grid-cols-1 gap-3">
                {/* Entrevistador */}
                <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Entrevistador
                    </label>
                    <SelectSearch
                        value={formData.entrevistadorId}
                        onChange={(value) => handleInputChange('entrevistadorId', value || '')}
                        placeholder="Seleccionar entrevistador..."
                        className="h-8 text-xs"
                        disabled={!isEditMode && !!entrevista}
                        showSearchIcon={true}
                        options={usuariosOptions.map(usuario => ({
                            value: `${usuario.nombres} ${usuario.apellidos}`.trim(),
                            label: `${usuario.nombres} ${usuario.apellidos}`.trim()
                        }))}
                        isLoading={loadingUsuarios}
                    />
                </div>

                {/* Fecha */}
                <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Fecha de Entrevista
                    </label>
                    <Input
                        type="date"
                        className="h-8 text-xs"
                        value={formData.fecha}
                        onChange={(e) => handleInputChange('fecha', e.target.value)}
                        readOnly={!isEditMode && !!entrevista}
                    />
                </div>

                {/* Hora */}
                <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Hora de Entrevista
                    </label>
                    <Input
                        type="time"
                        className="h-8 text-xs"
                        value={formData.hora}
                        onChange={(e) => handleInputChange('hora', e.target.value)}
                        readOnly={!isEditMode && !!entrevista}
                    />
                </div>

                {/* Correo */}
                <div className="space-y-1">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Correo Electrónico
                    </label>
                    <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="h-8 text-xs"
                        value={formData.correo}
                        onChange={(e) => handleInputChange('correo', e.target.value)}
                        readOnly={!isEditMode && !!entrevista}
                    />
                </div>
            </div>
        </section>
    )

    return (
        <div className="space-y-6">
            {/* Segunda Entrevista */}
            <div className="max-w-md mx-auto">
                {renderEntrevistaSection('Segunda Entrevista')}
            </div>

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
        </div>
    )
}