'use client';

import { useAuthStore } from '@/store/authStore';
import { BookOpen, Calendar, ClipboardList, BarChart2, Bell } from 'lucide-react';
import Link from 'next/link';

const DUMMY_JADWAL = [
  { jam: '07.00 - 08.30', mapel: 'Matematika', guru: 'Bpk. Ahmad' },
  { jam: '08.30 - 10.00', mapel: 'Bahasa Indonesia', guru: 'Ibu. Sari' },
  { jam: '10.15 - 11.45', mapel: 'IPA', guru: 'Bpk. Hendra' },
];

const DUMMY_KEHADIRAN = { hadir: 18, izin: 1, sakit: 1, alfa: 0, total: 20 };

const SHORTCUTS = [
  { href: '/jadwal',    icon: Calendar,      label: 'Jadwal',     color: 'bg-violet-50 text-violet-600' },
  { href: '/kehadiran', icon: ClipboardList, label: 'Kehadiran',  color: 'bg-emerald-50 text-emerald-600' },
  { href: '/nilai',     icon: BarChart2,     label: 'Nilai',      color: 'bg-amber-50 text-amber-600' },
  { href: '/profil',    icon: BookOpen,      label: 'Profil',     color: 'bg-blue-50 text-blue-600' },
];

export default function BerandaPage() {
  const { siswa, user } = useAuthStore();

  const namaDepan = siswa?.nama_lengkap?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'Siswa';
  const kelasAktif = siswa?.kelas_records?.[0];

  const pctHadir = Math.round((DUMMY_KEHADIRAN.hadir / DUMMY_KEHADIRAN.total) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-12 pb-20 px-5 relative">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-blue-200 text-sm">Selamat datang,</p>
            <h1 className="text-white text-2xl font-bold">{namaDepan} 👋</h1>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
            <Bell size={20} />
          </button>
        </div>
        {kelasAktif && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <BookOpen size={13} className="text-blue-100" />
            <span className="text-blue-100 text-xs font-medium">
              Kelas {kelasAktif.kelas?.nama_kelas} · {kelasAktif.tahun_ajaran?.nama}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 -mt-12 space-y-4 pb-6">
        <div className="grid grid-cols-4 gap-3">
          {SHORTCUTS.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1.5">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
                <Icon size={22} />
              </div>
              <span className="text-[11px] font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Kehadiran Bulan Ini</h2>
            <span className="text-xs text-blue-600 font-semibold">{pctHadir}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pctHadir}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hadir', value: DUMMY_KEHADIRAN.hadir, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Izin',  value: DUMMY_KEHADIRAN.izin,  color: 'text-blue-600 bg-blue-50' },
              { label: 'Sakit', value: DUMMY_KEHADIRAN.sakit, color: 'text-amber-600 bg-amber-50' },
              { label: 'Alfa',  value: DUMMY_KEHADIRAN.alfa,  color: 'text-red-600 bg-red-50' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-2.5 text-center ${item.color}`}>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-[10px] font-medium opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">Jadwal Hari Ini</h2>
            <Link href="/jadwal" className="text-xs text-blue-600 font-medium">Lihat semua</Link>
          </div>
          <div className="space-y-2.5">
            {DUMMY_JADWAL.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full bg-blue-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.mapel}</p>
                  <p className="text-xs text-slate-400">{item.guru}</p>
                </div>
                <span className="text-xs text-slate-500 shrink-0">{item.jam}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
