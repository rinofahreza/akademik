'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { User, BookOpen, Hash, Calendar, MapPin, Phone, LogOut } from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const { siswa, user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
    } finally {
      clearAuth();
      router.replace('/login');
    }
  };

  const kelasAktif = siswa?.kelas_records?.[0];

  const infoItems = [
    { icon: Hash,      label: 'NIS',          value: siswa?.nomor_induk ?? '-' },
    { icon: Hash,      label: 'NISN',         value: siswa?.nisn ?? '-' },
    { icon: BookOpen,  label: 'Tingkat',      value: siswa?.tingkat_pendidikan?.name ?? '-' },
    { icon: BookOpen,  label: 'Kelas',        value: kelasAktif?.kelas?.nama_kelas ?? 'Belum ditempatkan' },
    { icon: Calendar,  label: 'Tahun Ajaran', value: kelasAktif?.tahun_ajaran?.nama ?? '-' },
    { icon: Calendar,  label: 'Tgl Lahir',    value: siswa?.tanggal_lahir ? new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
    { icon: MapPin,    label: 'Tempat Lahir', value: siswa?.tempat_lahir ?? '-' },
    { icon: MapPin,    label: 'Alamat',       value: siswa?.alamat ?? '-' },
    { icon: Phone,     label: 'Telp Ortu',   value: siswa?.telepon_orang_tua ?? '-' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 pt-12 pb-16">
        <h1 className="text-xl font-bold text-white mb-1">Profil</h1>
        <p className="text-blue-200 text-sm">Informasi data diri siswa</p>
      </div>

      <div className="px-4 -mt-8 space-y-4 pb-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 flex items-center justify-center shrink-0">
            <User size={28} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 truncate">
              {siswa?.nama_lengkap ?? user?.name ?? '-'}
            </h2>
            <p className="text-sm text-slate-500 truncate">{user?.email ?? '-'}</p>
            <span className="inline-flex mt-1 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {siswa?.jenis_kelamin === 'L' ? 'Laki-laki' : siswa?.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-700">Informasi Akademik & Pribadi</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {infoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                  <p className="text-sm text-slate-800 font-medium mt-0.5 break-words">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-3xl py-4 text-sm font-semibold active:scale-95 transition hover:bg-red-100"
        >
          <LogOut size={18} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
