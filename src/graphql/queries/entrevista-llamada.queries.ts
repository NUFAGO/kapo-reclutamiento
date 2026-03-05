// Fragment reutilizable para campos de entrevista de llamada
const ENTREVISTA_LLAMADA_FIELDS = `
  id
  aplicacionCandidatoId
  fecha_entrevista
  disponibilidad_actual
  residencia_actual
  disponibilidad_viajar
  estudios
  estado_civil
  hijos
  edad
  experiencia_general
  experiencia_rubro
  busca_estabilidad
  retos_profesionales
  desenvolvimiento
  conocimiento_perfil
  interes_puesto
  pretension_monto
  pretension_negociable
  comentarios
  solicitar_referencias
  entrevistador_id
  entrevistador_nombre
  observaciones
  resultado
  version
  fecha_version
  codigo
  motivos_salida_empleo
  licencia_conducir
  reporte_infocorp
  condicion_salud_funciones
  restriccion_med_funciones
  created_at
  updated_at
`

export const OBTENER_ENTREVISTA_LLAMADA_POR_APLICACION_QUERY = `
  query ObtenerEntrevistaLlamadaPorAplicacion($aplicacionCandidatoId: ID!) {
    obtenerEntrevistaPorAplicacionCandidato(aplicacionCandidatoId: $aplicacionCandidatoId) {
      ${ENTREVISTA_LLAMADA_FIELDS}
    }
  }
`

export const EXISTE_ENTREVISTA_LLAMADA_PARA_APLICACION_QUERY = `
  query ExisteEntrevistaLlamadaParaAplicacion($aplicacionCandidatoId: ID!) {
    existeEntrevistaParaAplicacionCandidato(aplicacionCandidatoId: $aplicacionCandidatoId)
  }
`

export const OBTENER_ENTREVISTA_LLAMADA_QUERY = `
  query ObtenerEntrevistaLlamada($id: ID!) {
    obtenerEntrevista(id: $id) {
      ${ENTREVISTA_LLAMADA_FIELDS}
    }
  }
`

export const LISTAR_ENTREVISTAS_LLAMADA_QUERY = `
  query ListarEntrevistasLlamada($filtros: EntrevistaFiltrosInput) {
    listarEntrevistas(filtros: $filtros) {
      ${ENTREVISTA_LLAMADA_FIELDS}
    }
  }
`