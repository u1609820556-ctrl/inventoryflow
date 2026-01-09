'use client';

import { useState } from 'react';

export interface ProductData {
  nombre: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
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
      : [{ nombre: '', descripcion: '', stock_actual: 0, stock_minimo: 0 }]
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

      if (product.stock_actual < 0) {
        productErrors.stock_actual = 'El stock no puede ser negativo';
        isValid = false;
      }

      if (product.stock_minimo < 0) {
        productErrors.stock_minimo = 'El stock mínimo no puede ser negativo';
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
    setProducts([...products, { nombre: '', descripcion: '', stock_actual: 0, stock_minimo: 0 }]);
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
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Agrega tus productos</h2>
        <p className="text-sm text-gray-600 mt-1">Paso 2 de 3</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Producto {index + 1}</h3>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del producto
                  </label>
                  <input
                    type="text"
                    value={product.nombre}
                    onChange={(e) => handleProductChange(index, 'nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[index]?.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors[index].nombre}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <input
                    type="text"
                    value={product.descripcion || ''}
                    onChange={(e) => handleProductChange(index, 'descripcion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock inicial
                  </label>
                  <input
                    type="number"
                    value={product.stock_actual}
                    onChange={(e) =>
                      handleProductChange(index, 'stock_actual', parseInt(e.target.value) || 0)
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[index]?.stock_actual && (
                    <p className="mt-1 text-sm text-red-600">{errors[index].stock_actual}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock mínimo
                  </label>
                  <input
                    type="number"
                    value={product.stock_minimo}
                    onChange={(e) =>
                      handleProductChange(index, 'stock_minimo', parseInt(e.target.value) || 0)
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[index]?.stock_minimo && (
                    <p className="mt-1 text-sm text-red-600">{errors[index].stock_minimo}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-md hover:border-gray-400 hover:bg-gray-50"
        >
          + Agregar otro producto
        </button>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
          >
            ATRÁS
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            SIGUIENTE
          </button>
        </div>
      </form>
    </div>
  );
}
