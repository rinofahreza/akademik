import { cn } from '@/lib/utils';

interface BadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function Badge({ active, activeLabel = 'Aktif', inactiveLabel = 'Nonaktif' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
      )}
    >
      <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
