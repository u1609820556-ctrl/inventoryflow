'use client';

import { useProducts } from '@/hooks/useProducts';
import { useReorderRules } from '@/hooks/useReorderRules';
import { useMemo } from 'react';
import { AlertTriangle, Package, Clock } from 'lucide-react';

export function AlertasStockBajo() {
  const { products } = useProducts();
  const { rules } = useReorderRules();

  // Calcular productos con stock bajo y regla activa
  const productosAlerta = useMemo(() => {
    return products
      .filter((producto) => {
        // Verificar si tiene una regla activa
        const tieneReglaActiva = rules.some(
          (regla) => regla.producto_id === producto.id && regla.activa
        );

        if (!tieneReglaActiva) return false;

        // Obtener stock minimo de la regla
        const regla = rules.find((r) => r.producto_id === producto.id && r.activa);
        const stockMinimo = regla?.stock_minimo || 0;

        // Verificar si stock < minimo
        return producto.stock < stockMinimo;
      })
      .map((producto) => {
        const regla = rules.find((r) => r.producto_id === producto.id && r.activa);
        return {
          producto,
          regla,
          stockMinimo: regla?.stock_minimo || 0,
        };
      });
  }, [products, rules]);

  if (productosAlerta.length === 0) {
    return null; // Sin alertas, no mostrar nada
  }

  return (
    <div className="mb-6">
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-amber-800">
              Stock bajo detectado
            </h3>
            <p className="text-sm text-amber-600">
              {productosAlerta.length} {productosAlerta.length === 1 ? 'producto requiere' : 'productos requieren'} reposicion
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {productosAlerta.map((item) => (
            <div
              key={item.producto.id}
              className="bg-white/70 border border-amber-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.producto.nombre}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Stock actual: <span className="font-semibold text-red-600">{item.producto.stock}</span> | Minimo: <span className="font-semibold text-amber-700">{item.stockMinimo}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  El pedido se generara automaticamente hoy a las 3:00 AM
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs">i</span>
            No necesitas hacer nada. El sistema procesara automaticamente estos pedidos.
          </p>
        </div>
      </div>
    </div>
  );
}
