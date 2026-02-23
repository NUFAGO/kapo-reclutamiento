import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { AplicacionCandidato } from '@/app/(dashboard)/kanban/lib/kanban.types'
import { DebidaDiligencia } from '@/hooks'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const DARK = '#1a1a1a'
const GRAY_HEADER = '#404040'
const LIGHT_GRAY = '#f5f5f5'
const BORDER = '#333333'
const WHITE = '#ffffff'
const GREEN = '#2d6a4f'

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 28,
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: DARK,
        backgroundColor: WHITE,
    },

    /* ── Header doc info ── */
    docInfoRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 0,
    },
    docInfoCell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        justifyContent: 'center',
    },
    docInfoLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: '#555',
        marginBottom: 1,
    },
    docInfoValue: {
        fontSize: 8,
    },
    docInfoCellLast: {
        padding: 4,
        justifyContent: 'center',
        flex: 1,
    },

    /* ── Main title ── */
    titleBar: {
        backgroundColor: 'rgba(64, 64, 64, 0.9)',
        padding: 7,
        marginBottom: 10,
        marginTop: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: BORDER,
    },
    titleText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
        color: WHITE,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subTitleText: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#ccc',
        textAlign: 'center',
        marginTop: 2,
    },

    /* ── Section header ── */
    sectionHeader: {
        backgroundColor: GRAY_HEADER,
        padding: 4,
        marginBottom: 0,
    },
    sectionHeaderText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: WHITE,
        letterSpacing: 0.5,
    },

    /* ── Generic table ── */
    table: {
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    rowLast: {
        flexDirection: 'row',
    },
    cell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        justifyContent: 'center',
    },
    cellLast: {
        padding: 4,
        justifyContent: 'center',
    },
    cellLabel: {
        backgroundColor: LIGHT_GRAY,
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        color: '#444',
    },
    cellValue: {
        fontSize: 8,
    },

    /* ── Criteria table ── */
    thCell: {
        backgroundColor: LIGHT_GRAY,
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        justifyContent: 'center',
    },
    thText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        textAlign: 'center',
        color: '#333',
    },
    thCellLast: {
        backgroundColor: LIGHT_GRAY,
        padding: 4,
        justifyContent: 'center',
    },
    subGroupRow: {
        backgroundColor: '#e8e8e8',
        padding: 4,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    subGroupText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        letterSpacing: 0.3,
    },
    dataCell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        justifyContent: 'center',
    },
    dataCellLast: {
        padding: 4,
        justifyContent: 'center',
    },
    criteriaText: {
        fontSize: 7,
        lineHeight: 1.4,
    },
    centerText: {
        textAlign: 'center',
        fontSize: 7,
    },

    /* ── Risk badges (compact horizontal) ── */
    riskRow: {
        flexDirection: 'row',
        marginBottom: 8,
        marginTop: 4,
    },
    riskBadge: {
        flex: 1,
        padding: 4,
        borderWidth: 1,
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    riskBadgeLast: {
        flex: 1,
        padding: 4,
        borderWidth: 1,
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    riskLabel: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
    },
    riskRange: {
        fontSize: 6,
        marginLeft: 3,
    },
    riskCheck: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        marginLeft: 3,
    },

    /* ── Total row ── */
    totalRow: {
        flexDirection: 'row',
        backgroundColor: DARK,
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    totalLabel: {
        flex: 1,
        padding: 5,
        justifyContent: 'center',
    },
    totalLabelText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: WHITE,
        textAlign: 'right',
    },
    totalValue: {
        width: 50,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#666',
    },
    totalValueText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: WHITE,
    },

    /* ── Actions ── */
    actionCell: {
        flex: 1,
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionCellLast: {
        flex: 1,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 7,
        textAlign: 'center',
        lineHeight: 1.4,
        marginBottom: 3,
    },
    actionCheck: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: GREEN,
    },

    /* ── Controls table ── */
    ctrlThCell: {
        backgroundColor: LIGHT_GRAY,
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: BORDER,
        justifyContent: 'center',
    },
    ctrlThCellLast: {
        backgroundColor: LIGHT_GRAY,
        padding: 4,
        justifyContent: 'center',
    },
    ctrlThText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        textAlign: 'center',
    },
})

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmt = (d?: string | null): string => {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('es-PE') } catch { return String(d) }
}

type RiskLevel = 'CRÍTICO' | 'ALTO' | 'MODERADO' | 'BAJO'

const riskMeta: Record<RiskLevel, { textColor: string; bg: string; border: string; range: string }> = {
    CRÍTICO:  { textColor: WHITE, bg: '#ff0000', border: '#ff0000', range: '16–25' },
    ALTO:     { textColor: DARK,  bg: '#ffc000', border: '#ffc000', range: '11–15' },
    MODERADO: { textColor: DARK,  bg: '#ffc000', border: '#ffc000', range: '6–10'  },
    BAJO:     { textColor: DARK,  bg: '#92d050', border: '#92d050', range: '1–5'   },
}

const LEVELS: RiskLevel[] = ['CRÍTICO', 'ALTO', 'MODERADO', 'BAJO']

const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 16) return 'CRÍTICO'
    if (score >= 11) return 'ALTO'
    if (score >= 6)  return 'MODERADO'
    return 'BAJO'
}

const actionLabels: Record<string, string> = {
    NO_ESTABLECER:         'No establecer la\nrelación con el Postulante',
    SUSPENDER:             'Suspender la relación\ncon el Trabajador',
    TERMINAR:              'Terminar la relación\ncon el Trabajador',
    ACEPTAR_CON_CONTROLES: 'Aceptar la relación\ny establecer controles',
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
const SectionHeader = ({ label }: { label: string }) => (
    <View style={s.sectionHeader}>
        <Text style={s.sectionHeaderText}>{label}</Text>
    </View>
)

const CriteriaRow = ({
    num,
    text,
    pond,
    resp,
    pts,
    last = false,
}: {
    num: string
    text: string
    pond: number
    resp: string
    pts: number
    last?: boolean
}) => (
    <View style={last ? s.rowLast : s.row}>
        <View style={[s.dataCell, { width: 24 }]}>
            <Text style={[s.centerText, { fontSize: 6 }]}>{num}</Text>
        </View>
        <View style={[s.dataCell, { flex: 1 }]}>
            <Text style={s.criteriaText}>{text}</Text>
        </View>
        <View style={[s.dataCell, { width: 52 }]}>
            <Text style={s.centerText}>{String(pond)}</Text>
        </View>
        <View style={[s.dataCell, { width: 52 }]}>
            <Text style={[s.centerText, { fontFamily: 'Helvetica-Bold' }]}>{resp || '—'}</Text>
        </View>
        <View style={[s.dataCellLast, { width: 40 }]}>
            <Text style={[s.centerText, { fontFamily: 'Helvetica-Bold' }]}>{String(pts)}</Text>
        </View>
    </View>
)

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
interface Props {
    aplicacion: AplicacionCandidato
    debidaDiligencia: DebidaDiligencia
}

export function DebidaDiligenciaPdf({ aplicacion, debidaDiligencia }: Props) {
    const { candidato, convocatoria } = aplicacion
    const dd = debidaDiligencia
    const c = dd.criterios

    const nombreCompleto = candidato
        ? `${candidato.nombres} ${candidato.apellidoPaterno} ${candidato.apellidoMaterno}`.trim()
        : '—'

    const activeLevel = getRiskLevel(dd.puntaje_total)

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* ── Doc-info header ── */}
                <View style={s.docInfoRow}>
                    <View style={[s.docInfoCell, { width: '22%' }]}>
                        <Text style={s.docInfoLabel}>CÓDIGO</Text>
                        <Text style={s.docInfoValue}>{dd.codigo}</Text>
                    </View>
                    <View style={[s.docInfoCell, { width: '14%' }]}>
                        <Text style={s.docInfoLabel}>VERSIÓN</Text>
                        <Text style={s.docInfoValue}>1</Text>
                    </View>
                    <View style={[s.docInfoCell, { width: '28%' }]}>
                        <Text style={s.docInfoLabel}>FECHA DE APROBACIÓN</Text>
                        <Text style={s.docInfoValue}>{fmt(dd.fecha_aprobacion)}</Text>
                    </View>
                    <View style={s.docInfoCellLast}>
                        <Text style={s.docInfoLabel}>FECHA DE EVALUACIÓN</Text>
                        <Text style={s.docInfoValue}>{fmt(dd.fecha_evaluacion)}</Text>
                    </View>
                </View>

                {/* ── Title ── */}
                <View style={s.titleBar}>
                    <Text style={s.titleText}>DEBIDA DILIGENCIA AL PERSONAL</Text>
                    <Text style={s.subTitleText}>Evaluación de Integridad y Gestión de Riesgos</Text>
                </View>

                {/* ── Personal data ── */}
                <SectionHeader label="DATOS DEL PERSONAL" />
                <View style={[s.table, { marginTop: 0 }]}>
                    <View style={s.row}>
                        <View style={[s.cell, s.cellLabel, { width: '22%' }]}>
                            <Text>Nombre y Apellidos</Text>
                        </View>
                        <View style={[s.cell, s.cellValue, { flex: 1 }]}>
                            <Text>{nombreCompleto}</Text>
                        </View>
                        <View style={[s.cell, s.cellLabel, { width: '15%' }]}>
                            <Text>N° DNI</Text>
                        </View>
                        <View style={[s.cellLast, s.cellValue, { width: '18%' }]}>
                            <Text>{candidato?.dni || '—'}</Text>
                        </View>
                    </View>
                    <View style={s.rowLast}>
                        <View style={[s.cell, s.cellLabel, { width: '22%' }]}>
                            <Text>Puesto al que Postula</Text>
                        </View>
                        <View style={[s.cell, s.cellValue, { flex: 1 }]}>
                            <Text>{convocatoria?.cargoNombre || '—'}</Text>
                        </View>
                        <View style={[s.cell, s.cellLabel, { width: '15%' }]}>
                            <Text>Evaluador</Text>
                        </View>
                        <View style={[s.cellLast, s.cellValue, { width: '18%' }]}>
                            <Text>{dd.nombre_evaluador || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Risk level ── */}
                <SectionHeader label={`NIVEL DE RIESGO  —  Puntaje: ${String(dd.puntaje_total)} pts`} />
                <View style={s.riskRow}>
                    {LEVELS.map((level, idx) => {
                        const meta = riskMeta[level]
                        const active = activeLevel === level
                        const isLast = idx === LEVELS.length - 1
                        return (
                            <View
                                key={level}
                                style={[
                                    isLast ? s.riskBadgeLast : s.riskBadge,
                                    {
                                        backgroundColor: active ? meta.bg : '#f0f0f0',
                                        borderColor: active ? meta.border : '#bbb',
                                        opacity: active ? 1 : 0.45,
                                    },
                                ]}
                            >
                                <Text style={[s.riskLabel, { color: active ? meta.textColor : '#666' }]}>
                                    {level}
                                </Text>
                                <Text style={[s.riskRange, { color: active ? meta.textColor : '#888' }]}>
                                    ({meta.range})
                                </Text>
                                {active && (
                                    <Text style={[s.riskCheck, { color: meta.textColor }]}>{'✓'}</Text>
                                )}
                            </View>
                        )
                    })}
                </View>

                {/* ── Criteria table ── */}
                <SectionHeader label="CRITERIOS DE EVALUACIÓN" />
                <View style={[s.table, { marginTop: 0 }]}>
                    <View style={s.row}>
                        <View style={[s.thCell, { width: 24 }]}>
                            <Text style={s.thText}>#</Text>
                        </View>
                        <View style={[s.thCell, { flex: 1 }]}>
                            <Text style={s.thText}>CRITERIO</Text>
                        </View>
                        <View style={[s.thCell, { width: 52 }]}>
                            <Text style={s.thText}>PONDERACIÓN</Text>
                        </View>
                        <View style={[s.thCell, { width: 52 }]}>
                            <Text style={s.thText}>RESPUESTA</Text>
                        </View>
                        <View style={[s.thCellLast, { width: 40 }]}>
                            <Text style={s.thText}>PUNTAJE</Text>
                        </View>
                    </View>

                    {/* Group A */}
                    <View style={s.subGroupRow}>
                        <Text style={s.subGroupText}>A · UBICACIÓN GEOGRÁFICA</Text>
                    </View>
                    <CriteriaRow num="1"  text="¿La empresa de la que procede el postulante presenta casos de corrupción, denuncias o mala imagen o se tiene una alta percepción de mala reputación de la misma?" pond={c.item01.ponderacion} resp={c.item01.respuesta} pts={c.item01.puntaje} />
                    <CriteriaRow num="2"  text="¿La ciudad en la que se desarrollará o se desarrolla el postulante o trabajador hay percepción de corrupción?" pond={c.item02.ponderacion} resp={c.item02.respuesta} pts={c.item02.puntaje} />

                    {/* Group B */}
                    <View style={s.subGroupRow}>
                        <Text style={s.subGroupText}>B · TRABAJADOR O POSTULANTE</Text>
                    </View>
                    <CriteriaRow num="3"  text="El postulante o trabajador llegó a INACONS por recomendación (SI: 2 pts) — convocatoria (NO: 1 pt) — cambio de puesto (NA: 0 pts)" pond={c.item03.ponderacion} resp={c.item03.respuesta} pts={c.item03.puntaje} />
                    <CriteriaRow num="4"  text="¿El Postulante o Trabajador tiene malas recomendaciones por su ética o incorrecta labor por un anterior jefe? (Si ya es trabajador colocar NA)" pond={c.item04.ponderacion} resp={c.item04.respuesta} pts={c.item04.puntaje} />
                    <CriteriaRow num="5"  text="¿El postulante o trabajador actuará en representación de INACONS ante el estado, entidades públicas o privadas, funcionarios?" pond={c.item05.ponderacion} resp={c.item05.respuesta} pts={c.item05.puntaje} />
                    <CriteriaRow num="6"  text='¿Ha realizado comentarios indicando que cualquier pago particular, contribución u otra actividad es necesaria para "obtener beneficios" o "hacer arreglos"?' pond={c.item06.ponderacion} resp={c.item06.respuesta} pts={c.item06.puntaje} />
                    <CriteriaRow num="7"  text="¿El perfil de LinkedIn es igual o similar al que consigna en su CV? (Si no tiene perfil consignar NA)" pond={c.item07.ponderacion} resp={c.item07.respuesta} pts={c.item07.puntaje} />
                    <CriteriaRow num="8"  text="¿Según indagaciones iniciales presenta deudas en la SBS? Adjuntar evidencia." pond={c.item08.ponderacion} resp={c.item08.respuesta} pts={c.item08.puntaje} />
                    <CriteriaRow num="9"  text="¿Ha sido sujeto de procesos policiales, penales o judiciales? (Adjuntar declaración jurada)" pond={c.item09.ponderacion} resp={c.item09.respuesta} pts={c.item09.puntaje} />
                    <CriteriaRow num="10" text="¿Tendrá interacción frecuente con funcionarios del gobierno o clase política relacionadas con INACONS?" pond={c.item10.ponderacion} resp={c.item10.respuesta} pts={c.item10.puntaje} />

                    {/* Group C */}
                    <View style={s.subGroupRow}>
                        <Text style={s.subGroupText}>C · SOBRE SUS FUNCIONES</Text>
                    </View>
                    <CriteriaRow num="11" text="¿No tiene experiencia o no cubre expectativas para el puesto?" pond={c.item11.ponderacion} resp={c.item11.respuesta} pts={c.item11.puntaje} />
                    <CriteriaRow num="12" text="¿Existe conflicto de interés o riesgo de incumplimiento en la relación laboral?" pond={c.item12.ponderacion} resp={c.item12.respuesta} pts={c.item12.puntaje} />
                    <CriteriaRow num="13" text="¿El título se encuentra registrado en SUNEDU?" pond={c.item13.ponderacion} resp={c.item13.respuesta} pts={c.item13.puntaje} />
                    <CriteriaRow num="14" text="¿Ha pasado por evaluación de desempeño?" pond={c.item14.ponderacion} resp={c.item14.respuesta} pts={c.item14.puntaje} />
                    <CriteriaRow num="15" text="¿En última evaluación obtuvo >= 71%?" pond={c.item15.ponderacion} resp={c.item15.respuesta} pts={c.item15.puntaje} />
                    <CriteriaRow num="16" text="¿Mantiene buena relación con todos los niveles de la organización?" pond={c.item16.ponderacion} resp={c.item16.respuesta} pts={c.item16.puntaje} last />

                    {/* Total */}
                    <View style={s.totalRow}>
                        <View style={s.totalLabel}>
                            <Text style={s.totalLabelText}>TOTAL DEL PROCESO DE EVALUACIÓN</Text>
                        </View>
                        <View style={s.totalValue}>
                            <Text style={s.totalValueText}>{String(dd.puntaje_total)}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Actions (only if score > 5 and action set) ── */}
                {dd.puntaje_total > 5 && dd.accion && (
                    <>
                        <SectionHeader label={`ACCIONES A TOMAR  —  RIESGO ${activeLevel}`} />
                        <View style={[s.table, { marginTop: 0 }]}>
                            <View style={s.rowLast}>
                                {Object.entries(actionLabels).map(([key, label], idx) => {
                                    const isActive = dd.accion === key
                                    const isLast = idx === 3
                                    return (
                                        <View
                                            key={key}
                                            style={[
                                                isLast ? s.actionCellLast : s.actionCell,
                                                isActive ? { backgroundColor: '#e8f5e9' } : {},
                                            ]}
                                        >
                                            <Text style={[s.actionLabel, isActive ? { fontFamily: 'Helvetica-Bold' } : {}]}>
                                                {label}
                                            </Text>
                                            {isActive && (
                                                <Text style={s.actionCheck}>{'✓'}</Text>
                                            )}
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    </>
                )}

                {/* ── Controls ── */}
                {dd.accion === 'ACEPTAR_CON_CONTROLES' && dd.controles && dd.controles.length > 0 && (
                    <>
                        <SectionHeader label="CONTROLES ESTABLECIDOS" />
                        <View style={[s.table, { marginTop: 0 }]}>
                            <View style={s.row}>
                                <View style={[s.ctrlThCell, { width: 24 }]}>
                                    <Text style={s.ctrlThText}>#</Text>
                                </View>
                                <View style={[s.ctrlThCell, { flex: 1 }]}>
                                    <Text style={s.ctrlThText}>CRITERIO / CONTROL</Text>
                                </View>
                                <View style={[s.ctrlThCell, { width: 100 }]}>
                                    <Text style={s.ctrlThText}>RESPONSABLE</Text>
                                </View>
                                <View style={[s.ctrlThCellLast, { width: 72 }]}>
                                    <Text style={s.ctrlThText}>FECHA LÍMITE</Text>
                                </View>
                            </View>
                            {dd.controles.map((ctrl, i) => {
                                const isLast = i === (dd.controles?.length ?? 0) - 1
                                return (
                                    <View key={i} style={isLast ? s.rowLast : s.row}>
                                        <View style={[s.dataCell, { width: 24 }]}>
                                            <Text style={[s.centerText, { fontSize: 6 }]}>{String(i + 1)}</Text>
                                        </View>
                                        <View style={[s.dataCell, { flex: 1 }]}>
                                            <Text style={s.criteriaText}>{ctrl.criterio}</Text>
                                        </View>
                                        <View style={[s.dataCell, { width: 100 }]}>
                                            <Text style={s.centerText}>{ctrl.responsable || '—'}</Text>
                                        </View>
                                        <View style={[s.dataCellLast, { width: 72 }]}>
                                            <Text style={s.centerText}>{fmt(ctrl.fecha_limite)}</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </>
                )}

                {/* ── Footer ── */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 14,
                        left: 28,
                        right: 28,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderTopWidth: 0.5,
                        borderTopColor: '#ccc',
                        paddingTop: 4,
                    }}
                >
                    <Text style={{ fontSize: 6, color: '#999' }}>
                        {`${dd.codigo} · v1 · Generado: ${fmt(new Date().toISOString())}`}
                    </Text>
                    <Text style={{ fontSize: 6, color: '#999' }}>
                        {`Evaluador: ${dd.nombre_evaluador}`}
                    </Text>
                </View>

            </Page>
        </Document>
    )
}