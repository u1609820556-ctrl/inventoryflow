'use client';

// ============================================================
// COMPONENTE DEPRECADO - OrderLineItem
// ============================================================
// Este componente se usaba para el viejo sistema de pedidos.
// Se mantiene como stub para evitar errores de importación.
// ============================================================

import type { Producto } from '@/types';
import { Trash2 } from 'lucide-react';

interface OrderLineItemProps {
  linea: {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    fecha_entrega_esperada?: string;
  };
  index: number;
  products: Producto[];
  onUpdate: (index: number, field: string, value: unknown) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  errors: Record<string, string>;
}

export default function OrderLineItem({
  linea,
  index,
  products,
  onUpdate,
  onRemove,
  canRemove,
  errors,
}: OrderLineItemProps) {
  return (
    <div className="border border-[#E2E2D5] rounded-xl p-4 bg-[#F9FAFB] space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-[#374151]">Línea #{index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center gap-1.5 text-[#991B1B] hover:text-[#7F1D1D] text-sm font-medium transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Producto */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Producto <span className="text-[#991B1B]">*</span>
          </label>
          <select
            value={linea.producto_id}
            onChange={(e) => onUpdate(index, 'producto_id', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          >
            <option value="">Seleccionar...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} (Stock: {p.stock})
              </option>
            ))}
          </select>
          {errors[`linea_${index}_producto`] && (
            <p className="text-xs text-[#991B1B] mt-1">{errors[`linea_${index}_producto`]}</p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Cantidad <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={linea.cantidad}
            onChange={(e) => onUpdate(index, 'cantidad', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          />
          {errors[`linea_${index}_cantidad`] && (
            <p className="text-xs text-[#991B1B] mt-1">{errors[`linea_${index}_cantidad`]}</p>
          )}
        </div>

        {/* Precio unitario */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Precio unitario <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={linea.precio_unitario}
            onChange={(e) => onUpdate(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          />
          {errors[`linea_${index}_precio`] && (
            <p className="text-xs text-[#991B1B] mt-1">{errors[`linea_${index}_precio`]}</p>
          )}
        </div>

        {/* Fecha entrega esperada (opcional) */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-1.5">
            Fecha entrega esperada
          </label>
          <input
            type="date"
            value={linea.fecha_entrega_esperada || ''}
            onChange={(e) => onUpdate(index, 'fecha_entrega_esperada', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          />
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right pt-2 border-t border-[#E2E2D5]/50">
        <span className="text-sm text-[#6B7280]">Subtotal: </span>
        <span className="text-sm font-bold text-[#064E3B]">
          ${(linea.cantidad * linea.precio_unitario).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
