'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PedidoGenerado, EstadoPedidoGenerado } from '@/types';

interface SendEmailData {
  email_proveedor: string;
  pdf_base64?: string;
}

interface SendEmailResponse {
  estado: string;
  sent_at: string;
  email_sent_to: string;
  message_id?: string;
  numero_pedido?: string;
  error?: string;
  warning?: string;
}

interface GeneratePDFResponse {
  success: boolean;
  numero_pedido?: string;
  pdf_base64?: string;
  html_content?: string;
  total_estimado?: number;
  error?: string;
  details?: string;
}

interface ApiResponse {
  data?: PedidoGenerado[];
  error?: string;
  details?: string;
}

export function useGeneratedOrders() {
  const [orders, setOrders] = useState<PedidoGenerado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/create');
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener pedidos');
      }

      setOrders(result.data || []);
    } catch (err) {
      console.error('Failed to fetch generated orders:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = async (orderId: string, data: SendEmailData): Promise<SendEmailResponse> => {
    setSendingEmail(orderId);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: SendEmailResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar email');
      }

      // Update local state to reflect 'sent' status
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                estado: 'sent' as EstadoPedidoGenerado,
                sent_at: result.sent_at,
              }
            : order
        )
      );

      return result;
    } catch (err) {
      console.error('Failed to send email:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSendingEmail(null);
    }
  };

  const generatePDF = async (orderId: string): Promise<GeneratePDFResponse> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    setGeneratingPDF(orderId);
    setError(null);
    try {
      const response = await fetch('/api/orders/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedor_id: order.proveedor_id,
          lineas: order.datos_pedido.map((linea) => ({
            producto_id: linea.producto_id,
            cantidad: linea.cantidad,
            precio_unitario: linea.precio_unitario,
          })),
          notas: order.notas,
        }),
      });

      const result: GeneratePDFResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al generar PDF');
      }

      return result;
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al generar PDF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const downloadPDF = async (orderId: string): Promise<void> => {
    const result = await generatePDF(orderId);

    if (result.pdf_base64) {
      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.numero_pedido || 'pedido'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const getEmailPreview = async (
    orderId: string
  ): Promise<{ subject: string; html: string; text: string; to_email: string }> => {
    const response = await fetch(`/api/orders/${orderId}/send-email`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener preview');
    }

    return result;
  };

  const getOrdersByStatus = (status: EstadoPedidoGenerado | 'all'): PedidoGenerado[] => {
    if (status === 'all') {
      return orders;
    }
    return orders.filter((order) => order.estado === status);
  };

  const getPendingOrdersCount = (): number => {
    return orders.filter((o) => o.estado === 'pending_review').length;
  };

  const getSentOrdersThisWeek = (): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return orders.filter((o) => {
      if (o.estado !== 'sent' || !o.sent_at) return false;
      return new Date(o.sent_at) >= oneWeekAgo;
    }).length;
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    sendingEmail,
    generatingPDF,
    fetchOrders,
    sendEmail,
    generatePDF,
    downloadPDF,
    getEmailPreview,
    getOrdersByStatus,
    getPendingOrdersCount,
    getSentOrdersThisWeek,
  };
}
