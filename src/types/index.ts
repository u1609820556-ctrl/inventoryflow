// =====================================================
// DATABASE TYPES - InventoryFlow 2.0
// Estructura limpia y reorganizada
// =====================================================

// =====================================================
// PRODUCTO
// =====================================================

export interface Producto {
  id: string;
  empresa_id: string;
  nombre: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;

  stock: number;
  precio_unitario: number;
  created_at: string;
  updated_at: string;

  // Campo opcional populado desde Supabase JOINs
  proveedor?: {
    id: string;
    nombre: string;
  };
}

export interface CreateProductoInput {
  nombre: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock?: number;
  precio_unitario: number;
}

export interface UpdateProductoInput {
  nombre?: string;
  descripcion?: string;
  referencia?: string;
  proveedor_id?: string;
  stock?: number;
  precio_unitario?: number;
}

// =====================================================
// PROVEEDOR
// =====================================================

export interface Proveedor {
  id: string;
  empresa_id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  info_extra?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateProveedorInput {
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface UpdateProveedorInput {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

// =====================================================
// REGLA DE AUTOPEDIDO
// =====================================================

export interface ReglaAutopedido {
  id: string;
  empresa_id: string;
  producto_id: string;
  proveedor_id: string;
  stock_minimo: number;
  cantidad_pedido: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
  // Campos opcionales populados desde Supabase JOINs
  productos?: {
    id: string;
    nombre: string;
  };
  proveedores?: {
    id: string;
    nombre: string;
  };
}

export interface CreateReglaAutopedidoInput {
  producto_id: string;
  proveedor_id: string;
  stock_minimo: number;
  cantidad_pedido: number;
  activa?: boolean;
}

export interface UpdateReglaAutopedidoInput {
  producto_id?: string;
  proveedor_id?: string;
  stock_minimo?: number;
  cantidad_pedido?: number;
  activa?: boolean;
}

// =====================================================
// PEDIDOS GENERADOS
// =====================================================

export type EstadoPedidoGenerado = 'pending_review' | 'sent' | 'completed' | 'cancelled';

export interface LineaPedidoGenerado {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  nombre_producto?: string;
}

export interface PedidoGenerado {
  id: string;
  empresa_id: string;
  proveedor_id: string;
  estado: EstadoPedidoGenerado;
  datos_pedido: LineaPedidoGenerado[];
  total_estimado: number;
  pdf_url?: string;
  email_template_used?: string;
  notas?: string;
  created_at: string;
  sent_at?: string;
  updated_at: string;
  // Campos opcionales populados desde Supabase JOINs
  proveedores?: Proveedor;
}

// =====================================================
// EMPRESA
// =====================================================

export interface Empresa {
  id: string;
  nombre_empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// UI TYPES
// =====================================================

export interface User {
  id: string;
  email: string;
}

export interface SetupData {
  empresa?: {
    nombre_empresa: string;
    email: string;
    telefono: string;
    direccion: string;
  };
  productos?: Array<{
    nombre: string;
    descripcion?: string;
    stock: number;
    precio_unitario: number;
  }>;
  proveedores?: Array<{
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }>;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  details?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =====================================================
// MOVIMIENTOS DE STOCK
// =====================================================

export type TipoMovimientoStock = 'ajuste_manual' | 'venta' | 'compra' | 'devolucion' | 'merma';

export interface MovimientoStock {
  id: string;
  empresa_id: string;
  producto_id: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  notas?: string;
  usuario_id?: string;
  created_at: string;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type UUID = string;

export interface WithTimestamps {
  created_at: string;
  updated_at: string;
}

export interface WithEmpresa {
  empresa_id: string;
}
