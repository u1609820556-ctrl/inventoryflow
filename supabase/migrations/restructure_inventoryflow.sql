-- =====================================================
-- REESTRUCTURACIÓN INVENTORYFLOW 2.0
-- Migración completa para limpiar y reorganizar el esquema
-- =====================================================

-- PARTE 1: ELIMINAR TABLAS INNECESARIAS
-- (en orden correcto para respetar foreign keys)
-- =====================================================

DROP TABLE IF EXISTS lineas_pedido CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS historico_precios CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;

-- =====================================================
-- PARTE 2: RECREAR TABLA PRODUCTOS (limpia)
-- =====================================================

DROP TABLE IF EXISTS productos CASCADE;

CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  codigo_barras VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_producto_empresa UNIQUE(empresa_id, nombre)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);

-- =====================================================
-- PARTE 3: RECREAR TABLA REGLAS_AUTOPEDIDO (con nombres correctos)
-- =====================================================

DROP TABLE IF EXISTS reglas_autopedido CASCADE;

CREATE TABLE reglas_autopedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  stock_minimo INTEGER NOT NULL,
  cantidad_pedido INTEGER NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_regla UNIQUE(empresa_id, producto_id, proveedor_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_reglas_autopedido_empresa_id ON reglas_autopedido(empresa_id);
CREATE INDEX idx_reglas_autopedido_producto_id ON reglas_autopedido(producto_id);
CREATE INDEX idx_reglas_autopedido_proveedor_id ON reglas_autopedido(proveedor_id);
CREATE INDEX idx_reglas_autopedido_activa ON reglas_autopedido(activa);

-- =====================================================
-- PARTE 4: VERIFICAR/CREAR TABLA PEDIDOS_GENERADOS
-- =====================================================

-- Solo crear si no existe (esta tabla es necesaria para el sistema)
CREATE TABLE IF NOT EXISTS pedidos_generados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  estado VARCHAR(50) NOT NULL DEFAULT 'pending_review',
  datos_pedido JSONB NOT NULL DEFAULT '[]',
  total_estimado NUMERIC(10,2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  email_template_used TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_estado CHECK (estado IN ('pending_review', 'sent', 'completed', 'cancelled'))
);

-- Índices para pedidos_generados
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_empresa_id ON pedidos_generados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_proveedor_id ON pedidos_generados(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_estado ON pedidos_generados(estado);

-- =====================================================
-- PARTE 5: HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reglas_autopedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_generados ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 6: POLÍTICAS RLS PARA PRODUCTOS
-- =====================================================

DROP POLICY IF EXISTS "usuarios_ven_sus_productos" ON productos;
CREATE POLICY "usuarios_ven_sus_productos"
  ON productos FOR SELECT
  USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_crean_productos" ON productos;
CREATE POLICY "usuarios_crean_productos"
  ON productos FOR INSERT
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_editan_productos" ON productos;
CREATE POLICY "usuarios_editan_productos"
  ON productos FOR UPDATE
  USING (empresa_id = auth.uid())
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_eliminan_productos" ON productos;
CREATE POLICY "usuarios_eliminan_productos"
  ON productos FOR DELETE
  USING (empresa_id = auth.uid());

-- =====================================================
-- PARTE 7: POLÍTICAS RLS PARA REGLAS_AUTOPEDIDO
-- =====================================================

DROP POLICY IF EXISTS "usuarios_ven_sus_reglas" ON reglas_autopedido;
CREATE POLICY "usuarios_ven_sus_reglas"
  ON reglas_autopedido FOR SELECT
  USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_crean_reglas" ON reglas_autopedido;
CREATE POLICY "usuarios_crean_reglas"
  ON reglas_autopedido FOR INSERT
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_editan_reglas" ON reglas_autopedido;
CREATE POLICY "usuarios_editan_reglas"
  ON reglas_autopedido FOR UPDATE
  USING (empresa_id = auth.uid())
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_eliminan_reglas" ON reglas_autopedido;
CREATE POLICY "usuarios_eliminan_reglas"
  ON reglas_autopedido FOR DELETE
  USING (empresa_id = auth.uid());

-- =====================================================
-- PARTE 8: POLÍTICAS RLS PARA PROVEEDORES
-- =====================================================

DROP POLICY IF EXISTS "usuarios_ven_sus_proveedores" ON proveedores;
CREATE POLICY "usuarios_ven_sus_proveedores"
  ON proveedores FOR SELECT
  USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_crean_proveedores" ON proveedores;
CREATE POLICY "usuarios_crean_proveedores"
  ON proveedores FOR INSERT
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_editan_proveedores" ON proveedores;
CREATE POLICY "usuarios_editan_proveedores"
  ON proveedores FOR UPDATE
  USING (empresa_id = auth.uid())
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_eliminan_proveedores" ON proveedores;
CREATE POLICY "usuarios_eliminan_proveedores"
  ON proveedores FOR DELETE
  USING (empresa_id = auth.uid());

-- =====================================================
-- PARTE 9: POLÍTICAS RLS PARA PEDIDOS_GENERADOS
-- =====================================================

DROP POLICY IF EXISTS "usuarios_ven_sus_pedidos" ON pedidos_generados;
CREATE POLICY "usuarios_ven_sus_pedidos"
  ON pedidos_generados FOR SELECT
  USING (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_crean_pedidos" ON pedidos_generados;
CREATE POLICY "usuarios_crean_pedidos"
  ON pedidos_generados FOR INSERT
  WITH CHECK (empresa_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_editan_pedidos" ON pedidos_generados;
CREATE POLICY "usuarios_editan_pedidos"
  ON pedidos_generados FOR UPDATE
  USING (empresa_id = auth.uid())
  WITH CHECK (empresa_id = auth.uid());

-- =====================================================
-- PARTE 10: TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabla
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reglas_autopedido_updated_at ON reglas_autopedido;
CREATE TRIGGER update_reglas_autopedido_updated_at
  BEFORE UPDATE ON reglas_autopedido
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proveedores_updated_at ON proveedores;
CREATE TRIGGER update_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedidos_generados_updated_at ON pedidos_generados;
CREATE TRIGGER update_pedidos_generados_updated_at
  BEFORE UPDATE ON pedidos_generados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
