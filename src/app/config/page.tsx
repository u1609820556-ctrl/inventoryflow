'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useCompany } from '@/hooks/useCompany';
import { authHelpers } from '@/lib/supabase';
import {
  Settings,
  Building2,
  Link2,
  Mail,
  User,
  Palette,
  Info,
  Save,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { showSuccess, showError } from '@/components/ui/Toast';

// =====================================================
// SECTION CARD COMPONENT
// =====================================================
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E2D5] bg-[#F9FAFB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#F5F2ED]" />
          </div>
          <div>
            <h2 className="font-medium text-[#374151]">{title}</h2>
            {description && <p className="text-xs text-[#6B7280]">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// =====================================================
// CAMBIAR CONTRASENA MODAL
// =====================================================
function CambiarContrasenaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/config/cuenta/cambiar-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cambiar contrasena');
      }

      showSuccess('Contrasena cambiada correctamente');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contrasena');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E2D5]">
            <h2 className="font-serif text-lg font-bold text-[#064E3B]">
              Cambiar Contrasena
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Contrasena actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Nueva contrasena
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Confirmar nueva contrasena
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded border-[#E2E2D5] text-[#064E3B] focus:ring-[#064E3B]"
              />
              <span className="text-sm text-[#6B7280]">Mostrar contrasenas</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Cambiar Contrasena'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ELIMINAR CUENTA MODAL
// =====================================================
function EliminarCuentaModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== 'ELIMINAR') {
      setError('Debes escribir ELIMINAR para confirmar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/config/cuenta', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al eliminar cuenta');
      }

      await authHelpers.signOut();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cuenta');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-serif text-lg font-bold text-red-800">
                Eliminar Cuenta
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                Esta accion es IRREVERSIBLE
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>- Se eliminaran todos tus productos</li>
                <li>- Se eliminaran todos tus proveedores</li>
                <li>- Se eliminaran todos tus pedidos</li>
                <li>- Se eliminaran todas tus reglas de autopedido</li>
                <li>- Se eliminara tu empresa</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">
                Escribe <span className="font-bold text-red-600">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-4 py-2.5 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2D5]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmText !== 'ELIMINAR'}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar Cuenta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN CONFIG PAGE
// =====================================================
export default function ConfigPage() {
  const router = useRouter();
  const { company, loading: companyLoading, fetchCompany } = useCompany();

  // Form states
  const [empresaForm, setEmpresaForm] = useState({
    nombre_empresa: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [integracionesForm, setIntegracionesForm] = useState({
    resend_api_key: '',
    n8n_webhook_url: '',
  });
  const [emailForm, setEmailForm] = useState({
    email_defecto: '',
    enviar_email_crear_pedido: false,
    enviar_email_completar_pedido: false,
  });
  const [preferenciasForm, setPreferenciasForm] = useState({
    tema: 'light' as 'light' | 'dark',
    idioma: 'es' as 'es' | 'en',
    notificaciones: true,
  });

  // UI states
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [savingIntegraciones, setSavingIntegraciones] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPreferencias, setSavingPreferencias] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Load company data
  useEffect(() => {
    if (company) {
      setEmpresaForm({
        nombre_empresa: company.nombre_empresa || '',
        email: company.email || '',
        telefono: company.telefono || '',
        direccion: company.direccion || '',
      });
    }
  }, [company]);

  // Load user email
  useEffect(() => {
    const loadUser = async () => {
      const { session } = await authHelpers.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    loadUser();
  }, []);

  // Save handlers
  const handleSaveEmpresa = async () => {
    setSavingEmpresa(true);
    try {
      const response = await fetch('/api/config/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresaForm),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al guardar');
      }

      showSuccess('Datos de empresa guardados');
      fetchCompany();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingEmpresa(false);
    }
  };

  const handleSaveIntegraciones = async () => {
    setSavingIntegraciones(true);
    try {
      const response = await fetch('/api/config/integraciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integracionesForm),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al guardar');
      }

      showSuccess('Integraciones guardadas');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingIntegraciones(false);
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      const response = await fetch('/api/config/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al guardar');
      }

      showSuccess('Ajustes de email guardados');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePreferencias = async () => {
    setSavingPreferencias(true);
    try {
      // Por ahora guardamos en localStorage
      localStorage.setItem('inventoryflow_preferencias', JSON.stringify(preferenciasForm));
      showSuccess('Preferencias guardadas');
    } catch (err) {
      showError('Error al guardar preferencias');
    } finally {
      setSavingPreferencias(false);
    }
  };

  const handleSignOut = async () => {
    await authHelpers.signOut();
    router.push('/login');
    router.refresh();
  };

  if (companyLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
            <p className="mt-4 text-[#6B7280] font-medium">Cargando configuracion...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F2ED]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center shadow-sm">
              <Settings className="w-6 h-6 text-[#F5F2ED]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                Configuracion
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Gestiona tu empresa, integraciones y preferencias
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Seccion 1: Datos de Empresa */}
            <SectionCard
              icon={Building2}
              title="Datos de Empresa"
              description="Informacion de tu negocio"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={empresaForm.nombre_empresa}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, nombre_empresa: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                      placeholder="Mi Empresa S.L."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={empresaForm.email}
                      onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                      placeholder="contacto@miempresa.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={empresaForm.telefono}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                    placeholder="+34 123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Direccion
                  </label>
                  <textarea
                    value={empresaForm.direccion}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] resize-none"
                    placeholder="Calle Principal 123, 28001 Madrid"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEmpresa}
                    disabled={savingEmpresa}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {savingEmpresa ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Seccion 2: Integraciones */}
            <SectionCard
              icon={Link2}
              title="Integraciones"
              description="Conecta servicios externos"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Resend API Key
                  </label>
                  <p className="text-xs text-[#6B7280] mb-2">
                    Para enviar emails automaticos a proveedores
                  </p>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={integracionesForm.resend_api_key}
                      onChange={(e) => setIntegracionesForm({ ...integracionesForm, resend_api_key: e.target.value })}
                      className="w-full px-4 py-2.5 pr-10 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                      placeholder="re_xxxxxxxxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    N8N Webhook URL
                  </label>
                  <p className="text-xs text-[#6B7280] mb-2">
                    Para automatizaciones personalizadas
                  </p>
                  <input
                    type="url"
                    value={integracionesForm.n8n_webhook_url}
                    onChange={(e) => setIntegracionesForm({ ...integracionesForm, n8n_webhook_url: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                    placeholder="https://n8n.midominio.com/webhook/xxx"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveIntegraciones}
                    disabled={savingIntegraciones}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {savingIntegraciones ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Seccion 3: Ajustes de Email */}
            <SectionCard
              icon={Mail}
              title="Ajustes de Email"
              description="Configuracion de notificaciones"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Email por defecto
                  </label>
                  <input
                    type="email"
                    value={emailForm.email_defecto}
                    onChange={(e) => setEmailForm({ ...emailForm, email_defecto: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B]"
                    placeholder="pedidos@miempresa.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={emailForm.enviar_email_crear_pedido}
                        onChange={(e) => setEmailForm({ ...emailForm, enviar_email_crear_pedido: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                    </div>
                    <span className="text-sm text-[#374151]">Enviar email automaticamente al crear pedido</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={emailForm.enviar_email_completar_pedido}
                        onChange={(e) => setEmailForm({ ...emailForm, enviar_email_completar_pedido: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                    </div>
                    <span className="text-sm text-[#374151]">Enviar email al completar pedido</span>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveEmail}
                    disabled={savingEmail}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {savingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Seccion 4: Cuenta */}
            <SectionCard
              icon={User}
              title="Cuenta"
              description="Gestion de tu cuenta de usuario"
            >
              <div className="space-y-4">
                <div className="bg-[#F9FAFB] rounded-lg p-4">
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                    Email de la cuenta
                  </p>
                  <p className="text-sm text-[#374151]">{userEmail || 'Cargando...'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2.5 text-sm font-medium text-[#374151] border border-[#E2E2D5] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cambiar contrasena
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesion
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Seccion 5: Preferencias */}
            <SectionCard
              icon={Palette}
              title="Preferencias"
              description="Personaliza tu experiencia"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Tema
                    </label>
                    <select
                      value={preferenciasForm.tema}
                      onChange={(e) => setPreferenciasForm({ ...preferenciasForm, tema: e.target.value as 'light' | 'dark' })}
                      className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] bg-white"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro (proximamente)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Idioma
                    </label>
                    <select
                      value={preferenciasForm.idioma}
                      onChange={(e) => setPreferenciasForm({ ...preferenciasForm, idioma: e.target.value as 'es' | 'en' })}
                      className="w-full px-4 py-2.5 border border-[#E2E2D5] rounded-lg text-sm focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] bg-white"
                    >
                      <option value="es">Espanol</option>
                      <option value="en">English (proximamente)</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferenciasForm.notificaciones}
                      onChange={(e) => setPreferenciasForm({ ...preferenciasForm, notificaciones: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2E2D5] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#064E3B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E2D5] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                  </div>
                  <span className="text-sm text-[#374151]">Habilitar notificaciones</span>
                </label>
                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferencias}
                    disabled={savingPreferencias}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F5F2ED] bg-[#064E3B] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                  >
                    {savingPreferencias ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Seccion 6: Informacion */}
            <SectionCard
              icon={Info}
              title="Informacion"
              description="Detalles de tu suscripcion"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#E2E2D5]">
                  <span className="text-sm text-[#6B7280]">Version</span>
                  <span className="text-sm font-medium text-[#374151]">2.0.0</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#E2E2D5]">
                  <span className="text-sm text-[#6B7280]">Plan</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check className="w-3 h-3" />
                    Premium
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#E2E2D5]">
                  <span className="text-sm text-[#6B7280]">Fecha de activacion</span>
                  <span className="text-sm font-medium text-[#374151]">
                    {company?.created_at
                      ? new Date(company.created_at).toLocaleDateString('es-ES')
                      : '-'}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    disabled
                    className="text-sm text-[#6B7280] hover:text-[#064E3B] transition-colors disabled:opacity-50"
                  >
                    Ver facturacion (proximamente)
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CambiarContrasenaModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <EliminarCuentaModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </AppLayout>
  );
}
