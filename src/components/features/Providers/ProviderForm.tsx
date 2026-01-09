'use client';

import { useState, useEffect } from 'react';
import type { Proveedor } from '@/types';

export interface ProviderFormData {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ProviderFormProps {
  provider?: Proveedor | null;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function ProviderForm({ provider, onSubmit, onCancel, loading }: ProviderFormProps) {
  const [formData, setFormData] = useState<ProviderFormData>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (provider) {
      setFormData({
        nombre: provider.nombre,
        email: provider.email || '',
        telefono: provider.telefono || '',
        direccion: provider.direccion || '',
      });
    }
  }, [provider]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nombre requerido
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Email opcional pero debe ser válido si se provee
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email inválido';
      }
    }

    // Dirección máximo 500 chars
    if (formData.direccion && formData.direccion.trim().length > 500) {
      newErrors.direccion = 'La dirección no puede exceder 500 caracteres';
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

  const handleChange = (field: keyof ProviderFormData, value: string) => {
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
          Nombre del proveedor <span className="text-[#991B1B]">*</span>
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          maxLength={100}
          placeholder="Ej: Distribuidora ABC"
        />
        {errors.nombre && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.nombre}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          placeholder="ejemplo@correo.com"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.email}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Teléfono
        </label>
        <input
          type="text"
          value={formData.telefono}
          onChange={(e) => handleChange('telefono', e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
          maxLength={50}
          placeholder="+1 234 567 8900"
        />
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-semibold text-[#374151] mb-2">
          Dirección
        </label>
        <textarea
          value={formData.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200 disabled:bg-[#F9FAFB] disabled:cursor-not-allowed resize-none"
          maxLength={500}
          placeholder="Calle, Ciudad, País"
        />
        {errors.direccion && (
          <p className="mt-1.5 text-sm text-[#991B1B]">{errors.direccion}</p>
        )}
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
