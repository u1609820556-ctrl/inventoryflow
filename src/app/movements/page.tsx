'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import { useProducts } from '@/hooks/useProducts';
import { useProveedores } from '@/hooks/useProveedores';
import { useMovements } from '@/hooks/useMovements';
import { MovementForm } from '@/components/features/Movements/MovementForm';
import { MovementHistory } from '@/components/features/Movements/MovementHistory';
import AppLayout from '@/components/AppLayout';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export default function MovementsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const { products, fetchProducts } = useProducts();
  const { proveedores } = useProveedores();
  const { movements, loading, fetchMovements, createMovement, fetchMoreMovements } = useMovements();

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

  // Fetch movements on mount
  useEffect(() => {
    if (authenticated) {
      fetchMovements();
    }
  }, [authenticated, fetchMovements]);

  const handleSubmit = async (data: Parameters<typeof createMovement>[0]) => {
    try {
      await createMovement(data);

      // Refresh products to get updated stock
      await fetchProducts();

      // Refresh movements
      await fetchMovements();

      // Show success message
      setSuccessMessage('Movimiento registrado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Error is already handled in the hook
      throw error;
    }
  };

  const handleLoadMore = () => {
    fetchMoreMovements(movements.length);
  };

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
                  Registra entradas, salidas y ajustes de inventario. El stock se actualizará automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-[#F0FDF4] border border-[#064E3B]/20 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#064E3B]" />
              <p className="text-sm text-[#064E3B] font-medium">{successMessage}</p>
            </div>
          )}

          {/* Movement Form */}
          <div className="mb-8">
            <MovementForm
              products={products}
              proveedores={proveedores}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Movement History */}
          <MovementHistory
            movements={movements}
            products={products}
            proveedores={proveedores}
            loading={loading}
            hasMore={movements.length >= 50 && movements.length % 50 === 0}
            onLoadMore={handleLoadMore}
          />
        </div>
      </div>
    </AppLayout>
  );
}
