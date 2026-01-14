'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ReorderRulesList from '@/components/features/ReorderRules/ReorderRulesList';
import ReorderRuleModal from '@/components/features/ReorderRules/ReorderRuleModal';
import { useReorderRules } from '@/hooks/useReorderRules';
import { useProducts } from '@/hooks/useProducts';
import { useProveedores } from '@/hooks/useProveedores';
import type { ReglaAutopedido } from '@/types';
import { Plus, Settings, RefreshCw } from 'lucide-react';

export default function ReorderRulesPage() {
  const { rules, loading, error, createRule, updateRule, toggleRule, deleteRule, fetchRules } =
    useReorderRules();
  const { products, loading: productsLoading } = useProducts();
  const { proveedores, loading: providersLoading } = useProveedores();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReglaAutopedido | null>(null);

  const handleCreateClick = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (rule: ReglaAutopedido) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSave = async (data: {
    producto_id: string;
    proveedor_id: string;
    stock_minimo: number;
    cantidad_pedido: number;
    activa: boolean;
  }) => {
    if (editingRule) {
      // Update existing rule using PUT endpoint
      await updateRule(editingRule.id, data);
    } else {
      // Create new rule
      await createRule(data);
    }
  };

  const activeRulesCount = rules.filter((r) => r.activa).length;
  const totalRulesCount = rules.length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
                <Settings className="w-6 h-6 text-[#F5F2ED]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                  Reglas de Autopedido
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  Configura reglas automáticas para generar pedidos cuando el stock esté bajo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchRules}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={handleCreateClick}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Regla
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Total Reglas
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                {totalRulesCount}
              </p>
            </div>
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Activas
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                {activeRulesCount}
              </p>
            </div>
            <div className="hidden md:block bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Inactivas
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#9CA3AF]">
                {totalRulesCount - activeRulesCount}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Rules List */}
          <ReorderRulesList
            rules={rules}
            loading={loading}
            onEdit={handleEditClick}
            onToggle={toggleRule}
            onDelete={deleteRule}
          />
        </div>
      </div>

      {/* Modal */}
      <ReorderRuleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        rule={editingRule}
        products={products}
        providers={proveedores}
        loading={productsLoading || providersLoading}
      />
    </AppLayout>
  );
}
