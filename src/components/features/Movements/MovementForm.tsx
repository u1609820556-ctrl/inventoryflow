'use client';

// ============================================================
// COMPONENTE DEPRECADO - MovementForm
// ============================================================
// Este componente usaba la tabla 'movimientos' que fue eliminada.
// Se mantiene como stub para evitar errores de importación.
// ============================================================

import type { Producto, Proveedor } from '@/types';
import { Construction, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface MovementFormProps {
  products: Producto[];
  proveedores: Proveedor[];
  loading: boolean;
  onSubmit: (data: unknown) => Promise<void>;
}

export function MovementForm({ loading }: MovementFormProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 shadow-sm">
      <div className="text-center max-w-md mx-auto">
        <div className="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-4">
          <Construction className="w-6 h-6 text-[#D97706]" strokeWidth={2} />
        </div>

        <h2 className="font-serif text-xl font-bold text-[#374151] mb-2">
          Módulo en Reestructuración
        </h2>

        <p className="text-sm text-[#6B7280] mb-4">
          El sistema de movimientos ha sido actualizado. Ahora puedes ajustar
          el stock directamente desde la página de productos.
        </p>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#064E3B] text-[#F5F2ED] rounded-lg font-semibold text-sm hover:opacity-90 transition-all duration-200"
        >
          Ir a Productos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
