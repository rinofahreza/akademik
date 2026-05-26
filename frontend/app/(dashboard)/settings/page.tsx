'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Lock, Shield, Bell, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore, AuthUser } from '@/store/authStore';

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Password lama wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'notifications', label: 'Notifikasi', icon: Bell },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: errProfile, isSubmitting: submittingProfile },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: errPassword, isSubmitting: submittingPassword },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const res = await api.put('/profile', data);
      updateUser(res.data.data as AuthUser);
      toast.success('Profil berhasil diperbarui');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat()[0]
        : e?.response?.data?.message || 'Gagal memperbarui profil';
      toast.error(msg);
    }
  };

  const onSavePassword = async (data: PasswordForm) => {
    try {
      await api.put('/profile/password', data);
      toast.success('Password berhasil diperbarui');
      resetPassword();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Gagal memperbarui password');
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors";
  const readonlyClass = "w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Kelola preferensi dan informasi akun Anda</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0 space-y-3">
          {/* User Card */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col items-center text-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-sm">
              <span className="text-lg font-bold text-white">{user?.name?.charAt(0).toUpperCase() ?? '?'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{user?.email}</p>
            </div>
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
              {user?.roles?.[0] ?? 'User'}
            </span>
          </div>

          {/* Nav */}
          <nav className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-[3px] ${
                    activeTab === tab.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-medium'
                      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Tab: Profil */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Informasi Profil</h2>
                <p className="text-sm text-slate-500 mt-0.5">Perbarui nama dan email akun Anda</p>
              </div>
              <form onSubmit={handleProfile(onSaveProfile)} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                    <input {...regProfile('name')} className={inputClass} placeholder="Masukkan nama lengkap" />
                    {errProfile.name && <p className="mt-1 text-xs text-red-500">{errProfile.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                    <input {...regProfile('email')} type="email" className={inputClass} placeholder="Masukkan email" />
                    {errProfile.email && <p className="mt-1 text-xs text-red-500">{errProfile.email.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Role</label>
                    <div className={readonlyClass}>{user?.roles?.join(', ') || '-'}</div>
                  </div>
                  <div>
                    <label className={labelClass}>Status Akun</label>
                    <div className={readonlyClass}>
                      <span className={`inline-flex items-center gap-1.5 font-medium ${user?.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user?.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user?.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={submittingProfile} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {submittingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Password */}
          {activeTab === 'password' && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Ubah Password</h2>
                <p className="text-sm text-slate-500 mt-0.5">Gunakan password yang kuat dan unik</p>
              </div>
              <form onSubmit={handlePassword(onSavePassword)} className="p-6 space-y-5">
                <div>
                  <label className={labelClass}>Password Lama <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input {...regPassword('current_password')} type={showCurrent ? 'text' : 'password'} className={inputClass + ' pr-10'} placeholder="Masukkan password lama" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errPassword.current_password && <p className="mt-1 text-xs text-red-500">{errPassword.current_password.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Password Baru <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input {...regPassword('password')} type={showNew ? 'text' : 'password'} className={inputClass + ' pr-10'} placeholder="Min. 8 karakter" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errPassword.password && <p className="mt-1 text-xs text-red-500">{errPassword.password.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Konfirmasi Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input {...regPassword('password_confirmation')} type={showConfirm ? 'text' : 'password'} className={inputClass + ' pr-10'} placeholder="Ulangi password baru" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errPassword.password_confirmation && <p className="mt-1 text-xs text-red-500">{errPassword.password_confirmation.message}</p>}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs font-medium text-amber-700 mb-1">Tips password kuat:</p>
                  <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
                    <li>Minimal 8 karakter</li>
                    <li>Kombinasi huruf besar, kecil, angka, dan simbol</li>
                    <li>Jangan gunakan informasi pribadi</li>
                  </ul>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={submittingPassword} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                    {submittingPassword ? 'Menyimpan...' : 'Perbarui Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === 'security' && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Keamanan Akun</h2>
                <p className="text-sm text-slate-500 mt-0.5">Informasi keamanan dan sesi aktif</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { title: 'Autentikasi Dua Faktor', desc: 'Tambah lapisan keamanan ekstra pada akun Anda' },
                  { title: 'Riwayat Login', desc: 'Lihat aktivitas login terakhir pada akun Anda' },
                  { title: 'Sesi Aktif', desc: 'Kelola perangkat yang sedang login' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">Segera Hadir</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Notifikasi */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">Preferensi Notifikasi</h2>
                <p className="text-sm text-slate-500 mt-0.5">Atur notifikasi yang ingin Anda terima</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Notifikasi Email', desc: 'Terima notifikasi penting melalui email' },
                  { label: 'Aktivitas Sistem', desc: 'Pemberitahuan perubahan data dan aktivitas log' },
                  { label: 'Laporan Bulanan', desc: 'Ringkasan laporan dikirim setiap bulan' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">Segera Hadir</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
