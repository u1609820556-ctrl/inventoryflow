'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Productos', href: '/products' },
  { name: 'Movimientos', href: '/movements' },
  { name: 'Pedidos', href: '/orders' },
  { name: 'Reglas Autopedido', href: '/reorder-rules' },
  { name: 'Pedidos Generados', href: '/generated-orders' },
  { name: 'Proveedores', href: '/providers' },
  { name: 'Configuración', href: '/config' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { session } = await authHelpers.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F2ED]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
          <p className="mt-4 text-[#6B7280] font-medium font-serif">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await authHelpers.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-[#F5F2ED] text-[#374151]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F5F2ED] border-r border-[#E2E2D5] flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-[#064E3B] tracking-tight">
            InventoryFlow
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mt-1">
            Gestión Pyme
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#064E3B] text-[#F5F2ED] shadow-sm'
                    : 'text-[#6B7280] hover:bg-[#E2E2D5]/50 hover:text-[#064E3B]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E2E2D5]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-[#991B1B] hover:bg-[#991B1B]/10 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#F5F2ED]">
        {/* Eliminamos el padding extra aquí si el Dashboard ya tiene el suyo */}
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}