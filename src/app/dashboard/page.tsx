'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useCompany } from '@/hooks/useCompany';
import { useProducts } from '@/hooks/useProducts';
import { useReorderRules } from '@/hooks/useReorderRules';
import { useGeneratedOrders } from '@/hooks/useGeneratedOrders';
import { authHelpers } from '@/lib/supabase';
import type { Producto } from '@/types';
import {
  Package,
  AlertCircle,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  Check,
  X,
  Sparkles,
  Settings,
  Send,
  ArrowRight,
} from 'lucide-react';
import { showError, showInfo } from '@/components/ui/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const { company, loading: companyLoading } = useCompany();

  // Redirect to setup if no company exists after loading
  useEffect(() => {
    if (!companyLoading && !company) {
      router.push('/setup');
    }
  }, [company, companyLoading, router]);
  const { products, loading: productsLoading } = useProducts();
  const { rules, getActiveRulesCount } = useReorderRules();
  const { orders: generatedOrders, loading: ordersLoading, getPendingOrdersCount, getSentOrdersThisWeek } = useGeneratedOrders();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    // Usar las reglas de autopedido para determinar productos bajo stock
    return products.filter((p) => {
      const rule = rules.find(r => r.producto_id === p.id && r.activa);
      return rule ? p.stock < rule.stock_minimo : false;
    });
  }, [products, rules]);

  const pendingOrders = useMemo(() => {
    return generatedOrders.filter((order) => order.estado === 'pending_review');
  }, [generatedOrders]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
      showError('Error al cerrar sesión');
      setIsLoggingOut(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingOrderId(id);
    try {
      // TODO: Implement approve via API - for now redirect to orders page
      showInfo('Para aprobar este pedido, ve a la página de Pedidos');
      router.push('/pedidos/historial');
    } catch (err) {
      console.error('Failed to approve order:', err);
      showError('Error al aprobar pedido');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingOrderId(id);
    try {
      // TODO: Implement reject via API - for now redirect to orders page
      showInfo('Para rechazar este pedido, ve a la página de Pedidos');
      router.push('/pedidos/historial');
    } catch (err) {
      console.error('Failed to reject order:', err);
      showError('Error al rechazar pedido');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays}d`;
    }
  };

  const getStockPercentage = (product: Producto) => {
    const rule = rules.find(r => r.producto_id === product.id && r.activa);
    const minimo = rule?.stock_minimo || 1;
    return (product.stock / minimo) * 100;
  };

  if (companyLoading || productsLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
          <p className="text-[#374151] font-medium tracking-tight">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const displayLowStockProducts = lowStockProducts.slice(0, 7);
  const displayPendingOrders = pendingOrders.slice(0, 5);

  return (
    <AppLayout>
      {/* HEADER - Sticky top */}
      <div className="sticky top-0 z-50 bg-[#F5F2ED] border-b border-[#E2E2D5] px-6 md:px-8 lg:px-12 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#F5F2ED]" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-[#064E3B] tracking-tight">
                InventoryFlow
              </h1>
              <p className="text-xs text-[#6B7280] font-medium">
                {company?.nombre_empresa || 'Tu empresa'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 border border-[#E2E2D5] text-[#374151] text-sm font-medium rounded-lg hover:bg-white/50 hover:border-[#9CA3AF] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* GREETING SECTION */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-[#064E3B] rounded-full flex items-center justify-center mt-1">
                <TrendingUp className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Bienvenido de vuelta, {company?.nombre_empresa || 'Usuario'}
                </h2>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Aquí está tu resumen de hoy
                </p>
              </div>
            </div>
          </div>

          {/* STATS CARDS - Grid 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Total Stock Card */}
            <div
              className="group bg-white border-2 border-[#064E3B] rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
                    Total Stock
                  </p>
                  <p className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] leading-none">
                    {totalStock}
                  </p>
                </div>
                <Package className="w-4 h-4 text-[#064E3B] opacity-60" strokeWidth={2} />
              </div>
              <p className="text-xs md:text-sm text-[#9CA3AF]">Actualizado hace 2h</p>
            </div>

            {/* Bajo Stock Card */}
            <div
              className="group bg-white border-2 border-[#991B1B] rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
                    Bajo Stock
                  </p>
                  <p className="font-serif text-5xl md:text-6xl font-bold text-[#991B1B] leading-none">
                    {lowStockProducts.length}
                  </p>
                </div>
                <AlertCircle className="w-4 h-4 text-[#991B1B] opacity-60" strokeWidth={2} />
              </div>
              <p className="text-xs md:text-sm text-[#9CA3AF]">
                {lowStockProducts.length > 0 ? 'Requiere atención' : 'Todo en orden'}
              </p>
            </div>

            {/* Pedidos Pendientes Card */}
            <div
              className="group bg-white border-2 border-[#064E3B] rounded-xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
                    Pedidos Pend.
                  </p>
                  <p className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] leading-none">
                    {pendingOrders.length}
                  </p>
                </div>
                <FileText className="w-4 h-4 text-[#064E3B] opacity-60" strokeWidth={2} />
              </div>
              <p className="text-xs md:text-sm text-[#9CA3AF]">Esperando aprobación</p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="mb-8 md:mb-12">
            <div className="h-px bg-[#E2E2D5]"></div>
          </div>

          {/* MAIN CONTENT GRID - 60/40 */}
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-6 md:gap-8">
            {/* PRODUCTOS BAJO STOCK - 60% */}
            <div
              className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#E2E2D5]">
                <AlertCircle className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />
                <div className="flex-1">
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#374151]">
                    Productos Bajo Stock
                  </h3>
                  <p className="text-xs md:text-sm text-[#6B7280] mt-1">Requieren reorden</p>
                </div>
              </div>

              {/* Content */}
              {displayLowStockProducts.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-[#D1FAE5] mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-base md:text-lg font-medium text-[#9CA3AF] mb-1">
                    Todo está en orden
                  </p>
                  <p className="text-sm text-[#9CA3AF]">No hay productos bajo stock</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {displayLowStockProducts.map((product, index) => {
                    const percentage = getStockPercentage(product);
                    const isCritical = percentage <= 30;
                    const isWarning = percentage > 30 && percentage <= 60;

                    return (
                      <div
                        key={product.id}
                        className={`group py-3 md:py-4 transition-all duration-200 hover:bg-[#F9FAFB] hover:pl-3 cursor-pointer ${
                          index !== displayLowStockProducts.length - 1 ? 'border-b border-[#E2E2D5]' : ''
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftWidth = '3px';
                          e.currentTarget.style.borderLeftColor = '#064E3B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftWidth = '0px';
                        }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                isCritical ? 'bg-[#991B1B]' : isWarning ? 'bg-[#D97706]' : 'bg-[#064E3B]'
                              }`}
                            ></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm md:text-base font-bold text-[#374151] truncate">
                                {product.nombre}
                              </p>
                              <p className="text-xs md:text-sm text-[#9CA3AF] mt-0.5">
                                Stock:{' '}
                                <span className={`font-mono font-medium ${isCritical ? 'text-[#991B1B]' : 'text-[#6B7280]'}`}>
                                  {product.stock}
                                </span>{' '}
                                / Mín:{' '}
                                <span className="font-mono font-medium text-[#6B7280]">
                                  {rules.find(r => r.producto_id === product.id)?.stock_minimo || '-'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button className="px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-all duration-150">
                              Ver
                            </button>
                            <button className="px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-all duration-150">
                              Reordenar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {lowStockProducts.length > 7 && (
                <div className="mt-6">
                  <button className="w-full py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-all duration-200">
                    Ver todos ({lowStockProducts.length})
                  </button>
                </div>
              )}
            </div>

            {/* PEDIDOS PENDIENTES - 40% */}
            <div
              className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E2D5]">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-[#374151]">
                      Pedidos Pendientes
                    </h3>
                    <p className="text-xs md:text-sm text-[#6B7280] mt-1">Esperando tu aprobación</p>
                  </div>
                </div>
                {pendingOrders.length > 0 && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-[#991B1B] text-[#F5F2ED] text-xs md:text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {pendingOrders.length}
                  </div>
                )}
              </div>

              {/* Content */}
              {displayPendingOrders.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-[#D1FAE5] mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-base md:text-lg font-medium text-[#9CA3AF] mb-1">
                    Sin pedidos pendientes
                  </p>
                  <p className="text-sm text-[#9CA3AF]">¡Todo aprobado!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayPendingOrders.map((order, index) => (
                    <div
                      key={order.id}
                      className="group py-3 md:py-4 transition-all duration-200 hover:bg-[#F9FAFB] hover:pl-3 rounded-lg"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftWidth = '3px';
                        e.currentTarget.style.borderLeftColor = '#064E3B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderLeftWidth = '0px';
                      }}
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold bg-[#E2E2D5] text-[#374151] rounded tracking-wide">
                            AUTO
                          </span>
                          <span className="text-xs md:text-sm font-bold text-[#374151]">
                            ${order.total_estimado.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-[#9CA3AF]">
                          <p>
                            Prov:{' '}
                            <span className="text-[#6B7280] font-medium">
                              {order.proveedores?.nombre || 'Sin proveedor'}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] mt-1">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={loadingOrderId === order.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#064E3B] text-[#F5F2ED] text-xs md:text-sm font-semibold rounded-lg hover:opacity-90 transition-all duration-150 disabled:opacity-50"
                        >
                          {loadingOrderId === order.id ? (
                            <div className="w-3 h-3 border-2 border-[#F5F2ED] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              <span>Aprobar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          disabled={loadingOrderId === order.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#E2E2D5] text-[#374151] text-xs md:text-sm font-semibold rounded-lg hover:bg-[#991B1B] hover:text-[#F5F2ED] transition-all duration-150 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Rechazar</span>
                        </button>
                      </div>

                      {index !== displayPendingOrders.length - 1 && (
                        <div className="h-px bg-[#E2E2D5] mt-4"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {pendingOrders.length > 5 && (
                <div className="mt-6">
                  <button className="w-full py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-all duration-200">
                    Ver todos ({pendingOrders.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-8 md:my-12">
            <div className="h-px bg-[#E2E2D5]"></div>
          </div>

          {/* AUTOPEDIDOS SECTION */}
          <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E2D5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#F5F2ED]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-[#374151]">
                    Autopedidos - Resumen
                  </h3>
                  <p className="text-xs md:text-sm text-[#6B7280] mt-1">
                    Estado de reglas y pedidos automáticos
                  </p>
                </div>
              </div>
              <Link
                href="/pedidos/historial"
                className="flex items-center gap-1.5 text-sm font-medium text-[#064E3B] hover:underline"
              >
                Ver todos los pedidos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Reglas Activas */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Reglas Activas
                  </span>
                </div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                  {getActiveRulesCount()}
                </p>
                <Link
                  href="/pedidos/configuracion"
                  className="text-xs text-[#064E3B] font-medium hover:underline mt-2 inline-block"
                >
                  Gestionar reglas
                </Link>
              </div>

              {/* Pedidos Pendientes */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                    Pendientes
                  </span>
                </div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-amber-600">
                  {getPendingOrdersCount()}
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Por revisar/enviar
                </p>
              </div>

              {/* Enviados esta semana */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Enviados (sem.)
                  </span>
                </div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-emerald-600">
                  {getSentOrdersThisWeek()}
                </p>
                <p className="text-xs text-emerald-600 mt-2">
                  Últimos 7 días
                </p>
              </div>

              {/* Total Pedidos */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Total Pedidos
                  </span>
                </div>
                <p className="font-serif text-3xl md:text-4xl font-bold text-[#374151]">
                  {generatedOrders.length}
                </p>
                <p className="text-xs text-[#6B7280] mt-2">
                  Generados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}