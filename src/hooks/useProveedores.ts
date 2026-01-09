'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import type { Proveedor } from '@/types';

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.proveedores.getAll();

      if (err) throw err;
      setProveedores(data || []);
    } catch (err) {
      console.error('Failed to fetch proveedores:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProveedor = async (data: {
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<Proveedor> => {
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre del proveedor es requerido');
    }

    setLoading(true);
    setError(null);
    try {
      const { data: newProveedor, error: err } = await db.proveedores.create({
        nombre: data.nombre.trim(),
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
      });

      if (err) throw err;
      if (!newProveedor) throw new Error('No se pudo crear el proveedor');

      setProveedores((prev) => [...prev, newProveedor]);
      return newProveedor;
    } catch (err) {
      console.error('Failed to create proveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProveedor = async (
    id: string,
    data: Partial<Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de proveedor inválido');
    }

    setLoading(true);
    setError(null);
    try {
      const { data: updatedProveedor, error: err } = await db.proveedores.update(id, data);

      if (err) throw err;
      if (!updatedProveedor) throw new Error('No se pudo actualizar el proveedor');

      setProveedores((prev) => prev.map((p) => (p.id === id ? updatedProveedor : p)));
    } catch (err) {
      console.error('Failed to update proveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProveedor = async (id: string): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de proveedor inválido');
    }

    setLoading(true);
    setError(null);
    try {
      const { error: err } = await db.proveedores.delete(id);

      if (err) throw err;
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete proveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  };
}
