'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Package, ArrowRight, ChevronRight } from 'lucide-react';
import type { Producto, ReglaAutopedido } from '@/types';

interface AlertasStockProps {
  products: Producto[];
  rules: ReglaAutopedido[];
  limite?: number;
}

export default function AlertasStock({ products, rules, limite = 5 }: AlertasStockProps) {
  // Calcular productos bajo stock basado en reglas de autopedido
  const productosConAlerta = useMemo(() => {
    return products
      .map((producto) => {
        const regla = rules.find((r) => r.producto_id === producto.id && r.activa);
        if (!regla) return null;

        const porcentaje = regla.stock_minimo > 0
          ? (producto.stock / regla.stock_minimo) * 100
          : 100;

        if (producto.stock >= regla.stock_minimo) return null;

        return {
          producto,
          regla,
          porcentaje,
          diferencia: regla.stock_minimo - producto.stock,
          esCritico: porcentaje <= 30,
          esAdvertencia: porcentaje > 30 && porcentaje <= 60,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => a!.porcentaje - b!.porcentaje) as Array<{
        producto: Producto;
        regla: ReglaAutopedido;
        porcentaje: number;
        diferencia: number;
        esCritico: boolean;
        esAdvertencia: boolean;
      }>;
  }, [products, rules]);

  const productosLimitados = productosConAlerta.slice(0, limite);
  const hayMas = productosConAlerta.length > limite;

  if (productosConAlerta.length === 0) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#374151]">
              Alertas de Stock
            </h3>
            <p className="text-sm text-[#6B7280]">Todo en orden</p>
          </div>
        </div>
        <p className="text-[#6B7280] text-center py-4">
          No hay productos por debajo del stock mínimo
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#374151]">
              Alertas de Stock
            </h3>
            <p className="text-sm text-[#6B7280]">
              {productosConAlerta.length} producto{productosConAlerta.length !== 1 ? 's' : ''} bajo stock
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
          {productosConAlerta.length}
        </span>
      </div>

      {/* Lista de productos */}
      <div className="space-y-3">
        {productosLimitados.map(({ producto, regla, porcentaje, diferencia, esCritico, esAdvertencia }) => (
          <div
            key={producto.id}
            className={`p-4 rounded-xl border ${
              esCritico
                ? 'bg-red-50 border-red-200'
                : esAdvertencia
                ? 'bg-amber-50 border-amber-200'
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      esCritico ? 'bg-red-500' : esAdvertencia ? 'bg-amber-500' : 'bg-orange-500'
                    }`}
                  />
                  <h4 className="font-medium text-[#374151] truncate">
                    {producto.nombre}
                  </h4>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#6B7280]">
                    Stock:{' '}
                    <span className={`font-mono font-bold ${esCritico ? 'text-red-600' : 'text-[#374151]'}`}>
                      {producto.stock}
                    </span>
                  </span>
                  <span className="text-[#6B7280]">
                    Mínimo:{' '}
                    <span className="font-mono font-medium text-[#374151]">{regla.stock_minimo}</span>
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-bold ${
                    esCritico ? 'text-red-600' : esAdvertencia ? 'text-amber-600' : 'text-orange-600'
                  }`}
                >
                  {esCritico ? 'CRÍTICO' : esAdvertencia ? 'BAJO' : 'ADVERTENCIA'}
                </p>
                <p className="text-xs text-[#6B7280]">
                  Faltan {diferencia} uds
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-3">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    esCritico ? 'bg-red-500' : esAdvertencia ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ver todos */}
      {hayMas && (
        <Link
          href="/products"
          className="mt-4 flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#064E3B] hover:bg-[#F9FAFB] rounded-xl transition-colors"
        >
          Ver todos los productos ({productosConAlerta.length})
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      {/* Acción rápida */}
      <div className="mt-4 pt-4 border-t border-[#E2E2D5]">
        <Link
          href="/pedidos/configuracion"
          className="flex items-center justify-between p-3 bg-[#064E3B] text-white rounded-xl hover:opacity-90 transition-all"
        >
          <span className="font-medium text-sm">Configurar autopedidos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
