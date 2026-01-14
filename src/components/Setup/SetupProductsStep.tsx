'use client';

import { useState } from 'react';
import { Package, Trash2 } from 'lucide-react';

export interface ProductData {
  nombre: string;
  descripcion?: string;
  stock: number;
  precio_unitario: number;
}

export interface SetupProductsStepProps {
  initialData?: ProductData[];
  onNext: (products: ProductData[]) => void;
  onBack: () => void;
}

export default function SetupProductsStep({ initialData, onNext, onBack }: SetupProductsStepProps) {
  const [products, setProducts] = useState<ProductData[]>(
    initialData && initialData.length > 0
      ? initialData
      : [{ nombre: '', descripcion: '', stock: 0, precio_unitario: 0 }]
  );
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  const validateProducts = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    if (products.length === 0) {
      alert('Debes agregar al menos un producto');
      return false;
    }

    products.forEach((product, index) => {
      const productErrors: Record<string, string> = {};

      if (!product.nombre.trim()) {
        productErrors.nombre = 'El nombre es requerido';
        isValid = false;
      }

      if (product.stock < 0) {
        productErrors.stock = 'El stock no puede ser negativo';
        isValid = false;
      }

      if (product.precio_unitario < 0) {
        productErrors.precio_unitario = 'El precio no puede ser negativo';
        isValid = false;
      }

      if (Object.keys(productErrors).length > 0) {
        newErrors[index] = productErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleAddProduct = () => {
    setProducts([...products, { nombre: '', descripcion: '', stock: 0, precio_unitario: 0 }]);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length === 1) {
      alert('Debes tener al menos un producto');
      return;
    }
    setProducts(products.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleProductChange = (
    index: number,
    field: keyof ProductData,
    value: string | number
  ) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);

    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateProducts()) {
      onNext(products);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#F5F2ED]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#064E3B]">Agrega tus productos</h2>
              <p className="text-xs text-[#6B7280] font-medium">Paso 2 de 3</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="p-4 border border-[#E2E2D5] rounded-lg bg-[#F5F2ED]/50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-[#374151]">Producto {index + 1}</h3>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="flex items-center gap-1 text-[#991B1B] hover:opacity-80 text-sm font-medium transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Nombre del producto
                    </label>
                    <input
                      type="text"
                      value={product.nombre}
                      onChange={(e) => handleProductChange(index, 'nombre', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                    {errors[index]?.nombre && (
                      <p className="mt-1 text-sm text-[#991B1B]">{errors[index].nombre}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Descripcion (opcional)
                    </label>
                    <input
                      type="text"
                      value={product.descripcion || ''}
                      onChange={(e) => handleProductChange(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Stock inicial
                    </label>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) =>
                        handleProductChange(index, 'stock', parseInt(e.target.value) || 0)
                      }
                      min="0"
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                    {errors[index]?.stock && (
                      <p className="mt-1 text-sm text-[#991B1B]">{errors[index].stock}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Precio unitario
                    </label>
                    <input
                      type="number"
                      value={product.precio_unitario}
                      onChange={(e) =>
                        handleProductChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2.5 border border-[#E2E2D5] rounded-lg text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-colors bg-white"
                    />
                    {errors[index]?.precio_unitario && (
                      <p className="mt-1 text-sm text-[#991B1B]">{errors[index].precio_unitario}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full px-4 py-2.5 border-2 border-dashed border-[#E2E2D5] text-[#6B7280] font-medium rounded-lg hover:border-[#064E3B] hover:text-[#064E3B] hover:bg-[#F5F2ED]/50 transition-all duration-200"
          >
            + Agregar otro producto
          </button>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-2.5 border border-[#E2E2D5] text-[#374151] font-medium rounded-lg hover:bg-[#F5F2ED]/50 hover:border-[#9CA3AF] transition-all duration-200"
            >
              ATRAS
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#064E3B] text-[#F5F2ED] font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 transition-all duration-200"
            >
              SIGUIENTE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
