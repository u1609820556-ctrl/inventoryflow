import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are configured
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your-project-url' &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.startsWith('http');

// Create a dummy client if not configured to prevent errors
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

export const supabase = createBrowserClient(
  isConfigured ? supabaseUrl : dummyUrl,
  isConfigured ? supabaseAnonKey : dummyKey
);

export { isConfigured };

// Auth helpers
export const authHelpers = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// Database helpers
export const db = {
  productos: {
    getAll: () => supabase.from('productos').select('*').order('nombre'),
    getById: (id: string) => supabase.from('productos').select('*').eq('id', id).single(),
    create: (data: unknown) => supabase.from('productos').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('productos').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('productos').delete().eq('id', id),
  },

  movimientos: {
    getAll: () => supabase.from('movimientos').select('*, productos(nombre)').order('fecha', { ascending: false }),
    getByProducto: (productoId: string) => supabase.from('movimientos').select('*').eq('producto_id', productoId).order('fecha', { ascending: false }),
    create: (data: unknown) => supabase.from('movimientos').insert(data).select().single(),
  },

  proveedores: {
    getAll: () => supabase.from('proveedores').select('*').order('nombre'),
    getById: (id: string) => supabase.from('proveedores').select('*').eq('id', id).single(),
    create: (data: unknown) => supabase.from('proveedores').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('proveedores').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('proveedores').delete().eq('id', id),
  },

  pedidos: {
    getAll: () => supabase.from('pedidos').select('*, proveedores(nombre), lineas_pedido(*, productos(nombre))').order('fecha_creacion', { ascending: false }),
    getById: (id: string) => supabase.from('pedidos').select('*, proveedores(nombre), lineas_pedido(*, productos(nombre))').eq('id', id).single(),
    create: (data: unknown) => supabase.from('pedidos').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('pedidos').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('pedidos').delete().eq('id', id),
  },

  autopedidos: {
    getAll: () => supabase.from('reglas_autopedido').select('*, productos(nombre), proveedores(nombre)').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('reglas_autopedido').select('*, productos(nombre), proveedores(nombre)').eq('id', id).single(),
    create: (data: unknown) => supabase.from('reglas_autopedido').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('reglas_autopedido').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('reglas_autopedido').delete().eq('id', id),
  },

  lineasPedido: {
    getAll: () => supabase.from('lineas_pedido').select('*, productos(nombre)').order('created_at', { ascending: false }),
    getByPedido: (pedidoId: string) => supabase.from('lineas_pedido').select('*, productos(nombre)').eq('pedido_id', pedidoId),
    create: (data: unknown) => supabase.from('lineas_pedido').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('lineas_pedido').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('lineas_pedido').delete().eq('id', id),
  },

  empresa: {
    get: async () => {
      // Use limit(1) instead of single() to avoid errors when no rows exist
      const { data, error } = await supabase.from('empresa').select('*').limit(1);
      if (error) {
        console.error('Error fetching empresa:', error.code, error.message);
        return { data: null, error };
      }
      console.log('Empresa data:', data);
      // Return the first empresa or null if none exists
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    },
    create: (data: unknown) => supabase.from('empresa').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('empresa').update(data).eq('id', id).select().single(),
  },

  pedidosGenerados: {
    getAll: () => supabase.from('pedidos_generados').select('*, proveedores(nombre)').order('created_at', { ascending: false }),
    getById: (id: string) => supabase.from('pedidos_generados').select('*, proveedores(*)').eq('id', id).single(),
    create: (data: unknown) => supabase.from('pedidos_generados').insert(data).select().single(),
    update: (id: string, data: unknown) => supabase.from('pedidos_generados').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('pedidos_generados').delete().eq('id', id),
    getByEstado: (estado: string) => supabase.from('pedidos_generados').select('*, proveedores(nombre)').eq('estado', estado).order('created_at', { ascending: false }),
  },
};
