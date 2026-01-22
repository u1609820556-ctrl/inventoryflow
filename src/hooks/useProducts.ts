'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Producto } from '@/types';

// Input types para crear/actualizar productos
export interface CreateProductInput {
  nombre: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock?: number;
  precio_unitario: number;
}

export interface UpdateProductInput {
  nombre?: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock?: number;
  precio_unitario?: number;
}

// Validación de UUID
const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export function useProducts(enabled: boolean = true) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // Obtener empresa_id al inicializar (solo si está habilitado)
  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('[useProducts] Obteniendo productos...');

    try {
      const { data, error: err } = await supabase
        .from('productos')
        .select(`
          *,
          proveedor:proveedor_id(id, nombre)
        `)
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

  const createProduct = async (data: CreateProductInput): Promise<Producto> => {
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
    if (typeof data.precio_unitario !== 'number' || data.precio_unitario < 0) {
      throw new Error('El precio unitario debe ser un número >= 0');
    }
    if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
      throw new Error('El stock debe ser un número >= 0');
    }

    setLoading(true);
    setError(null);

    try {
      const insertData = {
        empresa_id: empresaId,
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        referencia: data.referencia?.trim() || null,
        proveedor_id: data.proveedor_id || null,
        stock: data.stock ?? 0,
        precio_unitario: data.precio_unitario,
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
          throw new Error('Error de permisos (RLS): No tienes permiso para crear productos.');
        }
        // Error de duplicado
        if (err.code === '23505') {
          throw new Error('Ya existe un producto con ese nombre en tu empresa.');
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
    data: UpdateProductInput
  ): Promise<Producto> => {
    console.log('[useProducts] updateProduct llamado:', { id, data });

    // Validar que el ID es un UUID válido
    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
      throw new Error('ID de producto inválido');
    }
    if (!empresaId) {
      throw new Error('No se puede actualizar: empresa_id no disponible');
    }
    if (data.nombre !== undefined && !data.nombre.trim()) {
      throw new Error('El nombre del producto no puede estar vacío');
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    if (data.precio_unitario !== undefined && data.precio_unitario < 0) {
      throw new Error('El precio unitario no puede ser negativo');
    }

    setLoading(true);
    setError(null);

    try {
      // Limpiar datos antes de enviar
      const cleanedData: Record<string, unknown> = {};

      if (data.nombre !== undefined) {
        cleanedData.nombre = data.nombre.trim();
      }
      if (data.descripcion !== undefined) {
        cleanedData.descripcion = data.descripcion?.trim() || null;
      }
      if (data.referencia !== undefined) {
        cleanedData.referencia = data.referencia?.trim() || null;
      }
      if (data.proveedor_id !== undefined) {
        cleanedData.proveedor_id = data.proveedor_id || null;
      }
      if (data.stock !== undefined) {
        cleanedData.stock = data.stock;
      }
      if (data.precio_unitario !== undefined) {
        cleanedData.precio_unitario = data.precio_unitario;
      }

      console.log('[useProducts] Datos limpiados para actualizar:', cleanedData);

      const { data: updatedProduct, error: err } = await supabase
        .from('productos')
        .update(cleanedData)
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single();

      if (err) {
        console.error('[useProducts] Error al actualizar:', err);

        if (err.code === '42501' || err.message.includes('RLS')) {
          throw new Error('Error de permisos: No tienes permiso para actualizar este producto.');
        }
        if (err.code === '23505') {
          throw new Error('Ya existe un producto con ese nombre en tu empresa.');
        }

        throw new Error(`Error al actualizar: ${err.message}`);
      }

      if (!updatedProduct) {
        throw new Error('Producto no encontrado o no tienes permisos para editarlo');
      }

      console.log('[useProducts] Producto actualizado:', updatedProduct.id);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      return updatedProduct;
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

    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
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
        .eq('empresa_id', empresaId);

      if (err) {
        console.error('[useProducts] Error al eliminar:', err);

        if (err.code === '23503') {
          throw new Error('No se puede eliminar: Este producto está referenciado en reglas de autopedido u otros registros.');
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

  const getProductsWithLowStock = (threshold?: number): Producto[] => {
    return products.filter((p) => threshold ? p.stock < threshold : p.stock <= 0);
  };

  const searchProducts = (query: string): Producto[] => {
    if (!query || !query.trim()) {
      return products;
    }
    const lowerQuery = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(lowerQuery) ||
        p.descripcion?.toLowerCase().includes(lowerQuery) ||
        p.referencia?.toLowerCase().includes(lowerQuery) ||
        p.proveedor?.nombre?.toLowerCase().includes(lowerQuery)
    );
  };

  // Cargar productos al iniciar
  useEffect(() => {
    if (enabled) {
      fetchProducts();
    }
  }, [enabled, fetchProducts]);

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
