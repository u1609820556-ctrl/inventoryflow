'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import { ArrowLeftRight, Construction, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ============================================================
// PÁGINA DEPRECADA - Movimientos
// ============================================================
// Esta página usaba la tabla 'movimientos' que fue eliminada en la
// reestructuración 2.0. Los movimientos de stock ahora se manejan
// directamente a través de ajustes en productos.
// ============================================================

export default function MovementsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session } = await authHelpers.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent mb-4"></div>
          <p className="text-[#374151] font-medium tracking-tight">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-[#064E3B] rounded-full flex items-center justify-center mt-1">
                <ArrowLeftRight className="w-4 h-4 text-[#F5F2ED]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] mb-2 leading-tight">
                  Movimientos de Stock
                </h1>
                <p className="text-sm md:text-base text-[#6B7280]">
                  Registra entradas, salidas y ajustes de inventario
                </p>
              </div>
            </div>
          </div>

          {/* Deprecation Notice */}
          <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 md:p-12 shadow-sm">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Construction className="w-8 h-8 text-[#D97706]" strokeWidth={2} />
              </div>

              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-3">
                Módulo en Reestructuración
              </h2>

              <p className="text-[#6B7280] mb-6 leading-relaxed">
                El sistema de movimientos de stock ha sido actualizado. Ahora puedes ajustar
                el stock directamente desde la página de productos, y los pedidos se generan
                automáticamente cuando el stock baja del mínimo configurado.
              </p>

              <div className="space-y-3">
                <Link
                  href="/products"
                  className="w-full px-6 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200"
                >
                  Ir a Productos
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/reorder-rules"
                  className="w-full px-6 py-3 border border-[#E2E2D5] text-[#374151] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-all duration-200"
                >
                  Configurar Reglas de Autopedido
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
