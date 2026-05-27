'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Calendar, ClipboardList, BarChart2, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { href: '/beranda',   icon: Home,          label: 'Beranda' },
  { href: '/jadwal',    icon: Calendar,      label: 'Jadwal' },
  { href: '/kehadiran', icon: ClipboardList, label: 'Kehadiran' },
  { href: '/nilai',     icon: BarChart2,     label: 'Nilai' },
  { href: '/profil',    icon: User,          label: 'Profil' },
];

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.replace('/login');
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 pb-safe overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 shadow-lg z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-all',
                  isActive ? 'text-blue-600' : 'text-slate-400'
                )}
              >
                <div className={clsx(
                  'flex items-center justify-center w-10 h-7 rounded-2xl transition-all',
                  isActive && 'bg-blue-50'
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={clsx('text-[10px] font-medium', isActive ? 'text-blue-600' : 'text-slate-400')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
