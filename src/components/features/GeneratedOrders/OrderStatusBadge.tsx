'use client';

import { Clock, Send, CheckCircle, XCircle } from 'lucide-react';
import type { EstadoPedidoGenerado } from '@/types';

interface OrderStatusBadgeProps {
  status: EstadoPedidoGenerado;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  EstadoPedidoGenerado,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: typeof Clock;
  }
> = {
  pending_review: {
    label: 'Pendiente',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  sent: {
    label: 'Enviado',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: Send,
  },
  completed: {
    label: 'Completado',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1',
  },
  md: {
    container: 'px-2.5 py-1 text-xs',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-2',
  },
};

export default function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeClasses[size];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} font-medium rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      <Icon className={sizeClass.icon} />
      {config.label}
    </span>
  );
}
