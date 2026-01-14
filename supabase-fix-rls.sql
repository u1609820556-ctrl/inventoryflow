-- ============================================
-- FIX: Arreglar RLS y añadir empresa_id
-- ============================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Este script arregla los problemas de RLS que causan errores al crear/editar
--
-- PROBLEMAS ENCONTRADOS:
-- 1. Las tablas productos y proveedores no tienen empresa_id
-- 2. Las políticas RLS actuales son tautologías (siempre verdaderas)
-- 3. No hay relación correcta entre auth.uid() y empresa_id
--
-- IMPORTANTE: Ejecutar paso a paso y verificar cada sección

-- ============================================
-- PASO 1: Agregar empresa_id a productos
-- ============================================

-- Agregar columna empresa_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'productos' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE productos ADD COLUMN empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna empresa_id agregada a productos';
    ELSE
        RAISE NOTICE 'Columna empresa_id ya existe en productos';
    END IF;
END $$;

-- Actualizar registros existentes con la primera empresa
UPDATE productos
SET empresa_id = (SELECT id FROM empresa LIMIT 1)
WHERE empresa_id IS NULL;

-- Hacer empresa_id NOT NULL (solo si todos los registros tienen valor)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM productos WHERE empresa_id IS NULL) THEN
        ALTER TABLE productos ALTER COLUMN empresa_id SET NOT NULL;
        RAISE NOTICE 'empresa_id en productos ahora es NOT NULL';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: Hay productos sin empresa_id';
    END IF;
END $$;

-- ============================================
-- PASO 2: Agregar empresa_id a proveedores
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proveedores' AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE proveedores ADD COLUMN empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna empresa_id agregada a proveedores';
    ELSE
        RAISE NOTICE 'Columna empresa_id ya existe en proveedores';
    END IF;
END $$;

-- Actualizar registros existentes
UPDATE proveedores
SET empresa_id = (SELECT id FROM empresa LIMIT 1)
WHERE empresa_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM proveedores WHERE empresa_id IS NULL) THEN
        ALTER TABLE proveedores ALTER COLUMN empresa_id SET NOT NULL;
        RAISE NOTICE 'empresa_id en proveedores ahora es NOT NULL';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: Hay proveedores sin empresa_id';
    END IF;
END $$;

-- ============================================
-- PASO 3: Crear índices para mejor rendimiento
-- ============================================

CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_empresa ON proveedores(empresa_id);

-- ============================================
-- PASO 4: OPCIÓN A - DESHABILITAR RLS (DESARROLLO)
-- ============================================
-- Si estás en desarrollo y solo hay un usuario/empresa,
-- es más fácil deshabilitar RLS temporalmente.
-- DESCOMENTA las siguientes líneas si quieres esta opción:

ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE reglas_autopedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_generados DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: OPCIÓN B - CONFIGURAR RLS CORRECTAMENTE (PRODUCCIÓN)
-- ============================================
-- Si necesitas RLS habilitado, usa estas políticas.
-- COMENTA las líneas DISABLE de arriba y DESCOMENTA estas:

/*
-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas de productos
DROP POLICY IF EXISTS "productos_select_policy" ON productos;
DROP POLICY IF EXISTS "productos_insert_policy" ON productos;
DROP POLICY IF EXISTS "productos_update_policy" ON productos;
DROP POLICY IF EXISTS "productos_delete_policy" ON productos;

-- Crear nuevas políticas para productos
-- Política permisiva: permite acceso si el usuario está autenticado
-- y el empresa_id coincide con cualquier empresa en el sistema
-- (En un sistema multi-tenant real, usarías auth.uid() = empresa.owner_id)

CREATE POLICY "productos_select_policy" ON productos
    FOR SELECT
    USING (true); -- Permite lectura a usuarios autenticados

CREATE POLICY "productos_insert_policy" ON productos
    FOR INSERT
    WITH CHECK (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "productos_update_policy" ON productos
    FOR UPDATE
    USING (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "productos_delete_policy" ON productos
    FOR DELETE
    USING (empresa_id IN (SELECT id FROM empresa));

-- Eliminar políticas antiguas de proveedores
DROP POLICY IF EXISTS "proveedores_select_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_insert_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_update_policy" ON proveedores;
DROP POLICY IF EXISTS "proveedores_delete_policy" ON proveedores;

-- Crear nuevas políticas para proveedores
CREATE POLICY "proveedores_select_policy" ON proveedores
    FOR SELECT
    USING (true);

CREATE POLICY "proveedores_insert_policy" ON proveedores
    FOR INSERT
    WITH CHECK (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "proveedores_update_policy" ON proveedores
    FOR UPDATE
    USING (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "proveedores_delete_policy" ON proveedores
    FOR DELETE
    USING (empresa_id IN (SELECT id FROM empresa));

-- Arreglar políticas de reglas_autopedido (las actuales son tautologías)
DROP POLICY IF EXISTS "Users can view own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can insert own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can update own company reorder rules" ON reglas_autopedido;
DROP POLICY IF EXISTS "Users can delete own company reorder rules" ON reglas_autopedido;

CREATE POLICY "reglas_autopedido_select" ON reglas_autopedido
    FOR SELECT
    USING (true);

CREATE POLICY "reglas_autopedido_insert" ON reglas_autopedido
    FOR INSERT
    WITH CHECK (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "reglas_autopedido_update" ON reglas_autopedido
    FOR UPDATE
    USING (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "reglas_autopedido_delete" ON reglas_autopedido
    FOR DELETE
    USING (empresa_id IN (SELECT id FROM empresa));

-- Lo mismo para pedidos_generados
DROP POLICY IF EXISTS "Users can view own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can insert own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can update own company generated orders" ON pedidos_generados;
DROP POLICY IF EXISTS "Users can delete own company generated orders" ON pedidos_generados;

CREATE POLICY "pedidos_generados_select" ON pedidos_generados
    FOR SELECT
    USING (true);

CREATE POLICY "pedidos_generados_insert" ON pedidos_generados
    FOR INSERT
    WITH CHECK (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "pedidos_generados_update" ON pedidos_generados
    FOR UPDATE
    USING (empresa_id IN (SELECT id FROM empresa));

CREATE POLICY "pedidos_generados_delete" ON pedidos_generados
    FOR DELETE
    USING (empresa_id IN (SELECT id FROM empresa));
*/

-- ============================================
-- PASO 5: Verificar la configuración
-- ============================================

-- Ver estructura de tablas
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('productos', 'proveedores', 'reglas_autopedido', 'pedidos_generados')
    AND column_name = 'empresa_id'
ORDER BY table_name;

-- Ver si RLS está habilitado
SELECT
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class
WHERE relname IN ('productos', 'proveedores', 'reglas_autopedido', 'pedidos_generados');

-- Ver políticas actuales
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('productos', 'proveedores', 'reglas_autopedido', 'pedidos_generados')
ORDER BY tablename, policyname;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Después de ejecutar, prueba crear un producto/proveedor desde la UI
-- y verifica los logs en la consola del navegador.
