'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface SubNavItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  submenu?: SubNavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Productos', href: '/products' },
  {
    name: 'Pedidos',
    href: '/pedidos',
    submenu: [
      { name: 'Configuracion', href: '/pedidos/configuracion' },
      { name: 'Historial', href: '/pedidos/historial' },
      { name: 'Crear Pedido', href: '/pedidos/manual' },
    ],
  },
  { name: 'Proveedores', href: '/proveedores' },
  { name: 'Configuracion', href: '/config' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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

  // Auto-expand submenu if current path is within it
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.submenu && pathname.startsWith(item.href)) {
        setOpenSubmenu(item.href);
      }
    });
  }, [pathname]);

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

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu(openSubmenu === href ? null : href);
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
            Gestion Pyme
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === item.href;

            if (hasSubmenu) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleSubmenu(item.href)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#064E3B] text-[#F5F2ED] shadow-sm'
                        : 'text-[#6B7280] hover:bg-[#E2E2D5]/50 hover:text-[#064E3B]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isSubmenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isSubmenuOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                      {item.submenu!.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSubActive
                                ? 'bg-[#064E3B]/10 text-[#064E3B] border-l-2 border-[#064E3B]'
                                : 'text-[#6B7280] hover:bg-[#E2E2D5]/50 hover:text-[#064E3B]'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#F5F2ED]">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}