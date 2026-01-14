'use client';

import { useState } from 'react';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Package, Truck, AlertCircle } from 'lucide-react';
import type { ReglaAutopedido } from '@/types';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton } from '@/components/ui/Skeleton';

interface ReorderRulesListProps {
  rules: ReglaAutopedido[];
  loading?: boolean;
  onEdit: (rule: ReglaAutopedido) => void;
  onToggle: (id: string, activa: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ReorderRulesList({
  rules,
  loading = false,
  onEdit,
  onToggle,
  onDelete,
}: ReorderRulesListProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; rule: ReglaAutopedido | null }>({
    isOpen: false,
    rule: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleToggle = async (rule: ReglaAutopedido) => {
    setLoadingAction(rule.id);
    try {
      await onToggle(rule.id, !rule.activa);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteClick = (rule: ReglaAutopedido) => {
    setDeleteModal({ isOpen: true, rule });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.rule) return;
    setDeleteLoading(true);
    try {
      await onDelete(deleteModal.rule.id);
      setDeleteModal({ isOpen: false, rule: null });
    } catch {
      // Error manejado en el padre
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (rules.length === 0) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#374151] mb-2">No hay reglas de autopedido</h3>
          <p className="text-sm text-[#6B7280] max-w-md">
            Crea tu primera regla para automatizar los pedidos cuando el stock de un producto esté bajo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
              <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Stock Mín.
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Cant. Pedido
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
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F5F2ED] rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#064E3B]" />
                    </div>
                    <span className="text-sm font-medium text-[#374151]">
                      {rule.productos?.nombre || 'Producto desconocido'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-sm text-[#6B7280]">
                      {rule.proveedores?.nombre || 'Sin proveedor'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                    {rule.stock_minimo}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#065F46]">
                    {rule.cantidad_pedido}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggle(rule)}
                    disabled={loadingAction === rule.id}
                    className="inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {rule.activa ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-[#064E3B]" />
                        <span className="text-xs font-medium text-[#064E3B]">Activa</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                        <span className="text-xs font-medium text-[#9CA3AF]">Inactiva</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(rule)}
                      className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(rule)}
                      className="p-2 text-[#6B7280] hover:text-[#991B1B] hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-[#E2E2D5]">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5F2ED] rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#064E3B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#374151]">
                    {rule.productos?.nombre || 'Producto desconocido'}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {rule.proveedores?.nombre || 'Sin proveedor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(rule)}
                disabled={loadingAction === rule.id}
                className="transition-colors disabled:opacity-50"
              >
                {rule.activa ? (
                  <ToggleRight className="w-8 h-8 text-[#064E3B]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-[#9CA3AF]" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D97706]" />
                <span className="text-xs text-[#6B7280]">Min: {rule.stock_minimo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#064E3B]" />
                <span className="text-xs text-[#6B7280]">Pedir: {rule.cantidad_pedido}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E2D5]">
              <button
                onClick={() => onEdit(rule)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={() => handleDeleteClick(rule)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#991B1B] border border-[#991B1B]/20 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, rule: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar regla de autopedido"
        message={`¿Estás seguro de eliminar la regla para "${deleteModal.rule?.productos?.nombre || 'este producto'}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
