'use client';

import { useEffect } from 'react';
import type { ReglaAutopedido, Producto, Proveedor } from '@/types';
import AutoOrderForm, { type AutoOrderFormData } from './AutoOrderForm';
import { X } from 'lucide-react';

export interface AutoOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: ReglaAutopedido | null;
  products: Producto[];
  proveedores: Proveedor[];
  existingRules: ReglaAutopedido[];
  onSave: (data: AutoOrderFormData) => Promise<void>;
  loading: boolean;
}

export default function AutoOrderModal({
  isOpen,
  onClose,
  rule,
  products,
  proveedores,
  existingRules,
  onSave,
  loading,
}: AutoOrderModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#E2E2D5]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E2D5]">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#064E3B]">
            {rule ? 'Editar Regla de Autopedido' : 'Nueva Regla de Autopedido'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="p-6">
          <AutoOrderForm
            rule={rule}
            products={products}
            proveedores={proveedores}
            existingRules={existingRules}
            onSubmit={onSave}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
