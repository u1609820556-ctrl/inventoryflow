'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import type { Producto } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.productos.getAll();

      if (err) throw err;
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (data: {
    nombre: string;
    descripcion?: string;
    codigo_barras?: string;
    stock_actual: number;
    stock_minimo: number;
    proveedor_principal_id?: string;
  }): Promise<Producto> => {
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre del producto es requerido');
    }
    if (data.stock_actual < 0) {
      throw new Error('El stock actual no puede ser negativo');
    }
    if (data.stock_minimo < 0) {
      throw new Error('El stock mínimo no puede ser negativo');
    }

    setLoading(true);
    setError(null);
    try {
      const { data: newProduct, error: err } = await db.productos.create({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        codigo_barras: data.codigo_barras?.trim() || null,
        stock_actual: data.stock_actual,
        stock_minimo: data.stock_minimo,
        proveedor_principal_id: data.proveedor_principal_id || null,
      });

      if (err) throw err;
      if (!newProduct) throw new Error('No se pudo crear el producto');

      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Failed to create product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    data: Partial<Omit<Producto, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de producto inválido');
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
      const { data: updatedProduct, error: err } = await db.productos.update(id, data);

      if (err) throw err;
      if (!updatedProduct) throw new Error('No se pudo actualizar el producto');

      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
    } catch (err) {
      console.error('Failed to update product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de producto inválido');
    }

    setLoading(true);
    setError(null);
    try {
      const { error: err } = await db.productos.delete(id);

      if (err) throw err;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsWithLowStock,
    searchProducts,
  };
}
