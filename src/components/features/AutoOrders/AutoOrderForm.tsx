'use client';

import { useState, useEffect } from 'react';
import type { ReglaAutopedido, Producto, Proveedor } from '@/types';
import { AlertTriangle } from 'lucide-react';

export interface AutoOrderFormData {
  producto_id: string;
  stock_minimo_trigger: number;
  cantidad_a_pedir: number;
  proveedor_id: string;
  requerir_aprobacion: boolean;
  habilitado: boolean;
}

export interface AutoOrderFormProps {
  rule?: ReglaAutopedido | null;
  products: Producto[];
  proveedores: Proveedor[];
  existingRules: ReglaAutopedido[];
  onSubmit: (data: AutoOrderFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function AutoOrderForm({
  rule,
  products,
  proveedores,
  existingRules,
  onSubmit,
  onCancel,
  loading,
}: AutoOrderFormProps) {
  const [formData, setFormData] = useState<AutoOrderFormData>({
    producto_id: '',
    stock_minimo_trigger: 10,
    cantidad_a_pedir: 50,
    proveedor_id: '',
    requerir_aprobacion: true,
    habilitado: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rule) {
      setFormData({
        producto_id: rule.producto_id,
        stock_minimo_trigger: rule.stock_minimo_trigger,
        cantidad_a_pedir: rule.cantidad_a_pedir,
        proveedor_id: rule.proveedor_id,
        requerir_aprobacion: rule.requerir_aprobacion,
        habilitado: rule.habilitado,
      });
    }
  }, [rule]);

  const selectedProduct = products.find((p) => p.id === formData.producto_id);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.producto_id) {
      newErrors.producto_id = 'El producto es requerido';
    } else if (!rule) {
      const exists = existingRules.some((r) => r.producto_id === formData.producto_id);
      if (exists) {
        newErrors.producto_id = 'Ya existe una regla para este producto';
      }
    }

    if (formData.stock_minimo_trigger < 0) {
      newErrors.stock_minimo_trigger = 'Debe ser mayor o igual a 0';
    }

    if (formData.cantidad_a_pedir <= 0) {
      newErrors.cantidad_a_pedir = 'Debe ser mayor a 0';
    }

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof AutoOrderFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Productos disponibles (solo los que no tienen regla al crear)
  const availableProducts = rule
    ? products
    : products.filter((p) => !existingRules.some((r) => r.producto_id === p.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Producto */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Producto <span className="text-[#991B1B]">*</span>
        </label>
        <select
          value={formData.producto_id}
          onChange={(e) => handleChange('producto_id', e.target.value)}
          disabled={loading || !!rule}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar producto...</option>
          {availableProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} (Stock actual: {p.stock_actual})
            </option>
          ))}
        </select>
        {errors.producto_id && <p className="mt-1.5 text-sm text-[#991B1B]">{errors.producto_id}</p>}
      </div>

      {/* Stock trigger */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Stock mínimo trigger <span className="text-[#991B1B]">*</span>
        </label>
        <input
          type="number"
          min="0"
          value={formData.stock_minimo_trigger}
          onChange={(e) => handleChange('stock_minimo_trigger', parseInt(e.target.value) || 0)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        />
        <p className="mt-1.5 text-xs text-[#9CA3AF]">
          El pedido se creará cuando el stock baje a este nivel
        </p>
        {errors.stock_minimo_trigger && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.stock_minimo_trigger}</p>
        )}
      </div>

      {selectedProduct && formData.stock_minimo_trigger > selectedProduct.stock_actual && (
        <div className="p-4 bg-[#FEF3C7] border border-[#D97706]/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            El stock actual ({selectedProduct.stock_actual}) es menor que el trigger. Esta regla
            se activará inmediatamente al guardar.
          </p>
        </div>
      )}

      {/* Cantidad a pedir */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Cantidad a pedir <span className="text-[#991B1B]">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={formData.cantidad_a_pedir}
          onChange={(e) => handleChange('cantidad_a_pedir', parseInt(e.target.value) || 0)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        />
        {errors.cantidad_a_pedir && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.cantidad_a_pedir}</p>
        )}
      </div>

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Proveedor <span className="text-[#991B1B]">*</span>
        </label>
        <select
          value={formData.proveedor_id}
          onChange={(e) => handleChange('proveedor_id', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        >
          <option value="">Seleccionar proveedor...</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        {errors.proveedor_id && <p className="mt-1.5 text-sm text-[#991B1B]">{errors.proveedor_id}</p>}
      </div>

      {/* Checkboxes */}
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="requerir_aprobacion"
            checked={formData.requerir_aprobacion}
            onChange={(e) => handleChange('requerir_aprobacion', e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 text-[#064E3B] border-[#E2E2D5] rounded focus:ring-[#064E3B]/20 cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="requerir_aprobacion" className="cursor-pointer">
            <span className="block text-sm font-semibold text-[#374151]">Requerir aprobación</span>
            <span className="block text-xs text-[#9CA3AF] mt-0.5">
              Los pedidos automáticos requerirán aprobación antes de procesarse
            </span>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="habilitado"
            checked={formData.habilitado}
            onChange={(e) => handleChange('habilitado', e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 text-[#064E3B] border-[#E2E2D5] rounded focus:ring-[#064E3B]/20 cursor-pointer disabled:cursor-not-allowed"
          />
          <label htmlFor="habilitado" className="cursor-pointer">
            <span className="block text-sm font-semibold text-[#374151]">Habilitado</span>
            <span className="block text-xs text-[#9CA3AF] mt-0.5">
              Activa o desactiva esta regla de autopedido
            </span>
          </label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 border border-[#E2E2D5] text-[#374151] font-semibold rounded-xl hover:bg-[#F9FAFB] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 bg-[#064E3B] text-[#F5F2ED] font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#F5F2ED] border-r-transparent"></span>
              Guardando...
            </span>
          ) : (
            rule ? 'Actualizar' : 'Crear Regla'
          )}
        </button>
      </div>
    </form>
  );
}
