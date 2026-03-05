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

export const CREAR_ENTREVISTA_LLAMADA_MUTATION = `
  mutation CrearEntrevistaLlamada($input: CrearEntrevistaInput!) {
    crearEntrevista(input: $input) {
      ${ENTREVISTA_LLAMADA_FIELDS}
    }
  }
`

export const ACTUALIZAR_ENTREVISTA_LLAMADA_MUTATION = `
  mutation ActualizarEntrevistaLlamada($id: ID!, $input: ActualizarEntrevistaInput!) {
    actualizarEntrevista(id: $id, input: $input) {
      ${ENTREVISTA_LLAMADA_FIELDS}
    }
  }
`

export const ELIMINAR_ENTREVISTA_LLAMADA_MUTATION = `
  mutation EliminarEntrevistaLlamada($id: ID!) {
    eliminarEntrevista(id: $id)
  }
`