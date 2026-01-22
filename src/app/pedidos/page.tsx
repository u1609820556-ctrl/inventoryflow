'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useGeneratedOrders } from '@/hooks/useGeneratedOrders';
import { useReorderRules } from '@/hooks/useReorderRules';
import { useProducts } from '@/hooks/useProducts';
import { useProveedores } from '@/hooks/useProveedores';
import { AlertasStockBajo } from '@/components/features/Productos/AlertasStockBajo';
import type { PedidoGenerado, ReglaAutopedido, EstadoPedidoGenerado } from '@/types';
import {
  Package,
  Plus,
  Settings,
  RefreshCw,
  Eye,
  Download,
  Send,
  Truck,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';
import { showSuccess, showError } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import CrearPedidoManualModal from '@/components/features/Pedidos/CrearPedidoManualModal';

// =====================================================
// ORDER STATUS BADGE
// =====================================================
const statusConfig: Record<EstadoPedidoGenerado, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof Clock;
}> = {
  pending_review: {
    label: 'Pendiente',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  sent: {
    label: 'Enviado',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: Send,
  },
  completed: {
    label: 'Completado',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
};

function OrderStatusBadge({ status, size = 'md' }: { status: EstadoPedidoGenerado; size?: 'sm' | 'md' | 'lg' }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: { container: 'px-2 py-0.5 text-xs', icon: 'w-3 h-3', gap: 'gap-1' },
    md: { container: 'px-2.5 py-1 text-xs', icon: 'w-3.5 h-3.5', gap: 'gap-1.5' },
    lg: { container: 'px-3 py-1.5 text-sm', icon: 'w-4 h-4', gap: 'gap-2' },
  };

  const s = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${s.container} font-medium rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon className={s.icon} />
      {config.label}
    </span>
  );
}

// =====================================================
// GENERATED ORDER DETAILS MODAL
// =====================================================
function GeneratedOrderModal({
  isOpen,
  onClose,
  order
}: {
  isOpen: boolean;
  onClose: () => void;
  order: PedidoGenerado | null
}) {
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
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
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
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Estado
                  </span>
                </div>
                <OrderStatusBadge status={order.estado} size="lg" />
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Fecha Creacion
                  </span>
                </div>
                <p className="text-sm font-medium text-[#374151]">
                  {formatDate(order.created_at)}
                </p>
              </div>

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

            {order.sent_at && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Enviado el:</span> {formatDate(order.sent_at)}
                </p>
              </div>
            )}

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

// =====================================================
// SEND EMAIL MODAL
// =====================================================
function SendEmailModal({
  isOpen,
  onClose,
  onSend,
  order,
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
  order: PedidoGenerado | null;
  loading?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !order) return null;

  const providerEmail = order.proveedores?.email || '';
  const providerName = order.proveedores?.nombre || 'Proveedor';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailToSend = email || providerEmail;

    if (!emailToSend.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(emailToSend)) {
      setError('El formato del email no es valido');
      return;
    }

    setIsSending(true);
    try {
      await onSend(emailToSend);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar email');
    } finally {
      setIsSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Enviar Pedido por Email
                </h2>
                <p className="text-xs text-[#6B7280]">
                  A: {providerName}
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {providerEmail && (
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                  Email del Proveedor
                </p>
                <span className="text-sm text-[#374151]">{providerEmail}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Enviar a (opcional si tiene email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading || isSending}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  error ? 'border-red-500' : 'border-[#E2E2D5]'
                }`}
                placeholder={providerEmail || 'email@proveedor.com'}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Resumen del Pedido
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Items:</span>
                  <span className="font-medium text-[#374151]">{order.datos_pedido.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Total estimado:</span>
                  <span className="font-bold text-[#064E3B]">
                    {formatCurrency(order.total_estimado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending || loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CONFIGURAR AUTOMATICOS MODAL
// =====================================================
function ConfigurarAutomaticosModal({
  isOpen,
  onClose,
  rules,
  loading,
  onCreateRule,
  onEditRule,
  onToggleRule,
  onDeleteRule,
  products,
  proveedores,
  productsLoading,
  proveedoresLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  rules: ReglaAutopedido[];
  loading: boolean;
  onCreateRule: (data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => Promise<void>;
  onEditRule: (id: string, data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => Promise<void>;
  onToggleRule: (id: string, activa: boolean) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  products: { id: string; nombre: string; stock: number }[];
  proveedores: { id: string; nombre: string }[];
  productsLoading: boolean;
  proveedoresLoading: boolean;
}) {
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ReglaAutopedido | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; rule: ReglaAutopedido | null }>({
    isOpen: false,
    rule: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    producto_id: '',
    proveedor_id: '',
    stock_minimo: 0,
    cantidad_pedido: 0,
    activa: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleOpenForm = (rule?: ReglaAutopedido) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        producto_id: rule.producto_id,
        proveedor_id: rule.proveedor_id,
        stock_minimo: rule.stock_minimo,
        cantidad_pedido: rule.cantidad_pedido,
        activa: rule.activa,
      });
    } else {
      setEditingRule(null);
      setFormData({
        producto_id: '',
        proveedor_id: '',
        stock_minimo: 0,
        cantidad_pedido: 0,
        activa: true,
      });
    }
    setFormErrors({});
    setShowRuleForm(true);
  };

  const handleCloseForm = () => {
    setShowRuleForm(false);
    setEditingRule(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.producto_id) errors.producto_id = 'Selecciona un producto';
    if (!formData.proveedor_id) errors.proveedor_id = 'Selecciona un proveedor';
    if (formData.stock_minimo < 0) errors.stock_minimo = 'El stock minimo debe ser >= 0';
    if (formData.cantidad_pedido <= 0) errors.cantidad_pedido = 'La cantidad debe ser > 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingRule) {
        await onEditRule(editingRule.id, formData);
        showSuccess('Regla actualizada correctamente');
      } else {
        await onCreateRule(formData);
        showSuccess('Regla creada correctamente');
      }
      handleCloseForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setFormErrors({ form: message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (rule: ReglaAutopedido) => {
    setLoadingAction(rule.id);
    try {
      await onToggleRule(rule.id, !rule.activa);
      showSuccess(rule.activa ? 'Regla desactivada' : 'Regla activada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado';
      showError(message);
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
      await onDeleteRule(deleteModal.rule.id);
      showSuccess('Regla eliminada correctamente');
      setDeleteModal({ isOpen: false, rule: null });
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Configurar Pedidos Automaticos
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {rules.length} reglas configuradas
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
            {showRuleForm ? (
              /* Rule Form */
              <form onSubmit={handleSubmitForm} className="space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-[#374151]">
                    {editingRule ? 'Editar Regla' : 'Nueva Regla'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="text-sm text-[#6B7280] hover:text-[#374151]"
                  >
                    Cancelar
                  </button>
                </div>

                {formErrors.form && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {formErrors.form}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Producto
                  </label>
                  <select
                    value={formData.producto_id}
                    onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                    disabled={productsLoading || !!editingRule}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                      formErrors.producto_id ? 'border-red-500' : 'border-[#E2E2D5]'
                    } ${editingRule ? 'bg-[#F9FAFB] text-[#6B7280]' : 'bg-white'}`}
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nombre} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                  {formErrors.producto_id && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.producto_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Proveedor
                  </label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    disabled={proveedoresLoading || !!editingRule}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                      formErrors.proveedor_id ? 'border-red-500' : 'border-[#E2E2D5]'
                    } ${editingRule ? 'bg-[#F9FAFB] text-[#6B7280]' : 'bg-white'}`}
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                  {formErrors.proveedor_id && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.proveedor_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Stock Minimo (trigger)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                      formErrors.stock_minimo ? 'border-red-500' : 'border-[#E2E2D5]'
                    }`}
                    placeholder="Ej: 10"
                  />
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Cuando el stock baje de este valor, se generara un pedido automatico
                  </p>
                  {formErrors.stock_minimo && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.stock_minimo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Cantidad a Pedir
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad_pedido}
                    onChange={(e) => setFormData({ ...formData, cantidad_pedido: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                      formErrors.cantidad_pedido ? 'border-red-500' : 'border-[#E2E2D5]'
                    }`}
                    placeholder="Ej: 50"
                  />
                  {formErrors.cantidad_pedido && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.cantidad_pedido}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                  </label>
                  <span className="text-sm font-medium text-[#374151]">
                    Regla {formData.activa ? 'activa' : 'inactiva'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isSaving}
                    className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      editingRule ? 'Guardar Cambios' : 'Crear Regla'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Rules List */
              <>
                <button
                  onClick={() => handleOpenForm()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-6 border-2 border-dashed border-[#E2E2D5] rounded-xl text-sm font-medium text-[#6B7280] hover:border-[#064E3B] hover:text-[#064E3B] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Regla
                </button>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
                    <p className="text-[#6B7280] font-medium">Cargando reglas...</p>
                  </div>
                ) : rules.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-[#9CA3AF]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#374151] mb-2">
                      No hay reglas de autopedido
                    </h3>
                    <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                      Crea tu primera regla para automatizar los pedidos cuando el stock de un producto este bajo.
                    </p>
                  </div>
                ) : (
                  <div className="border border-[#E2E2D5] rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Proveedor
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Stock Min.
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E2D5]">
                        {rules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-[#374151]">
                                {rule.productos?.nombre || 'Producto desconocido'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-[#6B7280]">
                                {rule.proveedores?.nombre || 'Sin proveedor'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                                {rule.stock_minimo}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
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
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenForm(rule)}
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
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!showRuleForm && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E2D5] bg-[#F9FAFB] flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, rule: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar regla de autopedido"
        message={`¿Estas seguro de eliminar la regla para "${deleteModal.rule?.productos?.nombre || 'este producto'}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

// =====================================================
// EDIT RULE INLINE MODAL
// =====================================================
function EditRuleInlineModal({
  isOpen,
  onClose,
  rule,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  rule: ReglaAutopedido | null;
  onSave: (id: string, data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => Promise<void>;
}) {
  const [stockMinimo, setStockMinimo] = useState(0);
  const [cantidadPedido, setCantidadPedido] = useState(1);
  const [activa, setActiva] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule && isOpen) {
      setStockMinimo(rule.stock_minimo);
      setCantidadPedido(rule.cantidad_pedido);
      setActiva(rule.activa);
      setError(null);
    }
  }, [rule, isOpen]);

  if (!isOpen || !rule) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (stockMinimo < 0) {
      setError('El stock minimo debe ser >= 0');
      return;
    }
    if (cantidadPedido <= 0) {
      setError('La cantidad a pedir debe ser > 0');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(rule.id, {
        producto_id: rule.producto_id,
        proveedor_id: rule.proveedor_id,
        stock_minimo: stockMinimo,
        cantidad_pedido: cantidadPedido,
        activa,
      });
      showSuccess('Regla actualizada correctamente');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Editar Regla
                </h2>
                <p className="text-xs text-[#6B7280]">
                  {rule.productos?.nombre}
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
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Info readonly */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Producto:</span>
                <span className="font-medium text-[#374151]">{rule.productos?.nombre}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Proveedor:</span>
                <span className="font-medium text-[#374151]">{rule.proveedores?.nombre}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Stock Minimo (trigger)
              </label>
              <input
                type="number"
                min="0"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Cuando el stock baje de este valor, se generara un pedido
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Cantidad a Pedir
              </label>
              <input
                type="number"
                min="1"
                value={cantidadPedido}
                onChange={(e) => setCantidadPedido(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
              </label>
              <span className="text-sm font-medium text-[#374151]">
                Regla {activa ? 'activa' : 'inactiva'}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE COMPONENT
// =====================================================
export default function PedidosPage() {
  // Generated Orders Hook
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    sendingEmail,
    generatingPDF,
    fetchOrders,
    sendEmail,
    downloadPDF,
    getPendingOrdersCount,
    getSentOrdersThisWeek,
  } = useGeneratedOrders();

  // Reorder Rules Hook
  const {
    rules,
    loading: rulesLoading,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
  } = useReorderRules();

  // Products and Providers
  const { products, loading: productsLoading } = useProducts();
  const { proveedores, loading: proveedoresLoading } = useProveedores();

  // Modal States
  const [isCrearPedidoModalOpen, setIsCrearPedidoModalOpen] = useState(false);
  const [isConfigurarAutomaticosModalOpen, setIsConfigurarAutomaticosModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PedidoGenerado | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EstadoPedidoGenerado | 'all'>('all');

  // Rule inline edit/delete states
  const [editingRuleInline, setEditingRuleInline] = useState<ReglaAutopedido | null>(null);
  const [isEditRuleModalOpen, setIsEditRuleModalOpen] = useState(false);
  const [deletingRule, setDeletingRule] = useState<ReglaAutopedido | null>(null);
  const [isDeleteRuleModalOpen, setIsDeleteRuleModalOpen] = useState(false);
  const [deleteRuleLoading, setDeleteRuleLoading] = useState(false);

  // Actions
  const handleViewDetails = (order: PedidoGenerado) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleSendEmailClick = (order: PedidoGenerado) => {
    setSelectedOrder(order);
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async (email: string) => {
    if (!selectedOrder) return;
    await sendEmail(selectedOrder.id, { email_proveedor: email });
    showSuccess('Email enviado correctamente');
  };

  const handleDownloadPDF = async (orderId: string) => {
    await downloadPDF(orderId);
    showSuccess('PDF descargado');
  };

  const handleCreateRule = async (data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => {
    await createRule(data);
  };

  const handleEditRule = async (id: string, data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => {
    await updateRule(id, data);
  };

  const handleToggleRule = async (id: string, activa: boolean) => {
    await toggleRule(id, activa);
  };

  const handleDeleteRule = async (id: string) => {
    await deleteRule(id);
  };

  const handleConfirmDeleteRule = async () => {
    if (!deletingRule) return;
    setDeleteRuleLoading(true);
    try {
      await deleteRule(deletingRule.id);
      showSuccess('Regla eliminada correctamente');
      setIsDeleteRuleModalOpen(false);
      setDeletingRule(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setDeleteRuleLoading(false);
    }
  };

  const handlePedidoCreado = () => {
    fetchOrders();
    setIsCrearPedidoModalOpen(false);
  };

  // Filter orders
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((order) => order.estado === statusFilter);

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

  const pendingCount = getPendingOrdersCount();
  const sentThisWeek = getSentOrdersThisWeek();

  const statusOptions: { value: EstadoPedidoGenerado | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending_review', label: 'Pendientes' },
    { value: 'sent', label: 'Enviados' },
    { value: 'completed', label: 'Completados' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
                <Package className="w-6 h-6 text-[#F5F2ED]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                  Pedidos
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  Gestiona pedidos manuales y automaticos a proveedores
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={fetchOrders}
                disabled={ordersLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={() => setIsConfigurarAutomaticosModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Crear Pedido Automatico</span>
              </button>
              <button
                onClick={() => setIsCrearPedidoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Pedido Manual
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Total Pedidos
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                {orders.length}
              </p>
            </div>
            <div className="bg-white border-2 border-amber-200 rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Pendientes
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Enviados (semana)
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-emerald-600">
                {sentThisWeek}
              </p>
            </div>
            <div className="hidden md:block bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Reglas Activas
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                {rules.filter((r) => r.activa).length}
              </p>
            </div>
          </div>

          {/* Alertas de Stock Bajo */}
          <AlertasStockBajo />

          {/* Error Message */}
          {ordersError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{ordersError}</p>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-[#6B7280]">Filtrar por estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EstadoPedidoGenerado | 'all')}
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

          {/* Orders Table */}
          <div className="bg-white border border-[#E2E2D5] rounded-xl overflow-hidden">
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
                <p className="text-[#6B7280] font-medium">Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#374151] mb-2">
                  No hay pedidos {statusFilter !== 'all' ? 'con este estado' : 'generados'}
                </h3>
                <p className="text-sm text-[#6B7280] max-w-md">
                  {statusFilter !== 'all'
                    ? 'Intenta cambiar el filtro de estado para ver mas pedidos.'
                    : 'Crea tu primer pedido manual o configura reglas de autopedido.'}
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
                                onClick={() => handleViewDetails(order)}
                                className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(order.id)}
                                disabled={generatingPDF === order.id}
                                className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors disabled:opacity-50"
                                title="Descargar PDF"
                              >
                                {generatingPDF === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                              {order.estado !== 'sent' && order.estado !== 'cancelled' && (
                                <button
                                  onClick={() => handleSendEmailClick(order)}
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
                          onClick={() => handleViewDetails(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(order.id)}
                          disabled={generatingPDF === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
                        >
                          {generatingPDF === order.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          PDF
                        </button>
                        {order.estado !== 'sent' && order.estado !== 'cancelled' && (
                          <button
                            onClick={() => handleSendEmailClick(order)}
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

          {/* Reglas de Autopedido Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5 text-[#F5F2ED]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#064E3B]">
                    Reglas de Autopedido
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    {rules.filter(r => r.activa).length} reglas activas de {rules.length} totales
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigurarAutomaticosModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Regla
              </button>
            </div>

            <div className="bg-white border border-[#E2E2D5] rounded-xl overflow-hidden">
              {rulesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
                  <p className="text-[#6B7280] font-medium">Cargando reglas...</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-16 h-16 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-4">
                    <Settings className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#374151] mb-2">
                    No hay reglas de autopedido
                  </h3>
                  <p className="text-sm text-[#6B7280] max-w-md mb-4">
                    Crea reglas para generar pedidos automaticamente cuando el stock de un producto baje del minimo.
                  </p>
                  <button
                    onClick={() => setIsConfigurarAutomaticosModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primera Regla
                  </button>
                </div>
              ) : (
                <>
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
                            Stock Minimo
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                            Cantidad Pedido
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
                                {rule.stock_minimo} uds
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#DBEAFE] text-[#1E40AF]">
                                {rule.cantidad_pedido} uds
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleToggleRule(rule.id, !rule.activa)}
                                className="inline-flex items-center gap-1.5 transition-colors"
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
                                  onClick={() => {
                                    setEditingRuleInline(rule);
                                    setIsEditRuleModalOpen(true);
                                  }}
                                  className="p-2 text-[#6B7280] hover:text-[#064E3B] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingRule(rule);
                                    setIsDeleteRuleModalOpen(true);
                                  }}
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
                            onClick={() => handleToggleRule(rule.id, !rule.activa)}
                            className="inline-flex items-center gap-1"
                          >
                            {rule.activa ? (
                              <ToggleRight className="w-6 h-6 text-[#064E3B]" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-[#6B7280]">Stock min: </span>
                            <span className="font-medium text-[#92400E]">{rule.stock_minimo}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280]">Cantidad: </span>
                            <span className="font-medium text-[#1E40AF]">{rule.cantidad_pedido}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E2D5]">
                          <button
                            onClick={() => {
                              setEditingRuleInline(rule);
                              setIsEditRuleModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#064E3B] border border-[#E2E2D5] rounded-lg hover:bg-[#F5F2ED] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setDeletingRule(rule);
                              setIsDeleteRuleModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#991B1B] border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CrearPedidoManualModal
        isOpen={isCrearPedidoModalOpen}
        onClose={() => setIsCrearPedidoModalOpen(false)}
        onSuccess={handlePedidoCreado}
      />

      <ConfigurarAutomaticosModal
        isOpen={isConfigurarAutomaticosModalOpen}
        onClose={() => setIsConfigurarAutomaticosModalOpen(false)}
        rules={rules}
        loading={rulesLoading}
        onCreateRule={handleCreateRule}
        onEditRule={handleEditRule}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
        products={products}
        proveedores={proveedores}
        productsLoading={productsLoading}
        proveedoresLoading={proveedoresLoading}
      />

      <GeneratedOrderModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedOrder(null);
        }}
        onSend={handleSendEmail}
        order={selectedOrder}
        loading={!!sendingEmail}
      />

      {/* Edit Rule Modal */}
      <EditRuleInlineModal
        isOpen={isEditRuleModalOpen}
        onClose={() => {
          setIsEditRuleModalOpen(false);
          setEditingRuleInline(null);
        }}
        rule={editingRuleInline}
        onSave={handleEditRule}
      />

      {/* Delete Rule Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteRuleModalOpen}
        onClose={() => {
          setIsDeleteRuleModalOpen(false);
          setDeletingRule(null);
        }}
        onConfirm={handleConfirmDeleteRule}
        title="Eliminar regla de autopedido"
        message={`¿Estas seguro de eliminar la regla para "${deletingRule?.productos?.nombre || 'este producto'}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleteRuleLoading}
      />
    </AppLayout>
  );
}
