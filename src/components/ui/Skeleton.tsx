'use client';

/**
 * Componente Skeleton para mostrar estados de carga.
 * Usa animación de pulso para indicar que el contenido está cargando.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#E2E2D5] rounded ${className}`}
    />
  );
}

/**
 * Skeleton para una fila de tabla
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#E2E2D5]">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-48" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
      </td>
    </tr>
  );
}

/**
 * Skeleton para tabla completa con múltiples filas
 * @param rows - Número de filas skeleton a mostrar (default: 5)
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
      {/* Header skeleton */}
      <div className="bg-[#F9FAFB] border-b border-[#E2E2D5] px-6 py-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {/* Body skeleton */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton para una tarjeta de producto en móvil
 */
export function CardSkeleton() {
  return (
    <div className="p-4 border-b border-[#E2E2D5]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg ml-3" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F9FAFB] rounded-lg p-3">
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="bg-[#F9FAFB] rounded-lg p-3">
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para lista de cards en móvil
 * @param count - Número de cards skeleton a mostrar (default: 5)
 */
export function CardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white border border-[#E2E2D5] rounded-xl shadow-sm overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton para el dashboard - Stats cards
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E2E2D5] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para formulario
 */
export function FormSkeleton() {
  return (
    <div className="space-y-5">
      {/* Input field */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      {/* Textarea */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton para dropdown/select
 */
export function DropdownSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de texto "Cargando..." con animación
 */
export function LoadingText({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-[#6B7280]">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#064E3B] border-r-transparent" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
