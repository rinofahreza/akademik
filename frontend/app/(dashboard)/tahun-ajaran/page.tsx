'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Badge from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { TahunAjaran } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  nama_tahun_ajaran: z.string().min(1, 'Nama wajib diisi'),
  tanggal_mulai: z.string().min(1, 'Tanggal mulai wajib diisi'),
  tanggal_selesai: z.string().min(1, 'Tanggal selesai wajib diisi'),
  is_active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function TahunAjaranPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, refresh } = useTable<TahunAjaran>({ endpoint: '/tahun-ajaran' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<TahunAjaran | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nama_tahun_ajaran: '', tanggal_mulai: '', tanggal_selesai: '', is_active: false },
  });

  const openAdd = () => { setEditing(null); reset({ nama_tahun_ajaran: '', tanggal_mulai: '', tanggal_selesai: '', is_active: false }); setModalOpen(true); };
  const openEdit = (item: TahunAjaran) => {
    setEditing(item);
    reset({
      nama_tahun_ajaran: item.nama_tahun_ajaran,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) {
        await api.put(`/tahun-ajaran/${editing.id}`, formData);
        toast.success('Berhasil diperbarui');
      } else {
        await api.post('/tahun-ajaran', formData);
        toast.success('Berhasil ditambahkan');
      }
      setModalOpen(false);
      refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan';
      toast.error(msg);
    }
  };

  const handleSetActive = async (item: TahunAjaran) => {
    try {
      await api.put(`/tahun-ajaran/${item.id}/set-active`);
      toast.success(`${item.nama_tahun_ajaran} dijadikan aktif`);
      refresh();
    } catch {
      toast.error('Gagal mengaktifkan tahun ajaran');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await api.delete(`/tahun-ajaran/${deleteModal.id}`);
      toast.success('Berhasil dihapus');
      setDeleteModal({ open: false });
      refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<TahunAjaran, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1, size: 60 },
    { accessorKey: 'nama_tahun_ajaran', header: 'Tahun Ajaran' },
    { accessorKey: 'tanggal_mulai', header: 'Mulai' },
    { accessorKey: 'tanggal_selesai', header: 'Selesai' },
    { accessorKey: 'is_active', header: 'Status', cell: ({ row }) => <Badge active={row.original.is_active} activeLabel="Aktif" inactiveLabel="Tidak Aktif" /> },
    {
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission('tahun-ajaran.update') && !row.original.is_active && (
            <button onClick={() => handleSetActive(row.original)} className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors" title="Set Aktif">
              <CheckCircle size={15} />
            </button>
          )}
          {hasPermission('tahun-ajaran.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
              <Pencil size={15} />
            </button>
          )}
          {hasPermission('tahun-ajaran.delete') && (
            <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Tahun Ajaran" description="Kelola data tahun ajaran" onAdd={openAdd} canAdd={hasPermission('tahun-ajaran.create')} />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4"><SearchInput value="" onChange={setSearch} placeholder="Cari tahun ajaran..." /></div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Tahun Ajaran <span className="text-red-500">*</span></label>
            <input {...register('nama_tahun_ajaran')} placeholder="2025/2026" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            {errors.nama_tahun_ajaran && <p className="mt-1 text-xs text-red-500">{errors.nama_tahun_ajaran.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input {...register('tanggal_mulai')} type="date" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              {errors.tanggal_mulai && <p className="mt-1 text-xs text-red-500">{errors.tanggal_mulai.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input {...register('tanggal_selesai')} type="date" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              {errors.tanggal_selesai && <p className="mt-1 text-xs text-red-500">{errors.tanggal_selesai.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input {...register('is_active')} type="checkbox" id="is_active" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            <label htmlFor="is_active" className="text-sm text-slate-700">Set sebagai tahun ajaran aktif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
