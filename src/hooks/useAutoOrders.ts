'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import type { ReglaAutopedido } from '@/types';

export function useAutoOrders() {
  const [rules, setRules] = useState<ReglaAutopedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.autopedidos.getAll();

      if (err) throw err;
      setRules(data || []);
    } catch (err) {
      console.error('Failed to fetch auto-order rules:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = async (data: {
    producto_id: string;
    stock_minimo_trigger: number;
    cantidad_a_pedir: number;
    proveedor_id: string;
    requerir_aprobacion: boolean;
    habilitado: boolean;
  }): Promise<ReglaAutopedido> => {
    // Validaciones
    if (!data.producto_id) throw new Error('El producto es requerido');
    if (data.stock_minimo_trigger < 0) {
      throw new Error('El stock mínimo trigger debe ser mayor o igual a 0');
    }
    if (data.cantidad_a_pedir <= 0) {
      throw new Error('La cantidad a pedir debe ser mayor a 0');
    }
    if (!data.proveedor_id) throw new Error('El proveedor es requerido');

    setLoading(true);
    setError(null);
    try {
      // Verificar que no exista otra regla para el mismo producto
      const existingRule = rules.find((r) => r.producto_id === data.producto_id);
      if (existingRule) {
        throw new Error('Ya existe una regla de autopedido para este producto');
      }

      const { data: newRule, error: err } = await db.autopedidos.create(data);
      if (err) throw err;
      if (!newRule) throw new Error('No se pudo crear la regla');

      setRules((prev) => [...prev, newRule]);
      return newRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (
    id: string,
    data: Partial<Omit<ReglaAutopedido, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> => {
    if (!id) throw new Error('ID de regla inválido');

    setLoading(true);
    setError(null);
    try {
      const { data: updatedRule, error: err } = await db.autopedidos.update(id, data);
      if (err) throw err;
      if (!updatedRule) throw new Error('No se pudo actualizar la regla');

      setRules((prev) => prev.map((r) => (r.id === id ? updatedRule : r)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, habilitado: boolean): Promise<void> => {
    return updateRule(id, { habilitado });
  };

  const deleteRule = async (id: string): Promise<void> => {
    if (!id) throw new Error('ID de regla inválido');

    setLoading(true);
    setError(null);
    try {
      const { error: err } = await db.autopedidos.delete(id);
      if (err) throw err;

      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActiveRules = (): ReglaAutopedido[] => {
    return rules.filter((r) => r.habilitado);
  };

  const getRuleByProduct = (productoId: string): ReglaAutopedido | undefined => {
    return rules.find((r) => r.producto_id === productoId);
  };

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
    getActiveRules,
    getRuleByProduct,
  };
}
