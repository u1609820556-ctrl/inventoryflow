'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { ReglaAutopedido, Producto, Proveedor } from '@/types';

interface ReorderRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => Promise<void>;
  rule?: ReglaAutopedido | null;
  products: Producto[];
  providers: Proveedor[];
  loading?: boolean;
}

export default function ReorderRuleModal({
  isOpen,
  onClose,
  onSave,
  rule,
  products,
  providers,
  loading = false,
}: ReorderRuleModalProps) {
  const [formData, setFormData] = useState({
    producto_id: '',
    proveedor_id: '',
    stock_minimo: 0,
    cantidad_pedido: 0,
    activa: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!rule;

  useEffect(() => {
    if (rule) {
      setFormData({
        producto_id: rule.producto_id,
        proveedor_id: rule.proveedor_id,
        stock_minimo: rule.stock_minimo,
        cantidad_pedido: rule.cantidad_pedido,
        activa: rule.activa,
      });
    } else {
      setFormData({
        producto_id: '',
        proveedor_id: '',
        stock_minimo: 0,
        cantidad_pedido: 0,
        activa: true,
      });
    }
    setErrors({});
  }, [rule, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.producto_id) {
      newErrors.producto_id = 'Selecciona un producto';
    }
    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'Selecciona un proveedor';
    }
    if (formData.stock_minimo < 0) {
      newErrors.stock_minimo = 'El stock mínimo debe ser >= 0';
    }
    if (formData.cantidad_pedido <= 0) {
      newErrors.cantidad_pedido = 'La cantidad debe ser > 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving rule:', err);
      setErrors({ form: err instanceof Error ? err.message : 'Error al guardar' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5]">
            <h2 className="font-serif text-xl font-bold text-[#064E3B]">
              {isEditing ? 'Editar Regla' : 'Nueva Regla de Autopedido'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {errors.form}
              </div>
            )}

            {/* Producto */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Producto
              </label>
              <select
                value={formData.producto_id}
                onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                disabled={loading || isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  errors.producto_id ? 'border-red-500' : 'border-[#E2E2D5]'
                } ${isEditing ? 'bg-[#F9FAFB] text-[#6B7280]' : 'bg-white'}`}
              >
                <option value="">Seleccionar producto...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre} (Stock: {product.stock})
                  </option>
                ))}
              </select>
              {errors.producto_id && (
                <p className="mt-1 text-xs text-red-500">{errors.producto_id}</p>
              )}
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Proveedor
              </label>
              <select
                value={formData.proveedor_id}
                onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                disabled={loading || isEditing}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  errors.proveedor_id ? 'border-red-500' : 'border-[#E2E2D5]'
                } ${isEditing ? 'bg-[#F9FAFB] text-[#6B7280]' : 'bg-white'}`}
              >
                <option value="">Seleccionar proveedor...</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.nombre}
                  </option>
                ))}
              </select>
              {errors.proveedor_id && (
                <p className="mt-1 text-xs text-red-500">{errors.proveedor_id}</p>
              )}
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Stock Mínimo (trigger)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })
                }
                disabled={loading}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  errors.stock_minimo ? 'border-red-500' : 'border-[#E2E2D5]'
                }`}
                placeholder="Ej: 10"
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Cuando el stock baje de este valor, se generará un pedido automático
              </p>
              {errors.stock_minimo && (
                <p className="mt-1 text-xs text-red-500">{errors.stock_minimo}</p>
              )}
            </div>

            {/* Cantidad a Pedir */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Cantidad a Pedir
              </label>
              <input
                type="number"
                min="1"
                value={formData.cantidad_pedido}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad_pedido: parseInt(e.target.value) || 0 })
                }
                disabled={loading}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  errors.cantidad_pedido ? 'border-red-500' : 'border-[#E2E2D5]'
                }`}
                placeholder="Ej: 50"
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Cantidad que se incluirá en el pedido automático
              </p>
              {errors.cantidad_pedido && (
                <p className="mt-1 text-xs text-red-500">{errors.cantidad_pedido}</p>
              )}
            </div>

            {/* Estado Activo */}
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
                disabled={isSaving || loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Guardar Cambios' : 'Crear Regla'}
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
