'use client';

/**
 * Hook para importar datos desde archivos Excel (.xlsx, .xls) o CSV.
 * Detecta automáticamente si el archivo contiene productos o proveedores
 * basándose en los nombres de las columnas.
 *
 * @example
 * ```tsx
 * const { parsearArchivo, importar, loading, error } = useImportarExcel();
 *
 * const handleFile = async (file: File) => {
 *   const { datos, tipo } = await parsearArchivo(file);
 *   if (tipo === 'productos') {
 *     const resultado = await importar(datos, tipo);
 *     console.log(`Importados ${resultado.exito} productos`);
 *   }
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/** Tipo de datos que se pueden importar */
export type TipoImportacion = 'productos' | 'proveedores' | 'desconocido';

export interface DatosProductoImportar {
  nombre: string;
  descripcion?: string;
  codigo_barras?: string;
  stock: number;
  precio_unitario: number;
}

export interface DatosProveedorImportar {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ResultadoValidacion {
  valido: boolean;
  errores: string[];
  columnasEncontradas: string[];
  totalRegistros: number;
}

export interface ResultadoImportacion {
  exito: number;
  total: number;
  errores: string[];
  datos_importados: unknown[];
}

// Palabras clave para detectar tipo
const KEYWORDS_PRODUCTOS = ['producto', 'nombre', 'precio', 'stock', 'precio_unitario', 'codigo_barras', 'descripcion', 'barcode', 'price', 'quantity'];
const KEYWORDS_PROVEEDORES = ['proveedor', 'supplier', 'email', 'telefono', 'direccion', 'phone', 'address', 'contacto'];

// Mapeo de columnas
const COLUMN_MAPPINGS_PRODUCTOS: Record<string, string> = {
  // Español
  'nombre': 'nombre',
  'producto': 'nombre',
  'name': 'nombre',
  'descripcion': 'descripcion',
  'description': 'descripcion',
  'codigo_barras': 'codigo_barras',
  'codigo': 'codigo_barras',
  'barcode': 'codigo_barras',
  'sku': 'codigo_barras',
  'stock': 'stock',
  'cantidad': 'stock',
  'quantity': 'stock',
  'inventario': 'stock',
  'precio_unitario': 'precio_unitario',
  'precio': 'precio_unitario',
  'price': 'precio_unitario',
  'unit_price': 'precio_unitario',
  'costo': 'precio_unitario',
};

const COLUMN_MAPPINGS_PROVEEDORES: Record<string, string> = {
  // Español
  'nombre': 'nombre',
  'proveedor': 'nombre',
  'name': 'nombre',
  'supplier': 'nombre',
  'email': 'email',
  'correo': 'email',
  'mail': 'email',
  'telefono': 'telefono',
  'phone': 'telefono',
  'tel': 'telefono',
  'celular': 'telefono',
  'direccion': 'direccion',
  'address': 'direccion',
  'domicilio': 'direccion',
};

/**
 * Hook para manejar la importación de datos desde Excel/CSV.
 * Proporciona funciones para parsear, validar e importar datos.
 *
 * @returns Objeto con estados y funciones para la importación
 */
export function useImportarExcel() {
  /** Indica si hay una operación en progreso */
  const [loading, setLoading] = useState(false);
  /** Mensaje de error si algo falló */
  const [error, setError] = useState<string | null>(null);
  /** Vista previa de los datos parseados */
  const [preview, setPreview] = useState<unknown[]>([]);
  /** Porcentaje de progreso (0-100) */
  const [progreso, setProgreso] = useState(0);
  /** Tipo de datos detectado automáticamente */
  const [tipoDetectado, setTipoDetectado] = useState<TipoImportacion>('desconocido');
  /** Columnas encontradas en el archivo */
  const [columnasDetectadas, setColumnasDetectadas] = useState<string[]>([]);

  /**
   * Lee un archivo Excel o CSV y retorna los datos como array de objetos.
   * @param file - Archivo a leer (.xlsx, .xls o .csv)
   * @returns Array de objetos con los datos del archivo
   * @throws Error si el formato no es soportado o hay error de lectura
   */
  const leerArchivo = useCallback(async (file: File): Promise<unknown[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv') {
        // Parsear CSV con PapaParse
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (err) => {
            reject(new Error(`Error al leer CSV: ${err.message}`));
          },
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Parsear Excel con xlsx
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (err) {
            reject(new Error(`Error al leer Excel: ${err instanceof Error ? err.message : 'Error desconocido'}`));
          }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Formato de archivo no soportado. Use .xlsx, .xls o .csv'));
      }
    });
  }, []);

  /**
   * Detecta si el archivo contiene productos o proveedores basándose en headers.
   * Asigna puntos a cada tipo según las palabras clave encontradas.
   * @param headers - Array de nombres de columnas
   * @returns Tipo detectado: 'productos', 'proveedores' o 'desconocido'
   */
  const detectarTipo = useCallback((headers: string[]): TipoImportacion => {
    const headersLower = headers.map(h => h.toLowerCase().trim());

    let scoreProductos = 0;
    let scoreProveedores = 0;

    headersLower.forEach(header => {
      // Buscar coincidencias exactas o parciales
      KEYWORDS_PRODUCTOS.forEach(keyword => {
        if (header.includes(keyword)) scoreProductos++;
      });
      KEYWORDS_PROVEEDORES.forEach(keyword => {
        if (header.includes(keyword)) scoreProveedores++;
      });
    });

    // Si tiene campos específicos de productos
    if (headersLower.some(h => ['precio', 'price', 'precio_unitario', 'stock', 'cantidad'].includes(h))) {
      scoreProductos += 3;
    }

    // Si tiene campos específicos de proveedores
    if (headersLower.some(h => ['email', 'correo', 'telefono', 'phone'].includes(h)) &&
        !headersLower.some(h => ['precio', 'price', 'stock'].includes(h))) {
      scoreProveedores += 3;
    }

    console.log('[useImportarExcel] Score productos:', scoreProductos, 'Score proveedores:', scoreProveedores);

    if (scoreProductos > scoreProveedores) return 'productos';
    if (scoreProveedores > scoreProductos) return 'proveedores';
    return 'desconocido';
  }, []);

  /**
   * Parsea un archivo y detecta automáticamente su tipo.
   * Esta es la función principal para procesar un archivo nuevo.
   * @param file - Archivo Excel o CSV a procesar
   * @returns Objeto con datos parseados, tipo detectado y headers
   * @throws Error si el archivo está vacío o tiene formato inválido
   */
  const parsearArchivo = useCallback(async (file: File): Promise<{
    datos: unknown[];
    tipo: TipoImportacion;
    headers: string[];
  }> => {
    setLoading(true);
    setError(null);
    setProgreso(10);

    try {
      const datos = await leerArchivo(file);
      setProgreso(50);

      if (!datos || datos.length === 0) {
        throw new Error('El archivo está vacío o no tiene datos válidos');
      }

      // Obtener headers del primer registro
      const headers = Object.keys(datos[0] as Record<string, unknown>);
      setColumnasDetectadas(headers);
      setProgreso(70);

      // Detectar tipo
      const tipo = detectarTipo(headers);
      setTipoDetectado(tipo);
      setProgreso(100);

      console.log('[useImportarExcel] Archivo parseado:', {
        registros: datos.length,
        headers,
        tipoDetectado: tipo,
      });

      return { datos, tipo, headers };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al parsear archivo';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [leerArchivo, detectarTipo]);

  /**
   * Mapea las columnas del archivo a los campos esperados.
   * Convierte nombres de columnas en español/inglés a campos internos.
   * @param datos - Datos crudos del archivo
   * @param tipo - Tipo de importación (productos o proveedores)
   * @returns Array de datos con campos normalizados
   */
  const mapearDatos = useCallback((
    datos: unknown[],
    tipo: TipoImportacion
  ): DatosProductoImportar[] | DatosProveedorImportar[] => {
    const mappings = tipo === 'productos' ? COLUMN_MAPPINGS_PRODUCTOS : COLUMN_MAPPINGS_PROVEEDORES;

    const result = datos.map((row) => {
      const rowData = row as Record<string, unknown>;
      const mapped: Record<string, unknown> = {};

      Object.entries(rowData).forEach(([key, value]) => {
        const keyLower = key.toLowerCase().trim();
        const mappedKey = mappings[keyLower];

        if (mappedKey) {
          // Convertir valores numéricos
          if (tipo === 'productos' && (mappedKey === 'stock' || mappedKey === 'precio_unitario')) {
            const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
            mapped[mappedKey] = isNaN(numValue) ? 0 : numValue;
          } else {
            mapped[mappedKey] = value ? String(value).trim() : '';
          }
        }
      });

      return mapped;
    });

    return result as unknown as DatosProductoImportar[] | DatosProveedorImportar[];
  }, []);

  /**
   * Valida los datos antes de importar.
   * Verifica campos requeridos, formatos y valores válidos.
   * @param datos - Datos a validar
   * @param tipo - Tipo de importación
   * @returns Objeto con resultado de validación y errores encontrados
   */
  const validarDatos = useCallback((
    datos: unknown[],
    tipo: TipoImportacion
  ): ResultadoValidacion => {
    const errores: string[] = [];
    const columnasEncontradas: string[] = [];

    if (!datos || datos.length === 0) {
      return {
        valido: false,
        errores: ['No hay datos para validar'],
        columnasEncontradas: [],
        totalRegistros: 0,
      };
    }

    // Obtener columnas del primer registro
    const primeraFila = datos[0] as Record<string, unknown>;
    const headers = Object.keys(primeraFila);
    const mappings = tipo === 'productos' ? COLUMN_MAPPINGS_PRODUCTOS : COLUMN_MAPPINGS_PROVEEDORES;

    // Verificar qué columnas se mapearon
    headers.forEach(header => {
      const headerLower = header.toLowerCase().trim();
      if (mappings[headerLower]) {
        columnasEncontradas.push(mappings[headerLower]);
      }
    });

    // Validar campos requeridos
    if (tipo === 'productos') {
      if (!columnasEncontradas.includes('nombre')) {
        errores.push('Falta columna "nombre" o "producto"');
      }
      // Precio es requerido para productos
      if (!columnasEncontradas.includes('precio_unitario')) {
        errores.push('Falta columna "precio_unitario" o "precio"');
      }
    } else if (tipo === 'proveedores') {
      if (!columnasEncontradas.includes('nombre')) {
        errores.push('Falta columna "nombre" o "proveedor"');
      }
    }

    // Validar cada registro
    const datosMapeados = mapearDatos(datos, tipo);

    datosMapeados.forEach((registro, index) => {
      if (tipo === 'productos') {
        const prod = registro as DatosProductoImportar;
        if (!prod.nombre || !prod.nombre.trim()) {
          errores.push(`Fila ${index + 2}: El nombre está vacío`);
        }
        if (prod.precio_unitario < 0) {
          errores.push(`Fila ${index + 2}: El precio no puede ser negativo`);
        }
        if (prod.stock < 0) {
          errores.push(`Fila ${index + 2}: El stock no puede ser negativo`);
        }
      } else if (tipo === 'proveedores') {
        const prov = registro as DatosProveedorImportar;
        if (!prov.nombre || !prov.nombre.trim()) {
          errores.push(`Fila ${index + 2}: El nombre está vacío`);
        }
        // Validar email si existe
        if (prov.email && prov.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(prov.email.trim())) {
            errores.push(`Fila ${index + 2}: El email "${prov.email}" no es válido`);
          }
        }
      }
    });

    // Limitar errores mostrados
    const erroresLimitados = errores.slice(0, 10);
    if (errores.length > 10) {
      erroresLimitados.push(`... y ${errores.length - 10} errores más`);
    }

    return {
      valido: errores.length === 0,
      errores: erroresLimitados,
      columnasEncontradas: [...new Set(columnasEncontradas)],
      totalRegistros: datos.length,
    };
  }, [mapearDatos]);

  /**
   * Importa los datos validados a la base de datos.
   * Llama a la API correspondiente según el tipo de datos.
   * @param datos - Datos validados a importar
   * @param tipo - Tipo de importación (productos o proveedores)
   * @returns Resultado con cantidad de éxitos, errores y datos importados
   * @throws Error si la API falla o hay errores de red
   */
  const importar = useCallback(async (
    datos: unknown[],
    tipo: TipoImportacion
  ): Promise<ResultadoImportacion> => {
    setLoading(true);
    setError(null);
    setProgreso(0);

    try {
      // Mapear datos
      const datosMapeados = mapearDatos(datos, tipo);
      setProgreso(20);

      // Determinar endpoint
      const endpoint = tipo === 'productos'
        ? '/api/productos/import'
        : '/api/proveedores/import';

      setProgreso(30);

      // Llamar a la API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datos: datosMapeados }),
      });

      setProgreso(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status} al importar`);
      }

      const resultado = await response.json();
      setProgreso(100);

      console.log('[useImportarExcel] Importación completada:', resultado);

      return {
        exito: resultado.exito || 0,
        total: resultado.total || datos.length,
        errores: resultado.errores || [],
        datos_importados: resultado.datos_importados || [],
      };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al importar datos';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [mapearDatos]);

  // Generar preview de los primeros N registros
  const generarPreview = useCallback((datos: unknown[], tipo: TipoImportacion, limite: number = 5): void => {
    const datosMapeados = mapearDatos(datos, tipo);
    setPreview(datosMapeados.slice(0, limite));
  }, [mapearDatos]);

  // Reset estado
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setPreview([]);
    setProgreso(0);
    setTipoDetectado('desconocido');
    setColumnasDetectadas([]);
  }, []);

  return {
    // Estados
    loading,
    error,
    preview,
    progreso,
    tipoDetectado,
    columnasDetectadas,

    // Funciones
    parsearArchivo,
    detectarTipo,
    validarDatos,
    importar,
    mapearDatos,
    generarPreview,
    reset,
  };
}
