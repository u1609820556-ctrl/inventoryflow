/**
 * Next.js Instrumentation
 * Este archivo se ejecuta una vez cuando el servidor arranca
 * Ideal para inicializar CRON jobs y otras tareas de servidor
 */

export async function register() {
  // Solo ejecutar en el runtime de Node.js (servidor)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Inicializando servidor...');

    // Importar dinamicamente para evitar problemas en el cliente
    const { initializeJobs } = await import('@/jobs/generateOrders');

    // Inicializar CRON jobs
    initializeJobs();

    console.log('[Instrumentation] Servidor inicializado');
  }
}
