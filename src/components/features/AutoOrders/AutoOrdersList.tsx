'use client';

import { useState } from 'react';
import type { ReglaAutopedido } from '@/types';
import { Plus, MoreVertical, Zap, AlertCircle } from 'lucide-react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => Promise<void>;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleToggle = async () => {
    setIsChanging(true);
    try {
      await onChange(!enabled);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isChanging}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
        enabled ? 'bg-[#064E3B]' : 'bg-[#E2E2D5]'
      } ${disabled || isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export interface AutoOrdersListProps {
  rules: ReglaAutopedido[];
  onEdit: (rule: ReglaAutopedido) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggle: (id: string, habilitado: boolean) => Promise<void>;
  loading: boolean;
}

export default function AutoOrdersList({
  rules,
  onEdit,
  onDelete,
  onCreate,
  onToggle,
  loading,
}: AutoOrdersListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleDeleteClick = (rule: ReglaAutopedido) => {
    if (window.confirm(`¿Eliminar regla de autopedido para "${rule.productos?.nombre || 'este producto'}"?`)) {
      onDelete(rule.id);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (ruleId: string) => {
    setOpenMenuId(openMenuId === ruleId ? null : ruleId);
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
            <p className="mt-4 text-[#6B7280] font-medium">Cargando reglas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={onCreate}
          className="px-5 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nueva Regla</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
        {rules.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[#E2E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] font-medium">No hay reglas de autopedido configuradas</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Crea una regla para automatizar tus pedidos</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Trigger</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Proveedor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Aprobación</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2D5]">
                  {rules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="hover:bg-[#F9FAFB] transition-all duration-200"
                      style={{
                        borderLeft: rule.habilitado ? '3px solid #064E3B' : '3px solid #E2E2D5'
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#374151]">
                          {typeof rule.productos === 'object' && rule.productos !== null
                            ? (rule.productos as { nombre?: string }).nombre || 'N/A'
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FEF3C7] text-[#92400E] rounded-lg text-xs font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          &lt; {rule.stock_minimo_trigger}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-[#374151]">{rule.cantidad_a_pedir}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#6B7280]">
                          {typeof rule.proveedores === 'object' && rule.proveedores !== null
                            ? (rule.proveedores as { nombre?: string }).nombre || 'N/A'
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          rule.requerir_aprobacion
                            ? 'bg-[#F0FDF4] text-[#064E3B]'
                            : 'bg-[#F9FAFB] text-[#6B7280]'
                        }`}>
                          {rule.requerir_aprobacion ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ToggleSwitch
                          enabled={rule.habilitado}
                          onChange={(enabled) => onToggle(rule.id, enabled)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => toggleMenu(rule.id)}
                            className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === rule.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                              <button
                                onClick={() => {
                                  onEdit(rule);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(rule)}
                                className="block w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-[#E2E2D5]">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 hover:bg-[#F9FAFB] transition-all duration-200"
                  style={{
                    borderLeft: rule.habilitado ? '3px solid #064E3B' : '3px solid #E2E2D5'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#374151]">
                        {typeof rule.productos === 'object' && rule.productos !== null
                          ? (rule.productos as { nombre?: string }).nombre || 'N/A'
                          : 'N/A'}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Proveedor: {typeof rule.proveedores === 'object' && rule.proveedores !== null
                          ? (rule.proveedores as { nombre?: string }).nombre || 'N/A'
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        enabled={rule.habilitado}
                        onChange={(enabled) => onToggle(rule.id, enabled)}
                      />
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(rule.id)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === rule.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                            <button
                              onClick={() => {
                                onEdit(rule);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(rule)}
                              className="block w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                      <span className="text-[#9CA3AF] text-xs block mb-0.5">Trigger stock</span>
                      <span className="font-mono font-semibold text-[#374151]">&lt; {rule.stock_minimo_trigger}</span>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg px-3 py-2">
                      <span className="text-[#9CA3AF] text-xs block mb-0.5">Cantidad a pedir</span>
                      <span className="font-mono font-semibold text-[#374151]">{rule.cantidad_a_pedir}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Total count */}
      {rules.length > 0 && (
        <div className="text-sm text-[#6B7280] text-right">
          Total: <span className="font-semibold text-[#374151]">{rules.length}</span> regla{rules.length !== 1 ? 's' : ''}
          {' | '}
          <span className="font-semibold text-[#064E3B]">{rules.filter(r => r.habilitado).length}</span> activa{rules.filter(r => r.habilitado).length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
