'use client';

// ============================================================
// COMPONENTE DEPRECADO - OrderForm
// ============================================================
// Este componente usaba el tipo 'Pedido' que fue eliminado.
// Se mantiene actualizado para usar PedidoGenerado.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import type { PedidoGenerado, Proveedor, Producto } from '@/types';
import OrderLineItem from './OrderLineItem';

export interface OrderFormData {
  proveedor_id: string;
  lineas: Array<{
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    fecha_entrega_esperada?: string;
  }>;
  requerir_aprobacion: boolean;
  notas?: string;
}

export interface OrderFormProps {
  order?: PedidoGenerado | null;
  proveedores: Proveedor[];
  products: Producto[];
  onSubmit: (data: OrderFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function OrderForm({
  order,
  proveedores,
  products,
  onSubmit,
  onCancel,
  loading,
}: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    proveedor_id: '',
    lineas: [{ producto_id: '', cantidad: 1, precio_unitario: 0 }],
    requerir_aprobacion: true,
    notas: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      // Cargar datos del pedido si es edición
      setFormData({
        proveedor_id: order.proveedor_id,
        lineas: order.datos_pedido.map(l => ({
          producto_id: l.producto_id,
          cantidad: l.cantidad,
          precio_unitario: l.precio_unitario,
        })),
        requerir_aprobacion: true,
        notas: order.notas || '',
      });
    }
  }, [order]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido';
    }

    if (formData.lineas.length === 0) {
      newErrors.lineas = 'Debe agregar al menos una línea de pedido';
    }

    formData.lineas.forEach((linea, idx) => {
      if (!linea.producto_id) {
        newErrors[`linea_${idx}_producto`] = 'Producto requerido';
      }
      if (linea.cantidad <= 0) {
        newErrors[`linea_${idx}_cantidad`] = 'Cantidad debe ser mayor a 0';
      }
      if (linea.precio_unitario < 0) {
        newErrors[`linea_${idx}_precio`] = 'Precio inválido';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof OrderFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addLinea = () => {
    setFormData((prev) => ({
      ...prev,
      lineas: [
        ...prev.lineas,
        { producto_id: '', cantidad: 1, precio_unitario: 0 },
      ],
    }));
  };

  const removeLinea = (index: number) => {
    if (formData.lineas.length > 1) {
      setFormData((prev) => ({
        ...prev,
        lineas: prev.lineas.filter((_, i) => i !== index),
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`linea_${index}_producto`];
        delete newErrors[`linea_${index}_cantidad`];
        delete newErrors[`linea_${index}_precio`];
        return newErrors;
      });
    }
  };

  const updateLinea = (index: number, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      lineas: prev.lineas.map((linea, i) =>
        i === index ? { ...linea, [field]: value } : linea
      ),
    }));
    const errorKey = `linea_${index}_${field === 'producto_id' ? 'producto' : field === 'cantidad' ? 'cantidad' : 'precio'}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const totalPedido = useMemo(() => {
    return formData.lineas.reduce((sum, linea) => {
      return sum + linea.cantidad * linea.precio_unitario;
    }, 0);
  }, [formData.lineas]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        {errors.proveedor_id && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.proveedor_id}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-[#374151]">
            Líneas del pedido <span className="text-[#991B1B]">*</span>
          </label>
          <button
            type="button"
            onClick={addLinea}
            disabled={loading}
            className="px-4 py-2 text-sm bg-[#064E3B] text-[#F5F2ED] font-semibold rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Agregar línea
          </button>
        </div>

        <div className="space-y-3">
          {formData.lineas.map((linea, index) => (
            <OrderLineItem
              key={index}
              linea={linea}
              index={index}
              products={products}
              onUpdate={updateLinea}
              onRemove={removeLinea}
              canRemove={formData.lineas.length > 1}
              errors={errors}
            />
          ))}
        </div>

        {errors.lineas && (
          <p className="mt-2 text-sm text-[#991B1B]">{errors.lineas}</p>
        )}

        <div className="mt-4 p-4 bg-[#064E3B]/5 rounded-xl border border-[#064E3B]/10">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#064E3B]">
              Total del pedido:
            </span>
            <span className="text-lg font-bold text-[#064E3B]">
              ${totalPedido.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start p-4 bg-[#F9FAFB] rounded-xl border border-[#E2E2D5]">
        <input
          type="checkbox"
          id="requerir_aprobacion"
          checked={formData.requerir_aprobacion}
          onChange={(e) => handleChange('requerir_aprobacion', e.target.checked)}
          disabled={loading}
          className="mt-0.5 h-4 w-4 text-[#064E3B] border-[#E2E2D5] rounded focus:ring-[#064E3B]/20 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="requerir_aprobacion"
          className="ml-3 block text-sm text-[#374151]"
        >
          <span className="font-semibold">Requerir aprobación</span>
          <span className="block text-xs text-[#6B7280] mt-1">
            Si está marcado, el pedido requerirá aprobación antes de ser procesado
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Notas
        </label>
        <textarea
          value={formData.notas}
          onChange={(e) => handleChange('notas', e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-none"
          placeholder="Información adicional sobre el pedido..."
        />
      </div>

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
            'Crear Pedido'
          )}
        </button>
      </div>
    </form>
  );
}
