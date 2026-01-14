'use client';

// ============================================================
// COMPONENTE DEPRECADO - PendingOrdersPanel
// ============================================================
// Este componente usaba el tipo 'Pedido' que fue eliminado en la
// reestructuración 2.0. Ahora los pedidos se manejan a través de
// 'pedidos_generados' usando PedidoGenerado.
// ============================================================

import { useState } from 'react';
import type { PedidoGenerado } from '@/types';

export interface PendingOrdersPanelProps {
  orders: PedidoGenerado[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function PendingOrdersPanel({
  orders,
  onApprove,
  onReject,
}: PendingOrdersPanelProps) {
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingOrderId(id);
    try {
      await onApprove(id);
    } catch (err) {
      console.error('Failed to approve order:', err);
      alert('Error al aprobar pedido');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingOrderId(id);
    try {
      await onReject(id);
    } catch (err) {
      console.error('Failed to reject order:', err);
      alert('Error al rechazar pedido');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="bg-white border-2 border-green-200 rounded-xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-gray-900">
          Pedidos Pendientes
        </h2>
        {orders.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-3 bg-green-100 text-green-700 text-sm font-bold rounded-full">
            {orders.length}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">No hay pedidos pendientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-2 border-gray-100 hover:border-green-200 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50/30 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-md tracking-wide">
                      AUTO
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      ${order.total_estimado.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(order.id)}
                  disabled={loadingOrderId === order.id}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingOrderId === order.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : 'APROBAR'}
                </button>
                <button
                  onClick={() => handleReject(order.id)}
                  disabled={loadingOrderId === order.id}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingOrderId === order.id ? 'Procesando...' : 'RECHAZAR'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
