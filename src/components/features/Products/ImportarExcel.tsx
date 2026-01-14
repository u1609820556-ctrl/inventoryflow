'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useImportarExcel, type DatosProductoImportar } from '@/hooks/useImportarExcel';
import { showSuccess, showError, showWarning } from '@/components/ui/Toast';

interface ImportarExcelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

type Step = 1 | 2 | 3;

export default function ImportarExcel({ isOpen, onClose, onImportSuccess }: ImportarExcelProps) {
  const {
    loading,
    error,
    preview,
    progreso,
    tipoDetectado,
    columnasDetectadas,
    parsearArchivo,
    validarDatos,
    importar,
    generarPreview,
    reset,
  } = useImportarExcel();

  const [step, setStep] = useState<Step>(1);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [datosParseados, setDatosParseados] = useState<unknown[]>([]);
  const [validacion, setValidacion] = useState<{ valido: boolean; errores: string[]; columnasEncontradas: string[]; totalRegistros: number } | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<{ exito: number; errores: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setArchivo(null);
      setDatosParseados([]);
      setValidacion(null);
      setResultado(null);
      reset();
    }
  }, [isOpen, reset]);

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setArchivo(file);
      const { datos, tipo } = await parsearArchivo(file);

      if (tipo !== 'productos') {
        showWarning('Este archivo parece ser de PROVEEDORES. Use el importador de proveedores.');
        setArchivo(null);
        return;
      }

      setDatosParseados(datos);
      const result = validarDatos(datos, 'productos');
      setValidacion(result);
      generarPreview(datos, 'productos', 5);
      setStep(2);
    } catch (err) {
      console.error('Error al parsear archivo:', err);
    }
  }, [parsearArchivo, validarDatos, generarPreview]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  // Importar datos
  const handleImportar = useCallback(async () => {
    if (!datosParseados.length) return;

    setImportando(true);
    try {
      const res = await importar(datosParseados, 'productos');
      setResultado({ exito: res.exito, errores: res.errores });
      setStep(3);

      if (res.exito > 0) {
        showSuccess(`Se importaron ${res.exito} productos correctamente`);
        onImportSuccess();
      } else {
        showError('No se pudieron importar los productos');
      }
    } catch (err) {
      console.error('Error al importar:', err);
      const message = err instanceof Error ? err.message : 'Error al importar productos';
      showError(message);
    } finally {
      setImportando(false);
    }
  }, [datosParseados, importar, onImportSuccess]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading && !importando) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, importando, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && !importando && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-[#E2E2D5]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E2D5]">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-[#064E3B]" />
            <h2 className="font-serif text-xl md:text-2xl font-bold text-[#064E3B]">
              Importar Productos (Excel/CSV)
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading || importando}
            className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#E2E2D5]">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? 'bg-[#064E3B] text-white'
                      : 'bg-[#E2E2D5] text-[#9CA3AF]'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      step > s ? 'bg-[#064E3B]' : 'bg-[#E2E2D5]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-[#6B7280]">
            <span>Seleccionar</span>
            <span>Validar</span>
            <span>Resultado</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Seleccionar Archivo */}
          {step === 1 && (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-[#064E3B] bg-[#064E3B]/5'
                  : 'border-[#E2E2D5] hover:border-[#9CA3AF]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleInputChange}
                className="hidden"
              />

              <Upload className="w-12 h-12 mx-auto text-[#9CA3AF] mb-4" />
              <p className="text-lg font-medium text-[#374151] mb-2">
                Arrastra y suelta tu archivo aquí
              </p>
              <p className="text-sm text-[#6B7280] mb-4">
                o haz clic para seleccionar
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="px-6 py-2.5 bg-[#064E3B] text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                Seleccionar archivo
              </button>
              <p className="text-xs text-[#9CA3AF] mt-4">
                Formatos soportados: .xlsx, .xls, .csv
              </p>
            </div>
          )}

          {/* Step 2: Validar Datos */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Info del archivo */}
              <div className="bg-[#F9FAFB] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#064E3B]" />
                  <span className="font-medium text-[#374151]">{archivo?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#064E3B] text-white text-xs font-bold rounded">
                    PRODUCTOS
                  </span>
                  <span className="text-sm text-[#6B7280]">
                    {validacion?.totalRegistros || 0} registros detectados
                  </span>
                </div>
              </div>

              {/* Columnas encontradas */}
              <div>
                <h4 className="text-sm font-medium text-[#374151] mb-2">Columnas encontradas:</h4>
                <div className="flex flex-wrap gap-2">
                  {['nombre', 'descripcion', 'codigo_barras', 'stock', 'precio_unitario'].map((col) => (
                    <span
                      key={col}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        validacion?.columnasEncontradas.includes(col)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-[#E2E2D5] text-[#9CA3AF]'
                      }`}
                    >
                      {validacion?.columnasEncontradas.includes(col) ? '✓' : '✗'} {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Errores de validación */}
              {validacion && !validacion.valido && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-700">Errores encontrados:</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                    {validacion.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[#374151] mb-2">
                    Vista previa (primeros {preview.length} registros):
                  </h4>
                  <div className="overflow-x-auto border border-[#E2E2D5] rounded-xl">
                    <table className="min-w-full divide-y divide-[#E2E2D5]">
                      <thead className="bg-[#F9FAFB]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Precio</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase">Código</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#E2E2D5]">
                        {(preview as DatosProductoImportar[]).map((item, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm text-[#374151]">{item.nombre || '-'}</td>
                            <td className="px-4 py-3 text-sm text-[#374151]">{item.stock ?? 0}</td>
                            <td className="px-4 py-3 text-sm text-[#374151]">${(item.precio_unitario ?? 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-[#374151]">{item.codigo_barras || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Resultado */}
          {step === 3 && resultado && (
            <div className="text-center py-8">
              {resultado.exito > 0 ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-[#374151] mb-2">
                    ¡Importación completada!
                  </h3>
                  <p className="text-lg text-[#6B7280]">
                    Se importaron <span className="font-bold text-[#064E3B]">{resultado.exito}</span> productos exitosamente
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-2xl font-bold text-[#374151] mb-2">
                    No se importaron productos
                  </h3>
                </>
              )}

              {resultado.errores.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-left max-w-md mx-auto">
                  <p className="font-medium text-red-700 mb-2">Errores ({resultado.errores.length}):</p>
                  <ul className="list-disc list-inside text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                    {resultado.errores.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Loading/Progress */}
          {(loading || importando) && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-[#064E3B] animate-spin mb-4" />
              <p className="text-[#6B7280]">
                {importando ? 'Importando productos...' : 'Procesando archivo...'}
              </p>
              {progreso > 0 && (
                <div className="w-48 h-2 bg-[#E2E2D5] rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-[#064E3B] transition-all duration-300"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#E2E2D5] bg-[#F9FAFB]">
          <button
            onClick={() => {
              if (step === 1) onClose();
              else if (step === 2) setStep(1);
              else if (step === 3) onClose();
            }}
            disabled={loading || importando}
            className="px-4 py-2 text-[#6B7280] font-medium hover:text-[#374151] transition-all disabled:opacity-50"
          >
            {step === 3 ? 'Cerrar' : step === 1 ? 'Cancelar' : (
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Atrás
              </span>
            )}
          </button>

          {step === 2 && (
            <button
              onClick={handleImportar}
              disabled={loading || importando || !validacion?.valido}
              className="px-6 py-2.5 bg-[#064E3B] text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
