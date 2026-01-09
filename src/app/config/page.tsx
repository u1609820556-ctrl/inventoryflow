'use client';

import AppLayout from '@/components/AppLayout';

export default function ConfigPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuracion</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuracion General</h2>
          <p className="text-gray-600">Configuraciones del sistema disponibles proximamente.</p>
        </div>
      </div>
    </AppLayout>
  );
}
