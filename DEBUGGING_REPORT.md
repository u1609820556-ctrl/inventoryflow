# Reporte de Debugging - InventoryFlow

## Problemas Encontrados

### 1. Falta de `empresa_id` en tablas productos y proveedores

**Problema:** Las tablas `productos` y `proveedores` no tenían la columna `empresa_id`, que es necesaria para:
- Filtrar datos por empresa (multi-tenant)
- Aplicar correctamente las políticas RLS

**Solución:**
- Actualizado `src/types/index.ts` para incluir `empresa_id` en `Producto` y `Proveedor`
- Los hooks ahora obtienen el `empresa_id` de la tabla `empresa` al inicializarse
- Los hooks incluyen `empresa_id` en todas las operaciones INSERT

### 2. Hooks no enviaban `empresa_id` al crear registros

**Problema:** Los hooks `useProducts.ts` y `useProveedores.ts` no incluían `empresa_id` al crear nuevos registros, causando errores de RLS.

**Archivos modificados:**
- `src/hooks/useProducts.ts`
- `src/hooks/useProveedores.ts`

**Cambios:**
- Añadido estado `empresaId` que se obtiene al montar el hook
- Todas las operaciones CRUD ahora incluyen verificación de `empresa_id`
- Filtrado por `empresa_id` en SELECT, UPDATE y DELETE

### 3. Políticas RLS incorrectas (tautologías)

**Problema:** Las políticas RLS en `supabase-migration-autopedidos.sql` eran tautologías que siempre retornaban verdadero:

```sql
-- INCORRECTO (siempre verdadero):
USING (empresa_id IN (SELECT id FROM empresa WHERE id = empresa_id))
```

**Solución:** Creado `supabase-fix-rls.sql` con dos opciones:
- **Opción A (Desarrollo):** Deshabilitar RLS temporalmente
- **Opción B (Producción):** Políticas RLS correctamente configuradas

### 4. Falta de logging detallado

**Problema:** Los errores eran genéricos y difíciles de diagnosticar.

**Solución:** Añadido logging extensivo con prefijos identificables:
- `[useProducts]` - Hook de productos
- `[useProveedores]` - Hook de proveedores
- `[useReorderRules]` - Hook de reglas
- `[API reorder-rules]` - Endpoint de reglas

### 5. Manejo de errores genérico

**Problema:** Los mensajes de error no eran específicos para ayudar al usuario.

**Solución:** Añadido manejo de errores específico:
- `42501` - Error de permisos RLS
- `23503` - Error de foreign key
- `23505` - Error de duplicado

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/types/index.ts` | Añadido `empresa_id` a `Producto` y `Proveedor` |
| `src/hooks/useProducts.ts` | Completo reescrito con empresa_id, logging y error handling |
| `src/hooks/useProveedores.ts` | Completo reescrito con empresa_id, logging y error handling |
| `src/hooks/useReorderRules.ts` | Añadido logging detallado |
| `src/app/api/reorder-rules/route.ts` | Añadido logging, DELETE endpoint, mejor error handling |

## Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| `supabase-fix-rls.sql` | Script SQL para arreglar estructura de tablas y RLS |

## Instrucciones de Aplicación

### Paso 1: Ejecutar Script SQL

**IMPORTANTE:** Ejecuta el script `supabase-fix-rls.sql` en el SQL Editor de Supabase.

El script:
1. Añade `empresa_id` a `productos` y `proveedores` (si no existe)
2. Migra datos existentes asignando la primera empresa
3. Crea índices para mejor rendimiento
4. **Por defecto deshabilita RLS** (para desarrollo)

### Paso 2: Verificar la ejecución

Después de ejecutar el script, verifica en la consola de Supabase que:
- Las columnas `empresa_id` existen en todas las tablas
- RLS está deshabilitado (para desarrollo)

### Paso 3: Probar la aplicación

1. Inicia la aplicación: `npm run dev`
2. Abre la consola del navegador (F12)
3. Intenta crear un producto/proveedor/regla
4. Verifica los logs en la consola

## Logs a Buscar

### Éxito
```
[useProducts] empresa_id encontrado: xxxxx
[useProducts] Insertando producto: {...}
[useProducts] Producto creado exitosamente: xxxxx
```

### Errores Comunes

**Sin empresa configurada:**
```
[useProducts] No se encontró empresa
```

**Error de RLS:**
```
[useProducts] Error de Supabase al crear: {code: "42501", message: "..."}
```

## Checklist de Validación

- [ ] Ejecutar `supabase-fix-rls.sql` en Supabase
- [ ] Verificar que columnas `empresa_id` existen
- [ ] Crear un producto sin errores
- [ ] Crear un proveedor sin errores
- [ ] Crear una regla de autopedido sin errores
- [ ] Editar un producto sin errores
- [ ] Eliminar un producto sin errores
- [ ] Los logs en consola muestran información útil

## Notas Adicionales

### Para Producción

Si necesitas RLS habilitado para producción:
1. Edita `supabase-fix-rls.sql`
2. Comenta las líneas `DISABLE ROW LEVEL SECURITY`
3. Descomenta la sección de políticas RLS (Opción B)
4. Ejecuta el script

### Estructura de empresa_id

Actualmente el sistema asume una sola empresa. Para multi-tenant:
1. Añadir columna `owner_id` a la tabla `empresa`
2. Relacionar `owner_id` con `auth.uid()`
3. Modificar las políticas RLS para filtrar por `empresa.owner_id = auth.uid()`
