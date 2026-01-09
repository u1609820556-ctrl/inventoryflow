'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers, isConfigured } from '@/lib/supabase';
import SetupInstructions from '@/components/SetupInstructions';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isConfigured) {
      const redirect = async () => {
        const { session } = await authHelpers.getSession();
        if (session) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      };
      redirect();
    }
  }, [router]);

  if (!isConfigured) {
    return <SetupInstructions />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">InventoryFlow</h1>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}
