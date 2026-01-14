/**
 * Funciones de validación centralizadas para la aplicación.
 * Úsalas tanto en cliente como en servidor para consistencia.
 */

/**
 * Valida si un string es un UUID v4 válido
 * @param id - String a validar
 * @returns true si es un UUID válido
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Valida si un email tiene formato correcto
 * @param email - Email a validar
 * @returns true si el formato es válido (o si está vacío, ya que es opcional)
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email || !email.trim()) return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida si un string no está vacío
 * @param value - Valor a validar
 * @param maxLength - Longitud máxima permitida (default: 255)
 * @returns Objeto con resultado de validación y mensaje de error
 */
export function validateRequiredString(
  value: string | undefined | null,
  fieldName: string,
  maxLength: number = 255
): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} es requerido` };
  }
  if (value.trim().length > maxLength) {
    return { valid: false, error: `${fieldName} no puede exceder ${maxLength} caracteres` };
  }
  return { valid: true };
}

/**
 * Valida si un número es mayor o igual a cero
 * @param value - Valor numérico a validar
 * @param fieldName - Nombre del campo para mensajes de error
 * @returns Objeto con resultado de validación
 */
export function validateNonNegativeNumber(
  value: number | undefined | null,
  fieldName: string
): { valid: boolean; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} es requerido` };
  }
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} debe ser un número válido` };
  }
  if (value < 0) {
    return { valid: false, error: `${fieldName} no puede ser negativo` };
  }
  return { valid: true };
}

/**
 * Valida si un número es mayor a cero (para precios, cantidades, etc.)
 * @param value - Valor numérico a validar
 * @param fieldName - Nombre del campo para mensajes de error
 * @returns Objeto con resultado de validación
 */
export function validatePositiveNumber(
  value: number | undefined | null,
  fieldName: string
): { valid: boolean; error?: string } {
  const nonNegative = validateNonNegativeNumber(value, fieldName);
  if (!nonNegative.valid) return nonNegative;

  if (value === 0) {
    return { valid: false, error: `${fieldName} debe ser mayor a 0` };
  }
  return { valid: true };
}

/**
 * Valida datos de un producto
 * @param data - Datos del producto a validar
 * @returns Objeto con errores por campo
 */
export function validateProductData(data: {
  nombre?: string;
  descripcion?: string;
  stock?: number;
  precio_unitario?: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const nombreValidation = validateRequiredString(data.nombre, 'El nombre', 100);
  if (!nombreValidation.valid) {
    errors.nombre = nombreValidation.error!;
  }

  if (data.descripcion && data.descripcion.trim().length > 500) {
    errors.descripcion = 'La descripción no puede exceder 500 caracteres';
  }

  if (data.stock !== undefined) {
    const stockValidation = validateNonNegativeNumber(data.stock, 'El stock');
    if (!stockValidation.valid) {
      errors.stock = stockValidation.error!;
    }
  }

  if (data.precio_unitario !== undefined) {
    const precioValidation = validateNonNegativeNumber(data.precio_unitario, 'El precio unitario');
    if (!precioValidation.valid) {
      errors.precio_unitario = precioValidation.error!;
    }
  }

  return errors;
}

/**
 * Valida datos de un proveedor
 * @param data - Datos del proveedor a validar
 * @returns Objeto con errores por campo
 */
export function validateProveedorData(data: {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const nombreValidation = validateRequiredString(data.nombre, 'El nombre', 100);
  if (!nombreValidation.valid) {
    errors.nombre = nombreValidation.error!;
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'El email no tiene un formato válido (ejemplo@correo.com)';
  }

  if (data.direccion && data.direccion.trim().length > 500) {
    errors.direccion = 'La dirección no puede exceder 500 caracteres';
  }

  return errors;
}

/**
 * Sanitiza un string removiendo caracteres potencialmente peligrosos
 * @param value - Valor a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(value: string | undefined | null): string | null {
  if (!value) return null;
  return value.trim();
}

/**
 * Formatea un precio para mostrar
 * @param price - Precio a formatear
 * @param locale - Locale para formato (default: es-MX)
 * @param currency - Moneda (default: MXN)
 * @returns String formateado
 */
export function formatPrice(
  price: number,
  locale: string = 'es-MX',
  currency: string = 'MXN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Formatea una fecha para mostrar
 * @param date - Fecha a formatear
 * @param locale - Locale para formato (default: es-MX)
 * @returns String formateado
 */
export function formatDate(
  date: string | Date,
  locale: string = 'es-MX'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Verifica si hay errores en un objeto de validación
 * @param errors - Objeto con errores
 * @returns true si hay al menos un error
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
