'use client';

import AppLayout from '@/components/AppLayout';
import CrearPedidoForm from '@/components/features/Pedidos/PedidoManual/CrearPedidoForm';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PedidoManualPage() {
  const handleSuccess = () => {
    // El formulario ya muestra el mensaje de éxito internamente
    console.log('Pedido creado exitosamente');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/pedidos/historial"
              className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#064E3B] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al historial
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#F5F2ED]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                  Crear Pedido Manual
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Crea un pedido personalizado para enviar a tu proveedor
                </p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <CrearPedidoForm onSuccess={handleSuccess} />
        </div>
      </div>
    </AppLayout>
  );
}
