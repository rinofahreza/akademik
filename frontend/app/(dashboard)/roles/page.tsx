'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import { Role, Permission } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const resourceLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'user': 'User',
  'role': 'Role',
  'siswa': 'Siswa',
  'siswa-kelas': 'Penempatan Kelas',
  'pegawai': 'Pegawai',
  'kelas': 'Kelas',
  'subject': 'Mata Pelajaran',
  'tingkat-pendidikan': 'Tingkat Pendidikan',
  'tahun-ajaran': 'Tahun Ajaran',
  'pegawai-category': 'Unit Pegawai',
  'pegawai-position': 'Posisi/Jabatan Pegawai',
  'employment-status': 'Status Kerja',
  'activity-log': 'Activity Log',
  'settings': 'Pengaturan',
};

const schema = z.object({
  name: z.string().min(1, 'Nama role wajib diisi'),
  permissions: z.array(z.string()),
});
type FormData = z.infer<typeof schema>;

export default function RolesPage() {
  const { hasPermission } = useAuthStore();
  const { data, meta, loading, setSearch, setPage, setPerPage, refresh } = useTable<Role>({ endpoint: '/roles' });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPerms, setGroupedPerms] = useState<Record<string, Permission[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({ open: false });
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', permissions: [] },
  });

  useEffect(() => {
    api.get('/permissions').then((res) => {
      const perms: Permission[] = res.data.data;
      setAllPermissions(perms);
      const grouped: Record<string, Permission[]> = {};
      perms.forEach((p) => {
        const [resource] = p.name.split('.');
        if (!grouped[resource]) grouped[resource] = [];
        grouped[resource].push(p);
      });
      setGroupedPerms(grouped);
    });
  }, []);

  const openAdd = () => { setEditing(null); reset({ name: '', permissions: [] }); setModalOpen(true); };
  const openEdit = (item: Role) => {
    setEditing(item);
    reset({ name: item.name, permissions: item.permissions?.map((p) => p.name) ?? [] });
    setModalOpen(true);
  };

  const onSubmit = async (formData: FormData) => {
    try {
      if (editing) { await api.put(`/roles/${editing.id}`, formData); toast.success('Role berhasil diperbarui'); }
      else { await api.post('/roles', formData); toast.success('Role berhasil ditambahkan'); }
      setModalOpen(false); refresh();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try { await api.delete(`/roles/${deleteModal.id}`); toast.success('Role berhasil dihapus'); setDeleteModal({ open: false }); refresh(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  const columns: ColumnDef<Role, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'name', header: 'Nama Role' },
    {
      header: 'Permissions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.original.permissions ?? []).slice(0, 5).map((p) => (
            <span key={p.name} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{p.name}</span>
          ))}
          {(row.original.permissions?.length ?? 0) > 5 && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">+{(row.original.permissions?.length ?? 0) - 5} lainnya</span>
          )}
        </div>
      ),
    },
    {
      header: 'Aksi', cell: ({ row }) => (
        <div className="flex gap-2">
          {hasPermission('role.update') && <button onClick={() => openEdit(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil size={15} /></button>}
          {hasPermission('role.delete') && <button onClick={() => setDeleteModal({ open: true, id: row.original.id })} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Roles & Permissions" description="Kelola role dan permission user" onAdd={openAdd} canAdd={hasPermission('role.create')} addLabel="Tambah Role" />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4"><SearchInput value="" onChange={setSearch} placeholder="Cari role..." /></div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>


      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Role' : 'Tambah Role'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Role <span className="text-red-500">*</span></label>
            <input {...register('name')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-3 space-y-4">
              <Controller
                name="permissions"
                control={control}
                render={({ field }) => (
                  <>
                    {Object.entries(groupedPerms).map(([resource, perms]) => (
                      <div key={resource}>
                        <p className="text-xs font-semibold uppercase text-slate-500 mb-2">{resourceLabels[resource] ?? resource}</p>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((perm) => {
                            const checked = field.value.includes(perm.name);
                            return (
                              <label key={perm.id} className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) field.onChange([...field.value, perm.name]);
                                    else field.onChange(field.value.filter((v) => v !== perm.name));
                                  }}
                                  className="hidden"
                                />
                                {perm.name.split('.')[1]}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
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
