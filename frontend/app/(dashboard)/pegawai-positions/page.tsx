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
import { PegawaiPosition, PegawaiCategory } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  pegawai_category_id: z.string().min(1, 'Unit wajib dipilih'),
  name: z.string().min(1, 'Nama wajib diisi'),
  status: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function PegawaiPositionsPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, setParam, refresh } = useTable<PegawaiPosition>({ endpoint: '/pegawai-positions' });
  const [categories, setCategories] = useState<PegawaiCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<PegawaiPosition | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pegawai_category_id: '', name: '', status: true },
  });

  useEffect(() => {
    api.get('/pegawai-categories?all=true').then((res) => setCategories(res.data.data));
  }, []);

  const openAdd = () => { setEditing(null); reset({ pegawai_category_id: '', name: '', status: true }); setModalOpen(true); };
  const openEdit = (item: PegawaiPosition) => {
    setEditing(item);
    reset({ pegawai_category_id: String(item.pegawai_category_id), name: item.name, status: item.status });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) { await api.put(`/pegawai-positions/${editing.id}`, formData); toast.success('Berhasil diperbarui'); }
      else { await api.post('/pegawai-positions', formData); toast.success('Berhasil ditambahkan'); }
      setModalOpen(false); refresh();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/pegawai-positions/${deleteModal.id}`); toast.success('Berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<PegawaiPosition, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Nama Posisi/Jabatan' },
    { header: 'Unit', cell: ({ row }) => <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{row.original.category?.name ?? '-'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge active={row.original.status} /> },
    {
      header: 'Aksi', cell: ({ row }) => (
        <div className="flex gap-2">
          {hasPermission('pegawai-position.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('pegawai-position.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Posisi/Jabatan Pegawai" description="Kelola posisi dan jabatan pegawai" onAdd={openAdd} canAdd={hasPermission('pegawai-position.create')} />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <SearchInput value="" onChange={setSearch} placeholder="Cari posisi..." />
          <FilterSelect
            value=""
            onChange={(v) => setParam('pegawai_category_id', v)}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
            placeholder="Semua Unit"
          />
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Posisi' : 'Tambah Posisi'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Pegawai <span className="text-red-500">*</span></label>
            <select {...register('pegawai_category_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">-- Pilih Unit --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.pegawai_category_id && <p className="mt-1 text-xs text-red-500">{errors.pegawai_category_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Posisi <span className="text-red-500">*</span></label>
            <input {...register('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
