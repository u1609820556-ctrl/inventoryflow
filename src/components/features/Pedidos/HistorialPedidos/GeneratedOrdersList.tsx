'use client';

import { useState } from 'react';
import { Eye, Download, Send, Truck, Calendar, FileText, Loader2 } from 'lucide-react';
import type { PedidoGenerado, EstadoPedidoGenerado } from '@/types';
import OrderStatusBadge from './OrderStatusBadge';

interface GeneratedOrdersListProps {
  orders: PedidoGenerado[];
  loading?: boolean;
  sendingEmail?: string | null;
  generatingPDF?: string | null;
  onViewDetails: (order: PedidoGenerado) => void;
  onDownloadPDF: (orderId: string) => Promise<void>;
  onSendEmail: (order: PedidoGenerado) => void;
  statusFilter: EstadoPedidoGenerado | 'all';
  onStatusFilterChange: (status: EstadoPedidoGenerado | 'all') => void;
}

const statusOptions: { value: EstadoPedidoGenerado | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'sent', label: 'Enviados' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default function GeneratedOrdersList({
  orders,
  loading = false,
  sendingEmail,
  generatingPDF,
  onViewDetails,
  onDownloadPDF,
  onSendEmail,
  statusFilter,
  onStatusFilterChange,
}: GeneratedOrdersListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (orderId: string) => {
    setDownloadingId(orderId);
    try {
      await onDownloadPDF(orderId);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((order) => order.estado === statusFilter);

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
          <p className="text-[#6B7280] font-medium">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-[#6B7280]">Filtrar por estado:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as EstadoPedidoGenerado | 'all')}
          className="px-3 py-2 text-sm border border-[#E2E2D5] rounded-lg bg-white focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-[#9CA3AF]">
          {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      {/* List */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#374151] mb-2">
              No hay pedidos {statusFilter !== 'all' ? 'con este estado' : 'generados'}
            </h3>
            <p className="text-sm text-[#6B7280] max-w-md">
              {statusFilter !== 'all'
                ? 'Intenta cambiar el filtro de estado para ver más pedidos.'
                : 'Los pedidos generados automáticamente aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2D5]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F5F2ED] rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-[#064E3B]" />
                          </div>
                          <span className="text-sm font-medium text-[#374151]">
                            {order.proveedores?.nombre || 'Sin proveedor'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                          <span className="text-sm text-[#6B7280]">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F2ED] text-[#374151]">
                          {order.datos_pedido.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-[#064E3B]">
                          {formatCurrency(order.total_estimado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <OrderStatusBadge status={order.estado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewDetails(order)}
                            className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(order.id)}
                            disabled={downloadingId === order.id || generatingPDF === order.id}
                            className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {downloadingId === order.id || generatingPDF === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          {order.estado !== 'sent' && order.estado !== 'cancelled' && (
                            <button
                              onClick={() => onSendEmail(order)}
                              disabled={sendingEmail === order.id}
                              className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors disabled:opacity-50"
                              title="Enviar por email"
                            >
                              {sendingEmail === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#E2E2D5]">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F2ED] rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#064E3B]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#374151]">
                          {order.proveedores?.nombre || 'Sin proveedor'}
                        </p>
                        <p className="text-xs text-[#6B7280]">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <OrderStatusBadge status={order.estado} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7280]">
                      {order.datos_pedido.length} items
                    </span>
                    <span className="font-bold text-[#064E3B]">
                      {formatCurrency(order.total_estimado)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E2D5]">
                    <button
                      onClick={() => onViewDetails(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownload(order.id)}
                      disabled={downloadingId === order.id || generatingPDF === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                    >
                      {downloadingId === order.id || generatingPDF === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      PDF
                    </button>
                    {order.estado !== 'sent' && order.estado !== 'cancelled' && (
                      <button
                        onClick={() => onSendEmail(order)}
                        disabled={sendingEmail === order.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                      >
                        {sendingEmail === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Email
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
