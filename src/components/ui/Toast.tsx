'use client';

import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Proveedor de toasts para la aplicación.
 * Debe incluirse en el layout raíz para funcionar globalmente.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#374151',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E2D5',
          maxWidth: '400px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#064E3B',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#991B1B',
            secondary: '#FFFFFF',
          },
        },
      }}
    />
  );
}

/**
 * Muestra una notificación de éxito
 * @param message - Mensaje a mostrar
 */
export function showSuccess(message: string) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-[#E2E2D5]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#064E3B]" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#374151]">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-[#E2E2D5]">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    { duration: 4000 }
  );
}

/**
 * Muestra una notificación de error
 * @param message - Mensaje de error a mostrar
 */
export function showError(message: string) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-[#991B1B]" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#374151]">
                Error
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-red-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-red-50 focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    { duration: 6000 }
  );
}

/**
 * Muestra una notificación de advertencia
 * @param message - Mensaje de advertencia
 */
export function showWarning(message: string) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-yellow-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#374151]">
                Advertencia
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-yellow-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-yellow-50 focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    { duration: 5000 }
  );
}

/**
 * Muestra una notificación informativa
 * @param message - Mensaje informativo
 */
export function showInfo(message: string) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-blue-200`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-[#374151]">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-blue-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-blue-50 focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    { duration: 4000 }
  );
}

/**
 * Muestra un toast de carga que se puede actualizar
 * @param message - Mensaje de carga
 * @returns ID del toast para actualizarlo
 */
export function showLoading(message: string): string {
  return toast.loading(message, {
    style: {
      background: '#FFFFFF',
      color: '#374151',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E2E2D5',
    },
  });
}

/**
 * Descarta un toast específico
 * @param toastId - ID del toast a descartar
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Descarta todos los toasts activos
 */
export function dismissAllToasts() {
  toast.dismiss();
}
