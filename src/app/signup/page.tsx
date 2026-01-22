'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Building2, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; needsConfirmation: boolean } | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombreEmpresa: nombreEmpresa || 'Mi Empresa',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear cuenta');
        return;
      }

      // Verificar si necesita confirmación de email
      if (data.needsEmailConfirmation) {
        setSuccess({
          message: 'Cuenta creada. Revisa tu correo para confirmar tu cuenta.',
          needsConfirmation: true,
        });
      } else {
        // Signup exitoso sin confirmación - redirigir a dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuenta';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#064E3B]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#064E3B]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#064E3B] rounded-2xl shadow-lg mb-6">
            <Sparkles className="w-8 h-8 text-[#F5F2ED]" strokeWidth={2} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#064E3B] tracking-tight mb-2">
            InventoryFlow
          </h1>
          <p className="text-[#6B7280] text-sm">
            Gestión inteligente de inventario
          </p>
        </div>

        {/* Card de Signup */}
        <div className="bg-white border border-[#E2E2D5] rounded-2xl shadow-sm p-8">
          {success ? (
            // Mensaje de éxito
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-2">
                ¡Cuenta creada!
              </h2>
              <p className="text-[#6B7280] mb-6">
                {success.message}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#064E3B] text-[#F5F2ED] font-semibold rounded-xl hover:bg-[#064E3B]/90 transition-all duration-200"
              >
                <span>Ir al Login</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-[#374151] mb-1">
                  Crear cuenta
                </h2>
                <p className="text-sm text-[#6B7280]">
                  Comienza a gestionar tu inventario hoy
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-[#991B1B] px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Nombre de tu empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={nombreEmpresa}
                      onChange={(e) => setNombreEmpresa(e.target.value)}
                      placeholder="Mi Empresa"
                      className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-[#E2E2D5] rounded-xl text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#064E3B] text-[#F5F2ED] font-semibold rounded-xl hover:bg-[#064E3B]/90 focus:outline-none focus:ring-2 focus:ring-[#064E3B] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear cuenta</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Link a Login */}
        {!success && (
          <p className="text-center mt-6 text-[#6B7280]">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-[#064E3B] font-semibold hover:underline transition-all duration-200"
            >
              Inicia sesión aquí
            </Link>
          </p>
        )}

        {/* Footer */}
        <p className="text-center mt-8 text-xs text-[#9CA3AF]">
          © 2025 InventoryFlow. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
