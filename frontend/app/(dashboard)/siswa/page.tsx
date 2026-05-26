'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Eye, Upload, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AccountInfoModal from '@/components/ui/AccountInfoModal';
import SearchInput from '@/components/ui/SearchInput';
import FilterSelect from '@/components/ui/FilterSelect';
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { Siswa, TingkatPendidikan, TahunAjaran, Kelas } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  kode_bayar: z.string().length(7, 'Kode bayar harus 7 digit').regex(/^[0-9]{7}$/, 'Kode bayar hanya boleh angka'),
  nomor_induk: z.string().optional(),
  nisn: z.string().optional(),
  no_kk: z.string().length(16, 'No KK harus 16 digit').regex(/^[0-9]{16}$/, 'No KK hanya boleh angka'),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^[0-9]{16}$/, 'NIK hanya boleh angka').optional().or(z.literal('')),
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  jenis_kelamin: z.enum(['L', 'P']),
  tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  alamat: z.string().optional(),
  telepon_orang_tua: z.string().optional().or(z.literal('')),
  tingkat_pendidikan_id: z.string().min(1, 'Tingkat pendidikan wajib dipilih'),
  kelas_id: z.string().optional(),
  tahun_ajaran_id: z.string().optional(),
  status: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function SiswaPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, setParam, refresh } = useTable<Siswa>({ endpoint: '/siswa' });
  const [tingkats, setTingkats] = useState<TingkatPendidikan[]>([]);
  const [tahunAjarans, setTahunAjarans] = useState<TahunAjaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [filteredKelas, setFilteredKelas] = useState<Kelas[]>([]);
  const [filterKelas, setFilterKelas] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: Siswa }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [accountInfo, setAccountInfo] = useState<{ open: boolean; email: string; password: string; name: string }>({ open: false, email: '', password: '', name: '' });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Siswa | null>(null);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kode_bayar: '', nomor_induk: '', nisn: '', no_kk: '', nik: '', nama_lengkap: '', jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '', alamat: '', tingkat_pendidikan_id: '', kelas_id: '', tahun_ajaran_id: '', status: true },
  });

  const watchedTingkat = watch('tingkat_pendidikan_id');
  const watchedTahunAjaran = watch('tahun_ajaran_id');

  useEffect(() => {
    Promise.allSettled([
      api.get('/tingkat-pendidikan?per_page=200'),
      api.get('/tahun-ajaran?per_page=200'),
      api.get('/kelas?per_page=200'),
    ]).then(([t, ta, k]) => {
      if (t.status === 'fulfilled') setTingkats(t.value.data.data);
      if (ta.status === 'fulfilled') {
        setTahunAjarans(ta.value.data.data);
      }
      if (k.status === 'fulfilled') {
        const kList: Kelas[] = k.value.data.data;
        setKelasList(kList);
        setFilteredKelas(kList);
      }
    });
  }, []);

  useEffect(() => {
    if (watchedTingkat) {
      setFilteredKelas(kelasList.filter((k) => String(k.tingkat_pendidikan_id) === watchedTingkat));
    } else {
      setFilteredKelas(kelasList);
    }
  }, [watchedTingkat, kelasList]);

  const openAdd = () => { setEditing(null); reset({ kode_bayar: '', nomor_induk: '', nisn: '', no_kk: '', nik: '', nama_lengkap: '', jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '', alamat: '', telepon_orang_tua: '', tingkat_pendidikan_id: '', kelas_id: '', tahun_ajaran_id: '', status: true }); setModalOpen(true); };
  const openEdit = (item: Siswa) => {
    setEditing(item);
    reset({
      kode_bayar: item.kode_bayar,
      nomor_induk: item.nomor_induk ?? '',
      nisn: item.nisn ?? '',
      no_kk: item.no_kk ?? '',
      nik: item.nik ?? '',
      nama_lengkap: item.nama_lengkap,
      jenis_kelamin: item.jenis_kelamin,
      tempat_lahir: item.tempat_lahir,
      tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '',
      alamat: item.alamat ?? '',
      telepon_orang_tua: (item as any).telepon_orang_tua ?? '',
      tingkat_pendidikan_id: String(item.tingkat_pendidikan_id),
      kelas_id: String(item.kelas_records?.[0]?.kelas_id ?? ''),
      tahun_ajaran_id: String(item.kelas_records?.[0]?.tahun_ajaran_id ?? ''),
      status: item.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    const payload = { ...formData, nomor_induk: formData.nomor_induk || null, nisn: formData.nisn || null, nik: formData.nik || null, alamat: formData.alamat || null, telepon_orang_tua: formData.telepon_orang_tua || null };
    try {
      if (editing) {
        await api.put(`/siswa/${editing.id}`, payload);
        toast.success('Berhasil diperbarui');
        setModalOpen(false);
        refresh();
      } else {
        const res = await api.post('/siswa', payload);
        toast.success('Siswa berhasil ditambahkan');
        setModalOpen(false);
        refresh();
        setAccountInfo({ open: true, email: res.data.login_email, password: res.data.default_password, name: formData.nama_lengkap });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = e?.response?.data?.errors ? Object.values(e.response.data.errors).flat()[0] : e?.response?.data?.message || 'Terjadi kesalahan';
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (item: Siswa) => {
    try {
      await api.patch(`/siswa/${item.id}/toggle-status`);
      refresh();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/siswa/${deleteModal.id}`); toast.success('Berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<Siswa, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'kode_bayar', header: 'Kode Bayar' },
    { header: 'No. Induk', cell: ({ row }) => row.original.nomor_induk ?? <span className="text-slate-400 text-xs">-</span> },
    { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
    { header: 'L/P', cell: ({ row }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${row.original.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{row.original.jenis_kelamin}</span> },
    { header: 'Kelas', cell: ({ row }) => {
      const tingkat = row.original.tingkat_pendidikan?.name ?? '';
      const kelasRecords = row.original.kelas_records;
      const kelasRecord = Array.isArray(kelasRecords) && kelasRecords.length > 0 ? kelasRecords[0] : null;
      const kelas = kelasRecord?.kelas?.nama_kelas ?? '';
      return kelas ? <span className="font-medium text-xs">{tingkat}-{kelas}</span> : <span className="text-slate-400 text-xs">Belum ditempatkan</span>;
    } },
    {
      header: 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => hasPermission('siswa.update') && handleToggleStatus(row.original)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            row.original.status ? 'bg-emerald-500' : 'bg-slate-300'
          } ${hasPermission('siswa.update') ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            row.original.status ? 'translate-x-[18px]' : 'translate-x-1'
          }`} />
        </button>
      ),
    },
    {
      header: 'Akun',
      cell: ({ row }) => row.original.user
        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">✓ Ada</span>
        : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">-</span>,
    },
    {
      header: 'Aksi', cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission('siswa.read') && <button onClick={() => setDetailModal({ open: true, data: row.original })} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><Eye size={15} /></button>}
          {hasPermission('siswa.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('siswa.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Data Siswa" description="Kelola data siswa" />
        <div className="flex items-center gap-2 flex-wrap">
          {(hasPermission('siswa.create') || hasPermission('siswa.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <Upload size={16} /> Import Excel
            </button>
          )}
          {(hasPermission('siswa.read') || hasPermission('siswa.create') || hasPermission('siswa.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Download size={16} /> Export Excel
            </button>
          )}
          {hasPermission('siswa.create') && (
            <button onClick={openAdd} className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
              + Tambah
            </button>
          )}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value="" onChange={setSearch} placeholder="Cari nama, NIS, NISN..." />
          <FilterSelect value="" onChange={(v) => setParam('tingkat_pendidikan_id', v)} options={tingkats.map((t) => ({ label: t.name, value: t.id }))} placeholder="Semua Tingkat" />
          <FilterSelect value={filterKelas} onChange={(v) => { setFilterKelas(v); setParam('kelas_id', v); }} options={filteredKelas.map((k) => ({ label: k.nama_kelas, value: k.id }))} placeholder="Semua Kelas" />
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Siswa' : 'Tambah Siswa'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kode Bayar <span className="text-red-500">*</span></label>
            <input {...register('kode_bayar')} maxLength={7} placeholder="7 digit angka" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none font-mono tracking-widest" />
            {errors.kode_bayar && <p className="mt-1 text-xs text-red-500">{errors.kode_bayar.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Induk</label>
              <input {...register('nomor_induk')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              {errors.nomor_induk && <p className="mt-1 text-xs text-red-500">{errors.nomor_induk.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NISN</label>
              <input {...register('nisn')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">No KK <span className="text-red-500">*</span></label>
              <input {...register('no_kk')} maxLength={16} placeholder="16 digit angka" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none font-mono tracking-widest" />
              {errors.no_kk && <p className="mt-1 text-xs text-red-500">{errors.no_kk.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NIK</label>
              <input {...register('nik')} maxLength={16} placeholder="16 digit angka" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none font-mono tracking-widest" />
              {errors.nik && <p className="mt-1 text-xs text-red-500">{errors.nik.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input {...register('nama_lengkap')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            {errors.nama_lengkap && <p className="mt-1 text-xs text-red-500">{errors.nama_lengkap.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Kelamin <span className="text-red-500">*</span></label>
              <select {...register('jenis_kelamin')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tempat Lahir <span className="text-red-500">*</span></label>
              <input {...register('tempat_lahir')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              {errors.tempat_lahir && <p className="mt-1 text-xs text-red-500">{errors.tempat_lahir.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir <span className="text-red-500">*</span></label>
            <input {...register('tanggal_lahir')} type="date" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            {errors.tanggal_lahir && <p className="mt-1 text-xs text-red-500">{errors.tanggal_lahir.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tingkat Pendidikan <span className="text-red-500">*</span></label>
              <select {...register('tingkat_pendidikan_id')} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tingkats.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.tingkat_pendidikan_id && <p className="mt-1 text-xs text-red-500">{errors.tingkat_pendidikan_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas <span className="text-slate-400 text-xs font-normal">(opsional)</span></label>
              <select {...register('kelas_id')} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {filteredKelas.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun Ajaran <span className="text-slate-400 text-xs font-normal">(opsional)</span></label>
              <select {...register('tahun_ajaran_id')} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tahunAjarans.filter((t) => t.is_active).map((t) => <option key={t.id} value={t.id}>{t.nama_tahun_ajaran}</option>)}
              </select>
              <p className="mt-1 text-xs text-slate-400">Penempatan kelas dapat dikelola di menu Penempatan Kelas</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat</label>
            <textarea {...register('alamat')} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telepon Orang Tua <span className="text-slate-400 text-xs font-normal">(opsional)</span></label>
            <input {...register('telepon_orang_tua')} placeholder="+62xxxxxxxxxxx" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailModal.open} onClose={() => setDetailModal({ open: false })} title="Detail Siswa" size="lg">
        {detailModal.data && (
          <div className="space-y-3">
            {[
              ['Kode Bayar', detailModal.data.kode_bayar],
              ['Nomor Induk', detailModal.data.nomor_induk ?? '-'],
              ['NISN', detailModal.data.nisn ?? '-'],
              ['No KK', detailModal.data.no_kk ?? '-'],
              ['NIK', detailModal.data.nik ?? '-'],
              ['Nama Lengkap', detailModal.data.nama_lengkap],
              ['Jenis Kelamin', detailModal.data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
              ['Tempat Lahir', detailModal.data.tempat_lahir],
              ['Tanggal Lahir', detailModal.data.tanggal_lahir],
              ['Tingkat', detailModal.data.tingkat_pendidikan?.name ?? '-'],
              ['Kelas Aktif', detailModal.data.kelasAktif?.kelas?.nama_kelas ?? 'Belum ditempatkan'],
              ['Tahun Ajaran', detailModal.data.kelasAktif?.tahun_ajaran?.nama_tahun_ajaran ?? '-'],
              ['Alamat', detailModal.data.alamat ?? '-'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500 w-36 shrink-0">{label}</span>
                <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} onConfirm={handleDelete} loading={deleting} />

      <AccountInfoModal
        open={accountInfo.open}
        onClose={() => setAccountInfo({ ...accountInfo, open: false })}
        email={accountInfo.email}
        password={accountInfo.password}
        name={accountInfo.name}
      />
    </div>
  );
}
