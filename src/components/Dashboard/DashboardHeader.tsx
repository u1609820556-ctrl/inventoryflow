'use client';

import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import { useState } from 'react';

export interface DashboardHeaderProps {
  companyName: string;
}

export default function DashboardHeader({ companyName }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await authHelpers.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
      alert('Error al cerrar sesión');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50/30 border-b border-green-100 px-8 py-8">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-green-700 tracking-wider uppercase mb-2">
            Bienvenido, {companyName}
          </p>
          <h1 className="font-serif text-5xl font-bold text-green-700 tracking-tight">
            Dashboard
          </h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 px-5 py-2.5 border-2 border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:border-green-300 hover:text-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isLoggingOut ? 'Saliendo...' : 'SALIR'}
        </button>
      </div>
    </div>
  );
}
