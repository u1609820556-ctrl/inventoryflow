'use client';

import { useState, useEffect } from 'react';
import type { Producto } from '@/types';
import { AlertTriangle } from 'lucide-react';

export interface ProductFormData {
  nombre: string;
  descripcion?: string;
  codigo_barras?: string;
  stock_actual: number;
  stock_minimo: number;
  proveedor_principal_id?: string;
}

export interface ProductFormProps {
  product?: Producto | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    codigo_barras: '',
    stock_actual: 0,
    stock_minimo: 0,
    proveedor_principal_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        codigo_barras: product.codigo_barras || '',
        stock_actual: product.stock_actual,
        stock_minimo: product.stock_minimo,
        proveedor_principal_id: product.proveedor_principal_id || '',
      });
    }
  }, [product]);

  useEffect(() => {
    if (formData.stock_minimo > formData.stock_actual && formData.stock_actual >= 0) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [formData.stock_actual, formData.stock_minimo]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    if (formData.stock_actual < 0) {
      newErrors.stock_actual = 'El stock actual no puede ser negativo';
    }

    if (formData.stock_minimo < 0) {
      newErrors.stock_minimo = 'El stock mínimo no puede ser negativo';
    }

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

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Nombre del producto <span className="text-[#991B1B]">*</span>
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          maxLength={100}
          placeholder="Ej: Laptop HP ProBook"
        />
        {errors.nombre && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.nombre}</p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-none"
          maxLength={500}
          placeholder="Descripción opcional del producto..."
        />
        {errors.descripcion && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.descripcion}</p>
        )}
      </div>

      {/* Código de barras */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Código de barras
        </label>
        <input
          type="text"
          value={formData.codigo_barras}
          onChange={(e) => handleChange('codigo_barras', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          placeholder="Ej: 7501234567890"
        />
      </div>

      {/* Stock actual y Stock mínimo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Stock actual <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            value={formData.stock_actual}
            onChange={(e) => handleChange('stock_actual', parseInt(e.target.value) || 0)}
            disabled={loading}
            min="0"
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          />
          {errors.stock_actual && (
            <p className="mt-1.5 text-sm text-[#991B1B]">{errors.stock_actual}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Stock mínimo <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            value={formData.stock_minimo}
            onChange={(e) => handleChange('stock_minimo', parseInt(e.target.value) || 0)}
            disabled={loading}
            min="0"
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          />
          {errors.stock_minimo && (
            <p className="mt-1.5 text-sm text-[#991B1B]">{errors.stock_minimo}</p>
          )}
        </div>
      </div>

      {/* Warning si stock mínimo > stock actual */}
      {showWarning && (
        <div className="p-4 bg-[#FEF3C7] border border-[#D97706]/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            El stock mínimo es mayor al stock actual. Este producto aparecerá como bajo stock.
          </p>
        </div>
      )}

      {/* Proveedor principal */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Proveedor principal (ID)
        </label>
        <input
          type="text"
          value={formData.proveedor_principal_id}
          onChange={(e) => handleChange('proveedor_principal_id', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          placeholder="Opcional"
        />
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
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
}
