'use client';

import { useState } from 'react';
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
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { TingkatPendidikan } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  status: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function TingkatPendidikanPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, refresh } = useTable<TingkatPendidikan>({ endpoint: '/tingkat-pendidikan' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<TingkatPendidikan | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', status: true },
  });

  const openAdd = () => { setEditing(null); reset({ name: '', status: true }); setModalOpen(true); };
  const openEdit = (item: TingkatPendidikan) => { setEditing(item); reset({ name: item.name, status: item.status }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) {
        await api.put(`/tingkat-pendidikan/${editing.id}`, data);
        toast.success('Berhasil diperbarui');
      } else {
        await api.post('/tingkat-pendidikan', data);
        toast.success('Berhasil ditambahkan');
      }
      setModalOpen(false);
      refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await api.delete(`/tingkat-pendidikan/${deleteModal.id}`);
      toast.success('Berhasil dihapus');
      setDeleteModal({ open: false });
      refresh();
    } catch {
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<TingkatPendidikan, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1, size: 60 },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Nama Tingkat Pendidikan' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge active={row.original.status} /> },
    {
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission('tingkat-pendidikan.update') && (
            <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
              <Pencil size={15} />
            </button>
          )}
          {hasPermission('tingkat-pendidikan.delete') && (
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
      <PageHeader
        title="Tingkat Pendidikan"
        description="Kelola data tingkat pendidikan"
        onAdd={openAdd}
        canAdd={hasPermission('tingkat-pendidikan.create')}
      />

      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <SearchInput value="" onChange={setSearch} placeholder="Cari tingkat pendidikan..." />
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tingkat Pendidikan' : 'Tambah Tingkat Pendidikan'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama <span className="text-red-500">*</span></label>
            <input {...register('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input {...register('status')} type="checkbox" id="status" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            <label htmlFor="status" className="text-sm text-slate-700">Aktif</label>
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
