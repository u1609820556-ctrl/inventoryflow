'use client';

// ============================================================
// HOOK DEPRECADO - useMovements
// ============================================================
// Este hook usaba la tabla 'movimientos' que fue eliminada en la
// reestructuración 2.0.
//
// Este archivo se mantiene como stub para evitar errores de
// importación en componentes que aún no se han migrado.
// ============================================================

import { useState, useCallback } from 'react';

interface DeprecatedMovimiento {
  id: string;
  producto_id: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  notas?: string;
}

export type MovementFormData = {
  producto_id: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Pedido_Recibido';
  cantidad: number;
  proveedor_id?: string;
  notas?: string;
};

export function useMovements() {
  const [movements] = useState<DeprecatedMovimiento[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    console.warn('[useMovements] DEPRECADO: Este hook ya no funciona.');
  }, []);

  const fetchMoreMovements = useCallback(async () => {
    console.warn('[useMovements] DEPRECADO: fetchMoreMovements ya no funciona.');
  }, []);

  const createMovement = async (): Promise<DeprecatedMovimiento> => {
    console.warn('[useMovements] DEPRECADO: createMovement ya no funciona.');
    throw new Error('Hook deprecado. La tabla movimientos fue eliminada.');
  };

  return {
    movements,
    loading,
    error,
    fetchMovements,
    createMovement,
    fetchMoreMovements,
  };
}
