'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SetupCompanyStep from './SetupCompanyStep';
import SetupProductsStep, { type ProductData } from './SetupProductsStep';
import SetupProvidersStep, { type ProviderData } from './SetupProvidersStep';
import { db } from '@/lib/supabase';
import type { SetupData } from '@/types';

export default function SetupContainer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<SetupData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Check if setup is already complete
  useEffect(() => {
    const checkExistingSetup = async () => {
      try {
        const { data: company, error: companyError } = await db.empresa.get();
        if (company && !companyError) {
          // Setup already complete, redirect to dashboard
          window.location.href = '/dashboard';
          return;
        }
      } catch (err) {
        // No company exists, continue with setup
        console.log('No existing company found, proceeding with setup');
      }
      setCheckingSetup(false);
    };
    checkExistingSetup();
  }, []);

  const handleCompanyNext = (companyData: {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
  }) => {
    setSetupData({ ...setupData, empresa: companyData });
    setCurrentStep(2);
  };

  const handleProductsNext = (products: ProductData[]) => {
    setSetupData({ ...setupData, productos: products });
    setCurrentStep(3);
  };

  const handleProvidersBack = () => {
    setCurrentStep(2);
  };

  const handleProductsBack = () => {
    setCurrentStep(1);
  };

  const handleFinish = async (providers: ProviderData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar datos antes de empezar
      if (!setupData.empresa) {
        throw new Error('Datos de empresa no disponibles');
      }
      if (!setupData.productos || setupData.productos.length === 0) {
        throw new Error('Debe haber al menos un producto');
      }
      if (providers.length === 0) {
        throw new Error('Debe haber al menos un proveedor');
      }

      console.log('Iniciando proceso de setup...');

      // 1. Crear empresa
      console.log('Creando empresa...');
      const { data: empresaData, error: empresaError } = await db.empresa.create(setupData.empresa);

      if (empresaError) {
        console.error('Error al crear empresa:', empresaError);
        throw new Error(`Error al crear empresa: ${empresaError.message}`);
      }

      if (!empresaData) {
        throw new Error('No se pudo crear la empresa - no se recibieron datos');
      }

      console.log('Empresa creada exitosamente:', empresaData.id);

      // 2. Crear proveedores
      console.log('Creando proveedores...');
      const providerPromises = providers.map((provider) =>
        db.proveedores.create({
          nombre: provider.nombre,
          email: provider.email || null,
          telefono: provider.telefono || null,
          direccion: provider.direccion || null,
        })
      );
      const providerResults = await Promise.all(providerPromises);

      // Verificar errores en proveedores
      const providerErrors = providerResults.filter(result => result.error);
      if (providerErrors.length > 0) {
        console.error('Errores al crear proveedores:', providerErrors);
        throw new Error(`Error al crear proveedores: ${providerErrors[0].error?.message}`);
      }

      console.log(`${providerResults.length} proveedores creados exitosamente`);

      // 3. Crear productos
      console.log('Creando productos...');
      const productPromises = setupData.productos.map((product) =>
        db.productos.create({
          nombre: product.nombre,
          descripcion: product.descripcion || null,
          stock_actual: product.stock_actual,
          stock_minimo: product.stock_minimo,
        })
      );
      const productResults = await Promise.all(productPromises);

      // Verificar errores en productos
      const productErrors = productResults.filter(result => result.error);
      if (productErrors.length > 0) {
        console.error('Errores al crear productos:', productErrors);
        throw new Error(`Error al crear productos: ${productErrors[0].error?.message}`);
      }

      console.log(`${productResults.length} productos creados exitosamente`);

      // 4. Todo guardado correctamente, redirigir al dashboard
      console.log('Setup completado exitosamente');
      console.log('Empresa ID:', empresaData.id);
      console.log('Proveedores creados:', providerResults.length);
      console.log('Productos creados:', productResults.length);

      // Dar tiempo a que la BD propague los datos completamente
      console.log('Esperando propagación de datos...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Redirigiendo al dashboard...');
      // Redirigir al dashboard con refresh completo
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error durante el setup:', err);
      setError(err instanceof Error ? err.message : 'Error al completar el setup');
      setIsLoading(false);
    }
  };

  // Show loading while checking existing setup
  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md max-w-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {currentStep === 1 && (
        <SetupCompanyStep
          initialData={setupData.empresa}
          onNext={handleCompanyNext}
        />
      )}

      {currentStep === 2 && (
        <SetupProductsStep
          initialData={setupData.productos}
          onNext={handleProductsNext}
          onBack={handleProductsBack}
        />
      )}

      {currentStep === 3 && (
        <SetupProvidersStep
          initialData={setupData.proveedores}
          onFinish={handleFinish}
          onBack={handleProvidersBack}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
