-- =====================================================
-- MIGRACIÓN: TABLA MOVIMIENTOS_STOCK
-- Para tracking de historial de ajustes y ventas de inventario
-- =====================================================

-- Crear tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL,
  stock_anterior INTEGER NOT NULL,
  stock_nuevo INTEGER NOT NULL,
  notas TEXT,
  usuario_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_tipo_movimiento CHECK (tipo IN ('ajuste_manual', 'venta', 'compra', 'devolucion', 'merma'))
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_empresa_id ON movimientos_stock(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_producto_id ON movimientos_stock(producto_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_tipo ON movimientos_stock(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_created_at ON movimientos_stock(created_at);

-- Habilitar RLS
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para movimientos_stock
DROP POLICY IF EXISTS "usuarios_ven_sus_movimientos" ON movimientos_stock;
CREATE POLICY "usuarios_ven_sus_movimientos"
  ON movimientos_stock FOR SELECT
  USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_crean_movimientos" ON movimientos_stock;
CREATE POLICY "usuarios_crean_movimientos"
  ON movimientos_stock FOR INSERT
  WITH CHECK (empresa_id = auth.uid());

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
