'use client';

import { useState } from 'react';
import type { Proveedor } from '@/types';
import { Search, Plus, MoreVertical, Building2, Mail, Phone, MapPin } from 'lucide-react';

export interface ProvidersListProps {
  providers: Proveedor[];
  onEdit: (provider: Proveedor) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function ProvidersList({
  providers,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
  loading,
}: ProvidersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleDeleteClick = (provider: Proveedor) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el proveedor "${provider.nombre}"?`
    );
    if (confirmDelete) {
      onDelete(provider.id);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (providerId: string) => {
    setOpenMenuId(openMenuId === providerId ? null : providerId);
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E2E2D5] rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#064E3B] border-r-transparent"></div>
            <p className="mt-4 text-[#6B7280] font-medium">Cargando proveedores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón crear */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E2D5] rounded-xl text-sm text-[#374151] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] transition-all duration-200"
          />
        </div>
        <button
          onClick={onCreate}
          className="w-full sm:w-auto px-5 py-3 bg-[#064E3B] text-[#F5F2ED] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
        {providers.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-[#E2E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] font-medium">
              {searchQuery ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {searchQuery ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer proveedor'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E2E2D5]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E2D5]">
                  {providers.map((provider) => (
                    <tr
                      key={provider.id}
                      className="group hover:bg-[#F9FAFB] transition-all duration-200"
                      style={{ borderLeft: '3px solid transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftColor = '#064E3B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderLeftColor = 'transparent';
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F0FDF4] rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-[#064E3B]" />
                          </div>
                          <span className="text-sm font-semibold text-[#374151]">
                            {provider.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {provider.email ? (
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Mail className="w-3.5 h-3.5" />
                            {provider.email}
                          </div>
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {provider.telefono ? (
                          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                            <Phone className="w-3.5 h-3.5" />
                            {provider.telefono}
                          </div>
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {provider.direccion ? (
                          <div className="flex items-center gap-2 text-sm text-[#6B7280] max-w-xs truncate">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{provider.direccion}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#9CA3AF]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => toggleMenu(provider.id)}
                            className="p-2 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === provider.id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                              <button
                                onClick={() => {
                                  onEdit(provider);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(provider)}
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
            <div className="md:hidden divide-y divide-[#E2E2D5]">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 hover:bg-[#F9FAFB] transition-all duration-200"
                  style={{ borderLeft: '3px solid transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderLeftColor = '#064E3B';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F0FDF4] rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#064E3B]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#374151]">
                          {provider.nombre}
                        </h3>
                        {provider.email && (
                          <p className="text-xs text-[#6B7280] mt-0.5">
                            {provider.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleMenu(provider.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#374151] hover:bg-[#E2E2D5]/50 rounded-lg transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === provider.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg z-10 border border-[#E2E2D5] overflow-hidden">
                          <button
                            onClick={() => {
                              onEdit(provider);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(provider)}
                            className="block w-full text-left px-4 py-2.5 text-sm text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {provider.telefono && (
                      <div className="flex items-center gap-2 text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{provider.telefono}</span>
                      </div>
                    )}
                    {provider.direccion && (
                      <div className="flex items-center gap-2 text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{provider.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Total count */}
      {providers.length > 0 && (
        <div className="text-sm text-[#6B7280] text-right">
          Total: <span className="font-semibold text-[#374151]">{providers.length}</span> proveedor{providers.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}
