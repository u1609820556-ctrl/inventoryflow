'use client';

import type { Pedido } from '@/types';
import { Plus, Check, X, Send, Clock, CheckCircle, XCircle, Package, Truck, AlertCircle } from 'lucide-react';

export interface OrdersListProps {
  orders: Pedido[];
  onEdit: (order: Pedido) => void;
  onCreate: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onMarkAsSent: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  loading: boolean;
  activeTab: 'pending' | 'approved' | 'history';
}

export default function OrdersList({
  orders,
  onCreate,
  onApprove,
  onReject,
  onMarkAsSent,
  onCancel,
  loading,
  activeTab,
}: OrdersListProps) {
  const getStatusStyles = (estado: Pedido['estado']) => {
    const styles = {
      Borrador: { bg: 'bg-[#F9FAFB]', text: 'text-[#6B7280]', border: 'border-[#E2E2D5]', icon: Package },
      Pendiente_Aprobacion: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#D97706]/20', icon: Clock },
      Aprobado: { bg: 'bg-[#F0FDF4]', text: 'text-[#064E3B]', border: 'border-[#064E3B]/20', icon: CheckCircle },
      Enviado: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#1D4ED8]/20', icon: Truck },
      Recibido: { bg: 'bg-[#F5F3FF]', text: 'text-[#7C3AED]', border: 'border-[#7C3AED]/20', icon: Package },
      Cancelado: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#991B1B]/20', icon: XCircle },
    };

    return styles[estado] || styles.Borrador;
  };

  const getStatusLabel = (estado: Pedido['estado']) => {
    const labels = {
      Borrador: 'Borrador',
      Pendiente_Aprobacion: 'Pendiente',
      Aprobado: 'Aprobado',
      Enviado: 'Enviado',
      Recibido: 'Recibido',
      Cancelado: 'Cancelado',
    };
    return labels[estado] || estado;
  };

  const getBorderLeftColor = (estado: Pedido['estado']) => {
    switch (estado) {
      case 'Pendiente_Aprobacion':
        return '#D97706'; // Orange
      case 'Aprobado':
      case 'Enviado':
        return '#064E3B'; // Green
      case 'Cancelado':
        return '#991B1B'; // Red
      case 'Recibido':
        return '#7C3AED'; // Purple
      default:
        return '#9CA3AF'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('¿Aprobar este pedido?')) {
      await onApprove(id);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('¿Rechazar este pedido?')) {
      await onReject(id);
    }
  };

  const handleMarkAsSent = async (id: string) => {
    if (window.confirm('¿Marcar este pedido como enviado?')) {
      await onMarkAsSent(id);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('¿Cancelar este pedido?')) {
      await onCancel(id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
            <p className="mt-4 text-[#6B7280] font-medium">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={onCreate}
          className="px-5 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Crear Pedido</span>
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[#E2E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] font-medium">
              {activeTab === 'pending' && 'No hay pedidos pendientes'}
              {activeTab === 'approved' && 'No hay pedidos aprobados'}
              {activeTab === 'history' && 'No hay pedidos en el historial'}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {activeTab === 'pending' && 'Los nuevos pedidos aparecerán aquí'}
              {activeTab === 'approved' && 'Los pedidos aprobados aparecerán aquí'}
              {activeTab === 'history' && 'Los pedidos completados o cancelados aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E2D5]">
            {orders.map((order) => {
              const statusStyles = getStatusStyles(order.estado);
              const StatusIcon = statusStyles.icon;
              const borderColor = getBorderLeftColor(order.estado);

              return (
                <div
                  key={order.id}
                  className="p-4 md:p-5 hover:bg-[#F9FAFB] transition-all duration-200"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Info del pedido */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-sm font-bold text-[#374151]">
                          {order.numero_pedido}
                        </h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusLabel(order.estado)}
                        </span>
                        {order.numero_pedido.startsWith('AUTO-') && (
                          <span className="px-2 py-0.5 bg-[#E2E2D5] text-[#374151] rounded-full text-xs font-bold">
                            AUTO
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#6B7280] space-y-1">
                        <p>
                          <span className="font-medium text-[#374151]">Proveedor:</span>{' '}
                          {typeof order.proveedores === 'object' && order.proveedores !== null
                            ? (order.proveedores as { nombre?: string }).nombre || 'N/A'
                            : 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium text-[#374151]">Creado:</span>{' '}
                          {formatDate(order.fecha_creacion)}
                        </p>
                        {order.notas && (
                          <p className="text-xs italic text-[#9CA3AF] bg-[#F9FAFB] px-2 py-1 rounded mt-2 border border-[#E2E2D5]">
                            {order.notas}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones según estado */}
                    <div className="flex flex-wrap gap-2">
                      {order.estado === 'Pendiente_Aprobacion' && (
                        <>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="px-4 py-2 text-sm font-semibold bg-[#064E3B] text-[#F5F2ED] rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="px-4 py-2 text-sm font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#991B1B]/20 rounded-lg hover:bg-[#991B1B] hover:text-[#F5F2ED] transition-all duration-200 flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                            Rechazar
                          </button>
                        </>
                      )}
                      {order.estado === 'Aprobado' && (
                        <>
                          <button
                            onClick={() => handleMarkAsSent(order.id)}
                            className="px-4 py-2 text-sm font-semibold bg-[#1D4ED8] text-[#F5F2ED] rounded-lg hover:opacity-90 transition-all duration-200 flex items-center gap-1.5"
                          >
                            <Send className="w-4 h-4" strokeWidth={2} />
                            Marcar Enviado
                          </button>
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-4 py-2 text-sm font-semibold border border-[#E2E2D5] text-[#6B7280] rounded-lg hover:bg-[#F9FAFB] transition-all duration-200 flex items-center gap-1.5"
                          >
                            <X className="w-4 h-4" strokeWidth={2} />
                            Cancelar
                          </button>
                        </>
                      )}
                      {order.estado === 'Enviado' && (
                        <span className="px-4 py-2 text-sm font-medium text-[#1D4ED8] italic flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          En tránsito
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Total count */}
      {orders.length > 0 && (
        <div className="text-sm text-[#6B7280] text-right">
          Total: <span className="font-semibold text-[#374151]">{orders.length}</span> pedido{orders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
