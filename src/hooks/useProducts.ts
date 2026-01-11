'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Producto } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // Obtener empresa_id al inicializar
  useEffect(() => {
    const getEmpresaId = async () => {
      try {
        console.log('[useProducts] Obteniendo empresa_id...');
        const { data, error: empresaError } = await supabase
          .from('empresa')
          .select('id')
          .limit(1);

        if (empresaError) {
          console.error('[useProducts] Error obteniendo empresa:', empresaError);
          setError('Error al obtener empresa: ' + empresaError.message);
          return;
        }

        if (data && data.length > 0) {
          console.log('[useProducts] empresa_id encontrado:', data[0].id);
          setEmpresaId(data[0].id);
        } else {
          console.warn('[useProducts] No se encontró empresa');
          setError('No se encontró la empresa. Configura la empresa primero.');
        }
      } catch (err) {
        console.error('[useProducts] Error inesperado:', err);
        setError('Error inesperado al obtener empresa');
      }
    };

    getEmpresaId();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!empresaId) {
      console.log('[useProducts] fetchProducts: No hay empresa_id, esperando...');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[useProducts] Obteniendo productos para empresa:', empresaId);

    try {
      const { data, error: err } = await supabase
        .from('productos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nombre');

      if (err) {
        console.error('[useProducts] Error en query:', err);
        throw new Error(`Error de Supabase: ${err.message} (código: ${err.code})`);
      }

      console.log('[useProducts] Productos obtenidos:', data?.length || 0);
      setProducts(data || []);
    } catch (err) {
      console.error('[useProducts] Error al obtener productos:', err);
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  const createProduct = async (data: {
    nombre: string;
    descripcion?: string;
    codigo_barras?: string;
    stock_actual: number;
    stock_minimo: number;
    proveedor_principal_id?: string;
  }): Promise<Producto> => {
    console.log('[useProducts] createProduct llamado con:', data);

    // Validaciones
    if (!empresaId) {
      const msg = 'No se puede crear producto: empresa_id no disponible';
      console.error('[useProducts]', msg);
      throw new Error(msg);
    }
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre del producto es requerido');
    }
    if (typeof data.stock_actual !== 'number' || data.stock_actual < 0) {
      throw new Error('El stock actual debe ser un número >= 0');
    }
    if (typeof data.stock_minimo !== 'number' || data.stock_minimo < 0) {
      throw new Error('El stock mínimo debe ser un número >= 0');
    }

    setLoading(true);
    setError(null);

    try {
      // Validar que proveedor_principal_id es un UUID válido si se proporciona
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const proveedorId = data.proveedor_principal_id?.trim();

      const insertData = {
        empresa_id: empresaId,
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        codigo_barras: data.codigo_barras?.trim() || null,
        stock_actual: data.stock_actual,
        stock_minimo: data.stock_minimo,
        proveedor_principal_id: (proveedorId && uuidRegex.test(proveedorId)) ? proveedorId : null,
      };

      console.log('[useProducts] Insertando producto:', insertData);

      const { data: newProduct, error: err } = await supabase
        .from('productos')
        .insert(insertData)
        .select()
        .single();

      if (err) {
        console.error('[useProducts] Error de Supabase al crear:', err);

        // Errores específicos de RLS
        if (err.code === '42501' || err.message.includes('RLS') || err.message.includes('policy')) {
          throw new Error('Error de permisos (RLS): No tienes permiso para crear productos. Verifica la configuración de seguridad.');
        }
        // Error de foreign key
        if (err.code === '23503') {
          throw new Error('Error de referencia: El proveedor seleccionado no existe.');
        }
        // Error de duplicado
        if (err.code === '23505') {
          throw new Error('Ya existe un producto con ese código de barras.');
        }

        throw new Error(`Error al crear producto: ${err.message}`);
      }

      if (!newProduct) {
        throw new Error('No se recibió respuesta del servidor al crear el producto');
      }

      console.log('[useProducts] Producto creado exitosamente:', newProduct.id);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('[useProducts] Error en createProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    data: Partial<Omit<Producto, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    console.log('[useProducts] updateProduct llamado:', { id, data });

    // Validar que el ID es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      throw new Error('ID de producto inválido');
    }
    if (!empresaId) {
      throw new Error('No se puede actualizar: empresa_id no disponible');
    }
    if (data.stock_actual !== undefined && data.stock_actual < 0) {
      throw new Error('El stock actual no puede ser negativo');
    }
    if (data.stock_minimo !== undefined && data.stock_minimo < 0) {
      throw new Error('El stock mínimo no puede ser negativo');
    }

    setLoading(true);
    setError(null);

    try {
      // Limpiar datos antes de enviar - convertir strings vacíos a null para campos UUID
      const cleanedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key === 'proveedor_principal_id') {
          // Si es string vacío o no es UUID válido, enviar null
          cleanedData[key] = (typeof value === 'string' && value.trim() && uuidRegex.test(value)) ? value : null;
        } else if (typeof value === 'string') {
          // Para otros strings, usar null si está vacío, o trim del valor
          cleanedData[key] = value.trim() || null;
        } else {
          cleanedData[key] = value;
        }
      }

      console.log('[useProducts] Datos limpiados para actualizar:', cleanedData);

      const { data: updatedProduct, error: err } = await supabase
        .from('productos')
        .update(cleanedData)
        .eq('id', id)
        .eq('empresa_id', empresaId) // Seguridad adicional
        .select()
        .single();

      if (err) {
        console.error('[useProducts] Error al actualizar:', err);

        if (err.code === '42501' || err.message.includes('RLS')) {
          throw new Error('Error de permisos: No tienes permiso para actualizar este producto.');
        }

        // Error específico de UUID inválido
        if (err.message.includes('invalid input syntax for type uuid')) {
          throw new Error('Error: Uno de los campos UUID tiene un formato inválido.');
        }

        throw new Error(`Error al actualizar: ${err.message}`);
      }

      if (!updatedProduct) {
        throw new Error('Producto no encontrado o no tienes permisos para editarlo');
      }

      console.log('[useProducts] Producto actualizado:', updatedProduct.id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
    } catch (err) {
      console.error('[useProducts] Error en updateProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    console.log('[useProducts] deleteProduct llamado:', id);

    if (!id || typeof id !== 'string') {
      throw new Error('ID de producto inválido');
    }
    if (!empresaId) {
      throw new Error('No se puede eliminar: empresa_id no disponible');
    }

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresaId); // Seguridad adicional

      if (err) {
        console.error('[useProducts] Error al eliminar:', err);

        if (err.code === '23503') {
          throw new Error('No se puede eliminar: Este producto está referenciado en otros registros (movimientos, pedidos, etc.)');
        }
        if (err.code === '42501' || err.message.includes('RLS')) {
          throw new Error('Error de permisos: No tienes permiso para eliminar este producto.');
        }

        throw new Error(`Error al eliminar: ${err.message}`);
      }

      console.log('[useProducts] Producto eliminado:', id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('[useProducts] Error en deleteProduct:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProductsWithLowStock = (): Producto[] => {
    return products.filter((p) => p.stock_actual < p.stock_minimo);
  };

  const searchProducts = (query: string): Producto[] => {
    if (!query || !query.trim()) {
      return products;
    }
    const lowerQuery = query.toLowerCase().trim();
    return products.filter((p) => p.nombre.toLowerCase().includes(lowerQuery));
  };

  // Cargar productos cuando empresaId esté disponible
  useEffect(() => {
    if (empresaId) {
      fetchProducts();
    }
  }, [empresaId, fetchProducts]);

  return {
    products,
    loading,
    error,
    empresaId,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsWithLowStock,
    searchProducts,
  };
}
