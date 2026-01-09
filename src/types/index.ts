// Database Types

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo_barras?: string;
  stock_actual: number;
  stock_minimo: number;
  proveedor_principal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Movimiento {
  id: string;
  producto_id: string;
  tipo: 'Entrada' | 'Salida' | 'Ajuste' | 'Pedido_Recibido';
  cantidad: number;
  fecha: string;
  proveedor_id?: string;
  notas?: string;
  usuario_id: string;
  created_at: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  info_extra?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface HistoricoPrecio {
  id: string;
  proveedor_id: string;
  producto_id: string;
  precio: number;
  fecha_cotizacion: string;
}

export interface Pedido {
  id: string;
  numero_pedido: string;
  proveedor_id: string;
  estado: 'Borrador' | 'Pendiente_Aprobacion' | 'Aprobado' | 'Enviado' | 'Recibido' | 'Cancelado';
  fecha_creacion: string;
  fecha_aprobacion?: string;
  creado_por_user_id: string;
  aprobado_por_user_id?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  // Optional joined fields from Supabase queries
  proveedores?: { nombre: string };
  lineas_pedido?: LineaPedido[];
}

export interface LineaPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  fecha_entrega_esperada?: string;
}

export interface ReglaAutopedido {
  id: string;
  habilitado: boolean;
  producto_id: string;
  stock_minimo_trigger: number;
  cantidad_a_pedir: number;
  proveedor_id: string;
  requerir_aprobacion: boolean;
  created_at: string;
  updated_at: string;
  // Optional joined fields from Supabase queries
  productos?: { nombre: string };
  proveedores?: { nombre: string };
}

// Empresa
export interface Empresa {
  id: string;
  nombre_empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  created_at: string;
  updated_at: string;
}

// UI Types

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
    stock_actual: number;
    stock_minimo: number;
  }>;
  proveedores?: Array<{
    nombre: string;
    email?: string;
    telefono?: string;
    direccion?: string;
  }>;
}
