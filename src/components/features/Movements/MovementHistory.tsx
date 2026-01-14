'use client';

// ============================================================
// COMPONENTE DEPRECADO - MovementHistory
// ============================================================
// Este componente usaba el tipo 'Movimiento' que fue eliminado.
// Se mantiene como stub para evitar errores de importación.
// ============================================================

import type { Producto, Proveedor } from '@/types';
import { Clock, Construction } from 'lucide-react';

// Deprecated type for backwards compatibility
export type MovementWithProduct = {
  id: string;
  producto_id: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  proveedor_id?: string;
  notas?: string;
  productos?: { nombre: string };
};

export interface MovementHistoryProps {
  movements: MovementWithProduct[];
  products: Producto[];
  proveedores: Proveedor[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MovementHistory({
  movements,
  loading,
}: MovementHistoryProps) {
  if (loading && movements.length === 0) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
          <span className="ml-3 text-[#6B7280] font-medium">Cargando historial...</span>
        </div>
      </div>
    );
  }

  // Always show deprecation notice
  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 md:p-12 shadow-sm text-center">
      <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
        <Construction className="w-8 h-8 text-[#D97706]" />
      </div>
      <h3 className="font-serif text-xl font-bold text-[#374151] mb-2">
        Historial de Movimientos
      </h3>
      <p className="text-[#6B7280] font-medium">
        El sistema de movimientos ha sido reestructurado.
      </p>
      <p className="text-sm text-[#9CA3AF] mt-1">
        Los movimientos ahora se registran directamente en los productos.
      </p>
    </div>
  );
}
