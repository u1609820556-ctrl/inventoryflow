-- =====================================================
-- FIX: Autenticación y tabla empresa
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Habilitar RLS en empresa
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas RLS para empresa
-- Los usuarios autenticados pueden ver su propia empresa (donde id = auth.uid())
DROP POLICY IF EXISTS "usuarios_ven_su_empresa" ON empresa;
CREATE POLICY "usuarios_ven_su_empresa"
  ON empresa FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Los usuarios autenticados pueden crear su empresa con su propio id
DROP POLICY IF EXISTS "usuarios_crean_su_empresa" ON empresa;
CREATE POLICY "usuarios_crean_su_empresa"
  ON empresa FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Los usuarios autenticados pueden actualizar su empresa
DROP POLICY IF EXISTS "usuarios_editan_su_empresa" ON empresa;
CREATE POLICY "usuarios_editan_su_empresa"
  ON empresa FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Función para crear empresa automáticamente al registrar usuario
-- Esta función se ejecuta con permisos de superuser (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.empresa (id, nombre_empresa, email, telefono, direccion)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_empresa', 'Mi Empresa'),
    NEW.email,
    '',
    ''
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si falla por cualquier razón, no bloquear el registro
  RAISE WARNING 'Error creando empresa para usuario %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Eliminar trigger existente si hay uno
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Crear trigger para auto-crear empresa
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Actualizar trigger de updated_at para empresa
DROP TRIGGER IF EXISTS update_empresa_updated_at ON empresa;
CREATE TRIGGER update_empresa_updated_at
  BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- IMPORTANTE: También verificar en Supabase Dashboard:
-- Authentication > Providers > Email > Confirm email
-- Desactivar si no tienes SMTP configurado
-- =====================================================
