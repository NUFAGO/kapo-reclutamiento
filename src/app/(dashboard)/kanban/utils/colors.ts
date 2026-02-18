// Utilidades de colores y tema para el sistema Kanban

/**
 * Genera color dinámico basado en ID de convocatoria
 * Utiliza el mismo algoritmo que KanbanCard para consistencia visual
 */
export const getConvocatoriaColor = (id: string): { h: number; s: number; l: number } => {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;

  // Usamos HSL con valores similares a Tailwind 500
  const saturation = 65 + (Math.abs(hash >> 3) % 20); // 65–84% (similar a 500)
  const lightness = 45 + (Math.abs(hash >> 6) % 25);  // 45–69% (similar a 500)

  return { h: hue, s: saturation, l: lightness };
};

/**
 * Convierte valores HSL a RGB
 */
export const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c/2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return { r, g, b };
};

/**
 * Obtiene estilos de color para tabs aplicando tonos como botones de Tailwind
 * Usa colores del tema oscuro para consistencia en ambos temas
 */
export const getTabColorStyles = (convocatoriaId: string, isActive: boolean) => {
  const { h, s, l } = getConvocatoriaColor(convocatoriaId);

  // Color base (equivalente a -500)
  const baseRgb = hslToRgb(h, s, l);

  // Color para texto usando tonos del tema oscuro (-400: más claro)
  const textRgb = hslToRgb(h, s, Math.min(90, l + 20));

  if (isActive) {
    return {
      backgroundColor: `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, 0.03)`, // bg-{color}-500/10
      color: `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`,                   // text-{color}-400 (tema oscuro)
      borderColor: `rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`,             // border-{color}-400 (tema oscuro)
      fontWeight: '600' as const
    };
  }

  return {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    borderColor: 'transparent',
    fontWeight: 'normal' as const
  };
};