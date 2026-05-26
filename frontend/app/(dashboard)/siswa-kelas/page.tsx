'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Users, ArrowUpCircle, Settings2, ChevronRight, ChevronLeft, Search, X, Eye, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/ui/Modal';
import FilterSelect from '@/components/ui/FilterSelect';
import SearchInput from '@/components/ui/SearchInput';
import PageHeader from '@/components/ui/PageHeader';
import { TahunAjaran, Kelas, Siswa } from '@/lib/types';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const massalSchema = z.object({
  dari_tahun_ajaran_id: z.string().min(1, 'Tahun ajaran asal wajib dipilih'),
  ke_tahun_ajaran_id: z.string().min(1, 'Tahun ajaran tujuan wajib dipilih'),
});
type MassalFormData = z.infer<typeof massalSchema>;

interface KelasItem {
  id: number;
  nama_kelas: string;
  tahun_ajaran_id: number;
  tahun_ajaran: TahunAjaran;
  tingkat_pendidikan_id: number;
  tingkat_pendidikan: { id: number; name: string };
  wali_kelas: { nama_lengkap: string } | null;
  jumlah_siswa: number;
  status: boolean;
}

interface KelasMapping { dari_kelas_id: string; ke_kelas_id: string; }

interface SiswaWithKelasId extends Siswa { siswa_kelas_id?: number; }

export default function SiswaKelasPage() {
  const { hasPermission } = useAuthStore();

  const [tahunAjarans, setTahunAjarans] = useState<TahunAjaran[]>([]);
  const [allKelas, setAllKelas] = useState<Kelas[]>([]);
  const [kelasSummary, setKelasSummary] = useState<KelasItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryMeta, setSummaryMeta] = useState({ current_page: 1, per_page: 20, total: 0, last_page: 1 });
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryPerPage, setSummaryPerPage] = useState(20);
  const [summarySearch, setSummarySearch] = useState('');

  const [filterTahunAjaran, setFilterTahunAjaran] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tingkats, setTingkats] = useState<{ id: number; name: string }[]>([]);

  const [kelolaOpen, setKelolaOpen] = useState(false);
  const [lihatOpen, setLihatOpen] = useState(false);
  const [massalOpen, setMassalOpen] = useState(false);

  const [selectedKelas, setSelectedKelas] = useState<KelasItem | null>(null);
  const [terdaftar, setTerdaftar] = useState<SiswaWithKelasId[]>([]);
  const [belumTerdaftar, setBelumTerdaftar] = useState<Siswa[]>([]);
  const [kelolaLoading, setKelolaLoading] = useState(false);

  const [searchKiri, setSearchKiri] = useState('');
  const [searchKanan, setSearchKanan] = useState('');
  const [checkedKiri, setCheckedKiri] = useState<Set<number>>(new Set());
  const [checkedKanan, setCheckedKanan] = useState<Set<number>>(new Set());

  // Pagination untuk kolom kiri (belum terdaftar)
  const [kiriPage, setKiriPage] = useState(1);
  const [kiriPerPage] = useState(50);
  const [kiriMeta, setKiriMeta] = useState({ current_page: 1, per_page: 50, total: 0, last_page: 1 });

  const [pendingTambah, setPendingTambah] = useState<Siswa[]>([]);
  const [pendingHapus, setPendingHapus] = useState<SiswaWithKelasId[]>([]);
  const [saving, setSaving] = useState(false);

  const [kelasMapping, setKelasMapping] = useState<KelasMapping[]>([{ dari_kelas_id: '', ke_kelas_id: '' }]);
  const [submittingMassal, setSubmittingMassal] = useState(false);

  const { register: regMassal, handleSubmit: handleMassal, watch: watchMassal, formState: { errors: errMassal } } = useForm<MassalFormData>({
    resolver: zodResolver(massalSchema),
    defaultValues: { dari_tahun_ajaran_id: '', ke_tahun_ajaran_id: '' },
  });

  const watchedDariTahun = watchMassal('dari_tahun_ajaran_id');
  const watchedKeTahun = watchMassal('ke_tahun_ajaran_id');

  const kelasDariTahun = useMemo(() => allKelas.filter((k) => String(k.tahun_ajaran_id) === watchedDariTahun), [allKelas, watchedDariTahun]);
  const kelasKeTahun = useMemo(() => allKelas.filter((k) => String(k.tahun_ajaran_id) === watchedKeTahun), [allKelas, watchedKeTahun]);

  const loadSummary = useCallback((tahunAjaranId: string, tingkatId: string, page = 1, perPage = 20, search = '') => {
    setSummaryLoading(true);
    const params = new URLSearchParams();
    if (tahunAjaranId) params.set('tahun_ajaran_id', tahunAjaranId);
    if (tingkatId) params.set('tingkat_pendidikan_id', tingkatId);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    api.get(`/siswa-kelas/kelas-summary?${params.toString()}`)
      .then((r) => { setKelasSummary(r.data.data); setSummaryMeta(r.data.meta); })
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    Promise.allSettled([
      api.get('/tahun-ajaran?per_page=200'),
      api.get('/tingkat-pendidikan?per_page=200'),
      api.get('/kelas?per_page=200'),
    ]).then(([ta, tp, k]) => {
      if (ta.status === 'fulfilled') {
        const list: TahunAjaran[] = ta.value.data.data;
        setTahunAjarans(list);
        const aktif = list.find((t) => t.is_active);
        if (aktif) {
          setFilterTahunAjaran(String(aktif.id));
          loadSummary(String(aktif.id), '', 1, 20, '');
        } else {
          loadSummary('', '', 1, 20, '');
        }
      }
      if (tp.status === 'fulfilled') setTingkats(tp.value.data.data);
      if (k.status === 'fulfilled') setAllKelas(k.value.data.data);
    });
  }, []);

  const handleFilterChange = (tahunAjaranId: string, tingkatId: string) => {
    setSummaryPage(1);
    loadSummary(tahunAjaranId, tingkatId, 1, summaryPerPage, summarySearch);
  };

  const loadKelolaData = async (kelas: KelasItem, page = 1, search = '') => {
    setKelolaLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('tahun_ajaran_id', String(kelas.tahun_ajaran_id));
      params.set('page_belum', String(page));
      params.set('per_page', String(kiriPerPage));
      if (search) params.set('search', search);
      const res = await api.get(`/siswa-kelas/kelas/${kelas.id}/siswa?${params.toString()}`);
      setTerdaftar(res.data.data.terdaftar);
      setBelumTerdaftar(res.data.data.belum_terdaftar);
      setKiriMeta(res.data.data.belum_meta || { current_page: 1, per_page: 50, total: 0, last_page: 1 });
    } catch {
      toast.error('Gagal memuat data siswa');
    } finally {
      setKelolaLoading(false);
    }
  };

  const openKelola = async (kelas: KelasItem) => {
    setSelectedKelas(kelas);
    setPendingTambah([]);
    setPendingHapus([]);
    setCheckedKiri(new Set());
    setCheckedKanan(new Set());
    setSearchKiri('');
    setSearchKanan('');
    setKiriPage(1);
    setKelolaOpen(true);
    await loadKelolaData(kelas, 1, '');
  };

  const openLihat = async (kelas: KelasItem) => {
    setSelectedKelas(kelas);
    setKelolaLoading(true);
    setLihatOpen(true);
    try {
      const res = await api.get(`/siswa-kelas/kelas/${kelas.id}/siswa?tahun_ajaran_id=${kelas.tahun_ajaran_id}`);
      setTerdaftar(res.data.data.terdaftar);
    } catch {
      toast.error('Gagal memuat data siswa');
    } finally {
      setKelolaLoading(false);
    }
  };

  const filteredKiri = useMemo(() => {
    const available = belumTerdaftar.filter((s) => !pendingTambah.find((p) => p.id === s.id));
    if (!searchKiri) return available;
    return available.filter((s) =>
      s.nama_lengkap.toLowerCase().includes(searchKiri.toLowerCase()) ||
      s.nomor_induk?.toLowerCase().includes(searchKiri.toLowerCase())
    );
  }, [belumTerdaftar, pendingTambah, searchKiri]);

  const filteredKanan = useMemo(() => {
    const registered = [...terdaftar, ...pendingTambah.map((s) => ({ ...s, siswa_kelas_id: undefined }))];
    const filtered = registered.filter((s) => !pendingHapus.find((p) => p.id === s.id));
    if (!searchKanan) return filtered;
    return filtered.filter((s) =>
      s.nama_lengkap.toLowerCase().includes(searchKanan.toLowerCase()) ||
      s.nomor_induk?.toLowerCase().includes(searchKanan.toLowerCase())
    );
  }, [terdaftar, pendingTambah, pendingHapus, searchKanan]);

  const moveToKanan = (siswa: Siswa[]) => {
    setPendingTambah((prev) => [...prev, ...siswa.filter((s) => !prev.find((p) => p.id === s.id))]);
    setCheckedKiri(new Set());
  };

  const moveToKiri = (siswa: SiswaWithKelasId[]) => {
    const yangSudahTerdaftar = siswa.filter((s) => terdaftar.find((t) => t.id === s.id));
    const yangBelumDisimpan = siswa.filter((s) => pendingTambah.find((p) => p.id === s.id));
    setPendingHapus((prev) => [...prev, ...yangSudahTerdaftar.filter((s) => !prev.find((p) => p.id === s.id))]);
    setPendingTambah((prev) => prev.filter((p) => !yangBelumDisimpan.find((s) => s.id === p.id)));
    setCheckedKanan(new Set());
  };

  const handleSave = async () => {
    if (!selectedKelas) return;
    const tambahIds = pendingTambah.map((s) => s.id);
    const hapusIds = pendingHapus.map((s) => s.id);
    if (tambahIds.length === 0 && hapusIds.length === 0) {
      toast('Tidak ada perubahan');
      setKelolaOpen(false);
      return;
    }
    setSaving(true);
    try {
      await api.post(`/siswa-kelas/kelas/${selectedKelas.id}/sync`, {
        tahun_ajaran_id: selectedKelas.tahun_ajaran_id,
        tambah: tambahIds,
        hapus: hapusIds,
      });
      toast.success('Data kelas berhasil disimpan');
      setKelolaOpen(false);
      loadSummary(filterTahunAjaran, filterTingkat);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const onMassal = async (formData: MassalFormData) => {
    const validMapping = kelasMapping.filter((m) => m.dari_kelas_id && m.ke_kelas_id);
    if (validMapping.length === 0) { toast.error('Tambahkan setidaknya satu mapping kelas'); return; }
    setSubmittingMassal(true);
    try {
      const res = await api.post('/siswa-kelas/naik-massal', {
        dari_tahun_ajaran_id: formData.dari_tahun_ajaran_id,
        ke_tahun_ajaran_id: formData.ke_tahun_ajaran_id,
        kelas_mapping: validMapping.map((m) => ({ dari_kelas_id: m.dari_kelas_id, ke_kelas_id: m.ke_kelas_id })),
      });
      toast.success(res.data.message);
      setMassalOpen(false);
      setKelasMapping([{ dari_kelas_id: '', ke_kelas_id: '' }]);
      loadSummary(filterTahunAjaran, filterTingkat);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Gagal naik kelas');
    } finally { setSubmittingMassal(false); }
  };

  const SiswaRow = ({
    siswa, checked, onCheck, onMove, moveIcon, side,
  }: {
    siswa: Siswa; checked: boolean; onCheck: () => void; onMove: () => void; moveIcon: React.ReactNode; side: 'left' | 'right';
  }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
      <input type="checkbox" checked={checked} onChange={onCheck} onClick={(e) => e.stopPropagation()} className="rounded accent-blue-600 shrink-0" />
      <div className="flex-1 min-w-0" onClick={onCheck}>
        <p className="text-sm font-medium text-slate-800 truncate">{siswa.nama_lengkap}</p>
        <p className="text-xs text-slate-400">{siswa.nomor_induk || siswa.kode_bayar}</p>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMove(); }}
        className={`shrink-0 rounded-lg p-1 transition-colors ${side === 'left' ? 'text-blue-600 hover:bg-blue-100' : 'text-red-500 hover:bg-red-100'}`}
      >
        {moveIcon}
      </button>
    </div>
  );

  const kelasColumns: ColumnDef<KelasItem, unknown>[] = [
    { header: 'No', cell: ({ row }) => (summaryPage - 1) * summaryPerPage + row.index + 1, size: 50 },
    { header: 'Nama Kelas', accessorKey: 'nama_kelas', cell: ({ row }) => row.original.nama_kelas },
    { header: 'Tingkat', cell: ({ row }) => row.original.tingkat_pendidikan?.name ?? '-' },
    { header: 'Tahun Ajaran', cell: ({ row }) => row.original.tahun_ajaran?.nama_tahun_ajaran ?? '-' },
    { header: 'Wali Kelas', cell: ({ row }) => row.original.wali_kelas?.nama_lengkap ?? <span className="text-slate-400 text-xs">-</span> },
    {
      header: 'Jumlah Siswa',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          <Users size={11} /> {row.original.jumlah_siswa} siswa
        </span>
      ),
    },
    {
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {hasPermission('siswa-kelas.read') && (
            <button onClick={() => openLihat(row.original)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Lihat Siswa">
              <Eye size={15} />
            </button>
          )}
          {hasPermission('siswa-kelas.update') && (
            <button onClick={() => openKelola(row.original)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="Kelola Siswa">
              <Settings2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Penempatan Kelas" description="Kelola penempatan siswa ke kelas per tahun ajaran" />
        <div className="flex items-center gap-2 flex-wrap">
          {(hasPermission('siswa-kelas.create') || hasPermission('siswa-kelas.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors">
              <Upload size={16} /> Import Excel
            </button>
          )}
          {(hasPermission('siswa-kelas.read') || hasPermission('siswa-kelas.create') || hasPermission('siswa-kelas.update')) && (
            <button className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Download size={16} /> Export Excel
            </button>
          )}
          {hasPermission('siswa-kelas.create') && (
            <button onClick={() => setMassalOpen(true)} className="shrink-0 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
              <ArrowUpCircle size={16} /> Naik Kelas Massal
            </button>
          )}
        </div>
      </div>

      {/* Filter + Tabel */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput
            value={summarySearch}
            onChange={(v) => {
              setSummarySearch(v);
              setSummaryPage(1);
              loadSummary(filterTahunAjaran, filterTingkat, 1, summaryPerPage, v);
            }}
            placeholder="Cari nama kelas..."
          />
          <FilterSelect
            value={filterTahunAjaran}
            onChange={(v) => { setFilterTahunAjaran(v); handleFilterChange(v, filterTingkat); }}
            options={tahunAjarans.map((t) => ({ label: t.nama_tahun_ajaran, value: t.id }))}
            placeholder="Semua Tahun Ajaran"
          />
          <FilterSelect
            value={filterTingkat}
            onChange={(v) => { setFilterTingkat(v); handleFilterChange(filterTahunAjaran, v); }}
            options={tingkats.map((t) => ({ label: t.name, value: t.id }))}
            placeholder="Semua Tingkat"
          />
          <FilterSelect
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); }}
            options={[{ label: 'Aktif', value: '1' }, { label: 'Nonaktif', value: '0' }]}
            placeholder="Semua Status"
          />
        </div>

        <DataTable
          columns={kelasColumns}
          data={kelasSummary}
          meta={summaryMeta}
          loading={summaryLoading}
          onPageChange={(page) => { setSummaryPage(page); loadSummary(filterTahunAjaran, filterTingkat, page, summaryPerPage, summarySearch); }}
          onPerPageChange={(pp) => { setSummaryPerPage(pp); setSummaryPage(1); loadSummary(filterTahunAjaran, filterTingkat, 1, pp, summarySearch); }}
        />
      </div>

      {/* Modal Lihat Siswa */}
      <Modal open={lihatOpen} onClose={() => setLihatOpen(false)} title={`Daftar Siswa — ${selectedKelas?.nama_kelas}`} size="md">
        {kelolaLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" /> Memuat...
          </div>
        ) : terdaftar.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-slate-400">
            <Users size={36} className="mb-2 opacity-40" />
            <p className="text-sm">Belum ada siswa di kelas ini</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {terdaftar.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50">
                <span className="w-6 text-xs text-slate-400 text-right shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.nama_lengkap}</p>
                  <p className="text-xs text-slate-400">{s.nomor_induk || s.kode_bayar}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal Kelola Siswa — Dual Column */}
      <Modal open={kelolaOpen} onClose={() => setKelolaOpen(false)} title={`Kelola Siswa — ${selectedKelas?.nama_kelas} (${selectedKelas?.tahun_ajaran?.nama_tahun_ajaran})`} size="xl">
        {kelolaLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" /> Memuat data siswa...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dual Column */}
            <div className="grid grid-cols-2 gap-4 min-h-[420px]">
              {/* Kolom Kiri — Belum di Kelas */}
              <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Belum di Kelas <span className="text-slate-400 font-normal normal-case">({kiriMeta.total})</span>
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={searchKiri}
                        onChange={(e) => setSearchKiri(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && selectedKelas) { setKiriPage(1); loadKelolaData(selectedKelas, 1, searchKiri); }}}
                        placeholder="Cari siswa..."
                        className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                      />
                      {searchKiri && <button onClick={() => { setSearchKiri(''); if (selectedKelas) { setKiriPage(1); loadKelolaData(selectedKelas, 1, ''); }}} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={12} /></button>}
                    </div>
                    <button
                      onClick={() => { if (selectedKelas) { setKiriPage(1); loadKelolaData(selectedKelas, 1, searchKiri); }}}
                      className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                    >
                      Cari
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-72">
                  {filteredKiri.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Tidak ada siswa ditemukan</p>
                  ) : filteredKiri.map((s) => (
                    <SiswaRow
                      key={s.id}
                      siswa={s}
                      checked={checkedKiri.has(s.id)}
                      side="left"
                      onCheck={() => {
                        const next = new Set(checkedKiri);
                        next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                        setCheckedKiri(next);
                      }}
                      onMove={() => moveToKanan([s])}
                      moveIcon={<ChevronRight size={16} />}
                    />
                  ))}
                </div>
                {/* Pagination */}
                {kiriMeta.last_page > 1 && (
                  <div className="border-t border-slate-100 px-3 py-2 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Halaman {kiriMeta.current_page} dari {kiriMeta.last_page}</span>
                    <div className="flex gap-1">
                      <button
                        disabled={kiriMeta.current_page <= 1 || kelolaLoading}
                        onClick={() => { if (selectedKelas) { const p = kiriPage - 1; setKiriPage(p); loadKelolaData(selectedKelas, p, searchKiri); }}}
                        className="rounded px-2 py-1 text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        disabled={kiriMeta.current_page >= kiriMeta.last_page || kelolaLoading}
                        onClick={() => { if (selectedKelas) { const p = kiriPage + 1; setKiriPage(p); loadKelolaData(selectedKelas, p, searchKiri); }}}
                        className="rounded px-2 py-1 text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-100 px-3 py-2 bg-slate-50">
                  <button
                    type="button"
                    disabled={checkedKiri.size === 0}
                    onClick={() => moveToKanan(filteredKiri.filter((s) => checkedKiri.has(s.id)))}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={13} />
                    Tambah Terpilih {checkedKiri.size > 0 && `(${checkedKiri.size})`}
                  </button>
                </div>
              </div>

              {/* Kolom Kanan — Sudah di Kelas */}
              <div className="flex flex-col rounded-xl border border-emerald-200 overflow-hidden">
                <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2.5">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                    Terdaftar di Kelas <span className="text-emerald-500 font-normal normal-case">({filteredKanan.length})</span>
                  </p>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={searchKanan}
                      onChange={(e) => setSearchKanan(e.target.value)}
                      placeholder="Cari siswa..."
                      className="w-full rounded-lg border border-emerald-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-400"
                    />
                    {searchKanan && <button onClick={() => setSearchKanan('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={12} /></button>}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-72">
                  {filteredKanan.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Belum ada siswa di kelas ini</p>
                  ) : filteredKanan.map((s) => (
                    <SiswaRow
                      key={s.id}
                      siswa={s}
                      checked={checkedKanan.has(s.id)}
                      side="right"
                      onCheck={() => {
                        const next = new Set(checkedKanan);
                        next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                        setCheckedKanan(next);
                      }}
                      onMove={() => moveToKiri([s])}
                      moveIcon={<ChevronLeft size={16} />}
                    />
                  ))}
                </div>
                <div className="border-t border-emerald-100 px-3 py-2 bg-emerald-50">
                  <button
                    type="button"
                    disabled={checkedKanan.size === 0}
                    onClick={() => moveToKiri(filteredKanan.filter((s) => checkedKanan.has(s.id)))}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={13} />
                    Hapus Terpilih {checkedKanan.size > 0 && `(${checkedKanan.size})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Pending summary */}
            {(pendingTambah.length > 0 || pendingHapus.length > 0) && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-700">
                <span className="font-semibold">Perubahan belum disimpan:</span>
                {pendingTambah.length > 0 && <span className="text-emerald-700 font-medium">+{pendingTambah.length} ditambahkan</span>}
                {pendingHapus.length > 0 && <span className="text-red-600 font-medium">−{pendingHapus.length} dihapus</span>}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setKelolaOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Naik Kelas Massal Modal */}
      <Modal open={massalOpen} onClose={() => setMassalOpen(false)} title="Naik Kelas Massal" size="lg">
        <form onSubmit={handleMassal(onMassal)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dari Tahun Ajaran <span className="text-red-500">*</span></label>
              <select {...regMassal('dari_tahun_ajaran_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tahunAjarans.map((t) => <option key={t.id} value={t.id}>{t.nama_tahun_ajaran}</option>)}
              </select>
              {errMassal.dari_tahun_ajaran_id && <p className="mt-1 text-xs text-red-500">{errMassal.dari_tahun_ajaran_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ke Tahun Ajaran <span className="text-red-500">*</span></label>
              <select {...regMassal('ke_tahun_ajaran_id')} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Pilih --</option>
                {tahunAjarans.map((t) => <option key={t.id} value={t.id}>{t.nama_tahun_ajaran}</option>)}
              </select>
              {errMassal.ke_tahun_ajaran_id && <p className="mt-1 text-xs text-red-500">{errMassal.ke_tahun_ajaran_id.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Mapping Kelas</label>
              <button type="button" onClick={() => setKelasMapping([...kelasMapping, { dari_kelas_id: '', ke_kelas_id: '' }])} className="text-xs text-blue-600 hover:underline">+ Tambah Baris</button>
            </div>
            <div className="space-y-2">
              {kelasMapping.map((m, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                  <select value={m.dari_kelas_id} onChange={(e) => { const n = [...kelasMapping]; n[i].dari_kelas_id = e.target.value; setKelasMapping(n); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">{watchedDariTahun ? 'Kelas asal' : 'Pilih tahun ajaran dulu'}</option>
                    {kelasDariTahun.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                  <span className="text-slate-400 text-sm">→</span>
                  <select value={m.ke_kelas_id} onChange={(e) => { const n = [...kelasMapping]; n[i].ke_kelas_id = e.target.value; setKelasMapping(n); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">{watchedKeTahun ? 'Kelas tujuan' : 'Pilih tahun ajaran dulu'}</option>
                    {kelasKeTahun.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                  </select>
                  {kelasMapping.length > 1 && (
                    <button type="button" onClick={() => setKelasMapping(kelasMapping.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setMassalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={submittingMassal} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submittingMassal ? 'Memproses...' : 'Proses Naik Kelas'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
