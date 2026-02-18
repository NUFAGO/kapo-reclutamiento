'use client'

import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, FileText, Download, Eye, X } from 'lucide-react'
import { FaRegFilePdf } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Modal from '@/components/ui/modal'

interface RecepcionCVTabProps {
    aplicacion: AplicacionCandidato
}

export function RecepcionCVTab({ aplicacion }: RecepcionCVTabProps) {
    const { candidato, convocatoria, pretensionEconomica, aniosExperienciaPuesto, curriculumUrl } = aplicacion
    const [showCVModal, setShowCVModal] = useState(false)

    // Formatear pretensión económica
    const pretensionFormateada = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
    }).format(pretensionEconomica)

    // Nombre completo
    const nombreCompleto = candidato
        ? `${candidato.nombres} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`.trim()
        : 'Sin información'

    const experienciaGeneral = aplicacion.aniosExperienciaGeneral ?? aplicacion.respuestasFormulario?.['anios_experiencia_general'] ?? aplicacion.respuestasFormulario?.['experiencia_general']

    return (
        <>
            <div className="space-y-6">
                {/* Información Personal */}
                <section>
                    <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        Información Personal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Nombres */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Nombres
                            </label>
                            <Input value={candidato?.nombres || 'N/A'} readOnly className="h-8 text-xs" />
                        </div>

                        {/* Apellido Paterno */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Apellido Paterno
                            </label>
                            <Input value={candidato?.apellidoPaterno || 'N/A'} readOnly className="h-8 text-xs" />
                        </div>

                        {/* Apellido Materno */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Apellido Materno
                            </label>
                            <Input value={candidato?.apellidoMaterno || 'N/A'} readOnly className="h-8 text-xs" />
                        </div>

                        {/* DNI */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                DNI
                            </label>
                            <Input value={candidato?.dni || 'N/A'} readOnly className="h-8 text-xs" />
                        </div>
                    </div>
                </section>

                {/* Información de Contacto */}
                <section>
                    <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Correo */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Input value={candidato?.correo || 'N/A'} readOnly className="h-8 text-xs" />
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Teléfono
                            </label>
                            <div className="relative">
                                <Input value={candidato?.telefono || 'N/A'} readOnly className="h-8 text-xs" />
                            </div>
                        </div>

                        {/* Lugar de Residencia */}
                        {candidato?.lugarResidencia && (
                            <div className="space-y-1 ">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Lugar de Residencia
                                </label>
                                <div className="relative">
                                    <Input value={candidato.lugarResidencia} readOnly className="h-8 text-xs" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Información Laboral */}
                <section>
                    <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        Información Laboral
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Cargo al que postula */}
                        <div className="space-y-1 ">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Cargo
                            </label>
                            <div className="relative">

                                <Input value={convocatoria?.cargoNombre || 'N/A'} readOnly className="h-8 text-xs " />
                            </div>
                        </div>

                        {/* Años de experiencia en el puesto */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Experiencia en el Puesto
                            </label>
                            <div className="relative">
                                <Input value={`${aniosExperienciaPuesto} ${aniosExperienciaPuesto === 1 ? 'año' : 'años'}`} readOnly className="h-8 text-xs" />
                            </div>
                        </div>

                        {/* Años de experiencia general */}
                        {experienciaGeneral !== undefined && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Experiencia General
                                </label>
                                <div className="relative">

                                    <Input value={`${experienciaGeneral}`} readOnly className="h-8 text-xs " />
                                </div>
                            </div>
                        )}

                        {/* Pretensión Económica */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Pretensión Económica
                            </label>
                            <div className="relative">

                                <Input value={pretensionFormateada} readOnly className="h-8 text-xs  font-semibold" />
                            </div>
                        </div>

                        {/* Medio de Convocatoria */}
                        {aplicacion.medioConvocatoria && (
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    Medio de Convocatoria
                                </label>
                                <Input value={aplicacion.medioConvocatoria} readOnly className="h-8 text-xs" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Curriculum Vitae */}
                <section>
                    <h3 className="text-xs uppercase font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Curriculum Vitae
                    </h3>
                    <div className="p-4 rounded-lg border" style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)'
                    }}>
                        {curriculumUrl ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-[#ff000017] ">
                                        <FaRegFilePdf className="w-5 h-5 text-[red]" style={{ stroke: '#dc2626', strokeWidth: '1.5' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {(() => {
                                                const fileName = curriculumUrl?.split('/').pop();
                                                if (!fileName) return 'Documento adjunto';
                                                return fileName.length > 35 ? fileName.substring(0, 35) + '...' : fileName;
                                            })()}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            Documento adjunto
                                        </p>
                                    </div>
                                </div>
                                <div className='flex gap-1.5'>
                                    <Button
                                        variant="subtle"
                                        color="success"
                                        size="icon"
                                >
                                    <a
                                        href={curriculumUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </Button>

                                <Button
                                    variant="subtle"
                                    color="primary"
                                    size="icon"
                                    onClick={() => setShowCVModal(true)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                </div>

                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />

                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                No hay curriculum adjunto
                            </p>
                        </div>
                    )}
                </div>
                </section>
            </div>
            
            {/* Modal para ver CV */}
            <Modal
                isOpen={showCVModal}
                onClose={() => setShowCVModal(false)}
                title="Curriculum Vitae"
                size="lg-tall"
                headerBackground="bg-gradient-to-r from-blue-600 to-purple-600"
            >
                <div className="w-full h-full">
                    {curriculumUrl ? (
                        <iframe
                            src={curriculumUrl}
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
        </>
    )
}
