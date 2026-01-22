/**
 * API Endpoint para ejecutar manualmente la generacion de pedidos
 * Util para testing y para integracion con servicios externos como Vercel Cron
 *
 * POST /api/cron/generate-orders
 * Headers:
 *   - Authorization: Bearer <CRON_SECRET> (opcional, para seguridad)
 *
 * En produccion con Vercel, puedes configurar un Cron Job en vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/generate-orders",
 *       "schedule": "0 3 * * *"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generarPedidosAutomaticos, type GenerarPedidosResult } from '@/jobs/generateOrders';

// Secreto para proteger el endpoint (opcional pero recomendado)
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verificar autorizacion si hay secreto configurado
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (token !== CRON_SECRET) {
        console.log('[API/CRON] Intento no autorizado');
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
    }

    console.log('[API/CRON] Iniciando generacion manual de pedidos...');

    const resultado: GenerarPedidosResult = await generarPedidosAutomaticos();

    console.log('[API/CRON] Completado:', resultado.mensaje);

    return NextResponse.json({
      success: true,
      ...resultado,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API/CRON] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Tambien permitir GET para Vercel Cron (que usa GET por defecto)
export async function GET(request: NextRequest) {
  // Vercel Cron envia un header especial
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  // Solo permitir si es Vercel Cron o tiene autorizacion
  if (!isVercelCron && CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== CRON_SECRET) {
      console.log('[API/CRON] Intento no autorizado via GET');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
  }

  console.log('[API/CRON] Iniciando generacion (trigger GET)...');

  try {
    const resultado: GenerarPedidosResult = await generarPedidosAutomaticos();

    return NextResponse.json({
      success: true,
      ...resultado,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API/CRON] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
