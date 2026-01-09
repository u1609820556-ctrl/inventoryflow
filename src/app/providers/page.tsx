'use client';

import { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import ProvidersList from '@/components/features/Providers/ProvidersList';
import ProviderModal from '@/components/features/Providers/ProviderModal';
import { useProveedores } from '@/hooks/useProveedores';
import type { Proveedor } from '@/types';
import type { ProviderFormData } from '@/components/features/Providers/ProviderForm';
import { Building2 } from 'lucide-react';

export default function ProvidersPage() {
  const {
    proveedores,
    loading,
    error,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  } = useProveedores();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Proveedor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Filtrar proveedores por nombre
  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return proveedores;
    }
    const query = searchQuery.toLowerCase();
    return proveedores.filter((p) =>
      p.nombre.toLowerCase().includes(query)
    );
  }, [proveedores, searchQuery]);

  const handleCreate = () => {
    setSelectedProvider(null);
    setIsModalOpen(true);
  };

  const handleEdit = (provider: Proveedor) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProveedor(id);
    } catch (err) {
      console.error('Error deleting provider:', err);
      alert('Error al eliminar el proveedor. Por favor intenta de nuevo.');
    }
  };

  const handleSave = async (data: ProviderFormData) => {
    setModalLoading(true);
    try {
      if (selectedProvider) {
        await updateProveedor(selectedProvider.id, data);
      } else {
        await createProveedor(data);
      }
      setIsModalOpen(false);
      setSelectedProvider(null);
    } catch (err) {
      console.error('Error saving provider:', err);
      alert(
        selectedProvider
          ? 'Error al actualizar el proveedor. Por favor intenta de nuevo.'
          : 'Error al crear el proveedor. Por favor intenta de nuevo.'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!modalLoading) {
      setIsModalOpen(false);
      setSelectedProvider(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
            <p className="text-[#374151] font-medium tracking-tight">Cargando proveedores...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-[#064E3B] rounded-full flex items-center justify-center mt-1">
                <Building2 className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Proveedores
                </h1>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Gestiona tu directorio de proveedores
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#991B1B]/20 rounded-xl">
              <p className="text-sm text-[#991B1B] font-medium">Error: {error}</p>
            </div>
          )}

          {/* Providers List */}
          <ProvidersList
            providers={filteredProviders}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onSearch={handleSearch}
            loading={loading}
          />

          {/* Modal */}
          <ProviderModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            provider={selectedProvider}
            onSave={handleSave}
            loading={modalLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
