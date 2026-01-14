/**
 * Constantes de diseño para InventoryFlow.
 * Usa estas constantes para mantener consistencia en toda la aplicación.
 */

/** Colores de la aplicación */
export const COLORS = {
  /** Verde oscuro principal - botones, headers, acentos */
  primary: '#064E3B',
  /** Fondo principal */
  background: '#F5F2ED',
  /** Fondo secundario */
  backgroundAlt: '#F9FAFB',
  /** Bordes */
  border: '#E2E2D5',
  /** Texto principal */
  textPrimary: '#374151',
  /** Texto secundario */
  textSecondary: '#6B7280',
  /** Texto terciario/placeholder */
  textMuted: '#9CA3AF',
  /** Rojo para errores/eliminaciones */
  error: '#991B1B',
  /** Rojo claro fondo */
  errorBg: '#FEF2F2',
  /** Amarillo advertencias */
  warning: '#D97706',
  /** Amarillo claro fondo */
  warningBg: '#FEF3C7',
  /** Verde éxito */
  success: '#065F46',
  /** Verde claro fondo */
  successBg: '#D1FAE5',
  /** Blanco */
  white: '#FFFFFF',
} as const;

/** Clases de Tailwind para botones */
export const BUTTON_STYLES = {
  /** Botón primario (verde oscuro) */
  primary: 'px-4 py-2.5 bg-[#064E3B] text-[#F5F2ED] font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  /** Botón secundario (borde) */
  secondary: 'px-4 py-2.5 border border-[#E2E2D5] text-[#374151] font-medium rounded-xl hover:bg-[#F9FAFB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  /** Botón danger (rojo) */
  danger: 'px-4 py-2.5 bg-[#991B1B] text-white font-semibold rounded-xl hover:bg-[#7F1D1D] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  /** Botón ghost (sin fondo) */
  ghost: 'px-4 py-2.5 text-[#6B7280] font-medium hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-xl transition-all duration-200',
} as const;

/** Clases de Tailwind para inputs */
export const INPUT_STYLES = {
  /** Input de texto básico */
  base: 'w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200',
  /** Textarea */
  textarea: 'w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 resize-none',
  /** Input con error */
  error: 'w-full px-4 py-3 bg-white border-2 border-[#991B1B] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#991B1B]/20 focus:border-[#991B1B] transition-all duration-200',
  /** Label */
  label: 'block text-sm font-medium text-[#374151] mb-2',
  /** Mensaje de error */
  errorMessage: 'text-sm text-[#991B1B] mt-1.5',
} as const;

/** Clases de Tailwind para cards/containers */
export const CARD_STYLES = {
  /** Card básica */
  base: 'bg-white border border-[#E2E2D5] rounded-xl shadow-sm',
  /** Card con hover */
  hover: 'bg-white border border-[#E2E2D5] rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
  /** Card destacada */
  featured: 'bg-white border-2 border-[#064E3B] rounded-xl shadow-sm',
  /** Card de error */
  error: 'bg-[#FEF2F2] border border-[#991B1B]/20 rounded-xl',
} as const;

/** Tamaños de espaciado consistentes */
export const SPACING = {
  /** Padding de página en móvil */
  pagePaddingMobile: 'px-6 py-8',
  /** Padding de página en desktop */
  pagePaddingDesktop: 'px-8 lg:px-12 py-8 md:py-12',
  /** Gap entre elementos de formulario */
  formGap: 'space-y-5',
  /** Gap entre cards */
  cardGap: 'gap-4 md:gap-6',
} as const;

/** Tipografía consistente */
export const TYPOGRAPHY = {
  /** Título de página */
  pageTitle: 'font-serif text-3xl md:text-4xl font-bold text-[#064E3B]',
  /** Subtítulo */
  subtitle: 'text-sm md:text-base text-[#6B7280]',
  /** Título de sección */
  sectionTitle: 'font-serif text-xl md:text-2xl font-bold text-[#374151]',
  /** Texto de label */
  label: 'text-xs font-medium text-[#6B7280] uppercase tracking-wider',
} as const;

/** Tamaño mínimo de botones para accesibilidad móvil */
export const TOUCH_TARGET_SIZE = '44px';
