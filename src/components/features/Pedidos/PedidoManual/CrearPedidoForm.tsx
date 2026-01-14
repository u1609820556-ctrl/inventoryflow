'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  FileText,
  Download,
  Mail,
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

interface CrearPedidoFormProps {
  onSuccess?: () => void;
}

export default function CrearPedidoForm({ onSuccess }: CrearPedidoFormProps) {
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

    return filtered.slice(0, 10); // Limitar resultados
  }, [products, items, busquedaProducto]);

  // Manejar selección de proveedor
  const handleSelectProveedor = (proveedor: Proveedor) => {
    seleccionarProveedor(proveedor);
    setBusquedaProveedor('');
    setShowProveedorDropdown(false);
  };

  // Manejar selección de producto
  const handleSelectProducto = (producto: Producto) => {
    agregarProducto(producto, 1);
    setBusquedaProducto('');
    setShowProductoDropdown(false);
  };

  // Manejar creación del pedido
  const handleCrearPedido = async () => {
    try {
      const resultado = await crearPedidoYDescargar();
      setPedidoCreado({ id: resultado.pedido_id, total: resultado.total_estimado });
      showSuccess(`Pedido creado correctamente. Total: $${resultado.total_estimado.toFixed(2)}`);

      // Si quiere enviar email, aquí se podría implementar
      // TODO: Implementar envío de email

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al crear pedido:', err);
      const message = err instanceof Error ? err.message : 'Error al crear el pedido';
      showError(message);
    }
  };

  // Resetear y crear nuevo pedido
  const handleNuevoPedido = () => {
    reset();
    setPedidoCreado(null);
  };

  // Si el pedido fue creado, mostrar mensaje de éxito
  if (pedidoCreado) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
        <h2 className="font-serif text-2xl font-bold text-[#374151] mb-2">
          ¡Pedido creado exitosamente!
        </h2>
        <p className="text-[#6B7280] mb-2">
          Total del pedido: <span className="font-bold text-[#064E3B]">${pedidoCreado.total.toFixed(2)}</span>
        </p>
        <p className="text-sm text-[#9CA3AF] mb-6">
          El PDF se ha descargado automáticamente
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleNuevoPedido}
            className="px-6 py-2.5 bg-[#064E3B] text-white font-medium rounded-lg hover:opacity-90 transition-all"
          >
            Crear otro pedido
          </button>
          <button
            onClick={() => window.location.href = '/pedidos/historial'}
            className="px-6 py-2.5 border border-[#E2E2D5] text-[#374151] font-medium rounded-lg hover:bg-[#F9FAFB] transition-all"
          >
            Ver historial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Paso 1: Seleccionar Proveedor */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#064E3B] text-white rounded-full flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-serif text-lg font-bold text-[#374151]">
            Seleccionar Proveedor
          </h3>
        </div>

        {proveedorSeleccionado ? (
          <div className="flex items-center justify-between bg-[#F9FAFB] rounded-xl p-4">
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
                className="w-full pl-10 pr-4 py-3 border border-[#E2E2D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B]"
              />
            </div>

            {showProveedorDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E2D5] rounded-xl shadow-lg max-h-60 overflow-y-auto">
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
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-[#064E3B] text-white rounded-full flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-serif text-lg font-bold text-[#374151]">
            Agregar Productos
          </h3>
        </div>

        {/* Buscador de productos */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={busquedaProducto}
              onChange={(e) => {
                setBusquedaProducto(e.target.value);
                setShowProductoDropdown(true);
              }}
              onFocus={() => setShowProductoDropdown(true)}
              className="w-full pl-10 pr-4 py-3 border border-[#E2E2D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B]"
            />
          </div>

          {showProductoDropdown && busquedaProducto && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E2D5] rounded-xl shadow-lg max-h-60 overflow-y-auto">
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
                        Stock: {producto.stock} | ${producto.precio_unitario.toFixed(2)}
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
          <div className="text-center py-8 border-2 border-dashed border-[#E2E2D5] rounded-xl">
            <Package className="w-12 h-12 mx-auto text-[#9CA3AF] mb-3" />
            <p className="text-[#6B7280]">
              Busca y agrega productos al pedido
            </p>
          </div>
        ) : (
          <div className="border border-[#E2E2D5] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280] uppercase">
                    Producto
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[#6B7280] uppercase">
                    Cantidad
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase">
                    Precio Unit.
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2D5]">
                {items.map((item) => (
                  <tr key={item.producto_id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#374151]">{item.producto_nombre}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                          className="p-1 rounded-lg hover:bg-[#E2E2D5] transition-colors"
                        >
                          <Minus className="w-4 h-4 text-[#6B7280]" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => cambiarCantidad(item.producto_id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center px-2 py-1 border border-[#E2E2D5] rounded-lg"
                        />
                        <button
                          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                          className="p-1 rounded-lg hover:bg-[#E2E2D5] transition-colors"
                        >
                          <Plus className="w-4 h-4 text-[#6B7280]" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[#6B7280]">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={(e) => cambiarPrecio(item.producto_id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right px-2 py-1 border border-[#E2E2D5] rounded-lg"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#374151]">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminarProducto(item.producto_id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#991B1B] hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F9FAFB]">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-right font-bold text-[#374151]">
                    Total:
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-xl text-[#064E3B]">
                    ${total.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
        <h3 className="font-medium text-[#374151] mb-3">Notas adicionales (opcional)</h3>
        <textarea
          placeholder="Escribe notas o instrucciones especiales para el proveedor..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-[#E2E2D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] resize-none"
        />
      </div>

      {/* Opciones y Acciones */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6">
        {/* Checkbox enviar email */}
        {proveedorSeleccionado?.email && (
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              className="w-5 h-5 rounded border-[#E2E2D5] text-[#064E3B] focus:ring-[#064E3B]"
            />
            <span className="text-[#374151]">
              Enviar por email a <span className="font-medium">{proveedorSeleccionado.email}</span>
            </span>
          </label>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCrearPedido}
            disabled={!esValido || loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#064E3B] text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando pedido...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Crear y Descargar PDF
              </>
            )}
          </button>

          <button
            onClick={reset}
            disabled={loading}
            className="px-6 py-3 border border-[#E2E2D5] text-[#6B7280] font-medium rounded-xl hover:bg-[#F9FAFB] transition-all disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Click outside handler for dropdowns */}
      {(showProveedorDropdown || showProductoDropdown) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowProveedorDropdown(false);
            setShowProductoDropdown(false);
          }}
        />
      )}
    </div>
  );
}
