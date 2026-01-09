'use client';

export default function SetupInstructions() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a InventoryFlow!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Para comenzar, necesitas configurar tu proyecto de Supabase. Sigue estos pasos:
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paso 1: Crear Proyecto en Supabase
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                Ve a{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  supabase.com
                </a>{' '}
                y crea una cuenta
              </li>
              <li>Haz clic en "New Project"</li>
              <li>Completa el formulario y espera a que el proyecto se inicialice</li>
            </ol>
          </div>

          <div className="border-l-4 border-green-600 pl-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paso 2: Obtener Credenciales
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>En tu proyecto de Supabase, ve a Settings → API</li>
              <li>Copia el "Project URL"</li>
              <li>Copia el "anon public" key</li>
            </ol>
          </div>

          <div className="border-l-4 border-purple-600 pl-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paso 3: Configurar Variables de Entorno
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                Abre el archivo <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> en
                la raíz del proyecto
              </li>
              <li>Reemplaza los valores placeholder con tus credenciales reales:</li>
            </ol>
            <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui`}
            </pre>
          </div>

          <div className="border-l-4 border-orange-600 pl-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paso 4: Crear Tablas en la Base de Datos
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>En Supabase, ve a SQL Editor</li>
              <li>
                Abre el archivo <code className="bg-gray-100 px-2 py-1 rounded">SETUP.md</code> en tu
                editor
              </li>
              <li>Copia el script SQL completo</li>
              <li>Pégalo en el SQL Editor de Supabase y ejecútalo</li>
            </ol>
          </div>

          <div className="border-l-4 border-red-600 pl-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paso 5: Reiniciar el Servidor
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Detén el servidor de desarrollo (Ctrl+C)</li>
              <li>
                Ejecuta nuevamente:{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
              </li>
              <li>Recarga esta página</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Para más detalles, consulta el archivo{' '}
            <code className="bg-blue-100 px-1 py-0.5 rounded">SETUP.md</code> en la raíz del
            proyecto.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
}
