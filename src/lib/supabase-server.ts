import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Helper to get current user's empresa
export async function getEmpresaFromUser() {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { empresa: null, error: 'No autenticado' };
  }

  // Get empresa (for now, we assume one empresa per system, but structured for multi-tenant)
  const { data: empresa, error: empresaError } = await supabase
    .from('empresa')
    .select('*')
    .limit(1)
    .single();

  if (empresaError) {
    return { empresa: null, error: 'Empresa no encontrada' };
  }

  return { empresa, error: null, user };
}
