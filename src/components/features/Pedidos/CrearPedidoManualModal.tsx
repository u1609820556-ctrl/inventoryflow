'use client';

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  Package,
  User,
} from 'lucide-react';
import { useCrearPedidoManual } from '@/hooks/useCrearPedidoManual';
import { useProducts } from '@/hooks/useProducts';
import { useProveedores } from '@/hooks/useProveedores';
import type { Producto, Proveedor } from '@/types';
import { showSuccess, showError } from '@/components/ui/Toast';

interface CrearPedidoManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CrearPedidoManualModal({
  isOpen,
  onClose,
  onSuccess,
}: CrearPedidoManualModalProps) {
  const {
    proveedorSeleccionado,
    items,
    loading,
    error,
    notas,
    total,
    esValido,
    seleccionarProveedor,
    agregarProducto,
    eliminarProducto,
    cambiarCantidad,
    cambiarPrecio,
    setNotas,
    crearPedidoYDescargar,
    reset,
  } = useCrearPedidoManual();

  const { products, loading: loadingProducts } = useProducts();
  const { proveedores, loading: loadingProveedores } = useProveedores();

  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaProveedor, setBusquedaProveedor] = useState('');
  const [showProveedorDropdown, setShowProveedorDropdown] = useState(false);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);
  const [enviarEmail, setEnviarEmail] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState<{ id: string; total: number } | null>(null);

  // Filtrar proveedores
  const proveedoresFiltrados = useMemo(() => {
    if (!busquedaProveedor.trim()) return proveedores;
    const query = busquedaProveedor.toLowerCase();
    return proveedores.filter(
      p => p.nombre.toLowerCase().includes(query) || p.email?.toLowerCase().includes(query)
    );
  }, [proveedores, busquedaProveedor]);

  // Filtrar productos (excluir los ya agregados)
  const productosFiltrados = useMemo(() => {
    const idsAgregados = new Set(items.map(item => item.producto_id));
    let filtered = products.filter(p => !idsAgregados.has(p.id));

    if (busquedaProducto.trim()) {
      const query = busquedaProducto.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.nombre.toLowerCase().includes(query) ||
          p.codigo_barras?.toLowerCase().includes(query)
      );
    }

    return filtered.slice(0, 10);
  }, [products, items, busquedaProducto]);

  const handleSelectProveedor = (proveedor: Proveedor) => {
    seleccionarProveedor(proveedor);
    setBusquedaProveedor('');
    setShowProveedorDropdown(false);
  };

  const handleSelectProducto = (producto: Producto) => {
    agregarProducto(producto, 1);
    setBusquedaProducto('');
    setShowProductoDropdown(false);
  };

  const handleCrearPedido = async () => {
    try {
      const resultado = await crearPedidoYDescargar();
      setPedidoCreado({ id: resultado.pedido_id, total: resultado.total_estimado });
      showSuccess(`Pedido creado correctamente. Total: ${resultado.total_estimado.toFixed(2)}€`);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear pedido:', err);
      const message = err instanceof Error ? err.message : 'Error al crear el pedido';
      showError(message);
    }
  };

  const handleNuevoPedido = () => {
    reset();
    setPedidoCreado(null);
  };

  const handleClose = () => {
    reset();
    setPedidoCreado(null);
    onClose();
  };

  if (!isOpen) return null;

  // Si el pedido fue creado, mostrar mensaje de exito
  if (pedidoCreado) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="text-center py-12 px-6">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-2">
                Pedido creado exitosamente
              </h2>
              <p className="text-[#6B7280] mb-2">
                Total del pedido: <span className="font-bold text-[#064E3B]">{pedidoCreado.total.toFixed(2)}€</span>
              </p>
              <p className="text-sm text-[#9CA3AF] mb-6">
                El PDF se ha descargado automaticamente
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleNuevoPedido}
                  className="px-6 py-2.5 bg-[#064E3B] text-white font-medium rounded-lg hover:opacity-90 transition-all"
                >
                  Crear otro pedido
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 border border-[#E2E2D5] text-[#374151] font-medium rounded-lg hover:bg-[#F9FAFB] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#064E3B] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-[#F5F2ED]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                  Crear Pedido Manual
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Crea un pedido personalizado para tu proveedor
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Error global */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Paso 1: Seleccionar Proveedor */}
            <div className="bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-[#064E3B] text-white rounded-full flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-medium text-[#374151]">
                  Seleccionar Proveedor
                </h3>
              </div>

              {proveedorSeleccionado ? (
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#064E3B] text-white rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#374151]">{proveedorSeleccionado.nombre}</p>
                      <p className="text-sm text-[#6B7280]">{proveedorSeleccionado.email || 'Sin email'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => seleccionarProveedor(null)}
                    className="text-sm text-[#6B7280] hover:text-[#991B1B] transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Buscar proveedor por nombre o email..."
                      value={busquedaProveedor}
                      onChange={(e) => {
                        setBusquedaProveedor(e.target.value);
                        setShowProveedorDropdown(true);
                      }}
                      onFocus={() => setShowProveedorDropdown(true)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E2E2D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B]"
                    />
                  </div>

                  {showProveedorDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E2D5] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {loadingProveedores ? (
                        <div className="p-4 text-center text-[#6B7280]">Cargando...</div>
                      ) : proveedoresFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-[#6B7280]">
                          {busquedaProveedor ? 'No se encontraron proveedores' : 'No hay proveedores disponibles'}
                        </div>
                      ) : (
                        proveedoresFiltrados.map((proveedor) => (
                          <button
                            key={proveedor.id}
                            onClick={() => handleSelectProveedor(proveedor)}
                            className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] transition-colors border-b border-[#E2E2D5] last:border-b-0"
                          >
                            <p className="font-medium text-[#374151]">{proveedor.nombre}</p>
                            <p className="text-sm text-[#6B7280]">{proveedor.email || 'Sin email'}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Paso 2: Agregar Productos */}
            <div className="bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-[#064E3B] text-white rounded-full flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-medium text-[#374151]">
                  Agregar Productos
                </h3>
              </div>

              {/* Buscador de productos */}
              <div className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre o codigo..."
                    value={busquedaProducto}
                    onChange={(e) => {
                      setBusquedaProducto(e.target.value);
                      setShowProductoDropdown(true);
                    }}
                    onFocus={() => setShowProductoDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#E2E2D5] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B]"
                  />
                </div>

                {showProductoDropdown && busquedaProducto && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E2D5] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loadingProducts ? (
                      <div className="p-4 text-center text-[#6B7280]">Cargando...</div>
                    ) : productosFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-[#6B7280]">No se encontraron productos</div>
                    ) : (
                      productosFiltrados.map((producto) => (
                        <button
                          key={producto.id}
                          onClick={() => handleSelectProducto(producto)}
                          className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] transition-colors border-b border-[#E2E2D5] last:border-b-0 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-[#374151]">{producto.nombre}</p>
                            <p className="text-sm text-[#6B7280]">
                              Stock: {producto.stock} | {producto.precio_unitario.toFixed(2)}€
                            </p>
                          </div>
                          <Plus className="w-5 h-5 text-[#064E3B]" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Lista de items */}
              {items.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-[#E2E2D5] rounded-lg bg-white">
                  <Package className="w-10 h-10 mx-auto text-[#9CA3AF] mb-2" />
                  <p className="text-sm text-[#6B7280]">
                    Busca y agrega productos al pedido
                  </p>
                </div>
              ) : (
                <div className="border border-[#E2E2D5] rounded-lg overflow-hidden bg-white">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                          Producto
                        </th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                          Cant.
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                          Precio
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-[#6B7280] uppercase">
                          Total
                        </th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E2D5]">
                      {items.map((item) => (
                        <tr key={item.producto_id} className="hover:bg-[#F9FAFB]">
                          <td className="px-3 py-2">
                            <span className="text-sm font-medium text-[#374151]">{item.producto_nombre}</span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                                className="p-1 rounded hover:bg-[#E2E2D5] transition-colors"
                              >
                                <Minus className="w-3 h-3 text-[#6B7280]" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => cambiarCantidad(item.producto_id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center px-1 py-0.5 border border-[#E2E2D5] rounded text-sm"
                              />
                              <button
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                                className="p-1 rounded hover:bg-[#E2E2D5] transition-colors"
                              >
                                <Plus className="w-3 h-3 text-[#6B7280]" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.precio_unitario}
                                onChange={(e) => cambiarPrecio(item.producto_id, parseFloat(e.target.value) || 0)}
                                className="w-16 text-right px-1 py-0.5 border border-[#E2E2D5] rounded text-sm"
                              />
                              <span className="text-xs text-[#6B7280]">€</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-[#374151] text-sm">
                            {item.subtotal.toFixed(2)}€
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => eliminarProducto(item.producto_id)}
                              className="p-1 text-[#9CA3AF] hover:text-[#991B1B] hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#F9FAFB]">
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-right font-bold text-[#374151]">
                          Total:
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-lg text-[#064E3B]">
                          {total.toFixed(2)}€
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Notas adicionales (opcional)
              </label>
              <textarea
                placeholder="Escribe notas o instrucciones especiales para el proveedor..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] resize-none"
              />
            </div>

            {/* Opcion enviar email */}
            {proveedorSeleccionado?.email && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enviarEmail}
                  onChange={(e) => setEnviarEmail(e.target.checked)}
                  className="w-5 h-5 rounded border-[#E2E2D5] text-[#064E3B] focus:ring-[#064E3B]"
                />
                <span className="text-sm text-[#374151]">
                  Enviar por email a <span className="font-medium">{proveedorSeleccionado.email}</span>
                </span>
              </label>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#E2E2D5] bg-[#F9FAFB] flex-shrink-0">
            <button
              onClick={reset}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#374151] transition-colors disabled:opacity-50"
            >
              Limpiar
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPedido}
                disabled={!esValido || loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Crear y Descargar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handler for dropdowns */}
      {(showProveedorDropdown || showProductoDropdown) && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => {
            setShowProveedorDropdown(false);
            setShowProductoDropdown(false);
          }}
        />
      )}
    </div>
  );
}
