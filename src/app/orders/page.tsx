'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import OrdersList from '@/components/features/Orders/OrdersList';
import OrderModal from '@/components/features/Orders/OrderModal';
import { useOrders } from '@/hooks/useOrders';
import { useProveedores } from '@/hooks/useProveedores';
import { useProducts } from '@/hooks/useProducts';
import type { Pedido } from '@/types';
import type { OrderFormData } from '@/components/features/Orders/OrderForm';
import { FileText, Clock, CheckCircle, History } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'history';

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    createOrder,
    approveOrder,
    rejectOrder,
    markAsSent,
    cancelOrder,
  } = useOrders();
  const { proveedores } = useProveedores();
  const { products } = useProducts();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Filtrar pedidos según tab
  const pendingOrders = orders.filter((o) => o.estado === 'Pendiente_Aprobacion');
  const approvedOrders = orders.filter((o) =>
    ['Aprobado', 'Enviado'].includes(o.estado)
  );
  const historyOrders = orders.filter((o) =>
    ['Recibido', 'Cancelado'].includes(o.estado)
  );

  const currentOrders =
    activeTab === 'pending'
      ? pendingOrders
      : activeTab === 'approved'
      ? approvedOrders
      : historyOrders;

  const handleCreate = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: OrderFormData) => {
    setModalLoading(true);
    try {
      await createOrder(data);
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Error al crear el pedido. Por favor intenta de nuevo.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!modalLoading) {
      setIsModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const tabs = [
    {
      id: 'pending' as const,
      label: 'Pendientes',
      count: pendingOrders.length,
      icon: Clock,
      borderColor: '#D97706'
    },
    {
      id: 'approved' as const,
      label: 'Aprobados',
      count: approvedOrders.length,
      icon: CheckCircle,
      borderColor: '#064E3B'
    },
    {
      id: 'history' as const,
      label: 'Historial',
      count: historyOrders.length,
      icon: History,
      borderColor: '#6B7280'
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
            <p className="text-[#374151] font-medium tracking-tight">Cargando pedidos...</p>
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
                <FileText className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Pedidos
                </h1>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Gestiona pedidos a proveedores y su seguimiento
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

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-1 p-1 bg-white border border-[#E2E2D5] rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#064E3B] text-[#F5F2ED] shadow-sm'
                        : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span>{tab.label}</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-[#F5F2ED]/20 text-[#F5F2ED]'
                        : 'bg-[#E2E2D5] text-[#6B7280]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List */}
          <OrdersList
            orders={currentOrders}
            onEdit={() => {}}
            onCreate={handleCreate}
            onApprove={approveOrder}
            onReject={rejectOrder}
            onMarkAsSent={markAsSent}
            onCancel={cancelOrder}
            loading={loading}
            activeTab={activeTab}
          />

          {/* Modal */}
          <OrderModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            order={selectedOrder}
            proveedores={proveedores}
            products={products}
            onSave={handleSave}
            loading={modalLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
}
