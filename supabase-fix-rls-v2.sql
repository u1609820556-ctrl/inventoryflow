-- ============================================
-- FIX v2: Eliminar políticas RLS problemáticas
-- ============================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Este script elimina las políticas RLS que están causando problemas

-- ============================================
-- PASO 1: Eliminar TODAS las políticas existentes
-- ============================================

-- Políticas de reglas_autopedido
DROP POLICY IF EXISTS "Users can view own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can insert own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can update own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can delete own company reorder rules" ON reglas_autopedido;

-- Políticas de pedidos_generados
DROP POLICY IF EXISTS "Users can view own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can insert own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can update own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can delete own company generated orders" ON pedidos_generados;

-- Políticas de productos (por si acaso)
DROP POLICY IF EXISTS "productos_select_policy" ON productos;
DROP POLICY IF EXISTS "productos_insert_policy" ON productos;
DROP POLICY IF EXISTS "productos_update_policy" ON productos;
DROP POLICY IF EXISTS "productos_delete_policy" ON productos;

-- Políticas de proveedores (por si acaso)
DROP POLICY IF EXISTS "proveedores_select_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_insert_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_update_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_delete_policy" ON proveedores;

-- ============================================
-- PASO 2: Deshabilitar RLS en TODAS las tablas
-- ============================================

ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE reglas_autopedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_generados DISABLE ROW LEVEL SECURITY;

-- También deshabilitar en otras tablas relacionadas si existen
ALTER TABLE IF EXISTS movimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lineas_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS empresa DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: Verificar que empresa_id existe
-- ============================================

-- Agregar empresa_id a productos si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'productos' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE productos ADD COLUMN empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna empresa_id AGREGADA a productos';
    ELSE
        RAISE NOTICE 'Columna empresa_id ya existe en productos';
    END IF;
END $$;

-- Agregar empresa_id a proveedores si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proveedores' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE proveedores ADD COLUMN empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna empresa_id AGREGADA a proveedores';
    ELSE
        RAISE NOTICE 'Columna empresa_id ya existe en proveedores';
    END IF;
END $$;

-- Actualizar registros existentes con la primera empresa
UPDATE productos
SET empresa_id = (SELECT id FROM empresa LIMIT 1)
WHERE empresa_id IS NULL;

UPDATE proveedores
SET empresa_id = (SELECT id FROM empresa LIMIT 1)
WHERE empresa_id IS NULL;

-- ============================================
-- PASO 4: Crear índices si no existen
-- ============================================

CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON proveedores(empresa_id);

-- ============================================
-- PASO 5: Verificación final
-- ============================================

-- Ver estado de RLS
SELECT
    relname as tabla,
    CASE WHEN relrowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as rls_estado
FROM pg_class
WHERE relname IN ('productos', 'proveedores', 'reglas_autopedido', 'pedidos_generados', 'empresa', 'movimientos');

-- Ver si hay políticas restantes
SELECT
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('productos', 'proveedores', 'reglas_autopedido', 'pedidos_generados')
ORDER BY tablename;

-- Ver estructura de empresa_id
SELECT
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('productos', 'proveedores', 'reglas_autopedido')
    AND column_name = 'empresa_id'
ORDER BY table_name;
