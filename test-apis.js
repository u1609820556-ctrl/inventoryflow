/*
 * Script de prueba para APIs de Autopedidos
 * ==========================================
 *
 * INSTRUCCIONES:
 * 1. Inicia sesión en la app (http://localhost:3000)
 * 2. Navega a /dashboard o /productos para que la página cargue datos
 * 3. Abre la consola del navegador (F12 -> Console)
 * 4. Copia y pega este script completo
 * 5. Presiona Enter para ejecutar
 */

(async function runAPITests() {
  console.log('%c=== PRUEBAS DE APIs DE AUTOPEDIDOS ===', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('');
  console.log('%cNOTA: Este script necesita IDs de producto y proveedor.', 'color: orange');
  console.log('%cSi no tienes datos, primero crea un producto y un proveedor en la app.', 'color: orange');
  console.log('');

  // IDs de prueba - REEMPLAZA ESTOS CON IDS REALES DE TU BD
  // Puedes obtenerlos desde Supabase Dashboard > Table Editor
  let producto = null;
  let proveedor = null;

  // Intentar obtener datos de la página actual si existe window.__NEXT_DATA__
  // o del cliente Supabase si está disponible
  if (window.__supabase) {
    try {
      const { data: prods } = await window.__supabase.from('productos').select('*').limit(1);
      const { data: provs } = await window.__supabase.from('proveedores').select('*').limit(1);
      if (prods?.length) producto = prods[0];
      if (provs?.length) proveedor = provs[0];
    } catch (e) {
      console.log('No se pudo obtener datos via cliente Supabase global');
    }
  }

  // Si no encontramos datos, pedir al usuario que los ingrese
  if (!producto || !proveedor) {
    console.log('%c⚠ No se encontraron datos automáticamente.', 'color: orange; font-weight: bold');
    console.log('');
    console.log('Por favor, ve a Supabase Dashboard y copia los IDs:');
    console.log('https://supabase.com/dashboard/project/mdnzlliwilqmfipqiowk/editor');
    console.log('');
    console.log('Luego ejecuta esto con tus IDs:');
    console.log('');
    console.log(`%crunTestsWithIds('TU_PRODUCTO_ID', 'TU_PROVEEDOR_ID')`, 'color: cyan; font-family: monospace');
    console.log('');

    // Crear función global para ejecutar con IDs manuales
    window.runTestsWithIds = async function(productoId, proveedorId) {
      await executeTests(
        { id: productoId, nombre: 'Producto Test', precio_compra: 10 },
        { id: proveedorId, nombre: 'Proveedor Test', email: 'test@example.com' }
      );
    };
    return;
  }

  console.log('%c✓ Datos encontrados automáticamente', 'color: green');
  await executeTests(producto, proveedor);
})();

// Función que ejecuta las pruebas
async function executeTests(producto, proveedor) {
  console.log('');
  console.log('Producto de prueba:', producto.nombre, '(' + producto.id + ')');
  console.log('Proveedor de prueba:', proveedor.nombre, '(' + proveedor.id + ')');

  // Variables para guardar resultados
  let pedidoCreado = null;
  const results = {
    reorderRules: null,
    generatePdf: null,
    createOrder: null,
    sendEmail: null
  };

  // === PRUEBA 1: POST /api/reorder-rules ===
  console.log('\n%c=== TEST 1: POST /api/reorder-rules ===', 'color: purple; font-weight: bold');
  try {
    const response = await fetch('/api/reorder-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto_id: producto.id,
        proveedor_id: proveedor.id,
        stock_minimo: 10,
        cantidad_pedido: 50
      })
    });
    const data = await response.json();
    results.reorderRules = { status: response.status, data };

    if (response.status === 201 || response.status === 200) {
      console.log('%c✓ ÉXITO', 'color: green; font-weight: bold');
    } else {
      console.log('%c✗ FALLO', 'color: red; font-weight: bold');
    }
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (e) {
    console.error('%c✗ ERROR', 'color: red; font-weight: bold');
    console.error(e);
  }

  // === PRUEBA 2: POST /api/orders/generate-pdf ===
  console.log('\n%c=== TEST 2: POST /api/orders/generate-pdf ===', 'color: purple; font-weight: bold');
  try {
    const response = await fetch('/api/orders/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proveedor_id: proveedor.id,
        lineas: [{
          producto_id: producto.id,
          cantidad: 50,
          precio_unitario: producto.precio_compra || 10
        }],
        notas: 'Nota de prueba'
      })
    });
    const data = await response.json();
    results.generatePdf = { status: response.status, data };

    if (response.status === 200 && data.success) {
      console.log('%c✓ ÉXITO', 'color: green; font-weight: bold');
      console.log('Status:', response.status);
      console.log('Número de pedido:', data.numero_pedido);
      console.log('Total estimado:', data.total_estimado);
      console.log('PDF generado:', data.pdf_base64 ? 'Sí (' + data.pdf_base64.length + ' chars)' : 'No');
      console.log('HTML generado:', data.html_content ? 'Sí' : 'No');
    } else {
      console.log('%c✗ FALLO', 'color: red; font-weight: bold');
      console.log('Status:', response.status);
      console.log('Response:', data);
    }
  } catch (e) {
    console.error('%c✗ ERROR', 'color: red; font-weight: bold');
    console.error(e);
  }

  // === PRUEBA 3: POST /api/orders/create ===
  console.log('\n%c=== TEST 3: POST /api/orders/create ===', 'color: purple; font-weight: bold');
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proveedor_id: proveedor.id,
        lineas: [{
          producto_id: producto.id,
          cantidad: 50,
          precio_unitario: producto.precio_compra || 10
        }],
        pdf_url: null,
        notas: 'Pedido de prueba desde script'
      })
    });
    const data = await response.json();
    results.createOrder = { status: response.status, data };

    if (response.status === 201) {
      console.log('%c✓ ÉXITO', 'color: green; font-weight: bold');
      pedidoCreado = data.pedido_id;
      console.log('Status:', response.status);
      console.log('Pedido ID:', data.pedido_id);
      console.log('Estado:', data.estado);
      console.log('Total estimado:', data.total_estimado);
    } else {
      console.log('%c✗ FALLO', 'color: red; font-weight: bold');
      console.log('Status:', response.status);
      console.log('Response:', data);
    }
  } catch (e) {
    console.error('%c✗ ERROR', 'color: red; font-weight: bold');
    console.error(e);
  }

  // === PRUEBA 4: POST /api/orders/:id/send-email ===
  if (pedidoCreado) {
    console.log('\n%c=== TEST 4: POST /api/orders/' + pedidoCreado + '/send-email ===', 'color: purple; font-weight: bold');
    try {
      const response = await fetch(`/api/orders/${pedidoCreado}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_proveedor: proveedor.email || 'test@example.com'
        })
      });
      const data = await response.json();
      results.sendEmail = { status: response.status, data };

      if (response.status === 200) {
        console.log('%c✓ ÉXITO', 'color: green; font-weight: bold');
        console.log('Status:', response.status);
        console.log('Email enviado a:', data.email_sent_to);
        console.log('Estado:', data.estado);
      } else {
        console.log('%c✗ FALLO (esperado si RESEND_API_KEY no está configurado)', 'color: orange; font-weight: bold');
        console.log('Status:', response.status);
        console.log('Response:', data);
      }
    } catch (e) {
      console.error('%c✗ ERROR', 'color: red; font-weight: bold');
      console.error(e);
    }
  } else {
    console.log('\n%c=== TEST 4: OMITIDO (no se creó pedido) ===', 'color: orange; font-weight: bold');
  }

  // Resumen
  console.log('\n%c=== RESUMEN DE PRUEBAS ===', 'color: blue; font-size: 14px; font-weight: bold');
  console.table({
    'POST /api/reorder-rules': results.reorderRules?.status === 201 || results.reorderRules?.status === 200 ? '✓ OK' : '✗ FALLO',
    'POST /api/orders/generate-pdf': results.generatePdf?.status === 200 ? '✓ OK' : '✗ FALLO',
    'POST /api/orders/create': results.createOrder?.status === 201 ? '✓ OK' : '✗ FALLO',
    'POST /api/orders/:id/send-email': results.sendEmail?.status === 200 ? '✓ OK' : (results.sendEmail ? '⚠ Sin Resend' : 'N/A')
  });

  console.log('\n%cResultados completos disponibles en window.apiTestResults', 'color: gray');
  window.apiTestResults = results;
}
