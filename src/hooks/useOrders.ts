'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, authHelpers } from '@/lib/supabase';
import type { Pedido } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db.pedidos.getAll();

      if (err) throw err;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingOrders = (): Pedido[] => {
    return orders.filter((order) => order.estado === 'Pendiente_Aprobacion');
  };

  const approveOrder = async (id: string): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de pedido inválido');
    }

    setLoading(true);
    setError(null);
    try {
      const { user } = await authHelpers.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: updatedOrder, error: err } = await db.pedidos.update(id, {
        estado: 'Aprobado',
        fecha_aprobacion: new Date().toISOString(),
        aprobado_por_user_id: user.id,
      });

      if (err) throw err;
      if (!updatedOrder) throw new Error('No se pudo aprobar el pedido');

      setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
    } catch (err) {
      console.error('Failed to approve order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rejectOrder = async (id: string): Promise<void> => {
    if (!id || typeof id !== 'string') {
      throw new Error('ID de pedido inválido');
    }

    setLoading(true);
    setError(null);
    try {
      const { data: updatedOrder, error: err } = await db.pedidos.update(id, {
        estado: 'Cancelado',
      });

      if (err) throw err;
      if (!updatedOrder) throw new Error('No se pudo rechazar el pedido');

      setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
    } catch (err) {
      console.error('Failed to reject order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: {
    proveedor_id: string;
    lineas: Array<{
      producto_id: string;
      cantidad: number;
      precio_unitario: number;
      fecha_entrega_esperada?: string;
    }>;
    requerir_aprobacion: boolean;
    notas?: string;
  }): Promise<Pedido> => {
    setLoading(true);
    setError(null);

    try {
      const { user } = await authHelpers.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Validaciones
      if (!data.proveedor_id) throw new Error('El proveedor es requerido');
      if (!data.lineas || data.lineas.length === 0) {
        throw new Error('Debe agregar al menos un producto');
      }

      // Validar cada línea
      data.lineas.forEach((linea, idx) => {
        if (!linea.producto_id) throw new Error(`Línea ${idx + 1}: producto requerido`);
        if (linea.cantidad <= 0) throw new Error(`Línea ${idx + 1}: cantidad debe ser > 0`);
        if (linea.precio_unitario < 0) throw new Error(`Línea ${idx + 1}: precio inválido`);
      });

      // Generar número de pedido único
      const numeroOrden = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Determinar estado inicial
      const estadoInicial = data.requerir_aprobacion ? 'Pendiente_Aprobacion' : 'Aprobado';

      // Crear pedido
      const pedidoData = {
        numero_pedido: numeroOrden,
        proveedor_id: data.proveedor_id,
        estado: estadoInicial,
        fecha_creacion: new Date().toISOString(),
        creado_por_user_id: user.id,
        notas: data.notas?.trim() || null,
        ...(estadoInicial === 'Aprobado' && {
          fecha_aprobacion: new Date().toISOString(),
          aprobado_por_user_id: user.id,
        }),
      };

      const { data: newPedido, error: pedidoErr } = await db.pedidos.create(pedidoData);
      if (pedidoErr) throw pedidoErr;
      if (!newPedido) throw new Error('No se pudo crear el pedido');

      // Crear líneas de pedido
      const lineasPromises = data.lineas.map((linea) =>
        db.lineasPedido.create({
          pedido_id: newPedido.id,
          producto_id: linea.producto_id,
          cantidad: linea.cantidad,
          precio_unitario: linea.precio_unitario,
          fecha_entrega_esperada: linea.fecha_entrega_esperada || null,
        })
      );

      await Promise.all(lineasPromises);

      // Actualizar estado local
      setOrders((prev) => [newPedido, ...prev]);

      return newPedido;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (
    id: string,
    data: Partial<{
      estado: Pedido['estado'];
      notas: string;
      fecha_aprobacion: string;
      aprobado_por_user_id: string;
    }>
  ): Promise<void> => {
    if (!id) throw new Error('ID de pedido inválido');

    setLoading(true);
    setError(null);

    try {
      const { data: updatedOrder, error: err } = await db.pedidos.update(id, data);
      if (err) throw err;
      if (!updatedOrder) throw new Error('No se pudo actualizar el pedido');

      setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar pedido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: string): Promise<void> => {
    return updateOrder(id, { estado: 'Cancelado' });
  };

  const markAsSent = async (id: string): Promise<void> => {
    return updateOrder(id, { estado: 'Enviado' });
  };

  const markAsReceived = async (
    id: string,
    movimientoData: {
      lineas: Array<{
        producto_id: string;
        cantidad_recibida: number;
      }>;
    }
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { user } = await authHelpers.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Actualizar estado del pedido
      await updateOrder(id, { estado: 'Recibido' });

      // Crear movimientos de tipo 'Pedido_Recibido' para cada línea
      const movimientosPromises = movimientoData.lineas.map((linea) =>
        db.movimientos.create({
          producto_id: linea.producto_id,
          tipo: 'Pedido_Recibido',
          cantidad: linea.cantidad_recibida,
          fecha: new Date().toISOString(),
          notas: `Pedido recibido - ID: ${id}`,
          usuario_id: user.id,
        })
      );

      await Promise.all(movimientosPromises);

      // Actualizar stock de productos
      const updateStockPromises = movimientoData.lineas.map(async (linea) => {
        const { data: product } = await db.productos.getById(linea.producto_id);
        if (product) {
          await db.productos.update(linea.producto_id, {
            stock_actual: product.stock_actual + linea.cantidad_recibida,
          });
        }
      });

      await Promise.all(updateStockPromises);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar como recibido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByStatus = (estado: Pedido['estado']): Pedido[] => {
    return orders.filter((o) => o.estado === estado);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchPendingOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    markAsSent,
    markAsReceived,
    approveOrder,
    rejectOrder,
    getOrdersByStatus,
  };
}
