'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import FilterSelect from '@/components/ui/FilterSelect';
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { Kelas, TingkatPendidikan, TahunAjaran, Pegawai } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  tingkat_pendidikan_id: z.string().min(1, 'Tingkat pendidikan wajib dipilih'),
  tahun_ajaran_id: z.string().min(1, 'Tahun ajaran wajib dipilih'),
  nama_kelas: z.string().min(1, 'Nama kelas wajib diisi'),
  wali_kelas_id: z.string().optional(),
  status: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function KelasPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, setParam, refresh } = useTable<Kelas>({ endpoint: '/kelas' });
  const [tingkats, setTingkats] = useState<TingkatPendidikan[]>([]);
  const [tahunAjarans, setTahunAjarans] = useState<TahunAjaran[]>([]);
  const [pegawais, setPegawais] = useState<Pegawai[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Kelas | null>(null);
  const [filterTahunAjaran, setFilterTahunAjaran] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tingkat_pendidikan_id: '', tahun_ajaran_id: '', nama_kelas: '', wali_kelas_id: '', status: true },
  });

  useEffect(() => {
    Promise.allSettled([
      api.get('/tingkat-pendidikan?per_page=200'),
      api.get('/tahun-ajaran?per_page=200'),
      api.get('/pegawai?per_page=200'),
    ]).then(([t, ta, p]) => {
      if (t.status === 'fulfilled') setTingkats(t.value.data.data);
      if (ta.status === 'fulfilled') {
        const list: TahunAjaran[] = ta.value.data.data;
        setTahunAjarans(list);
        const aktif = list.find((ta) => ta.is_active);
        if (aktif) {
          setParam('tahun_ajaran_id', String(aktif.id));
          setFilterTahunAjaran(String(aktif.id));
        }
      }
      if (p.status === 'fulfilled') setPegawais(p.value.data.data);
    });
  }, []);

  const openAdd = () => { setEditing(null); reset({ tingkat_pendidikan_id: '', tahun_ajaran_id: '', nama_kelas: '', wali_kelas_id: '', status: true }); setModalOpen(true); };
  const openEdit = (item: Kelas) => {
    setEditing(item);
    reset({
      tingkat_pendidikan_id: String(item.tingkat_pendidikan_id),
      tahun_ajaran_id: String(item.tahun_ajaran_id),
      nama_kelas: item.nama_kelas,
      wali_kelas_id: item.wali_kelas_id ? String(item.wali_kelas_id) : '',
      status: item.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    const payload = { ...formData, wali_kelas_id: formData.wali_kelas_id || null };
    try {
      if (editing) { await api.put(`/kelas/${editing.id}`, payload); toast.success('Berhasil diperbarui'); }
      else { await api.post('/kelas', payload); toast.success('Berhasil ditambahkan'); }
      setModalOpen(false); refresh();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/kelas/${deleteModal.id}`); toast.success('Berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<Kelas, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nama_kelas', header: 'Nama Kelas' },
    { header: 'Tingkat', cell: ({ row }) => row.original.tingkat_pendidikan?.name ?? '-' },
    { header: 'Tahun Ajaran', cell: ({ row }) => row.original.tahun_ajaran?.nama_tahun_ajaran ?? '-' },
    { header: 'Wali Kelas', cell: ({ row }) => row.original.wali_kelas?.nama_lengkap ?? <span className="text-slate-400 text-xs">Belum ada</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge active={row.original.status} /> },
    {
      header: 'Aksi', cell: ({ row }) => (
        <div className="flex gap-2">
          {hasPermission('kelas.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('kelas.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Kelas" description="Kelola data kelas" onAdd={openAdd} canAdd={hasPermission('kelas.create')} />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value="" onChange={setSearch} placeholder="Cari nama kelas..." />
          <FilterSelect value="" onChange={(v) => setParam('tingkat_pendidikan_id', v)} options={tingkats.map((t) => ({ label: t.name, value: t.id }))} placeholder="Semua Tingkat" />
          <FilterSelect value={filterTahunAjaran} onChange={(v) => { setFilterTahunAjaran(v); setParam('tahun_ajaran_id', v); }} options={tahunAjarans.map((t) => ({ label: t.nama_tahun_ajaran, value: t.id }))} placeholder="Semua Tahun Ajaran" />
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Kelas' : 'Tambah Kelas'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tingkat Pendidikan <span className="text-red-500">*</span></label>
              <select {...register('tingkat_pendidikan_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tingkats.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.tingkat_pendidikan_id && <p className="mt-1 text-xs text-red-500">{errors.tingkat_pendidikan_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun Ajaran <span className="text-red-500">*</span></label>
              <select {...register('tahun_ajaran_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tahunAjarans.map((t) => <option key={t.id} value={t.id}>{t.nama_tahun_ajaran}</option>)}
              </select>
              {errors.tahun_ajaran_id && <p className="mt-1 text-xs text-red-500">{errors.tahun_ajaran_id.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Kelas <span className="text-red-500">*</span></label>
            <input {...register('nama_kelas')} placeholder="Kelas 1A" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            {errors.nama_kelas && <p className="mt-1 text-xs text-red-500">{errors.nama_kelas.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Wali Kelas</label>
            <select {...register('wali_kelas_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">-- Tidak Ada --</option>
              {pegawais.map((p) => <option key={p.id} value={p.id}>{p.nama_lengkap}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input {...register('status')} type="checkbox" id="status" className="h-4 w-4 rounded" />
            <label htmlFor="status" className="text-sm text-slate-700">Aktif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
