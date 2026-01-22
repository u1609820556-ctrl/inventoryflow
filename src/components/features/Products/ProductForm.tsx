'use client';

import { useState, useEffect } from 'react';
import type { Producto, CreateProductoInput, Proveedor } from '@/types';
import { useProveedores } from '@/hooks/useProveedores';

export interface ProductFormData {
  nombre: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock: number;
  precio_unitario: number;
}

export interface ProductFormProps {
  product?: Producto | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const { proveedores } = useProveedores();

  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    referencia: '',
    proveedor_id: '',
    stock: 0,
    precio_unitario: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        referencia: product.referencia || '',
        proveedor_id: product.proveedor_id || '',
        stock: product.stock,
        precio_unitario: product.precio_unitario,
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.descripcion && formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripcion no puede exceder 500 caracteres';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (formData.precio_unitario < 0) {
      newErrors.precio_unitario = 'El precio unitario no puede ser negativo';
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

      {/* Descripcion */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Descripcion
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-none"
          maxLength={500}
          placeholder="Descripcion opcional del producto..."
        />
        {errors.descripcion && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.descripcion}</p>
        )}
      </div>

      {/* Referencia */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Referencia
        </label>
        <input
          type="text"
          value={formData.referencia}
          onChange={(e) => handleChange('referencia', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          placeholder="Ej: REF-001"
        />
      </div>

      {/* Proveedor Principal */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Proveedor Principal
        </label>
        <select
          value={formData.proveedor_id}
          onChange={(e) => handleChange('proveedor_id', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
        >
          <option value="">Selecciona proveedor...</option>
          {proveedores?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Stock y Precio unitario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Stock <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
            disabled={loading}
            min="0"
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          />
          {errors.stock && (
            <p className="mt-1.5 text-sm text-[#991B1B]">{errors.stock}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#374151] mb-2">
            Precio unitario <span className="text-[#991B1B]">*</span>
          </label>
          <input
            type="number"
            value={formData.precio_unitario}
            onChange={(e) => handleChange('precio_unitario', parseFloat(e.target.value) || 0)}
            disabled={loading}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] font-mono placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          />
          {errors.precio_unitario && (
            <p className="mt-1.5 text-sm text-[#991B1B]">{errors.precio_unitario}</p>
          )}
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
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
}
