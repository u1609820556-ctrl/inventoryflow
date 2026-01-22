/**
 * CRON Job para generar pedidos automaticos
 * Se ejecuta diariamente a las 3:00 AM
 */

import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { generarPDFPedido } from '@/lib/pdf-generator';
import type { Empresa, Proveedor, ReglaAutopedido, LineaPedidoGenerado } from '@/types';

// Flag para evitar inicializaciones multiples
let isInitialized = false;

// Cliente Supabase con Service Role Key (para operaciones sin sesion)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[CRON] Faltan variables de entorno SUPABASE');
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Interface extendida para reglas con productos
 */
interface ReglaConProducto extends ReglaAutopedido {
  productos: {
    id: string;
    nombre: string;
    stock: number;
    precio_unitario: number;
  };
  proveedores: Proveedor;
  empresa: Empresa;
}

/**
 * Resultado de la generacion de pedidos
 */
export interface GenerarPedidosResult {
  pedidosGenerados: number;
  totalReglas: number;
  errores: number;
  mensaje: string;
  detalles?: string[];
}

/**
 * Funcion principal que genera pedidos automaticos
 * Revisa todas las reglas activas y genera pedidos cuando el stock esta bajo
 */
export async function generarPedidosAutomaticos(): Promise<GenerarPedidosResult> {
  console.log('[CRON] Iniciando generacion de pedidos automaticos...');
  console.log('[CRON] Timestamp:', new Date().toISOString());

  const supabase = getServiceClient();
  if (!supabase) {
    throw new Error('No se pudo crear cliente Supabase (faltan credenciales)');
  }

  let pedidosGenerados = 0;
  const erroresEnProceso: string[] = [];

  try {
    // ====== PASO 1: Obtener todas las reglas activas con sus relaciones ======
    const { data: reglas, error: reglasError } = await supabase
      .from('reglas_autopedido')
      .select(`
        *,
        productos (
          id,
          nombre,
          stock,
          precio_unitario
        ),
        proveedores (
          id,
          nombre,
          email,
          telefono,
          direccion
        )
      `)
      .eq('activa', true);

    if (reglasError) {
      console.error('[CRON] Error obteniendo reglas:', reglasError);
      throw new Error(`Error al obtener reglas: ${reglasError.message}`);
    }

    if (!reglas || reglas.length === 0) {
      console.log('[CRON] No hay reglas activas configuradas');
      return {
        pedidosGenerados: 0,
        totalReglas: 0,
        errores: 0,
        mensaje: 'No hay reglas de autopedido activas',
      };
    }

    console.log(`[CRON] Encontradas ${reglas.length} reglas activas`);

    // ====== PASO 2: Obtener empresa (asumimos una sola por ahora) ======
    const { data: empresa, error: empresaError } = await supabase
      .from('empresa')
      .select('*')
      .limit(1)
      .single();

    if (empresaError || !empresa) {
      console.error('[CRON] Error obteniendo empresa:', empresaError);
      throw new Error('No se encontro la empresa configurada');
    }

    // ====== PASO 3: Procesar cada regla ======
    // Agrupar reglas por proveedor para optimizar pedidos
    const reglasPorProveedor = new Map<string, ReglaConProducto[]>();

    for (const regla of reglas as ReglaConProducto[]) {
      // Verificar que la regla tiene producto y proveedor
      if (!regla.productos || !regla.proveedores) {
        console.warn(`[CRON] Regla ${regla.id} sin producto/proveedor asociado`);
        continue;
      }

      // Verificar si el stock esta bajo el minimo
      const stockActual = regla.productos.stock || 0;
      const stockMinimo = regla.stock_minimo;

      if (stockActual < stockMinimo) {
        console.log(`[CRON] Stock bajo detectado: ${regla.productos.nombre} (${stockActual} < ${stockMinimo})`);

        const proveedorId = regla.proveedor_id;
        if (!reglasPorProveedor.has(proveedorId)) {
          reglasPorProveedor.set(proveedorId, []);
        }
        reglasPorProveedor.get(proveedorId)!.push({
          ...regla,
          empresa: empresa as Empresa,
        });
      }
    }

    // ====== PASO 4: Generar pedidos agrupados por proveedor ======
    for (const [proveedorId, reglasProveedor] of reglasPorProveedor) {
      try {
        const proveedor = reglasProveedor[0].proveedores;
        const empresaData = reglasProveedor[0].empresa;

        // Crear lineas del pedido
        const lineasPedido: LineaPedidoGenerado[] = reglasProveedor.map((regla) => ({
          producto_id: regla.producto_id,
          cantidad: regla.cantidad_pedido,
          precio_unitario: regla.productos.precio_unitario,
          nombre_producto: regla.productos.nombre,
        }));

        // Calcular total
        const totalEstimado = lineasPedido.reduce(
          (acc, linea) => acc + linea.cantidad * linea.precio_unitario,
          0
        );

        // Insertar pedido en BD
        const { data: nuevoPedido, error: insertError } = await supabase
          .from('pedidos_generados')
          .insert({
            empresa_id: empresaData.id,
            proveedor_id: proveedorId,
            estado: 'pending_review',
            datos_pedido: lineasPedido,
            total_estimado: totalEstimado,
            notas: `Pedido generado automaticamente - ${reglasProveedor.length} producto(s) con stock bajo`,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`[CRON] Error insertando pedido para proveedor ${proveedorId}:`, insertError);
          erroresEnProceso.push(`Error creando pedido para ${proveedor.nombre}: ${insertError.message}`);
          continue;
        }

        // Generar PDF del pedido (opcional, se almacena como referencia)
        try {
          const pdfBuffer = await generarPDFPedido(
            {
              id: nuevoPedido.id,
              datos_pedido: lineasPedido,
              total_estimado: totalEstimado,
              notas: nuevoPedido.notas,
            },
            empresaData,
            proveedor
          );

          // Guardar PDF en Supabase Storage (opcional)
          const pdfPath = `pedidos/${nuevoPedido.id}.pdf`;
          const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(pdfPath, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            });

          if (uploadError) {
            console.warn(`[CRON] No se pudo guardar PDF: ${uploadError.message}`);
          } else {
            // Actualizar pedido con URL del PDF
            const { data: { publicUrl } } = supabase.storage
              .from('documentos')
              .getPublicUrl(pdfPath);

            await supabase
              .from('pedidos_generados')
              .update({ pdf_url: publicUrl })
              .eq('id', nuevoPedido.id);
          }
        } catch (pdfError) {
          console.warn('[CRON] Error generando PDF (no critico):', pdfError);
        }

        console.log(`[CRON] Pedido generado para ${proveedor.nombre}: ${nuevoPedido.id}`);
        console.log(`[CRON] El cliente puede enviar manualmente desde la app`);

        pedidosGenerados++;
      } catch (err: unknown) {
        const errorMsg = `Error procesando proveedor ${proveedorId}: ${err instanceof Error ? err.message : 'Error desconocido'}`;
        console.error(`[CRON] ${errorMsg}`);
        erroresEnProceso.push(errorMsg);
      }
    }

    // ====== PASO 5: Retornar resumen ======
    const resumen: GenerarPedidosResult = {
      pedidosGenerados,
      totalReglas: reglas.length,
      errores: erroresEnProceso.length,
      mensaje: `Se generaron ${pedidosGenerados} pedidos (de ${reglas.length} reglas activas)`,
      detalles: erroresEnProceso.length > 0 ? erroresEnProceso : undefined,
    };

    console.log('[CRON] Resumen:', resumen);
    return resumen;

  } catch (err: unknown) {
    console.error('[CRON] Error fatal en generarPedidosAutomaticos:', err);
    throw err;
  }
}

/**
 * Inicializa el CRON job
 * Se ejecuta todos los dias a las 3:00 AM (hora del servidor)
 */
export function initializeJobs(): void {
  // Evitar multiples inicializaciones
  if (isInitialized) {
    console.log('[CRON] Jobs ya inicializados, saltando...');
    return;
  }

  // Solo inicializar en servidor (no en cliente)
  if (typeof window !== 'undefined') {
    console.log('[CRON] Saltando inicializacion en cliente');
    return;
  }

  // Verificar que tenemos las credenciales necesarias
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[CRON] SUPABASE_SERVICE_ROLE_KEY no configurada - CRON deshabilitado');
    return;
  }

  try {
    // Programar ejecucion a las 3:00 AM todos los dias
    // Formato: minuto hora dia-del-mes mes dia-de-semana
    cron.schedule('0 3 * * *', async () => {
      console.log('[CRON] ============================================');
      console.log('[CRON] Ejecutando tarea programada: Generar Pedidos');
      console.log('[CRON] ============================================');

      try {
        const resultado = await generarPedidosAutomaticos();
        console.log('[CRON] Tarea completada:', resultado.mensaje);
      } catch (error) {
        console.error('[CRON] Error en tarea programada:', error);
      }
    }, {
      timezone: 'Europe/Madrid', // Ajustar segun ubicacion
    });

    isInitialized = true;
    console.log('[CRON] Jobs inicializados correctamente');
    console.log('[CRON] Proxima ejecucion: 3:00 AM (Europe/Madrid)');

  } catch (error) {
    console.error('[CRON] Error inicializando jobs:', error);
  }
}

/**
 * Detiene todos los CRON jobs
 */
export function stopJobs(): void {
  // node-cron no tiene un metodo global para detener todos los jobs
  // pero podemos resetear el flag
  isInitialized = false;
  console.log('[CRON] Jobs marcados para reinicio');
}
