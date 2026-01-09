'use client';

import { useState, useCallback } from 'react';
import { db, authHelpers } from '@/lib/supabase';
import type { Movimiento } from '@/types';

export type MovementFormData = {
  producto_id: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Pedido_Recibido';
  cantidad: number;
  proveedor_id?: string;
  notas?: string;
};

export function useMovements() {
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async (limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.movimientos.getAll();

      if (err) throw err;

      // Limit results
      const limitedData = (data || []).slice(0, limit);
      setMovements(limitedData);
    } catch (err) {
      console.error('Failed to fetch movements:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoreMovements = useCallback(async (offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.movimientos.getAll();

      if (err) throw err;

      // Get next batch starting from offset
      const moreBatch = (data || []).slice(offset, offset + 50);
      setMovements((prev) => [...prev, ...moreBatch]);
    } catch (err) {
      console.error('Failed to fetch more movements:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMovement = async (formData: MovementFormData): Promise<Movimiento> => {
    // Validations
    if (!formData.producto_id) {
      throw new Error('El producto es requerido');
    }
    if (!formData.tipo) {
      throw new Error('El tipo de movimiento es requerido');
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    setLoading(true);
    setError(null);
    try {
      // Get current user
      const { user } = await authHelpers.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Get current product stock
      const { data: product, error: productErr } = await db.productos.getById(formData.producto_id);
      if (productErr) throw productErr;
      if (!product) throw new Error('Producto no encontrado');

      const currentStock = product.stock_actual;

      // Calculate new stock based on movement type
      let newStock: number;
      switch (formData.tipo) {
        case 'Entrada':
          newStock = currentStock + formData.cantidad;
          break;
        case 'Salida':
          newStock = currentStock - formData.cantidad;
          // Validate stock doesn't go negative
          if (newStock < 0) {
            throw new Error('No hay suficiente stock. Stock actual: ' + currentStock);
          }
          break;
        case 'Ajuste':
          // For Ajuste, cantidad is the NEW total stock
          newStock = formData.cantidad;
          break;
        case 'Pedido_Recibido':
          newStock = currentStock + formData.cantidad;
          break;
        default:
          throw new Error('Tipo de movimiento inválido');
      }

      // Create movement record
      const movementData = {
        producto_id: formData.producto_id,
        tipo: formData.tipo,
        cantidad: formData.cantidad,
        fecha: new Date().toISOString(),
        proveedor_id: formData.proveedor_id || null,
        notas: formData.notas?.trim() || null,
        usuario_id: user.id,
      };

      const { data: newMovement, error: movErr } = await db.movimientos.create(movementData);
      if (movErr) throw movErr;
      if (!newMovement) throw new Error('No se pudo crear el movimiento');

      // Update product stock
      const { error: updateErr } = await db.productos.update(formData.producto_id, {
        stock_actual: newStock,
      });
      if (updateErr) throw updateErr;

      // Update local state
      setMovements((prev) => [newMovement, ...prev]);

      // ====== LÓGICA DE AUTOPEDIDOS ======
      if (formData.tipo === 'Salida') {
        try {
          await checkAutoOrderRules(formData.producto_id, newStock);
        } catch (autoOrderErr) {
          console.error('Error al verificar reglas de autopedido:', autoOrderErr);
          // No falla el movimiento si falla el autopedido
        }
      }
      // ===================================

      return newMovement;
    } catch (err) {
      console.error('Failed to create movement:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear movimiento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkAutoOrderRules = async (productoId: string, currentStock: number) => {
    try {
      // 1. Obtener reglas habilitadas para este producto
      const { data: rules, error: rulesErr } = await db.autopedidos.getAll();
      if (rulesErr) throw rulesErr;

      const activeRule = rules?.find(
        (r) => r.producto_id === productoId && r.habilitado
      );

      if (!activeRule) return; // No hay regla activa

      // 2. Verificar si se alcanzó el trigger
      if (currentStock <= activeRule.stock_minimo_trigger) {
        const { user } = await authHelpers.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        // 3. Generar número de pedido
        const numeroOrden = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // 4. Determinar estado
        const estadoInicial = activeRule.requerir_aprobacion
          ? 'Pendiente_Aprobacion'
          : 'Aprobado';

        // 5. Crear pedido
        const pedidoData = {
          numero_pedido: numeroOrden,
          proveedor_id: activeRule.proveedor_id,
          estado: estadoInicial,
          fecha_creacion: new Date().toISOString(),
          creado_por_user_id: user.id,
          notas: `Pedido automático. Stock: ${currentStock}, Trigger: ${activeRule.stock_minimo_trigger}`,
          ...(estadoInicial === 'Aprobado' && {
            fecha_aprobacion: new Date().toISOString(),
            aprobado_por_user_id: user.id,
          }),
        };

        const { data: newPedido, error: pedidoErr } = await db.pedidos.create(pedidoData);
        if (pedidoErr) throw pedidoErr;
        if (!newPedido) throw new Error('No se pudo crear pedido automático');

        // 6. Crear línea de pedido
        await db.lineasPedido.create({
          pedido_id: newPedido.id,
          producto_id: productoId,
          cantidad: activeRule.cantidad_a_pedir,
          precio_unitario: 0, // Precio a definir
        });

        console.log(`✅ Pedido automático creado: ${numeroOrden}`);
      }
    } catch (err) {
      console.error('Error en checkAutoOrderRules:', err);
      throw err;
    }
  };

  return {
    movements,
    loading,
    error,
    fetchMovements,
    createMovement,
    fetchMoreMovements,
  };
}
