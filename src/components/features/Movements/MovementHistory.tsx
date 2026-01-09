'use client';

import type { Movimiento, Producto, Proveedor } from '@/types';
import { Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, Package, ChevronDown } from 'lucide-react';

// Extended type with product info
export type MovementWithProduct = Movimiento & {
  productos?: { nombre: string };
};

export interface MovementHistoryProps {
  movements: MovementWithProduct[];
  products: Producto[];
  proveedores: Proveedor[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MovementHistory({
  movements,
  products,
  proveedores,
  loading,
  hasMore,
  onLoadMore,
}: MovementHistoryProps) {
  const getProductName = (movimiento: MovementWithProduct): string => {
    // First try from joined data
    if (movimiento.productos?.nombre) {
      return movimiento.productos.nombre;
    }
    // Fallback to products array
    const product = products.find((p) => p.id === movimiento.producto_id);
    return product?.nombre || 'Producto desconocido';
  };

  const getProveedorName = (proveedorId?: string): string => {
    if (!proveedorId) return '';
    const proveedor = proveedores.find((p) => p.id === proveedorId);
    return proveedor?.nombre || '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoStyles = (tipo: string) => {
    switch (tipo) {
      case 'Entrada':
        return {
          color: 'text-[#064E3B]',
          bg: 'bg-[#F0FDF4]',
          border: 'border-[#064E3B]/20',
          icon: ArrowDownCircle
        };
      case 'Salida':
        return {
          color: 'text-[#991B1B]',
          bg: 'bg-[#FEF2F2]',
          border: 'border-[#991B1B]/20',
          icon: ArrowUpCircle
        };
      case 'Ajuste':
        return {
          color: 'text-[#1D4ED8]',
          bg: 'bg-[#EFF6FF]',
          border: 'border-[#1D4ED8]/20',
          icon: RefreshCw
        };
      case 'Pedido_Recibido':
        return {
          color: 'text-[#7C3AED]',
          bg: 'bg-[#F5F3FF]',
          border: 'border-[#7C3AED]/20',
          icon: Package
        };
      default:
        return {
          color: 'text-[#6B7280]',
          bg: 'bg-[#F9FAFB]',
          border: 'border-[#E2E2D5]',
          icon: RefreshCw
        };
    }
  };

  const getCantidadDisplay = (movimiento: Movimiento): { text: string; color: string } => {
    switch (movimiento.tipo) {
      case 'Entrada':
      case 'Pedido_Recibido':
        return { text: `+${movimiento.cantidad}`, color: 'text-[#064E3B]' };
      case 'Salida':
        return { text: `-${movimiento.cantidad}`, color: 'text-[#991B1B]' };
      case 'Ajuste':
        return { text: `${movimiento.cantidad}`, color: 'text-[#1D4ED8]' };
      default:
        return { text: `${movimiento.cantidad}`, color: 'text-[#374151]' };
    }
  };

  if (loading && movements.length === 0) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
          <span className="ml-3 text-[#6B7280] font-medium">Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-8 md:p-12 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#E2E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-[#9CA3AF]" />
        </div>
        <p className="text-[#6B7280] font-medium">No hay movimientos registrados</p>
        <p className="text-sm text-[#9CA3AF] mt-1">Los movimientos que registres aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#E2E2D5]">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-[#374151]">
          Historial de Movimientos
          <span className="text-sm font-normal text-[#9CA3AF] ml-2">
            (últimos {movements.length})
          </span>
        </h2>
      </div>

      <div className="divide-y divide-[#E2E2D5]">
        {movements.map((movimiento) => {
          const tipoStyles = getTipoStyles(movimiento.tipo);
          const cantidadDisplay = getCantidadDisplay(movimiento);
          const Icon = tipoStyles.icon;

          return (
            <div
              key={movimiento.id}
              className="p-4 md:p-5 hover:bg-[#F9FAFB] transition-all duration-200 group"
              style={{ borderLeft: '3px solid transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = '#064E3B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = 'transparent';
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Date, Time, Type */}
                <div className="flex gap-4 min-w-0 flex-1">
                  <div className="flex flex-col items-center min-w-[80px]">
                    <span className="text-sm font-semibold text-[#374151]">
                      {formatDate(movimiento.fecha)}
                    </span>
                    <span className="text-xs text-[#9CA3AF] font-mono">{formatTime(movimiento.fecha)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Type badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${tipoStyles.bg} ${tipoStyles.color} ${tipoStyles.border}`}
                    >
                      <Icon className="w-3 h-3" />
                      {movimiento.tipo.replace('_', ' ')}
                    </span>

                    {/* Product name */}
                    <p className="mt-2 font-semibold text-[#374151]">{getProductName(movimiento)}</p>

                    {/* Quantity */}
                    <p className="mt-1 text-sm text-[#6B7280]">
                      Cantidad:{' '}
                      <span className={`font-mono font-bold ${cantidadDisplay.color}`}>
                        {cantidadDisplay.text}
                      </span>
                    </p>

                    {/* Proveedor (if present) */}
                    {movimiento.proveedor_id && (
                      <p className="mt-1 text-sm text-[#9CA3AF]">
                        Proveedor: <span className="font-medium text-[#6B7280]">{getProveedorName(movimiento.proveedor_id)}</span>
                      </p>
                    )}

                    {/* Notes (if present) */}
                    {movimiento.notas && (
                      <p className="mt-2 text-sm text-[#6B7280] italic bg-[#F9FAFB] px-3 py-2 rounded-lg border border-[#E2E2D5]">
                        {movimiento.notas}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-4 border-t border-[#E2E2D5]">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-3 border border-[#E2E2D5] text-[#6B7280] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#6B7280] border-r-transparent"></span>
                Cargando...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Cargar más
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
