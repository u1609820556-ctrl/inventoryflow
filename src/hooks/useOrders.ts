'use client';

// ============================================================
// HOOK DEPRECADO - useOrders
// ============================================================
// Este hook usaba la tabla 'pedidos' que fue eliminada en la
// reestructuración 2.0. Ahora los pedidos se manejan a través
// de 'pedidos_generados' usando useGeneratedOrders.
//
// Este archivo se mantiene como stub para evitar errores de
// importación en componentes que aún no se han migrado.
// ============================================================

import { useState, useCallback } from 'react';

interface DeprecatedPedido {
  id: string;
  numero_pedido?: string;
  proveedor_id?: string;
  estado?: string;
  fecha_creacion?: string;
  proveedores?: { nombre: string };
}

export function useOrders() {
  const [orders] = useState<DeprecatedPedido[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    console.warn('[useOrders] DEPRECADO: Este hook ya no funciona. Usa useGeneratedOrders.');
  }, []);

  const fetchPendingOrders = (): DeprecatedPedido[] => {
    console.warn('[useOrders] DEPRECADO: fetchPendingOrders ya no funciona.');
    return [];
  };

  const approveOrder = async (id: string): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: approveOrder ya no funciona.', id);
  };

  const rejectOrder = async (id: string): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: rejectOrder ya no funciona.', id);
  };

  const createOrder = async (): Promise<DeprecatedPedido> => {
    console.warn('[useOrders] DEPRECADO: createOrder ya no funciona.');
    throw new Error('Hook deprecado. Usa useGeneratedOrders.');
  };

  const updateOrder = async (): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: updateOrder ya no funciona.');
  };

  const cancelOrder = async (): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: cancelOrder ya no funciona.');
  };

  const markAsSent = async (): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: markAsSent ya no funciona.');
  };

  const markAsReceived = async (): Promise<void> => {
    console.warn('[useOrders] DEPRECADO: markAsReceived ya no funciona.');
  };

  const getOrdersByStatus = (): DeprecatedPedido[] => {
    console.warn('[useOrders] DEPRECADO: getOrdersByStatus ya no funciona.');
    return [];
  };

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
