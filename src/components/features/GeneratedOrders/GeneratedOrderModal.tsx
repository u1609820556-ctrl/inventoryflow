'use client';

import { X, Package, Truck, Calendar, FileText, Mail } from 'lucide-react';
import type { PedidoGenerado } from '@/types';
import OrderStatusBadge from './OrderStatusBadge';

interface GeneratedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PedidoGenerado | null;
}

export default function GeneratedOrderModal({
  isOpen,
  onClose,
  order,
}: GeneratedOrderModalProps) {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Detalles del Pedido
                </h2>
                <p className="text-xs text-[#6B7280]">
                  ID: {order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Proveedor */}
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Proveedor
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#374151]">
                  {order.proveedores?.nombre || 'Sin proveedor'}
                </p>
                {order.proveedores?.email && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="text-xs text-[#6B7280]">{order.proveedores.email}</span>
                  </div>
                )}
              </div>

              {/* Estado */}
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Estado
                  </span>
                </div>
                <OrderStatusBadge status={order.estado} size="lg" />
              </div>

              {/* Fecha Creación */}
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Fecha Creación
                  </span>
                </div>
                <p className="text-sm font-medium text-[#374151]">
                  {formatDate(order.created_at)}
                </p>
              </div>

              {/* Total Estimado */}
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Total Estimado
                  </span>
                </div>
                <p className="text-lg font-bold text-[#064E3B]">
                  {formatCurrency(order.total_estimado)}
                </p>
              </div>
            </div>

            {/* Fecha Envío (si aplica) */}
            {order.sent_at && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Enviado el:</span> {formatDate(order.sent_at)}
                </p>
              </div>
            )}

            {/* Notas */}
            {order.notas && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[#374151] mb-2">Notas</h3>
                <p className="text-sm text-[#6B7280] bg-[#F9FAFB] rounded-lg p-3">
                  {order.notas}
                </p>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h3 className="text-sm font-medium text-[#374151] mb-3">
                Items del Pedido ({order.datos_pedido.length})
              </h3>
              <div className="border border-[#E2E2D5] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                      <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                        Precio Unit.
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E2D5]">
                    {order.datos_pedido.map((item, index) => (
                      <tr key={index} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#374151]">
                            {item.nombre_producto || 'Producto'}
                          </p>
                          {item.codigo && (
                            <p className="text-xs text-[#9CA3AF] font-mono">{item.codigo}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F5F2ED] text-sm font-medium text-[#374151]">
                            {item.cantidad}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-[#6B7280]">
                          {formatCurrency(item.precio_unitario)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-[#374151]">
                          {formatCurrency(item.cantidad * item.precio_unitario)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F9FAFB]">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-[#374151]">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-[#064E3B]">
                        {formatCurrency(order.total_estimado)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E2D5] bg-[#F9FAFB] flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
