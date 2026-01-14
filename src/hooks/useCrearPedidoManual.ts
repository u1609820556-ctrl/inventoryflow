'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Proveedor, Producto, LineaPedidoGenerado } from '@/types';

export interface ItemPedido {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
}

interface CreateOrderResponse {
  pedido_id: string;
  estado: string;
  total_estimado: number;
  pdf_url?: string;
}

interface GeneratePDFResponse {
  success: boolean;
  numero_pedido?: string;
  pdf_base64?: string;
  html_content?: string;
  total_estimado?: number;
  error?: string;
}

export function useCrearPedidoManual() {
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState<string>('');

  // Seleccionar proveedor
  const seleccionarProveedor = useCallback((proveedor: Proveedor | null) => {
    setProveedorSeleccionado(proveedor);
    setError(null);
  }, []);

  // Agregar producto al pedido
  const agregarProducto = useCallback((producto: Producto, cantidad: number = 1) => {
    setItems(prev => {
      // Verificar si ya existe
      const existente = prev.find(item => item.producto_id === producto.id);
      if (existente) {
        // Actualizar cantidad
        return prev.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      // Agregar nuevo item
      return [
        ...prev,
        {
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          cantidad,
          precio_unitario: producto.precio_unitario,
        },
      ];
    });
    setError(null);
  }, []);

  // Eliminar producto del pedido
  const eliminarProducto = useCallback((productoId: string) => {
    setItems(prev => prev.filter(item => item.producto_id !== productoId));
  }, []);

  // Cambiar cantidad de un producto
  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.producto_id === productoId
          ? { ...item, cantidad }
          : item
      )
    );
  }, [eliminarProducto]);

  // Cambiar precio unitario de un producto
  const cambiarPrecio = useCallback((productoId: string, precio: number) => {
    if (precio < 0) return;
    setItems(prev =>
      prev.map(item =>
        item.producto_id === productoId
          ? { ...item, precio_unitario: precio }
          : item
      )
    );
  }, []);

  // Calcular total
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);
  }, [items]);

  // Calcular subtotales por item
  const itemsConSubtotal = useMemo(() => {
    return items.map(item => ({
      ...item,
      subtotal: item.cantidad * item.precio_unitario,
    }));
  }, [items]);

  // Generar PDF del pedido
  const generarPDF = useCallback(async (): Promise<GeneratePDFResponse> => {
    if (!proveedorSeleccionado) {
      throw new Error('Selecciona un proveedor primero');
    }
    if (items.length === 0) {
      throw new Error('Agrega al menos un producto al pedido');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedor_id: proveedorSeleccionado.id,
          lineas: items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          })),
          notas,
        }),
      });

      const result: GeneratePDFResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al generar PDF');
      }

      return result;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al generar PDF';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [proveedorSeleccionado, items, notas]);

  // Descargar PDF
  const descargarPDF = useCallback(async (): Promise<void> => {
    const result = await generarPDF();

    if (result.pdf_base64) {
      // Convertir base64 a blob y descargar
      const byteCharacters = atob(result.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.numero_pedido || 'pedido-manual'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }, [generarPDF]);

  // Crear pedido en la BD
  const crearPedido = useCallback(async (): Promise<CreateOrderResponse> => {
    if (!proveedorSeleccionado) {
      throw new Error('Selecciona un proveedor primero');
    }
    if (items.length === 0) {
      throw new Error('Agrega al menos un producto al pedido');
    }

    setLoading(true);
    setError(null);

    try {
      // Primero generar el PDF
      const pdfResult = await generarPDF();

      // Crear el pedido en la BD
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedor_id: proveedorSeleccionado.id,
          lineas: items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          })),
          notas,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear pedido');
      }

      return {
        pedido_id: result.pedido_id,
        estado: result.estado,
        total_estimado: result.total_estimado,
        pdf_url: pdfResult.pdf_base64 ? 'generated' : undefined,
      };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear pedido';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [proveedorSeleccionado, items, notas, generarPDF]);

  // Crear pedido y descargar PDF
  const crearPedidoYDescargar = useCallback(async (): Promise<CreateOrderResponse> => {
    if (!proveedorSeleccionado) {
      throw new Error('Selecciona un proveedor primero');
    }
    if (items.length === 0) {
      throw new Error('Agrega al menos un producto al pedido');
    }

    setLoading(true);
    setError(null);

    try {
      // Generar PDF
      const pdfResult = await generarPDF();

      // Descargar PDF
      if (pdfResult.pdf_base64) {
        const byteCharacters = atob(pdfResult.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pdfResult.numero_pedido || 'pedido-manual'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Crear el pedido en la BD
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedor_id: proveedorSeleccionado.id,
          lineas: items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          })),
          notas,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear pedido');
      }

      return {
        pedido_id: result.pedido_id,
        estado: result.estado,
        total_estimado: result.total_estimado,
        pdf_url: pdfResult.pdf_base64 ? 'generated' : undefined,
      };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear pedido';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  }, [proveedorSeleccionado, items, notas, generarPDF]);

  // Reset estado
  const reset = useCallback(() => {
    setProveedorSeleccionado(null);
    setItems([]);
    setNotas('');
    setError(null);
    setLoading(false);
  }, []);

  // Validar si el pedido está listo para crear
  const esValido = useMemo(() => {
    return proveedorSeleccionado !== null && items.length > 0;
  }, [proveedorSeleccionado, items]);

  return {
    // Estados
    proveedorSeleccionado,
    items: itemsConSubtotal,
    loading,
    error,
    notas,
    total,
    esValido,

    // Funciones
    seleccionarProveedor,
    agregarProducto,
    eliminarProducto,
    cambiarCantidad,
    cambiarPrecio,
    setNotas,
    generarPDF,
    descargarPDF,
    crearPedido,
    crearPedidoYDescargar,
    reset,
  };
}
