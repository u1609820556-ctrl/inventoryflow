-- ============================================
-- MIGRATION: Sistema de Auto-pedidos
-- ============================================
-- Este script debe ejecutarse en el SQL Editor de Supabase
-- Ejecutar en orden de arriba a abajo

-- ============================================
-- 1. MODIFICAR TABLA reglas_autopedido
-- ============================================
-- Agregar empresa_id si no existe (necesario para RLS)

-- Primero verificar si la columna existe, si no, agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reglas_autopedido' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE reglas_autopedido ADD COLUMN empresa_id UUID REFERENCES empresa(id);
    END IF;
END $$;

-- Actualizar registros existentes con el empresa_id (asumiendo una sola empresa por ahora)
UPDATE reglas_autopedido
SET empresa_id = (SELECT id FROM empresa LIMIT 1)
WHERE empresa_id IS NULL;

-- Hacer empresa_id NOT NULL después de la migración de datos
ALTER TABLE reglas_autopedido ALTER COLUMN empresa_id SET NOT NULL;

-- ============================================
-- 2. CREAR TABLA pedidos_generados
-- ============================================

-- Crear el tipo ENUM para estados si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pedido_generado') THEN
        CREATE TYPE estado_pedido_generado AS ENUM ('pending_review', 'sent', 'completed', 'cancelled');
    END IF;
END $$;

-- Crear tabla pedidos_generados
CREATE TABLE IF NOT EXISTS pedidos_generados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
    proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    estado estado_pedido_generado NOT NULL DEFAULT 'pending_review',
    datos_pedido JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- datos_pedido estructura: [{ "producto_id": "uuid", "cantidad": 10, "precio_unitario": 5.50, "nombre_producto": "...", "codigo": "..." }]
    total_estimado DECIMAL(12, 2) NOT NULL DEFAULT 0,
    pdf_url TEXT,
    email_template_used TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_empresa ON pedidos_generados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_proveedor ON pedidos_generados(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_estado ON pedidos_generados(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_generados_created ON pedidos_generados(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pedidos_generados_updated_at ON pedidos_generados;
CREATE TRIGGER update_pedidos_generados_updated_at
    BEFORE UPDATE ON pedidos_generados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. CONFIGURAR RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en reglas_autopedido
ALTER TABLE reglas_autopedido ENABLE ROW LEVEL SECURITY;

-- Política para reglas_autopedido: usuarios solo ven sus propias reglas
DROP POLICY IF EXISTS "Users can view own company reorder rules" ON reglas_autopedido;
CREATE POLICY "Users can view own company reorder rules" ON reglas_autopedido
    FOR SELECT USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can insert own company reorder rules" ON reglas_autopedido;
CREATE POLICY "Users can insert own company reorder rules" ON reglas_autopedido
    FOR INSERT WITH CHECK (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can update own company reorder rules" ON reglas_autopedido;
CREATE POLICY "Users can update own company reorder rules" ON reglas_autopedido
    FOR UPDATE USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can delete own company reorder rules" ON reglas_autopedido;
CREATE POLICY "Users can delete own company reorder rules" ON reglas_autopedido
    FOR DELETE USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

-- Habilitar RLS en pedidos_generados
ALTER TABLE pedidos_generados ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos_generados
DROP POLICY IF EXISTS "Users can view own company generated orders" ON pedidos_generados;
CREATE POLICY "Users can view own company generated orders" ON pedidos_generados
    FOR SELECT USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can insert own company generated orders" ON pedidos_generados;
CREATE POLICY "Users can insert own company generated orders" ON pedidos_generados
    FOR INSERT WITH CHECK (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can update own company generated orders" ON pedidos_generados;
CREATE POLICY "Users can update own company generated orders" ON pedidos_generados
    FOR UPDATE USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

DROP POLICY IF EXISTS "Users can delete own company generated orders" ON pedidos_generados;
CREATE POLICY "Users can delete own company generated orders" ON pedidos_generados
    FOR DELETE USING (empresa_id IN (
        SELECT id FROM empresa WHERE id = empresa_id
    ));

-- ============================================
-- 4. AGREGAR ÍNDICES ADICIONALES A reglas_autopedido
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reglas_autopedido_empresa ON reglas_autopedido(empresa_id);
CREATE INDEX IF NOT EXISTS idx_reglas_autopedido_producto ON reglas_autopedido(producto_id);
CREATE INDEX IF NOT EXISTS idx_reglas_autopedido_proveedor ON reglas_autopedido(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_reglas_autopedido_habilitado ON reglas_autopedido(habilitado);

-- Trigger para updated_at en reglas_autopedido (si no existe)
DROP TRIGGER IF EXISTS update_reglas_autopedido_updated_at ON reglas_autopedido;
CREATE TRIGGER update_reglas_autopedido_updated_at
    BEFORE UPDATE ON reglas_autopedido
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
