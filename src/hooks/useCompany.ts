'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import type { Empresa } from '@/types';

export function useCompany() {
  const [company, setCompany] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.empresa.get();

      if (err && err.code !== 'PGRST116') {
        throw err;
      }

      setCompany(data || null);
    } catch (err) {
      console.error('Failed to fetch company:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = async (data: {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
  }): Promise<Empresa> => {
    if (!data.nombre_empresa || !data.nombre_empresa.trim()) {
      throw new Error('El nombre de la empresa es requerido');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('El email es requerido');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('El email no es válido');
    }
    if (!data.telefono || !data.telefono.trim()) {
      throw new Error('El teléfono es requerido');
    }
    if (!data.direccion || !data.direccion.trim()) {
      throw new Error('La dirección es requerida');
    }

    setLoading(true);
    setError(null);
    try {
      const { data: newCompany, error: err } = await db.empresa.create({
        nombre_empresa: data.nombre_empresa.trim(),
        email: data.email.trim(),
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
      });

      if (err) throw err;
      if (!newCompany) throw new Error('No se pudo crear la empresa');

      setCompany(newCompany);
      return newCompany;
    } catch (err) {
      console.error('Failed to create company:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear empresa';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isSetupComplete = (): boolean => {
    return company !== null;
  };

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    loading,
    error,
    fetchCompany,
    createCompany,
    isSetupComplete,
  };
}
