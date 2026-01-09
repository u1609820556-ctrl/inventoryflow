'use client';

import { useState } from 'react';
import type { MovementFormData } from '@/hooks/useMovements';
import type { Producto, Proveedor } from '@/types';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, RotateCcw, Save } from 'lucide-react';

export interface MovementFormProps {
  products: Producto[];
  proveedores: Proveedor[];
  loading: boolean;
  onSubmit: (data: MovementFormData) => Promise<void>;
}

export function MovementForm({ products, proveedores, loading, onSubmit }: MovementFormProps) {
  const [tipo, setTipo] = useState<'Entrada' | 'Salida' | 'Ajuste'>('Entrada');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find selected product to show current stock
  const selectedProduct = products.find((p) => p.id === productoId);

  const handleClear = () => {
    setTipo('Entrada');
    setProductoId('');
    setCantidad('');
    setProveedorId('');
    setNotas('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!productoId) {
      setError('Debe seleccionar un producto');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    if (!cantidad || isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    // Check stock for Salida
    if (tipo === 'Salida' && selectedProduct) {
      if (cantidadNum > selectedProduct.stock_actual) {
        setError(`No hay suficiente stock. Stock actual: ${selectedProduct.stock_actual}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        producto_id: productoId,
        tipo,
        cantidad: cantidadNum,
        proveedor_id: proveedorId || undefined,
        notas: notas || undefined,
      });

      // Success - clear form
      handleClear();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  const tipoButtons = [
    { value: 'Entrada' as const, label: 'Entrada', icon: ArrowDownCircle, color: 'bg-[#064E3B]' },
    { value: 'Salida' as const, label: 'Salida', icon: ArrowUpCircle, color: 'bg-[#991B1B]' },
    { value: 'Ajuste' as const, label: 'Ajuste', icon: RefreshCw, color: 'bg-[#1D4ED8]' },
  ];

  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
      <h2 className="font-serif text-xl md:text-2xl font-bold text-[#374151] mb-6">Registrar Movimiento</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-3">
            Tipo de movimiento <span className="text-[#991B1B]">*</span>
          </label>
          <div className="flex gap-2">
            {tipoButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = tipo === btn.value;
              return (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => setTipo(btn.value)}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? `${btn.color} text-[#F5F2ED]`
                      : 'bg-[#F9FAFB] text-[#6B7280] border border-[#E2E2D5] hover:bg-[#E2E2D5]/50'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Producto */}
        <div>
          <label htmlFor="producto" className="block text-sm font-semibold text-[#374151] mb-2">
            Producto <span className="text-[#991B1B]">*</span>
          </label>
          <select
            id="producto"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
            disabled={loading || submitting}
          >
            <option value="">Seleccionar producto...</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre} (Stock: {product.stock_actual})
              </option>
            ))}
          </select>

          {selectedProduct && (
            <p className="mt-2 text-sm text-[#6B7280]">
              Stock actual: <span className="font-mono font-semibold text-[#374151]">{selectedProduct.stock_actual}</span>
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="cantidad" className="block text-sm font-semibold text-[#374151] mb-2">
            {tipo === 'Ajuste' ? 'Nuevo stock total' : 'Cantidad'}{' '}
            <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            id="cantidad"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
            placeholder={tipo === 'Ajuste' ? 'Ej: 100' : 'Ej: 50'}
            disabled={loading || submitting}
          />
          {tipo === 'Ajuste' && (
            <p className="mt-1.5 text-xs text-[#9CA3AF]">
              Ingresa el nuevo stock total para este producto
            </p>
          )}
        </div>

        {/* Proveedor (opcional) */}
        <div>
          <label htmlFor="proveedor" className="block text-sm font-semibold text-[#374151] mb-2">
            Proveedor (opcional)
          </label>
          <select
            id="proveedor"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
            disabled={loading || submitting}
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Notas (opcional) */}
        <div>
          <label htmlFor="notas" className="block text-sm font-semibold text-[#374151] mb-2">
            Notas (opcional)
          </label>
          <textarea
            id="notas"
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-none"
            placeholder="Información adicional sobre este movimiento..."
            disabled={loading || submitting}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-[#FEF2F2] border border-[#991B1B]/20 rounded-xl">
            <p className="text-sm text-[#991B1B] font-medium">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || submitting}
            className="flex-1 px-4 py-3 border border-[#E2E2D5] text-[#374151] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading || submitting}
            className="flex-1 px-4 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#F5F2ED] border-r-transparent"></span>
                Registrando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Registrar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
