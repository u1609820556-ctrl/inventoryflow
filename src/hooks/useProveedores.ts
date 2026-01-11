'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Proveedor } from '@/types';

// Validación simple de email
const isValidEmail = (email: string): boolean => {
  if (!email) return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  // Obtener empresa_id al inicializar
  useEffect(() => {
    const getEmpresaId = async () => {
      try {
        console.log('[useProveedores] Obteniendo empresa_id...');
        const { data, error: empresaError } = await supabase
          .from('empresa')
          .select('id')
          .limit(1);

        if (empresaError) {
          console.error('[useProveedores] Error obteniendo empresa:', empresaError);
          setError('Error al obtener empresa: ' + empresaError.message);
          return;
        }

        if (data && data.length > 0) {
          console.log('[useProveedores] empresa_id encontrado:', data[0].id);
          setEmpresaId(data[0].id);
        } else {
          console.warn('[useProveedores] No se encontró empresa');
          setError('No se encontró la empresa. Configura la empresa primero.');
        }
      } catch (err) {
        console.error('[useProveedores] Error inesperado:', err);
        setError('Error inesperado al obtener empresa');
      }
    };

    getEmpresaId();
  }, []);

  const fetchProveedores = useCallback(async () => {
    if (!empresaId) {
      console.log('[useProveedores] fetchProveedores: No hay empresa_id, esperando...');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[useProveedores] Obteniendo proveedores para empresa:', empresaId);

    try {
      const { data, error: err } = await supabase
        .from('proveedores')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nombre');

      if (err) {
        console.error('[useProveedores] Error en query:', err);
        throw new Error(`Error de Supabase: ${err.message} (código: ${err.code})`);
      }

      console.log('[useProveedores] Proveedores obtenidos:', data?.length || 0);
      setProveedores(data || []);
    } catch (err) {
      console.error('[useProveedores] Error al obtener proveedores:', err);
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  const createProveedor = async (data: {
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<Proveedor> => {
    console.log('[useProveedores] createProveedor llamado con:', data);

    // Validaciones
    if (!empresaId) {
      const msg = 'No se puede crear proveedor: empresa_id no disponible';
      console.error('[useProveedores]', msg);
      throw new Error(msg);
    }
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error('El nombre del proveedor es requerido');
    }
    if (data.email && !isValidEmail(data.email.trim())) {
      throw new Error('El formato del email no es válido');
    }

    setLoading(true);
    setError(null);

    try {
      const insertData = {
        empresa_id: empresaId,
        nombre: data.nombre.trim(),
        email: data.email?.trim() || null,
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
      };

      console.log('[useProveedores] Insertando proveedor:', insertData);

      const { data: newProveedor, error: err } = await supabase
        .from('proveedores')
        .insert(insertData)
        .select()
        .single();

      if (err) {
        console.error('[useProveedores] Error de Supabase al crear:', err);

        // Errores específicos de RLS
        if (err.code === '42501' || err.message.includes('RLS') || err.message.includes('policy')) {
          throw new Error('Error de permisos (RLS): No tienes permiso para crear proveedores. Verifica la configuración de seguridad.');
        }
        // Error de duplicado (si hay unique constraint en email)
        if (err.code === '23505') {
          throw new Error('Ya existe un proveedor con ese email.');
        }

        throw new Error(`Error al crear proveedor: ${err.message}`);
      }

      if (!newProveedor) {
        throw new Error('No se recibió respuesta del servidor al crear el proveedor');
      }

      console.log('[useProveedores] Proveedor creado exitosamente:', newProveedor.id);
      setProveedores((prev) => [...prev, newProveedor]);
      return newProveedor;
    } catch (err) {
      console.error('[useProveedores] Error en createProveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProveedor = async (
    id: string,
    data: Partial<Omit<Proveedor, 'id' | 'empresa_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    console.log('[useProveedores] updateProveedor llamado:', { id, data });

    if (!id || typeof id !== 'string') {
      throw new Error('ID de proveedor inválido');
    }
    if (!empresaId) {
      throw new Error('No se puede actualizar: empresa_id no disponible');
    }
    if (data.email && !isValidEmail(data.email.trim())) {
      throw new Error('El formato del email no es válido');
    }

    setLoading(true);
    setError(null);

    try {
      const { data: updatedProveedor, error: err } = await supabase
        .from('proveedores')
        .update(data)
        .eq('id', id)
        .eq('empresa_id', empresaId) // Seguridad adicional
        .select()
        .single();

      if (err) {
        console.error('[useProveedores] Error al actualizar:', err);

        if (err.code === '42501' || err.message.includes('RLS')) {
          throw new Error('Error de permisos: No tienes permiso para actualizar este proveedor.');
        }

        throw new Error(`Error al actualizar: ${err.message}`);
      }

      if (!updatedProveedor) {
        throw new Error('Proveedor no encontrado o no tienes permisos para editarlo');
      }

      console.log('[useProveedores] Proveedor actualizado:', updatedProveedor.id);
      setProveedores((prev) => prev.map((p) => (p.id === id ? updatedProveedor : p)));
    } catch (err) {
      console.error('[useProveedores] Error en updateProveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteProveedor = async (id: string): Promise<void> => {
    console.log('[useProveedores] deleteProveedor llamado:', id);

    if (!id || typeof id !== 'string') {
      throw new Error('ID de proveedor inválido');
    }
    if (!empresaId) {
      throw new Error('No se puede eliminar: empresa_id no disponible');
    }

    setLoading(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresaId); // Seguridad adicional

      if (err) {
        console.error('[useProveedores] Error al eliminar:', err);

        if (err.code === '23503') {
          throw new Error('No se puede eliminar: Este proveedor está referenciado en productos o pedidos.');
        }
        if (err.code === '42501' || err.message.includes('RLS')) {
          throw new Error('Error de permisos: No tienes permiso para eliminar este proveedor.');
        }

        throw new Error(`Error al eliminar: ${err.message}`);
      }

      console.log('[useProveedores] Proveedor eliminado:', id);
      setProveedores((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('[useProveedores] Error en deleteProveedor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar proveedor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores cuando empresaId esté disponible
  useEffect(() => {
    if (empresaId) {
      fetchProveedores();
    }
  }, [empresaId, fetchProveedores]);

  return {
    proveedores,
    loading,
    error,
    empresaId,
    fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  };
}
