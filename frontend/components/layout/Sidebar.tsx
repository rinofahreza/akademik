'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight, X, GraduationCap } from 'lucide-react';
import { navConfig, NavItem } from './sidebar-config';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const { hasPermission } = useAuthStore();
  const [open, setOpen] = useState(() => {
    if (item.children) {
      return item.children.some((child) => child.href === pathname);
    }
    return false;
  });

  if (item.permission && !hasPermission(item.permission)) return null;

  if (item.children) {
    const visibleChildren = item.children.filter(
      (child) => !child.permission || hasPermission(child.permission)
    );
    if (visibleChildren.length === 0) return null;

    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <item.icon size={16} />
            {item.label}
          </span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {open && (
          <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
            {visibleChildren.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <item.icon size={16} />
      {item.label}
    </Link>
  );
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{process.env.NEXT_PUBLIC_APP_NAME ?? 'Akademik'}</p>
            <p className="text-xs text-slate-500">{process.env.NEXT_PUBLIC_APP_SUBTITLE ?? 'Sistem Sekolah'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navConfig.map((item, i) => (
          <NavLink key={i} item={item} />
        ))}
      </nav>
    </div>
  );
}
