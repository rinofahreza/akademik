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
import { Pegawai, PegawaiCategory, PegawaiPosition, EmploymentStatus, Subject, TingkatPendidikan } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  nig: z.string().optional(),
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  nomor_hp: z.string().optional(),
  jenis_kelamin: z.enum(['L', 'P']),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  alamat: z.string().optional(),
  pegawai_category_id: z.string().min(1, 'Unit wajib dipilih'),
  pegawai_position_id: z.string().min(1, 'Posisi wajib dipilih'),
  employment_status_id: z.string().min(1, 'Status kerja wajib dipilih'),
  subject_id: z.string().optional(),
  tingkat_pendidikan_id: z.string().optional(),
  status: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function PegawaiPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, setParam, refresh } = useTable<Pegawai>({ endpoint: '/pegawai' });
  const [categories, setCategories] = useState<PegawaiCategory[]>([]);
  const [positions, setPositions] = useState<PegawaiPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<PegawaiPosition[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tingkats, setTingkats] = useState<TingkatPendidikan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; data?: Pegawai }>({ open: false });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [accountInfo, setAccountInfo] = useState<{ open: boolean; email: string; password: string; name: string }>({ open: false, email: '', password: '', name: '' });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Pegawai | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nig: '', nama_lengkap: '', email: '', nomor_hp: '', jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '', alamat: '', pegawai_category_id: '', pegawai_position_id: '', employment_status_id: '', subject_id: '', tingkat_pendidikan_id: '', status: true },
  });

  const watchedCategory = watch('pegawai_category_id');

  useEffect(() => {
    Promise.allSettled([
      api.get('/pegawai-categories?per_page=200'),
      api.get('/pegawai-positions?per_page=200'),
      api.get('/employment-statuses?per_page=200'),
      api.get('/subjects?per_page=200'),
      api.get('/tingkat-pendidikan?per_page=200'),
    ]).then(([c, p, e, s, t]) => {
      if (c.status === 'fulfilled') setCategories(c.value.data.data);
      if (p.status === 'fulfilled') { setPositions(p.value.data.data); setFilteredPositions(p.value.data.data); }
      if (e.status === 'fulfilled') setEmploymentStatuses(e.value.data.data);
      if (s.status === 'fulfilled') setSubjects(s.value.data.data);
      if (t.status === 'fulfilled') setTingkats(t.value.data.data);
    });
  }, []);

  useEffect(() => {
    if (watchedCategory) {
      setFilteredPositions(positions.filter((p) => String(p.pegawai_category_id) === watchedCategory));
    } else {
      setFilteredPositions(positions);
    }
  }, [watchedCategory, positions]);

  const openAdd = () => {
    setEditing(null);
    reset({ nig: '', nama_lengkap: '', email: '', nomor_hp: '', jenis_kelamin: 'L', tempat_lahir: '', tanggal_lahir: '', alamat: '', pegawai_category_id: '', pegawai_position_id: '', employment_status_id: '', subject_id: '', tingkat_pendidikan_id: '', status: true });
    setModalOpen(true);
  };

  const openEdit = (item: Pegawai) => {
    setEditing(item);
    reset({
      nig: item.nig ?? '',
      nama_lengkap: item.nama_lengkap,
      email: item.email ?? '',
      nomor_hp: item.nomor_hp ?? '',
      jenis_kelamin: item.jenis_kelamin,
      tempat_lahir: item.tempat_lahir ?? '',
      tanggal_lahir: item.tanggal_lahir ? item.tanggal_lahir.substring(0, 10) : '',
      alamat: item.alamat ?? '',
      pegawai_category_id: String(item.pegawai_category_id),
      pegawai_position_id: String(item.pegawai_position_id),
      employment_status_id: String(item.employment_status_id),
      subject_id: item.subject_id ? String(item.subject_id) : '',
      tingkat_pendidikan_id: item.tingkat_pendidikan_id ? String(item.tingkat_pendidikan_id) : '',
      status: item.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    const payload = {
      ...formData,
      nig: formData.nig || null,
      email: formData.email || null,
      nomor_hp: formData.nomor_hp || null,
      tempat_lahir: formData.tempat_lahir || null,
      tanggal_lahir: formData.tanggal_lahir || null,
      alamat: formData.alamat || null,
      subject_id: formData.subject_id || null,
      tingkat_pendidikan_id: formData.tingkat_pendidikan_id || null,
    };
    try {
      if (editing) {
        await api.put(`/pegawai/${editing.id}`, payload);
        toast.success('Berhasil diperbarui');
        setModalOpen(false); refresh();
      } else {
        const res = await api.post('/pegawai', payload);
        toast.success('Pegawai berhasil ditambahkan');
        setModalOpen(false); refresh();
        setAccountInfo({ open: true, email: res.data.login_email, password: res.data.default_password, name: formData.nama_lengkap });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = e?.response?.data?.errors ? Object.values(e.response.data.errors).flat()[0] : e?.response?.data?.message || 'Terjadi kesalahan';
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (item: Pegawai) => {
    try {
      await api.patch(`/pegawai/${item.id}/toggle-status`);
      refresh();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/pegawai/${deleteModal.id}`); toast.success('Berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<Pegawai, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'nig', header: 'NIG', cell: ({ row }) => row.original.nig ?? <span className="text-slate-400 text-xs">-</span> },
    { accessorKey: 'nama_lengkap', header: 'Nama Lengkap' },
    { header: 'Unit', cell: ({ row }) => <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{row.original.category?.name ?? '-'}</span> },
    { header: 'Posisi', cell: ({ row }) => row.original.position?.name ?? '-' },
    { header: 'Penempatan', cell: ({ row }) => row.original.tingkat_pendidikan ? <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">{row.original.tingkat_pendidikan.name}</span> : <span className="text-slate-400 text-xs">-</span> },
    { header: 'Status Kerja', cell: ({ row }) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{row.original.employment_status?.code ?? '-'}</span> },
    {
      header: 'Status',
      cell: ({ row }) => (
        <button
          onClick={() => hasPermission('pegawai.update') && handleToggleStatus(row.original)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
            row.original.status ? 'bg-emerald-500' : 'bg-slate-300'
          } ${hasPermission('pegawai.update') ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
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
          {hasPermission('pegawai.read') && <button onClick={() => setDetailModal({ open: true, data: row.original })} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><Eye size={15} /></button>}
          {hasPermission('pegawai.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('pegawai.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Data Pegawai" description="Kelola data pegawai" />
        <div className="flex items-center gap-2 flex-wrap">
          {(hasPermission('pegawai.create') || hasPermission('pegawai.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <Upload size={16} /> Import Excel
            </button>
          )}
          {(hasPermission('pegawai.read') || hasPermission('pegawai.create') || hasPermission('pegawai.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Download size={16} /> Export Excel
            </button>
          )}
          {hasPermission('pegawai.create') && (
            <button onClick={openAdd} className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
              + Tambah
            </button>
          )}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value="" onChange={setSearch} placeholder="Cari nama, NIG, email..." />
          <FilterSelect value="" onChange={(v) => setParam('pegawai_category_id', v)} options={categories.map((c) => ({ label: c.name, value: c.id }))} placeholder="Semua Unit" />
          <FilterSelect value="" onChange={(v) => setParam('employment_status_id', v)} options={employmentStatuses.map((e) => ({ label: e.name, value: e.id }))} placeholder="Semua Status Kerja" />
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pegawai' : 'Tambah Pegawai'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NIG</label>
              <input {...register('nig')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select {...register('jenis_kelamin')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input {...register('nama_lengkap')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            {errors.nama_lengkap && <p className="mt-1 text-xs text-red-500">{errors.nama_lengkap.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor HP</label>
              <input {...register('nomor_hp')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tempat Lahir</label>
              <input {...register('tempat_lahir')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir</label>
              <input {...register('tanggal_lahir')} type="date" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Pegawai <span className="text-red-500">*</span></label>
              <select {...register('pegawai_category_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.pegawai_category_id && <p className="mt-1 text-xs text-red-500">{errors.pegawai_category_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Posisi/Jabatan <span className="text-red-500">*</span></label>
              <select {...register('pegawai_position_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {filteredPositions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.pegawai_position_id && <p className="mt-1 text-xs text-red-500">{errors.pegawai_position_id.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Kerja <span className="text-red-500">*</span></label>
              <select {...register('employment_status_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {employmentStatuses.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
              </select>
              {errors.employment_status_id && <p className="mt-1 text-xs text-red-500">{errors.employment_status_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mata Pelajaran <span className="text-slate-400 text-xs">(Guru Bidang Studi)</span></label>
              <select {...register('subject_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Tidak Ada --</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Penempatan <span className="text-slate-400 text-xs">(Tingkat Pendidikan)</span></label>
            <select {...register('tingkat_pendidikan_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">-- Tidak Ada Penempatan --</option>
              {tingkats.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat</label>
            <textarea {...register('alamat')} rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={detailModal.open} onClose={() => setDetailModal({ open: false })} title="Detail Pegawai" size="lg">
        {detailModal.data && (
          <div className="space-y-3">
            {[
              ['NIG', detailModal.data.nig ?? '-'],
              ['Nama Lengkap', detailModal.data.nama_lengkap],
              ['Jenis Kelamin', detailModal.data.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
              ['Email', detailModal.data.email ?? '-'],
              ['Nomor HP', detailModal.data.nomor_hp ?? '-'],
              ['Tempat Lahir', detailModal.data.tempat_lahir ?? '-'],
              ['Tanggal Lahir', detailModal.data.tanggal_lahir ?? '-'],
              ['Unit', detailModal.data.category?.name ?? '-'],
              ['Posisi', detailModal.data.position?.name ?? '-'],
              ['Status Kerja', `${detailModal.data.employment_status?.name ?? '-'} (${detailModal.data.employment_status?.code ?? '-'})`],
              ['Mata Pelajaran', detailModal.data.subject?.name ?? '-'],
              ['Penempatan', detailModal.data.tingkat_pendidikan?.name ?? '-'],
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
