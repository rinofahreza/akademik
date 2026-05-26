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
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { User, Role } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const addSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
  role: z.string().min(1, 'Role wajib dipilih'),
  is_active: z.boolean(),
}).refine((d) => d.password === d.password_confirmation, { message: 'Konfirmasi password tidak cocok', path: ['password_confirmation'] });

const editSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  role: z.string().min(1, 'Role wajib dipilih'),
  is_active: z.boolean(),
}).refine((d) => !d.password || d.password === d.password_confirmation, { message: 'Konfirmasi password tidak cocok', path: ['password_confirmation'] });

type AddFormData = z.infer<typeof addSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function UsersPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, refresh } = useTable<User>({ endpoint: '/users' });
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const addForm = useForm<AddFormData>({ resolver: zodResolver(addSchema), defaultValues: { name: '', email: '', password: '', password_confirmation: '', role: '', is_active: true } });
  const editForm = useForm<EditFormData>({ resolver: zodResolver(editSchema), defaultValues: { name: '', email: '', password: '', password_confirmation: '', role: '', is_active: true } });

  useEffect(() => {
    api.get('/roles?all=true').then((res) => setRoles(res.data.data));
  }, []);

  const openAdd = () => { setEditing(null); addForm.reset(); setModalOpen(true); };
  const openEdit = (item: User) => {
    setEditing(item);
    editForm.reset({ name: item.name, email: item.email, password: '', password_confirmation: '', role: item.roles?.[0]?.name ?? '', is_active: item.is_active });
    setModalOpen(true);
  };

  const onSubmitAdd = async (formData: AddFormData) => {
    try {
      await api.post('/users', formData);
      toast.success('User berhasil ditambahkan');
      setModalOpen(false); refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      toast.error(e?.response?.data?.errors ? Object.values(e.response.data.errors).flat()[0] : e?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const onSubmitEdit = async (formData: EditFormData) => {
    try {
      await api.put(`/users/${editing!.id}`, formData);
      toast.success('User berhasil diperbarui');
      setModalOpen(false); refresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      toast.error(e?.response?.data?.errors ? Object.values(e.response.data.errors).flat()[0] : e?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/users/${deleteModal.id}`); toast.success('User berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Gagal menghapus');
    }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<User, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'email', header: 'Email' },
    { header: 'Role', cell: ({ row }) => <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">{row.original.roles?.[0]?.name ?? '-'}</span> },
    { header: 'Status', cell: ({ row }) => <Badge active={row.original.is_active} /> },
    {
      header: 'Aksi', cell: ({ row }) => (
        <div className="flex gap-2">
          {hasPermission('user.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('user.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  const RoleSelect = ({ formReg }: { formReg: ReturnType<typeof addForm.register> | ReturnType<typeof editForm.register> }) => (
    <select {...formReg} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
      <option value="">-- Pilih Role --</option>
      {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
    </select>
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Manajemen User" description="Kelola data user dan role" onAdd={openAdd} canAdd={hasPermission('user.create')} />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4"><SearchInput value="" onChange={setSearch} placeholder="Cari nama atau email..." /></div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Tambah User'} size="lg">
        {!editing ? (
          <form onSubmit={addForm.handleSubmit(onSubmitAdd)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama <span className="text-red-500">*</span></label>
              <input {...addForm.register('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              {addForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input {...addForm.register('email')} type="email" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              {addForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <input {...addForm.register('password')} type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                {addForm.formState.errors.password && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password <span className="text-red-500">*</span></label>
                <input {...addForm.register('password_confirmation')} type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                {addForm.formState.errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.password_confirmation.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <RoleSelect formReg={addForm.register('role')} />
              {addForm.formState.errors.role && <p className="mt-1 text-xs text-red-500">{addForm.formState.errors.role.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input {...addForm.register('is_active')} type="checkbox" id="is_active_add" className="h-4 w-4 rounded" />
              <label htmlFor="is_active_add" className="text-sm text-slate-700">Aktif</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={addForm.formState.isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{addForm.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama <span className="text-red-500">*</span></label>
              <input {...editForm.register('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              {editForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{editForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input {...editForm.register('email')} type="email" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru <span className="text-slate-400 text-xs">(kosongkan jika tidak diubah)</span></label>
                <input {...editForm.register('password')} type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password</label>
                <input {...editForm.register('password_confirmation')} type="password" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
                {editForm.formState.errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{editForm.formState.errors.password_confirmation.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role <span className="text-red-500">*</span></label>
              <RoleSelect formReg={editForm.register('role')} />
            </div>
            <div className="flex items-center gap-2">
              <input {...editForm.register('is_active')} type="checkbox" id="is_active_edit" className="h-4 w-4 rounded" />
              <label htmlFor="is_active_edit" className="text-sm text-slate-700">Aktif</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={editForm.formState.isSubmitting} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{editForm.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal open={deleteModal.open} onClose={() => setDeleteModal({ open: false })} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
