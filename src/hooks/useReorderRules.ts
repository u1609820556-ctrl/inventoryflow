'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReglaAutopedido } from '@/types';

// Input types para crear/actualizar reglas
export interface CreateReorderRuleInput {
  producto_id: string;
  proveedor_id: string;
  stock_minimo: number;
  cantidad_pedido: number;
  activa?: boolean;
}

export interface UpdateReorderRuleInput {
  producto_id?: string;
  proveedor_id?: string;
  stock_minimo?: number;
  cantidad_pedido?: number;
  activa?: boolean;
}

interface ApiResponse {
  message?: string;
  data?: ReglaAutopedido | ReglaAutopedido[];
  error?: string;
  details?: string;
}

export function useReorderRules() {
  const [rules, setRules] = useState<ReglaAutopedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reorder-rules');
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Error al obtener reglas';
        const details = result.details ? ` (${result.details})` : '';
        throw new Error(`${errorMsg}${details}`);
      }

      const rulesData = (result.data as ReglaAutopedido[]) || [];
      setRules(rulesData);
    } catch (err) {
      console.error('[useReorderRules] Error al obtener reglas:', err);
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRule = async (data: CreateReorderRuleInput): Promise<ReglaAutopedido> => {
    // Validaciones
    if (!data.producto_id) {
      throw new Error('Debe seleccionar un producto');
    }
    if (!data.proveedor_id) {
      throw new Error('Debe seleccionar un proveedor');
    }
    if (typeof data.stock_minimo !== 'number' || data.stock_minimo < 0) {
      throw new Error('El stock mínimo debe ser un número >= 0');
    }
    if (typeof data.cantidad_pedido !== 'number' || data.cantidad_pedido <= 0) {
      throw new Error('La cantidad a pedir debe ser un número > 0');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reorder-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Error al crear regla';
        const details = result.details ? ` (${result.details})` : '';
        throw new Error(`${errorMsg}${details}`);
      }

      const newRule = result.data as ReglaAutopedido;

      if (!newRule) {
        throw new Error('No se recibió la regla creada del servidor');
      }

      // Update local state
      setRules((prev) => {
        // Check if rule already exists (update case from upsert)
        const existingIndex = prev.findIndex((r) => r.id === newRule.id);

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRule;
          return updated;
        } else {
          return [newRule, ...prev];
        }
      });

      return newRule;
    } catch (err) {
      console.error('[useReorderRules] Error en createRule:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (
    id: string,
    data: UpdateReorderRuleInput
  ): Promise<ReglaAutopedido> => {
    if (!id) {
      throw new Error('ID de regla requerido');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reorder-rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Error al actualizar regla';
        const details = result.details ? ` (${result.details})` : '';
        throw new Error(`${errorMsg}${details}`);
      }

      const updatedRule = result.data as ReglaAutopedido;

      if (!updatedRule) {
        throw new Error('No se recibió la regla actualizada del servidor');
      }

      // Update local state
      setRules((prev) => prev.map((r) => (r.id === id ? updatedRule : r)));

      return updatedRule;
    } catch (err) {
      console.error('[useReorderRules] Error en updateRule:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, activa?: boolean): Promise<ReglaAutopedido> => {
    const rule = rules.find((r) => r.id === id);
    if (!rule) {
      throw new Error('Regla no encontrada');
    }

    // Si se proporciona activa, usar ese valor; si no, toggle del valor actual
    const newActiva = activa !== undefined ? activa : !rule.activa;
    return updateRule(id, { activa: newActiva });
  };

  const deleteRule = async (id: string): Promise<void> => {
    if (!id) {
      throw new Error('ID de regla requerido');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reorder-rules/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Error al eliminar regla';
        const details = result.details ? ` (${result.details})` : '';
        throw new Error(`${errorMsg}${details}`);
      }

      // Remove from local state
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('[useReorderRules] Error en deleteRule:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar regla';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getActiveRulesCount = (): number => {
    return rules.filter((r) => r.activa).length;
  };

  const getRulesByProduct = (productoId: string): ReglaAutopedido[] => {
    return rules.filter((r) => r.producto_id === productoId);
  };

  const getRulesByProveedor = (proveedorId: string): ReglaAutopedido[] => {
    return rules.filter((r) => r.proveedor_id === proveedorId);
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
    getActiveRulesCount,
    getRulesByProduct,
    getRulesByProveedor,
  };
}
