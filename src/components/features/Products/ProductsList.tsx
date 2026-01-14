'use client';

import { useState } from 'react';
import type { Producto } from '@/types';
import { Search, Plus, MoreVertical, AlertCircle } from 'lucide-react';

export interface ProductsListProps {
  products: Producto[];
  onEdit: (product: Producto) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function ProductsList({
  products,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
  loading,
}: ProductsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteClick = (product: Producto) => {
    const confirmDelete = window.confirm(
      `Estas seguro de eliminar el producto "${product.nombre}"?`
    );
    if (confirmDelete) {
      onDelete(product.id);
    }
    setOpenMenuId(null);
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

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
            <p className="mt-4 text-[#6B7280] font-medium">Cargando productos...</p>
          </div>
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
        <button
          onClick={onCreate}
          className="w-full sm:w-auto px-5 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nuevo Producto</span>
        </button>
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
                      Descripcion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Stock
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
                          {product.codigo_barras && (
                            <div className="text-xs text-[#9CA3AF] font-mono mt-0.5">
                              {product.codigo_barras}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280] max-w-xs truncate">
                            {product.descripcion || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-mono font-semibold ${isLowStock ? 'text-[#991B1B]' : 'text-[#374151]'}`}>
                            {product.stock}
                          </span>
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
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <span className="text-[#9CA3AF] text-xs block mb-0.5">Stock</span>
                        <span className={`font-mono font-semibold ${isLowStock ? 'text-[#991B1B]' : 'text-[#374151]'}`}>
                          {product.stock}
                        </span>
                      </div>
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
    </div>
  );
}
