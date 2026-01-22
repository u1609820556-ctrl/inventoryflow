'use client';

import { useState } from 'react';
import type { Producto } from '@/types';
import { Search, Plus, MoreVertical, AlertCircle, FileSpreadsheet, Minus, Check } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { TableSkeleton, CardListSkeleton } from '@/components/ui/Skeleton';
import { showSuccess, showError, showWarning } from '@/components/ui/Toast';

export interface ProductsListProps {
  products: Producto[];
  onEdit: (product: Producto) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onSearch: (query: string) => void;
  onImport: () => void;
  onStockUpdate: () => void;
  loading: boolean;
}

export default function ProductsList({
  products,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
  onImport,
  onStockUpdate,
  loading,
}: ProductsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Producto | null }>({
    isOpen: false,
    product: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stockAdjusting, setStockAdjusting] = useState<string | null>(null);
  const [sellQuantities, setSellQuantities] = useState<Record<string, string>>({});
  const [sellLoading, setSellLoading] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteClick = (product: Producto) => {
    setDeleteModal({ isOpen: true, product });
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.product) return;
    setDeleteLoading(true);
    try {
      await onDelete(deleteModal.product.id);
      setDeleteModal({ isOpen: false, product: null });
    } catch {
      // El error se maneja en el componente padre
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleMenu = (productId: string) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Ajustar stock (+1 o -1)
  const handleStockAdjust = async (productId: string, delta: number) => {
    setStockAdjusting(productId);
    try {
      const response = await fetch(`/api/productos/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al ajustar stock');
      }

      showSuccess(`Stock ajustado: ${data.stock_anterior} → ${data.stock_nuevo}`);
      onStockUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al ajustar stock';
      showError(message);
    } finally {
      setStockAdjusting(null);
    }
  };

  // Registrar venta
  const handleSell = async (productId: string, productName: string, currentStock: number) => {
    const quantityStr = sellQuantities[productId];
    const quantity = parseInt(quantityStr, 10);

    if (!quantityStr || isNaN(quantity) || quantity <= 0) {
      showError('Ingresa una cantidad válida');
      return;
    }

    if (quantity > currentStock) {
      showError(`Stock insuficiente. Disponible: ${currentStock}`);
      return;
    }

    setSellLoading(productId);
    try {
      const response = await fetch('/api/stock/registrar-venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: productId,
          cantidad: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar venta');
      }

      // Limpiar input
      setSellQuantities(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      showSuccess(`Venta registrada: ${quantity} unidades de "${productName}"`);

      // Mostrar alerta si el stock bajó del mínimo
      if (data.alerta_stock_bajo) {
        showWarning(`Stock bajo el mínimo (${data.stock_minimo}). Stock actual: ${data.stock_nuevo}`);
      }

      onStockUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar venta';
      showError(message);
    } finally {
      setSellLoading(null);
    }
  };

  const handleSellQuantityChange = (productId: string, value: string) => {
    // Solo permitir números
    if (value === '' || /^\d+$/.test(value)) {
      setSellQuantities(prev => ({ ...prev, [productId]: value }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="w-full sm:w-96 h-12 bg-[#E2E2D5] rounded-xl animate-pulse" />
          <div className="w-full sm:w-40 h-12 bg-[#E2E2D5] rounded-xl animate-pulse" />
        </div>
        {/* Desktop table skeleton */}
        <div className="hidden md:block">
          <TableSkeleton rows={5} />
        </div>
        {/* Mobile cards skeleton */}
        <div className="md:hidden">
          <CardListSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con busqueda y boton crear */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={onImport}
            className="w-full sm:w-auto px-5 py-3 bg-white text-[#064E3B] border border-[#064E3B] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#064E3B]/5 transition-all duration-200"
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={2.5} />
            <span>Importar Excel</span>
          </button>
          <button
            onClick={onCreate}
            className="w-full sm:w-auto px-5 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[#E2E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] font-medium">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {searchQuery ? 'Intenta con otro termino de busqueda' : 'Comienza agregando tu primer producto'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Referencia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Vender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2D5]">
                  {products.map((product) => {
                    const isLowStock = product.stock <= 0;
                    return (
                      <tr
                        key={product.id}
                        className="group hover:bg-[#F9FAFB] transition-all duration-200"
                        style={{
                          borderLeft: isLowStock ? '3px solid #991B1B' : '3px solid transparent'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[#374151]">
                            {product.nombre}
                          </div>
                          {product.descripcion && (
                            <div className="text-xs text-[#9CA3AF] mt-0.5 truncate max-w-[200px]">
                              {product.descripcion}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#6B7280] font-mono">
                            {product.referencia || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#6B7280]">
                            {product.proveedor?.nombre || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStockAdjust(product.id, -1)}
                              disabled={stockAdjusting === product.id || product.stock <= 0}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E2D5] bg-white text-[#6B7280] hover:bg-[#FEF2F2] hover:border-[#991B1B] hover:text-[#991B1B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              title="Reducir stock"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <span className={`w-12 text-center text-sm font-mono font-semibold ${isLowStock ? 'text-[#991B1B]' : 'text-[#374151]'}`}>
                              {stockAdjusting === product.id ? '...' : product.stock}
                            </span>
                            <button
                              onClick={() => handleStockAdjust(product.id, 1)}
                              disabled={stockAdjusting === product.id}
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E2E2D5] bg-white text-[#6B7280] hover:bg-[#ECFDF5] hover:border-[#064E3B] hover:text-[#064E3B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              title="Aumentar stock"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={sellQuantities[product.id] || ''}
                              onChange={(e) => handleSellQuantityChange(product.id, e.target.value)}
                              placeholder="0"
                              className="w-14 px-2 py-1.5 text-center text-sm font-mono border border-[#E2E2D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                              disabled={sellLoading === product.id}
                            />
                            <button
                              onClick={() => handleSell(product.id, product.nombre, product.stock)}
                              disabled={sellLoading === product.id || !sellQuantities[product.id]}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#064E3B] text-white hover:bg-[#043927] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              title="Registrar venta"
                            >
                              {sellLoading === product.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-[#6B7280]">
                            {formatPrice(product.precio_unitario)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => toggleMenu(product.id)}
                              className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenuId === product.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                                <button
                                  onClick={() => {
                                    onEdit(product);
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(product)}
                                  className="block w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#E2E2D5]">
              {products.map((product) => {
                const isLowStock = product.stock <= 0;
                return (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-[#F9FAFB] transition-all duration-200"
                    style={{
                      borderLeft: isLowStock ? '3px solid #991B1B' : '3px solid transparent'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#374151]">
                          {product.nombre}
                        </h3>
                        {product.descripcion && (
                          <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                            {product.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="relative ml-3">
                        <button
                          onClick={() => toggleMenu(product.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === product.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                            <button
                              onClick={() => {
                                onEdit(product);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="block w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {/* Stock con botones +/- */}
                      <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <span className="text-[#9CA3AF] text-xs block mb-2">Stock</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockAdjust(product.id, -1)}
                            disabled={stockAdjusting === product.id || product.stock <= 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E2D5] bg-white text-[#6B7280] hover:bg-[#FEF2F2] hover:border-[#991B1B] hover:text-[#991B1B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <span className={`flex-1 text-center font-mono font-semibold text-lg ${isLowStock ? 'text-[#991B1B]' : 'text-[#374151]'}`}>
                            {stockAdjusting === product.id ? '...' : product.stock}
                          </span>
                          <button
                            onClick={() => handleStockAdjust(product.id, 1)}
                            disabled={stockAdjusting === product.id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E2D5] bg-white text-[#6B7280] hover:bg-[#ECFDF5] hover:border-[#064E3B] hover:text-[#064E3B] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* Vender */}
                      <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <span className="text-[#9CA3AF] text-xs block mb-2">Vender</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={sellQuantities[product.id] || ''}
                            onChange={(e) => handleSellQuantityChange(product.id, e.target.value)}
                            placeholder="0"
                            className="flex-1 px-3 py-2 text-center text-sm font-mono border border-[#E2E2D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                            disabled={sellLoading === product.id}
                          />
                          <button
                            onClick={() => handleSell(product.id, product.nombre, product.stock)}
                            disabled={sellLoading === product.id || !sellQuantities[product.id]}
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#064E3B] text-white hover:bg-[#043927] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {sellLoading === product.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" strokeWidth={2.5} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <span className="text-[#9CA3AF] text-xs block mb-0.5">Precio</span>
                        <span className="font-mono font-medium text-[#6B7280]">
                          {formatPrice(product.precio_unitario)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Total count */}
      {products.length > 0 && (
        <div className="text-sm text-[#6B7280] text-right">
          Total: <span className="font-semibold text-[#374151]">{products.length}</span> producto{products.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${deleteModal.product?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
