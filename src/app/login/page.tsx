'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHelpers } from '@/lib/supabase';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { session } = await authHelpers.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = isSignUp
        ? await authHelpers.signUp(email, password)
        : await authHelpers.signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (data?.session || data?.user) {
        // Login exitoso - redirigir al dashboard
        window.location.href = '/dashboard';
      } else if (isSignUp) {
        // Si es registro, puede que necesite confirmar email
        setError('Revisa tu email para confirmar tu cuenta');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F2ED]">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm border border-[#E2E2D5]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#064E3B] rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-[#F5F2ED]" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#064E3B] tracking-tight">InventoryFlow</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#E2E2D5] px-3 py-2.5 text-[#374151] placeholder-[#9CA3AF] focus:border-[#064E3B] focus:outline-none focus:ring-1 focus:ring-[#064E3B] transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151]">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#E2E2D5] px-3 py-2.5 text-[#374151] placeholder-[#9CA3AF] focus:border-[#064E3B] focus:outline-none focus:ring-1 focus:ring-[#064E3B] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-[#991B1B]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#064E3B] px-4 py-2.5 text-[#F5F2ED] font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-[#064E3B] hover:opacity-80 font-medium transition-opacity"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
