'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PedidosPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pedidos/configuracion');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
        <p className="mt-4 text-[#6B7280] font-medium">Redireccionando...</p>
      </div>
    </div>
  );
}
