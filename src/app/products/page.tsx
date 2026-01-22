'use client';

import { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import ProductsList from '@/components/features/Products/ProductsList';
import ProductModal from '@/components/features/Products/ProductModal';
import ImportarExcel from '@/components/features/Products/ImportarExcel';
import { AlertasStockBajo } from '@/components/features/Productos/AlertasStockBajo';
import { useProducts } from '@/hooks/useProducts';
import type { Producto } from '@/types';
import type { ProductFormData } from '@/components/features/Products/ProductForm';
import { Package } from 'lucide-react';
import { showSuccess, showError } from '@/components/ui/Toast';

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    fetchProducts,
  } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return searchProducts(searchQuery);
  }, [products, searchQuery, searchProducts]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Producto) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      showSuccess('Producto eliminado correctamente');
    } catch (err) {
      console.error('Error deleting product:', err);
      const message = err instanceof Error ? err.message : 'Error al eliminar el producto';
      showError(message);
      throw err;
    }
  };

  const handleSave = async (data: ProductFormData) => {
    setModalLoading(true);
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
        showSuccess(`Producto "${data.nombre}" actualizado correctamente`);
      } else {
        await createProduct(data);
        showSuccess(`Producto "${data.nombre}" creado correctamente`);
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      const message = err instanceof Error ? err.message : 'Error al guardar el producto';
      showError(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!modalLoading) {
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
            <p className="text-[#374151] font-medium tracking-tight">Cargando productos...</p>
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
                <Package className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Productos
                </h1>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Gestiona tu catálogo de productos e inventario
                </p>
              </div>
            </div>
          </div>

          {/* Alertas de Stock Bajo */}
          <AlertasStockBajo />

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#991B1B]/20 rounded-xl">
              <p className="text-sm text-[#991B1B] font-medium">Error: {error}</p>
            </div>
          )}

          {/* Products List */}
          <ProductsList
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onSearch={handleSearch}
            onImport={handleImport}
            onStockUpdate={fetchProducts}
            loading={loading}
          />

          {/* Modal */}
          <ProductModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProduct}
            onSave={handleSave}
            loading={modalLoading}
          />

          {/* Modal Importar Excel */}
          <ImportarExcel
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImportSuccess={handleImportSuccess}
          />
        </div>
      </div>
    </AppLayout>
  );
}
