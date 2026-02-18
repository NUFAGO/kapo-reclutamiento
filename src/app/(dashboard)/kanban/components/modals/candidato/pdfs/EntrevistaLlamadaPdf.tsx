import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'

// Registramos una fuente estándar (opcional, pero ayuda a la consistencia)
// Font.register({ family: 'Helvetica', fonts: [{ src: '...' }] });

const styles = StyleSheet.create({
    page: {
        padding: 30, // Márgenes de la hoja
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.3,
    },
    // Estilos para simular tablas con bordes
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 20, // Altura mínima de fila
        alignItems: 'stretch',
    },
    tableRowLast: {
        flexDirection: 'row',
        borderBottomWidth: 0,
        minHeight: 20,
    },
    // Celdas
    cell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        justifyContent: 'center',
    },
    cellLast: {
        padding: 4,
        borderRightWidth: 0,
        justifyContent: 'center',
    },
    // Tipos de celda específicos
    headerLabel: {
        backgroundColor: '#f2f2f2', // Fondo gris claro
        fontWeight: 'bold',
        fontSize: 8,
    },
    headerValue: {
        backgroundColor: '#ffffff',
    },
    // Estilos de texto
    textBold: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },
    textCenter: {
        textAlign: 'center',
    },
    // Checkbox visual
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    checkbox: {
        width: 10,
        height: 10,
        borderWidth: 1,
        borderColor: '#000',
        marginLeft: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        backgroundColor: '#000',
        width: 6,
        height: 6,
    },
    // Título principal
    mainTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    sectionHeader: {
        backgroundColor: '#404040',
        color: 'white',
        fontFamily: 'Helvetica-Bold',
        fontSize: 6,
        padding: 4,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: '#000',
    }
})

// Componente auxiliar para Checkbox
const Checkbox = ({ checked, label }: { checked: boolean, label?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        {label && <Text style={{ fontSize: 8, marginRight: 4 }}>{label}</Text>}
        <View style={styles.checkbox}>
            {checked && <View style={styles.checked} />}
        </View>
    </View>
);

interface EntrevistaLlamadaPdfProps {
    aplicacion: AplicacionCandidato
    entrevista?: any
}

export function EntrevistaLlamadaPdf({ aplicacion, entrevista }: EntrevistaLlamadaPdfProps) {
    if (!entrevista) return null

    // Formateadores de fecha y moneda
    const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('es-PE')
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return ''
        return `S/ ${amount.toLocaleString('es-PE')}`
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                {/* --- HEADER ISO --- */}
                <View style={[styles.table, { marginBottom: 5 }]}>
                    <View style={[styles.tableRow, { height: 35 }]}>
                        {/* Logo */}
                        <View style={[styles.cell, { width: '40%', alignItems: 'center', justifyContent: 'center', padding: 2 }]}>
                            <Image
                                src="/logo-inacons.png"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </View>
                        {/* Título */}
                        <View style={[styles.cell, { width: '60%', backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={styles.mainTitle}>FICHA DE ENTREVISTA</Text>
                        </View>
                        {/* Datos ISO */}
                        {/* <View style={[styles.cellLast, { width: '30%', padding: 0 }]}>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', height: 20 }}>
                                <View style={[styles.headerLabel, { width: '40%', borderRightWidth: 1, padding: 4, justifyContent: 'center' }]}>
                                    <Text>Código</Text>
                                </View>
                                <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>FO-ADM-026</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', height: 20 }}>
                                <View style={[styles.headerLabel, { width: '40%', borderRightWidth: 1, padding: 4, justifyContent: 'center' }]}>
                                    <Text>Versión</Text>
                                </View>
                                <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>3</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', height: 20 }}>
                                <View style={[styles.headerLabel, { width: '40%', borderRightWidth: 1, padding: 4, justifyContent: 'center' }]}>
                                    <Text>Fecha Aprob.</Text>
                                </View>
                                <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>2022-08-08</Text>
                                </View>
                            </View>
                        </View> */}
                    </View>
                </View>

                {/* --- DATOS GENERALES --- */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '25%' }]}>
                            <Text>NOMBRE DEL PUESTO:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '75%' }]}>
                            <Text>{aplicacion.convocatoria?.cargoNombre}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '25%' }]}>
                            <Text>JEFE INMEDIATO:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '75%' }]}>
                            <Text>RRHH / Gerencia</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '15%' }]}>
                            <Text>FECHA:</Text>
                        </View>
                        <View style={[styles.cell, { width: '15%' }]}>
                            <Text>{formatDate(entrevista.fecha_entrevista)}</Text>
                        </View>
                        <View style={[styles.cell, styles.headerLabel, { width: '45%' }]}>
                            <Text>COMUNICACIÓN DE HORARIO, LUGAR Y CONDICIONES:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '25%', flexDirection: 'row', justifyContent: 'space-around' }]}>
                            <Checkbox checked={true} label="SI" />
                            <Checkbox checked={false} label="NO" />
                        </View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={[styles.cell, styles.headerLabel, { width: '25%' }]}>
                            <Text>NOMBRES Y APELLIDOS:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '75%' }]}>
                            <Text>{aplicacion.candidato?.nombres} {aplicacion.candidato?.apellidoPaterno} {aplicacion.candidato?.apellidoMaterno}</Text>
                        </View>
                    </View>
                </View>

                {/* --- TABLA DE PREGUNTAS (Estilo Grid) --- */}
                <View style={styles.table}>
                    {/* Item 1 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>DISPONIBILIDAD INMEDIATA, ACTUALMENTE ESTA LABORANDO</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.disponibilidad_actual}</Text>
                        </View>
                    </View>
                    {/* Item 2 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>RESIDENCIA, ¿DÓNDE VIVE ACTUALMENTE?</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.residencia_actual}</Text>
                        </View>
                    </View>
                    {/* Item 3 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>DISPONIBILIDAD DE VIAJAR</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.disponibilidad_viajar === 'SI' ? 'Sí tiene disponibilidad' : 'No tiene disponibilidad'}</Text>
                        </View>
                    </View>
                    {/* Item 4 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>ESTUDIOS</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.estudios}</Text>
                        </View>
                    </View>
                    {/* Item 5 & 6 (Divididos o juntos) */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>ESTADO CIVIL / EDAD</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.estado_civil} / {entrevista.edad} años</Text>
                        </View>
                    </View>
                    {/* Item 7 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>EXPERIENCIA (General y Rubro)</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%', minHeight: 40 }]}>
                            <Text>Gral: {entrevista.experiencia_general}</Text>
                            <Text>Rubro: {entrevista.experiencia_rubro}</Text>
                        </View>
                    </View>
                    {/* Item 8 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>BUSCA ESTABILIDAD</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.busca_estabilidad}</Text>
                        </View>
                    </View>
                    {/* Item 9 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>¿CUÁLES SON SUS RETOS PROFESIONALES?</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.retos_profesionales}</Text>
                        </View>
                    </View>
                    {/* Item 10 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>DESENVOLVIMIENTO (1 al 10)</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.desenvolvimiento}/10</Text>
                        </View>
                    </View>
                    {/* Item 11 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>CONOCIMIENTO SEGÚN PERFIL</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.conocimiento_perfil === 'SI' ? 'Aplica' : 'No aplica'}</Text>
                        </View>
                    </View>
                    {/* Item 12 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>INTERÉS EN EL PUESTO (1 al 10)</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.interes_puesto}/10</Text>
                        </View>
                    </View>
                    {/* Item 13 */}
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>PRETENSIONES SALARIALES</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{formatCurrency(entrevista.pretension_monto)} ({entrevista.pretension_negociable === 'SI' ? 'Negociable' : 'No negociable'})</Text>
                        </View>
                    </View>
                    {/* Item 14 */}
                    <View style={styles.tableRowLast}>
                        <View style={[styles.cell, styles.headerLabel, { width: '40%' }]}>
                            <Text>SOLICITAR REFERENCIAS / COVID</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '60%' }]}>
                            <Text>{entrevista.solicitar_referencias}</Text>
                        </View>
                    </View>
                </View>

                {/* --- FOOTER / RESULTADOS --- */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '30%' }]}>
                            <Text>RESPONSABLE ENTREVISTA:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '70%' }]}>
                            <Text>{entrevista.entrevistador_nombre}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.headerLabel, { width: '30%', justifyContent: 'flex-start' }]}>
                            <Text>OBSERVACIONES:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '70%', height: 40 }]}>
                            <Text>{entrevista.observaciones}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRowLast}>
                        <View style={[styles.cell, styles.headerLabel, { width: '30%', justifyContent: 'flex-start' }]}>
                            <Text>RESULTADO DE LA ENTREVISTA:</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '70%', height: 40 }]}>
                            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{entrevista.resultado}</Text>
                        </View>
                    </View>
                </View>

                {/* --- SECCION REFERENCIAS --- */}
                <Text style={styles.sectionHeader}>RESULTADO DE REFERENCIAS LABORALES (SOLO POSTULANTES DE ENTREVISTA FINAL)</Text>
                <View style={styles.table}>
                    <View style={[styles.tableRow, { backgroundColor: '#e0e0e0' }]}>
                        <View style={[styles.cell, { width: '30%' }]}>
                            <Text style={[styles.textBold, styles.textCenter]}>EMPRESA</Text>
                        </View>
                        <View style={[styles.cellLast, { width: '70%' }]}>
                            <Text style={[styles.textBold, styles.textCenter]}>COMENTARIOS</Text>
                        </View>
                    </View>
                    {/* Filas vacías para rellenar manualmente o mapear si hay datos */}
                    <View style={[styles.tableRow, { height: 25 }]}>
                         <View style={[styles.cell, { width: '30%' }]} />
                         <View style={[styles.cellLast, { width: '70%' }]} />
                    </View>
                    <View style={[styles.tableRowLast, { height: 25 }]}>
                         <View style={[styles.cell, { width: '30%' }]} />
                         <View style={[styles.cellLast, { width: '70%' }]} />
                    </View>
                </View>

            </Page>
        </Document>
    )
}