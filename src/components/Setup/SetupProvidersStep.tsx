'use client';

import { useState } from 'react';

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
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Tus proveedores</h2>
        <p className="text-sm text-gray-600 mt-1">Paso 3 de 3</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Proveedor {index + 1}</h3>
                {providers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProvider(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del proveedor
                  </label>
                  <input
                    type="text"
                    value={provider.nombre}
                    onChange={(e) => handleProviderChange(index, 'nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[index]?.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors[index].nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={provider.email || ''}
                    onChange={(e) => handleProviderChange(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[index]?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors[index].email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="text"
                    value={provider.telefono || ''}
                    onChange={(e) => handleProviderChange(index, 'telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <textarea
                    value={provider.direccion || ''}
                    onChange={(e) => handleProviderChange(index, 'direccion', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddProvider}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-md hover:border-gray-400 hover:bg-gray-50"
        >
          + Agregar otro proveedor
        </button>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ATRÁS
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'GUARDANDO...' : 'FINALIZAR'}
          </button>
        </div>
      </form>
    </div>
  );
}
