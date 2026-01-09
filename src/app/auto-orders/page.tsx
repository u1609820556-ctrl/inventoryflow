'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AutoOrdersList from '@/components/features/AutoOrders/AutoOrdersList';
import AutoOrderModal from '@/components/features/AutoOrders/AutoOrderModal';
import { useAutoOrders } from '@/hooks/useAutoOrders';
import { useProveedores } from '@/hooks/useProveedores';
import { useProducts } from '@/hooks/useProducts';
import type { ReglaAutopedido } from '@/types';
import type { AutoOrderFormData } from '@/components/features/AutoOrders/AutoOrderForm';
import { Zap } from 'lucide-react';

export default function AutoOrdersPage() {
  const { rules, loading, error, createRule, updateRule, toggleRule, deleteRule } = useAutoOrders();
  const { proveedores } = useProveedores();
  const { products } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ReglaAutopedido | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleCreate = () => {
    setSelectedRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rule: ReglaAutopedido) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRule(id);
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert('Error al eliminar la regla. Por favor intenta de nuevo.');
    }
  };

  const handleSave = async (data: AutoOrderFormData) => {
    setModalLoading(true);
    try {
      if (selectedRule) {
        await updateRule(selectedRule.id, data);
      } else {
        await createRule(data);
      }
      setIsModalOpen(false);
      setSelectedRule(null);
    } catch (err) {
      console.error('Error saving rule:', err);
      alert(
        selectedRule
          ? 'Error al actualizar la regla. Por favor intenta de nuevo.'
          : 'Error al crear la regla. Por favor intenta de nuevo.'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!modalLoading) {
      setIsModalOpen(false);
      setSelectedRule(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
            <p className="text-[#374151] font-medium tracking-tight">Cargando reglas...</p>
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
                <Zap className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Reglas de Autopedido
                </h1>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Configura reglas automáticas para generar pedidos cuando el stock baje
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

          {/* Auto Orders List */}
          <AutoOrdersList
            rules={rules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onToggle={toggleRule}
            loading={loading}
          />

          {/* Modal */}
          <AutoOrderModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            rule={selectedRule}
            products={products}
            proveedores={proveedores}
            existingRules={rules}
            onSave={handleSave}
            loading={modalLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
