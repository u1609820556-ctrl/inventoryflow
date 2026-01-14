'use client';

import AppLayout from '@/components/AppLayout';
import { FileEdit, Construction } from 'lucide-react';
import Link from 'next/link';

export default function PedidoManualPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
              <FileEdit className="w-6 h-6 text-[#F5F2ED]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                Crear Pedido Manual
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Crea pedidos manualmente seleccionando productos
              </p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 md:p-12 shadow-sm">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Construction className="w-8 h-8 text-[#D97706]" strokeWidth={2} />
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-3">
                Proximamente
              </h2>

              <p className="text-[#6B7280] mb-6 leading-relaxed">
                Esta funcionalidad estara disponible pronto. Podras crear pedidos
                manuales seleccionando productos y proveedores, o importando desde
                un archivo Excel.
              </p>

              <Link
                href="/pedidos/configuracion"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-200"
              >
                Ir a Configuracion de Autopedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
