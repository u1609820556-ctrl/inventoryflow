'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export interface SetupCompanyStepProps {
  initialData?: {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  onNext: (data: {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
  }) => void;
}

export default function SetupCompanyStep({ initialData, onNext }: SetupCompanyStepProps) {
  const [formData, setFormData] = useState({
    nombre_empresa: initialData?.nombre_empresa || '',
    email: initialData?.email || '',
    telefono: initialData?.telefono || '',
    direccion: initialData?.direccion || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_empresa.trim()) {
      newErrors.nombre_empresa = 'El nombre de la empresa es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#F5F2ED]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#064E3B]">Setup de tu Empresa</h2>
              <p className="text-xs text-[#6B7280] font-medium">Paso 1 de 3</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre_empresa" className="block text-sm font-medium text-[#374151] mb-1">
              Nombre empresa
            </label>
            <input
              type="text"
              id="nombre_empresa"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors"
            />
            {errors.nombre_empresa && (
              <p className="mt-1 text-sm text-[#991B1B]">{errors.nombre_empresa}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-1">
              Email contacto
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors"
            />
            {errors.email && <p className="mt-1 text-sm text-[#991B1B]">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-[#374151] mb-1">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors"
            />
            {errors.telefono && <p className="mt-1 text-sm text-[#991B1B]">{errors.telefono}</p>}
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-[#374151] mb-1">
              Dirección
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors resize-none"
            />
            {errors.direccion && <p className="mt-1 text-sm text-[#991B1B]">{errors.direccion}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-[#064E3B] text-[#F5F2ED] font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 transition-all duration-200"
            >
              SIGUIENTE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
