'use client';

import { useState } from 'react';
import { Users, Trash2 } from 'lucide-react';

export interface ProviderData {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface SetupProvidersStepProps {
  initialData?: ProviderData[];
  onFinish: (providers: ProviderData[]) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function SetupProvidersStep({
  initialData,
  onFinish,
  onBack,
  isLoading,
}: SetupProvidersStepProps) {
  const [providers, setProviders] = useState<ProviderData[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ nombre: '', email: '', telefono: '', direccion: '' }]
  );
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const validateProviders = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    if (providers.length === 0) {
      alert('Debes agregar al menos un proveedor');
      return false;
    }

    providers.forEach((provider, index) => {
      const providerErrors: Record<string, string> = {};

      if (!provider.nombre.trim()) {
        providerErrors.nombre = 'El nombre es requerido';
        isValid = false;
      }

      if (provider.email && provider.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(provider.email)) {
        providerErrors.email = 'El email no es válido';
        isValid = false;
      }

      if (Object.keys(providerErrors).length > 0) {
        newErrors[index] = providerErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddProvider = () => {
    setProviders([...providers, { nombre: '', email: '', telefono: '', direccion: '' }]);
  };

  const handleRemoveProvider = (index: number) => {
    if (providers.length === 1) {
      alert('Debes tener al menos un proveedor');
      return;
    }
    setProviders(providers.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleProviderChange = (
    index: number,
    field: keyof ProviderData,
    value: string
  ) => {
    const newProviders = [...providers];
    newProviders[index] = { ...newProviders[index], [field]: value };
    setProviders(newProviders);

    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateProviders()) {
      onFinish(providers);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#F5F2ED]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#064E3B]">Tus proveedores</h2>
              <p className="text-xs text-[#6B7280] font-medium">Paso 3 de 3</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {providers.map((provider, index) => (
              <div key={index} className="p-4 border border-[#E2E2D5] rounded-lg bg-[#F5F2ED]/50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-[#374151]">Proveedor {index + 1}</h3>
                  {providers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProvider(index)}
                      className="flex items-center gap-1 text-[#991B1B] hover:opacity-80 text-sm font-medium transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Nombre del proveedor
                    </label>
                    <input
                      type="text"
                      value={provider.nombre}
                      onChange={(e) => handleProviderChange(index, 'nombre', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                    {errors[index]?.nombre && (
                      <p className="mt-1 text-sm text-[#991B1B]">{errors[index].nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={provider.email || ''}
                      onChange={(e) => handleProviderChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                    {errors[index]?.email && (
                      <p className="mt-1 text-sm text-[#991B1B]">{errors[index].email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="text"
                      value={provider.telefono || ''}
                      onChange={(e) => handleProviderChange(index, 'telefono', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Dirección (opcional)
                    </label>
                    <textarea
                      value={provider.direccion || ''}
                      onChange={(e) => handleProviderChange(index, 'direccion', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddProvider}
            className="w-full px-4 py-2.5 border-2 border-dashed border-[#E2E2D5] text-[#6B7280] font-medium rounded-lg hover:border-[#064E3B] hover:text-[#064E3B] hover:bg-[#F5F2ED]/50 transition-all duration-200"
          >
            + Agregar otro proveedor
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-[#E2E2D5] text-[#374151] font-medium rounded-lg hover:bg-[#F5F2ED]/50 hover:border-[#9CA3AF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ATRÁS
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-[#064E3B] text-[#F5F2ED] font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'GUARDANDO...' : 'FINALIZAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
