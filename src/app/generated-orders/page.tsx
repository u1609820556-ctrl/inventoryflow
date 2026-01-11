'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import GeneratedOrdersList from '@/components/features/GeneratedOrders/GeneratedOrdersList';
import GeneratedOrderModal from '@/components/features/GeneratedOrders/GeneratedOrderModal';
import SendEmailModal from '@/components/features/GeneratedOrders/SendEmailModal';
import { useGeneratedOrders } from '@/hooks/useGeneratedOrders';
import type { PedidoGenerado, EstadoPedidoGenerado } from '@/types';
import { FileText, RefreshCw } from 'lucide-react';

export default function GeneratedOrdersPage() {
  const {
    orders,
    loading,
    error,
    sendingEmail,
    generatingPDF,
    fetchOrders,
    sendEmail,
    downloadPDF,
    getPendingOrdersCount,
    getSentOrdersThisWeek,
  } = useGeneratedOrders();

  const [selectedOrder, setSelectedOrder] = useState<PedidoGenerado | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EstadoPedidoGenerado | 'all'>('all');

  const handleViewDetails = (order: PedidoGenerado) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleSendEmailClick = (order: PedidoGenerado) => {
    setSelectedOrder(order);
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async (email: string, _sendCopy: boolean) => {
    if (!selectedOrder) return;
    await sendEmail(selectedOrder.id, { email_proveedor: email });
  };

  const handleDownloadPDF = async (orderId: string) => {
    await downloadPDF(orderId);
  };

  const pendingCount = getPendingOrdersCount();
  const sentThisWeek = getSentOrdersThisWeek();

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-[#F5F2ED]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                  Pedidos Generados
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  Gestiona los pedidos generados automáticamente
                </p>
              </div>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Total Pedidos
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                {orders.length}
              </p>
            </div>
            <div className="bg-white border-2 border-amber-200 rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Pendientes
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
            <div className="bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Enviados (semana)
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-emerald-600">
                {sentThisWeek}
              </p>
            </div>
            <div className="hidden md:block bg-white border border-[#E2E2D5] rounded-xl p-4 md:p-6">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Completados
              </p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-[#9CA3AF]">
                {orders.filter((o) => o.estado === 'completed').length}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Orders List */}
          <GeneratedOrdersList
            orders={orders}
            loading={loading}
            sendingEmail={sendingEmail}
            generatingPDF={generatingPDF}
            onViewDetails={handleViewDetails}
            onDownloadPDF={handleDownloadPDF}
            onSendEmail={handleSendEmailClick}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Details Modal */}
      <GeneratedOrderModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedOrder(null);
        }}
        onSend={handleSendEmail}
        order={selectedOrder}
        loading={!!sendingEmail}
      />
    </AppLayout>
  );
}
