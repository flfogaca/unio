import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'em-fila' | 'em-atendimento' | 'finalizado'
  className?: string
}

const statusConfig = {
  'em-fila': {
    label: 'Em Fila',
    className: 'bg-actionBlue/10 text-actionBlue border-actionBlue/20'
  },
  'em-atendimento': {
    label: 'Em Atendimento',
    className: 'bg-accent/10 text-accent border-accent/20'
  },
  'finalizado': {
    label: 'Finalizado',
    className: 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['em-fila'] // Fallback para 'em-fila'
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}