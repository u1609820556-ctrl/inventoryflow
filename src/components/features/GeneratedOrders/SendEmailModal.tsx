'use client';

import { useState } from 'react';
import { X, Send, Loader2, Mail, AlertCircle, Copy, Check } from 'lucide-react';
import type { PedidoGenerado } from '@/types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string, sendCopy: boolean) => Promise<void>;
  order: PedidoGenerado | null;
  loading?: boolean;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  onSend,
  order,
  loading = false,
}: SendEmailModalProps) {
  const [email, setEmail] = useState('');
  const [sendCopy, setSendCopy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Reset state when modal opens
  useState(() => {
    if (isOpen && order?.proveedores?.email) {
      setEmail(order.proveedores.email);
    }
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('El formato del email no es válido');
      return;
    }

    setIsSending(true);
    try {
      await onSend(email, sendCopy);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar email');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyEmail = async () => {
    if (order?.proveedores?.email) {
      await navigator.clipboard.writeText(order.proveedores.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleUseProviderEmail = () => {
    if (order?.proveedores?.email) {
      setEmail(order.proveedores.email);
      setError(null);
    }
  };

  if (!isOpen || !order) return null;

  const providerEmail = order.proveedores?.email;
  const providerName = order.proveedores?.nombre || 'Proveedor';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Enviar Pedido por Email
                </h2>
                <p className="text-xs text-[#6B7280]">
                  A: {providerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Warning if already sent */}
            {order.estado === 'sent' && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Este pedido ya fue enviado
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Enviado el {new Date(order.sent_at!).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Provider Email Info */}
            {providerEmail && (
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                  Email del Proveedor
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#374151]">{providerEmail}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-1.5 text-[#6B7280] hover:text-[#064E3B] hover:bg-white rounded transition-colors"
                      title="Copiar email"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {email !== providerEmail && (
                      <button
                        type="button"
                        onClick={handleUseProviderEmail}
                        className="text-xs font-medium text-[#064E3B] hover:underline"
                      >
                        Usar este
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Enviar a
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={loading || isSending}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors ${
                  error ? 'border-red-500' : 'border-[#E2E2D5]'
                }`}
                placeholder="email@proveedor.com"
              />
              {!providerEmail && (
                <p className="mt-1 text-xs text-amber-600">
                  El proveedor no tiene email configurado
                </p>
              )}
            </div>

            {/* Send Copy Checkbox */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendCopy}
                  onChange={(e) => setSendCopy(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
              </label>
              <span className="text-sm text-[#374151]">
                Enviar copia a mi email
              </span>
            </div>

            {/* Order Summary */}
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
                Resumen del Pedido
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Items:</span>
                  <span className="font-medium text-[#374151]">{order.datos_pedido.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Total estimado:</span>
                  <span className="font-bold text-[#064E3B]">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(order.total_estimado)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending || loading || order.estado === 'sent'}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
