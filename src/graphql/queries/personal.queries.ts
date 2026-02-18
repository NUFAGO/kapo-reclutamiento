/**
 *  Consultas para consumir datos del servicio PERSONAL
 */

export const BUSCAR_EMPLEADOS_QUERY = `
  query ListEmpleadoCH($filter: EmpleadoCHFilterInput) {
    listEmpleadoCH(filter: $filter) {
      empleados {
        id
        dni
        nombres
        ap_paterno
        ap_materno
      }
      total
    }
  }
`