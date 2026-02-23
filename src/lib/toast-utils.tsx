import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

/**
 * 🎯 UTILIDADES PARA TOASTS - Sistema de notificaciones con duraciones configurables
 *
 * Permite especificar duración opcional por toast individual
 * Si no se especifica duración, usa los valores por defecto del provider
 */

export interface ToastOptions {
  duration?: number
}

/**
 * Toast de éxito con duración configurable
 * @param message - Mensaje a mostrar
 * @param options - Opciones (opcional: duration en ms)
 */
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, { ...options, icon: <CheckCircle size={20} className="text-green-500" />, style: { background: '#f0fdf4', border: 'none', fontSize: '0.75rem', color: '#1f2937' } })
}

/**
 * Toast de error con duración configurable
 * @param message - Mensaje a mostrar
 * @param options - Opciones (opcional: duration en ms)
 */
export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, { ...options, icon: <XCircle size={20} className="text-red-500" />, style: { background: '#fef2f2', border: 'none', fontSize: '0.75rem', color: '#1f2937' } })
}

/**
 * Toast de información con duración configurable
 * @param message - Mensaje a mostrar
 * @param options - Opciones (opcional: duration en ms)
 */
export function showInfo(message: string, options?: ToastOptions) {
  return toast(message, {
    ...options,
    icon: <Info size={20} className="text-blue-500" />,
    style: { background: '#eff6ff', border: 'none', fontSize: '0.75rem', color: '#1f2937' },
  })
}

/**
 * Toast de advertencia con duración configurable
 * @param message - Mensaje a mostrar
 * @param options - Opciones (opcional: duration en ms)
 */
export function showWarning(message: string, options?: ToastOptions) {
  return toast(message, {
    ...options,
    icon: <AlertTriangle size={20} className="text-yellow-500" />,
    style: { background: '#fffbeb', border: 'none', fontSize: '0.75rem', color: '#1f2937' },
  })
}

/**
 * Toast de carga (loading) con duración configurable
 * @param message - Mensaje a mostrar
 * @param options - Opciones (opcional: duration en ms)
 */
export function showLoading(message: string, options?: ToastOptions) {
  return toast.loading(message, { ...options, style: { fontSize: '0.75rem', color: '#1f2937' } })
}

/**
 * Actualizar toast existente
 * @param toastId - ID del toast a actualizar
 * @param message - Nuevo mensaje
 * @param options - Nuevas opciones
 */
export function updateToast(toastId: string, message: string, options?: ToastOptions) {
  return toast.success(message, {
    ...options,
    id: toastId,
    icon: <CheckCircle size={20} className="text-green-500" />,
    style: { background: '#f0fdf4', border: 'none', fontSize: '0.75rem', color: '#1f2937' },
  })
}

/**
 * Dismiss toast específico
 * @param toastId - ID del toast a cerrar
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId)
}

/**
 * Dismiss todos los toasts
 */
export function dismissAllToasts() {
  toast.dismiss()
}

// Duraciones predefinidas para consistencia
export const TOAST_DURATIONS = {
  QUICK: 2000,    // Para confirmaciones rápidas
  NORMAL: 3000,   // Para operaciones normales
  LONG: 4000,     // Para errores o información importante
  EXTRA_LONG: 5000, // Para casos especiales
} as const

// Exportar toast original por si se necesita acceso directo
export { toast }