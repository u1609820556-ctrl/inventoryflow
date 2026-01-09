'use client';

export interface StockSummaryCardProps {
  totalStock: number;
  lowStockCount: number;
  pendingOrdersCount: number;
}

export default function StockSummaryCard({
  totalStock,
  lowStockCount,
  pendingOrdersCount,
}: StockSummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="group bg-white border-2 border-green-200 rounded-xl p-8 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-3">
            Total Stock
          </p>
          <p className="font-serif text-5xl font-bold text-green-700 mb-2">
            {totalStock}
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <div className="group bg-white border-2 border-red-200 rounded-xl p-8 shadow-sm hover:shadow-lg hover:border-red-300 transition-all duration-300">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-3">
            Bajo Stock
          </p>
          <p className="font-serif text-5xl font-bold text-red-600 mb-2">
            {lowStockCount}
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <div className="group bg-white border-2 border-green-200 rounded-xl p-8 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300">
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500 tracking-wider uppercase mb-3">
            Pedidos Pendientes
          </p>
          <p className="font-serif text-5xl font-bold text-green-700 mb-2">
            {pendingOrdersCount}
          </p>
          <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
