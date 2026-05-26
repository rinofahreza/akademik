'use client';

import { useEffect, useState } from 'react';
import { Users, UserCog, School, Calendar, BarChart3, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface DashboardData {
  total_siswa: number;
  total_pegawai: number;
  total_kelas: number;
  tahun_ajaran_aktif: { nama_tahun_ajaran: string } | null;
  siswa_per_tingkat: { name: string; total: number }[];
  siswa_per_kelas: { name: string; tingkat: string; total: number }[];
  pegawai_per_kategori: { name: string; total: number }[];
  pegawai_per_status: { name: string; code: string; total: number }[];
  user_per_role: { name: string; total: number }[];
  guru_bidang_studi: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: { name: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span className="w-32 truncate text-xs text-slate-600 shrink-0">{item.name}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${(item.total / max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 w-6 text-right">{item.total}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Gagal memuat data dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tahun Ajaran Aktif: <strong className="text-blue-600">{data.tahun_ajaran_aktif?.nama_tahun_ajaran ?? '-'}</strong>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Siswa" value={data.total_siswa} color="bg-blue-500" />
        <StatCard icon={UserCog} label="Total Pegawai" value={data.total_pegawai} color="bg-emerald-500" />
        <StatCard icon={School} label="Total Kelas" value={data.total_kelas} color="bg-violet-500" />
        <StatCard icon={Calendar} label="Guru Bidang Studi" value={data.guru_bidang_studi} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Siswa per Tingkat */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-900">Siswa per Tingkat Pendidikan</h3>
          </div>
          {data.siswa_per_tingkat.length > 0 ? (
            <SimpleBarChart data={data.siswa_per_tingkat} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada data</p>
          )}
        </div>

        {/* Pegawai per Unit */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Pegawai per Unit</h3>
          </div>
          {data.pegawai_per_kategori.length > 0 ? (
            <SimpleBarChart data={data.pegawai_per_kategori} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada data</p>
          )}
        </div>

        {/* Pegawai per Status */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-violet-500" />
            <h3 className="font-semibold text-slate-900">Pegawai per Status Kerja</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.pegawai_per_status.map((item) => (
              <div key={item.code} className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{item.total}</p>
                <p className="text-xs text-slate-500 mt-1">{item.name}</p>
                <span className="mt-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{item.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User per Role */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-orange-500" />
            <h3 className="font-semibold text-slate-900">User per Role</h3>
          </div>
          {data.user_per_role.length > 0 ? (
            <SimpleBarChart data={data.user_per_role} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada data</p>
          )}
        </div>
      </div>
    </div>
  );
}
