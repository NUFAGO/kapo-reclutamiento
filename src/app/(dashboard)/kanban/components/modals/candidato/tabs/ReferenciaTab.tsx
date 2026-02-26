'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { UserCheck, Save, Edit, Plus, Phone, Building, FileText, MessageSquare, X, ChevronRight } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { showSuccess, showError, TOAST_DURATIONS } from '@/lib/toast-utils'
import {
    useReferenciasPorAplicacion,
    useCrearReferencia,
    useActualizarReferencia
} from '@/hooks/useReferencias'
import { Referencia } from '@/hooks/useReferencias'
import { useFileUpload } from '@/hooks/useFileUpload'
import toast from 'react-hot-toast'

interface ReferenciaTabProps {
    aplicacion: AplicacionCandidato
    onValidationChange?: (isValid: boolean) => void
    viewOnly?: boolean
}

interface FormData {
    numero_telefono: string
    nombresyapellidos: string
    detalles: string
    empresa: string
    comentarios: string
    archivos: File[]
    archivosurl: string[]
}

export function ReferenciaTab({ aplicacion, onValidationChange, viewOnly = false }: ReferenciaTabProps) {
    const { data: referencias, isLoading: loadingReferencias } = useReferenciasPorAplicacion(aplicacion.id)
    const { mutateAsync: crearReferencia, isPending: loadingCrear } = useCrearReferencia()
    const { mutateAsync: actualizarReferencia, isPending: loadingActualizar } = useActualizarReferencia()
    const { uploadMultipleFiles, deleteFile, isUploading, error: uploadError, clearError } = useFileUpload()

    // Report validation when data is loaded
    React.useEffect(() => {
        if (!loadingReferencias) {
            onValidationChange?.(!!(referencias && referencias.length > 0))
        }
    }, [referencias, loadingReferencias])

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list')
    const [editingReferencia, setEditingReferencia] = useState<Referencia | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalData, setOriginalData] = useState<FormData | null>(null)

    const [formData, setFormData] = useState<FormData>({
        numero_telefono: '',
        nombresyapellidos: '',
        detalles: '',
        empresa: '',
        comentarios: '',
        archivos: [],
        archivosurl: []
    })

    useEffect(() => {
        if (referencias && referencias.length > 0) {
            setViewMode('list')
        } else {
            setViewMode('form')
        }
    }, [referencias])

    useEffect(() => {
        if (editingReferencia) {
            const loadedData = {
                numero_telefono: editingReferencia.numero_telefono,
                nombresyapellidos: editingReferencia.nombresyapellidos,
                detalles: editingReferencia.detalles || '',
                empresa: editingReferencia.empresa || '',
                comentarios: editingReferencia.comentarios || '',
                archivos: [],
                archivosurl: editingReferencia.archivosurl || []
            }
            setFormData(loadedData)
            setOriginalData(loadedData)
            setIsEditMode(true)
            setHasChanges(false)
            setViewMode('form')
        }
    }, [editingReferencia])

    useEffect(() => {
        if (originalData && isEditMode) {
            const hasAnyChanges = (
                formData.numero_telefono !== originalData.numero_telefono ||
                formData.nombresyapellidos !== originalData.nombresyapellidos ||
                formData.detalles !== originalData.detalles ||
                formData.empresa !== originalData.empresa ||
                formData.comentarios !== originalData.comentarios ||
                JSON.stringify(formData.archivosurl.sort()) !== JSON.stringify(originalData.archivosurl.sort()) ||
                formData.archivos.length > 0
            )
            setHasChanges(hasAnyChanges)
        } else {
            setHasChanges(false)
        }
    }, [formData, originalData, isEditMode])

    const handleInputChange = (field: keyof FormData, value: string | File[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (files: File[]) => {
        setFormData(prev => ({ ...prev, archivos: files }))
    }

    const handleEditMode = () => setIsEditMode(true)

    const handleCancelEdit = () => {
        if (originalData) setFormData(originalData)
        setIsEditMode(false)
        setHasChanges(false)
        setEditingReferencia(null)
        if (referencias && referencias.length > 0) {
            setViewMode('list')
        } else {
            setViewMode('form')
        }
    }

    const handleNuevaReferencia = () => {
        setEditingReferencia(null)
        setFormData({ numero_telefono: '', nombresyapellidos: '', detalles: '', empresa: '', comentarios: '', archivos: [], archivosurl: [] })
        setOriginalData(null)
        setIsEditMode(false)
        setHasChanges(false)
        setViewMode('form')
    }

    const handleEditarReferencia = (referencia: Referencia) => {
        setEditingReferencia(referencia)
        setIsEditMode(true)
    }

    const validateForm = (): string[] => {
        const errors: string[] = []
        if (!formData.numero_telefono?.trim()) errors.push('Número de Teléfono')
        if (!formData.nombresyapellidos?.trim()) errors.push('Nombres y Apellidos')
        return errors
    }

    const handleSave = async () => {
        const validationErrors = validateForm()
        if (validationErrors.length > 0) {
            let missingFieldsMessage = validationErrors.length <= 2
                ? validationErrors.join(', ')
                : `${validationErrors.slice(0, 2).join(', ')}, etc`
            showError(`Faltan completar los siguientes campos: ${missingFieldsMessage}`, { duration: TOAST_DURATIONS.LONG })
            return
        }

        // Check reference limit
        if (!editingReferencia && referencias && referencias.length >= 3) {
            showError('No se pueden agregar más de 3 referencias por candidato.', { duration: TOAST_DURATIONS.NORMAL })
            return
        }

        try {
            let archivosUrls: string[] = [...formData.archivosurl]
            if (formData.archivos.length > 0) {
                const resultado = await uploadMultipleFiles(formData.archivos, { tipo: 'CV_DOCUMENTOS' })
                if (resultado.successful.length > 0) {
                    archivosUrls = [...archivosUrls, ...resultado.successful.map(f => f.url)]
                }
                if (resultado.failed.length > 0) {
                    showError(`Error al subir ${resultado.failed.length} archivo(s)`, { duration: TOAST_DURATIONS.LONG })
                    return
                }
            }

            if (editingReferencia && originalData) {
                const removedUrls = originalData.archivosurl.filter(url => !formData.archivosurl.includes(url))
                if (removedUrls.length > 0) {
                    const deleteResults = await Promise.allSettled(removedUrls.map(url => deleteFile(url)))
                    const failedDeletes = deleteResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
                    if (failedDeletes.length > 0) {
                        showError(`Error al eliminar ${failedDeletes.length} archivo(s) del storage. Los cambios se guardarán de todos modos.`, { duration: TOAST_DURATIONS.LONG })
                    }
                }
            }

            const saveData: any = {
                aplicacionCandidatoId: aplicacion.id,
                candidatoId: aplicacion.candidatoId,
                numero_telefono: formData.numero_telefono,
                nombresyapellidos: formData.nombresyapellidos,
                archivosurl: archivosUrls
            }
            if (formData.detalles.trim()) saveData.detalles = formData.detalles
            if (formData.empresa.trim()) saveData.empresa = formData.empresa
            if (formData.comentarios.trim()) saveData.comentarios = formData.comentarios

            if (editingReferencia) {
                const updateData: any = {
                    numero_telefono: saveData.numero_telefono,
                    nombresyapellidos: saveData.nombresyapellidos,
                    archivosurl: saveData.archivosurl
                }
                if (saveData.detalles !== undefined) updateData.detalles = saveData.detalles
                if (saveData.empresa !== undefined) updateData.empresa = saveData.empresa
                if (saveData.comentarios !== undefined) updateData.comentarios = saveData.comentarios
                await actualizarReferencia({ id: editingReferencia.id, input: updateData })
                showSuccess('Referencia actualizada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            } else {
                await crearReferencia(saveData)
                showSuccess('Referencia creada correctamente', { duration: TOAST_DURATIONS.NORMAL })
            }

            setOriginalData(formData)
            setIsEditMode(false)
            setHasChanges(false)
            setEditingReferencia(null)
            setViewMode('list')
        } catch (error) {
            console.error('Error saving reference:', error)
            showError('Error al guardar la referencia. Inténtalo nuevamente.', { duration: TOAST_DURATIONS.LONG })
        }
    }

    const loading = loadingReferencias || loadingCrear || loadingActualizar || isUploading

    // Helper function to extract filename from URL
    const getFileNameFromUrl = (url: string): string => {
        const parts = url.split('/')
        const fileName = parts[parts.length - 1]
        return fileName.includes('?') ? fileName.split('?')[0] : fileName
    }

    // ─── File Upload Component ───────────────────────────────────────────────
    const FileUploadComponent = () => {
        const [isDragOver, setIsDragOver] = useState(false)
        const fileInputRef = useRef<HTMLInputElement>(null)

        const maxFiles = 3
        const maxSize = 3 * 1024 * 1024
        const allowedTypes = [
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png', 'image/jpg'
        ]

        const validateFile = (file: File): string | null => {
            if (file.size > maxSize) return `El archivo "${file.name}" supera el límite de 3MB`
            if (!allowedTypes.includes(file.type)) return `Archivo no permitido: PDF, DOC, DOCX, JPG, PNG`
            return null
        }

        const processFiles = (fileList: FileList | null) => {
            if (!fileList) return
            const newFiles: File[] = []
            const errors: string[] = []
            Array.from(fileList).forEach(file => {
                if (formData.archivos.length + newFiles.length >= maxFiles) { errors.push('Máximo 3 archivos permitidos'); return }
                const exists = [...formData.archivos, ...newFiles].some(f => f.name === file.name && f.size === file.size)
                if (exists) { errors.push(`Archivo duplicado: ${file.name}`); return }
                const validationError = validateFile(file)
                if (validationError) { errors.push(validationError); return }
                newFiles.push(file)
            })
            if (errors.length > 0) toast.error(errors.join('\n'))
            if (newFiles.length > 0) handleFileChange([...formData.archivos, ...newFiles])
        }

        const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); processFiles(e.dataTransfer.files) }
        const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
        const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }

        const removeFile = (index: number) => handleFileChange(formData.archivos.filter((_, i) => i !== index))
        const removeExistingFile = (index: number) => setFormData(prev => ({ ...prev, archivosurl: prev.archivosurl.filter((_, i) => i !== index) }))

        const getFileNameFromUrl = (url: string): string => {
            const parts = url.split('/')
            const fileName = parts[parts.length - 1]
            return fileName.includes('?') ? fileName.split('?')[0] : fileName
        }

        const totalUsed = formData.archivos.length + formData.archivosurl.length

        return (
            <div className="space-y-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => processFiles(e.target.files)}
                    className="hidden"
                />

                {/* Drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer
                        transition-all duration-200
                        ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
                        ${totalUsed >= maxFiles ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FileText className={`w-4 h-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700">
                            {totalUsed >= maxFiles ? 'Límite de archivos alcanzado' : 'Adjuntar archivos'}
                        </p>
                        <p className="text-xs text-gray-400">PDF, DOC, JPG · máx. 3MB · {totalUsed}/{maxFiles}</p>
                    </div>
                    {totalUsed > 0 && (
                        <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                            {totalUsed} archivo{totalUsed !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Archivos existentes (URLs) */}
                {formData.archivosurl.map((url, index) => (
                    <div key={`existing-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-green-600 flex-shrink-0">
                            <FileText className="w-3 h-3 text-white" />
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-xs truncate hover:text-blue-600 hover:underline" style={{ color: 'var(--text-primary)' }}>
                            {getFileNameFromUrl(url)}
                        </a>
                        <button type="button" onClick={() => removeExistingFile(index)}
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Archivos nuevos (Files) */}
                {formData.archivos.map((file, index) => (
                    <div key={`new-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600 flex-shrink-0">
                            <FileText className="w-3 h-3 text-white" />
                        </div>
                        <span className="flex-1 text-xs truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                        <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                        <button type="button" onClick={() => removeFile(index)}
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    // ─── Form View ───────────────────────────────────────────────────────────
    const renderReferenciaSection = () => (
        <section>
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="uppercase text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <UserCheck className="w-3.5 h-3.5" />
                        {editingReferencia ? 'Editar Referencia' : 'Nueva Referencia'}
                    </h3>
                    {editingReferencia && !isEditMode && (
                        <button
                            onClick={handleEditMode}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <Edit className="w-3 h-3" />
                            Editar
                        </button>
                    )}
                </div>

            {/* Form fields */}
            <div className="space-y-4">
                {/* Nombres y Apellidos — full width */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Nombres y Apellidos <span className="text-red-400 normal-case tracking-normal">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Nombres y apellidos de la referencia"
                        className="h-8 text-xs"
                        value={formData.nombresyapellidos}
                        onChange={(e) => handleInputChange('nombresyapellidos', e.target.value)}
                        readOnly={!isEditMode && !!editingReferencia}
                    />
                </div>

                {/* Teléfono + Empresa — 2 cols */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Teléfono <span className="text-red-400 normal-case tracking-normal">*</span>
                        </label>
                        <Input
                            type="tel"
                            placeholder="+51 999 999 999"
                            className="h-8 text-xs"
                            value={formData.numero_telefono}
                            onChange={(e) => {
                                // Only allow numbers and limit to 9 digits
                                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 9)
                                handleInputChange('numero_telefono', numericValue)
                            }}
                            readOnly={!isEditMode && !!editingReferencia}
                            maxLength={9}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Empresa</label>
                        <Input
                            type="text"
                            placeholder="Nombre de la empresa"
                            className="h-8 text-xs"
                            value={formData.empresa}
                            onChange={(e) => handleInputChange('empresa', e.target.value)}
                            readOnly={!isEditMode && !!editingReferencia}
                        />
                    </div>
                </div>

                {/* Detalles */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Detalles</label>
                    <textarea
                        placeholder="Información adicional sobre la referencia..."
                        className="w-full h-20 px-3 py-2 text-xs border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        value={formData.detalles}
                        onChange={(e) => handleInputChange('detalles', e.target.value)}
                        readOnly={!isEditMode && !!editingReferencia}
                    />
                </div>

                {/* Archivos */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Archivos adjuntos</label>
                    <FileUploadComponent />
                </div>

                {/* Comentarios */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Comentarios</label>
                    <textarea
                        placeholder="Comentarios adicionales..."
                        className="w-full h-20 px-3 py-2 text-xs border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        value={formData.comentarios}
                        onChange={(e) => handleInputChange('comentarios', e.target.value)}
                        readOnly={!isEditMode && !!editingReferencia}
                    />
                </div>
            </div>

            {/* Action buttons */}
            {!viewOnly && (
                <div className="flex items-center justify-center gap-2 ">
                    {(referencias && referencias.length > 0) && (
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={handleCancelEdit}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        variant="custom"
                        color="primary"
                        size="xs"
                        icon={<Save className="w-3.5 h-3.5" />}
                        onClick={handleSave}
                        disabled={loading || (isEditMode && !hasChanges && !!editingReferencia) || (!editingReferencia && referencias && referencias.length >= 3)}
                    >
                        {loading ? 'Guardando...' : (editingReferencia ? 'Actualizar' : 'Guardar')}
                    </Button>
                </div>
            )}
        </div>
    </section>
)

// ─── List View ───────────────────────────────────────────────────────────
const renderReferenciasList = () => (
    <section>
        <div className="space-y-4">
            
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <UserCheck className="w-3.5 h-3.5" />
                        Referencias
                        <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                            ({referencias?.length || 0})
                        </span>
                    </h3>
                    <Button
                        variant="custom"
                        color="primary"
                        size="xs"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={handleNuevaReferencia}
                    >
                        Nueva
                    </Button>
                </div>

            {/* Cards */}
            <div className="space-y-2.5">
                {referencias?.map((referencia) => (
                    <div
                        key={referencia.id}
                        className="group relative rounded-xl p-4 hover:shadow-sm transition-all duration-150"
                        style={{
                            backgroundColor: 'var(--card-bg)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        {/* Top row: name + edit button */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-white">
                                        {referencia.nombresyapellidos.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        {referencia.nombresyapellidos}
                                    </p>
                                    {referencia.empresa && (
                                        <p className="text-xs truncate leading-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                            {referencia.empresa}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                color="secondary"
                                size="xs"
                                icon={<Edit className="w-3 h-3" />}
                                onClick={() => handleEditarReferencia(referencia)}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-150"
                            >
                                Editar
                            </Button>
                        </div>

                        {/* Info pills row */}
                        <div className="flex flex-wrap gap-2">
                            {referencia.numero_telefono && (
                                <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                                    <Phone className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{referencia.numero_telefono}</span>
                                </div>
                            )}
                            {referencia.archivosurl && referencia.archivosurl.map((url, index) => (
                                <div key={`file-${index}`} className="flex items-center gap-1.5 rounded-md px-2.5 py-1 border bg-blue-300/10 dark:bg-blue-200/5">
                                    <FileText className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                                    <a href={url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs font-medium hover:text-blue-600 hover:underline truncate max-w-24" style={{ color: 'var(--text-primary)' }}>
                                        {getFileNameFromUrl(url)}
                                    </a>
                                </div>
                            ))}
                        </div>

                        {/* Optional text fields */}
                        {(referencia.detalles || referencia.comentarios) && (
                            <div className="mt-3 space-y-1.5">
                                {referencia.detalles && (
                                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Detalles: </span>
                                        {referencia.detalles}
                                    </p>
                                )}
                                {referencia.comentarios && (
                                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Comentarios: </span>
                                        {referencia.comentarios}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </section>
    )

    // ─── Root ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {viewMode === 'list' && referencias && referencias.length > 0
                ? renderReferenciasList()
                : <div className="max-w-md mx-auto">{renderReferenciaSection()}</div>
            }
        </div>
    )
}