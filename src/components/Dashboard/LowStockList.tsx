'use client';

import type { Producto } from '@/types';

export interface LowStockListProps {
  products: Producto[];
}

export default function LowStockList({ products }: LowStockListProps) {
  const displayProducts = products.slice(0, 5);

  const getStockStatus = (product: Producto) => {
    // Con la nueva estructura, no hay stock_minimo en producto
    // Se usa stock <= 0 como indicador de bajo stock
    if (product.stock <= 0) return { color: 'text-red-600', icon: '🔴' };
    if (product.stock <= 10) return { color: 'text-yellow-600', icon: '🟡' };
    return { color: 'text-green-600', icon: '🟢' };
  };

  return (
    <div className="bg-white border-2 border-green-200 rounded-xl p-8 shadow-sm">
      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">
        Productos Bajo Stock
      </h2>

      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">No hay productos con stock bajo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayProducts.map((product) => {
            const status = getStockStatus(product);
            return (
              <div
                key={product.id}
                className="group flex items-center justify-between p-4 border border-gray-100 hover:border-red-200 rounded-lg hover:bg-red-50/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{status.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                      {product.nombre}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Stock: <span className="font-mono font-medium">{product.stock}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-mono font-bold ${status.color}`}>
                    {product.stock}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">unidades</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {products.length > 5 && (
        <button className="mt-6 w-full py-2.5 text-sm text-green-700 hover:text-green-800 font-medium border-2 border-green-200 hover:border-green-300 rounded-lg hover:bg-green-50 transition-all duration-200">
          Ver todos los productos ({products.length})
        </button>
      )}
    </div>
  );
}
