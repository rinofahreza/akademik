'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Monitor, Smartphone, Globe, LogIn, LogOut, Plus, Pencil, Trash2 } from 'lucide-react';
import DataTable from '@/components/tables/DataTable';
import SearchInput from '@/components/ui/SearchInput';
import FilterSelect from '@/components/ui/FilterSelect';
import PageHeader from '@/components/ui/PageHeader';
import { useTable } from '@/hooks/useTable';
import api from '@/lib/axios';

interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer: { id: number; name: string; email: string } | null;
  properties: {
    ip_address?: string;
    user_agent?: string;
  };
  attribute_changes: {
    attributes?: Record<string, unknown>;
    old?: Record<string, unknown>;
  } | null;
  created_at: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  'User login':  <LogIn size={13} className="text-emerald-600" />,
  'User logout': <LogOut size={13} className="text-slate-500" />,
};

const EVENT_BADGES: Record<string, string> = {
  created: 'bg-emerald-100 text-emerald-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
  'User login': 'bg-emerald-100 text-emerald-700',
  'User logout': 'bg-slate-100 text-slate-600',
};

function parseUserAgent(ua: string | undefined): { device: string; icon: React.ReactNode } {
  if (!ua) return { device: '-', icon: <Globe size={13} /> };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const icon = isMobile
    ? <Smartphone size={13} className="text-blue-500" />
    : <Monitor size={13} className="text-slate-500" />;

  let browser = 'Browser';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua)) browser = 'Opera';
  else if (/chrome\/[0-9]/i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/msie|trident/i.test(ua)) browser = 'IE';

  return { device: browser, icon };
}

function EventBadge({ description }: { description: string }) {
  const lower = description.toLowerCase();
  const key = lower.includes('created') ? 'created' : lower.includes('updated') ? 'updated' : lower.includes('deleted') ? 'deleted' : description;
  const cls = EVENT_BADGES[key] ?? 'bg-slate-100 text-slate-600';
  const icon = lower.includes('created') ? <Plus size={11} /> : lower.includes('updated') ? <Pencil size={11} /> : lower.includes('deleted') ? <Trash2 size={11} /> : EVENT_ICONS[description] ?? null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {icon}{description}
    </span>
  );
}

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  user_id: 'ID User',
  kode_bayar: 'Kode Bayar',
  nomor_induk: 'Nomor Induk',
  nisn: 'NISN',
  no_kk: 'No KK',
  nik: 'NIK',
  nama_lengkap: 'Nama Lengkap',
  jenis_kelamin: 'Jenis Kelamin',
  tempat_lahir: 'Tempat Lahir',
  tanggal_lahir: 'Tanggal Lahir',
  alamat: 'Alamat',
  status: 'Status',
  tingkat_pendidikan_id: 'Penempatan / Tingkat Pendidikan',
  kelas_id: 'Kelas',
  tahun_ajaran_id: 'Tahun Ajaran',
  nig: 'NIG',
  nama: 'Nama',
  email: 'Email',
  jabatan: 'Jabatan',
  nama_kelas: 'Nama Kelas',
  nama_tahun_ajaran: 'Tahun Ajaran',
  name: 'Nama',
  is_active: 'Aktif',
  created_at: 'Dibuat',
  updated_at: 'Diperbarui',
};

function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (key === 'jenis_kelamin') return value === 'L' ? 'Laki-laki' : 'Perempuan';
  if (key === 'status' || key === 'is_active') return value ? 'Aktif' : 'Tidak Aktif';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  return String(value);
}

function ChangeTable({ data }: { data: Record<string, unknown> }) {
  return (
    <table className="w-full text-xs">
      <tbody>
        {Object.entries(data).map(([k, v]) => (
          <tr key={k} className="border-b border-slate-100 last:border-0">
            <td className="py-0.5 pr-2 text-slate-500 font-medium whitespace-nowrap">{FIELD_LABELS[k] ?? k}</td>
            <td className="py-0.5 text-slate-700 break-all">{formatFieldValue(k, v)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ActivityLogPage() {
  const { data, meta, loading, setSearch, setPage, setPerPage, setParam } = useTable<ActivityLog>({ endpoint: '/activity-logs' });
  const [logNames, setLogNames] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    api.get('/activity-logs/log-names').then((res) => setLogNames(res.data.data)).catch(() => {});
  }, []);

  const handleDateFrom = (v: string) => { setDateFrom(v); setParam('date_from', v); };
  const handleDateTo = (v: string) => { setDateTo(v); setParam('date_to', v); };

  const columns: ColumnDef<ActivityLog, unknown>[] = [
    { header: 'No', cell: ({ row }) => row.index + 1 },
    {
      header: 'Waktu',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600 whitespace-nowrap">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      header: 'User',
      cell: ({ row }) => row.original.causer ? (
        <div>
          <p className="text-sm font-medium text-slate-800">{row.original.causer.name}</p>
          <p className="text-xs text-slate-400">{row.original.causer.email}</p>
        </div>
      ) : <span className="text-xs text-slate-400">System</span>,
    },
    {
      header: 'Aktivitas',
      cell: ({ row }) => <EventBadge description={row.original.description} />,
    },
    {
      header: 'Modul',
      cell: ({ row }) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {row.original.log_name ?? '-'}
        </span>
      ),
    },
    {
      header: 'Perangkat',
      cell: ({ row }) => {
        const ua = row.original.properties?.user_agent;
        const { device, icon } = parseUserAgent(ua);
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
            {icon} {device}
          </span>
        );
      },
    },
    {
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-slate-500">
          {row.original.properties?.ip_address ?? '-'}
        </span>
      ),
    },
    {
      header: 'Detail',
      cell: ({ row }) => {
        const changes = row.original.attribute_changes;
        const hasChanges = changes?.attributes || changes?.old;
        if (!hasChanges) return <span className="text-xs text-slate-400">-</span>;
        return (
          <details className="cursor-pointer">
            <summary className="text-xs text-blue-600 hover:underline list-none">Lihat</summary>
            <div className="mt-1 w-64 rounded-lg bg-slate-50 p-2 text-xs text-slate-700 space-y-2">
              {changes.old && (
                <div>
                  <p className="font-semibold text-red-500 mb-1">Sebelum:</p>
                  <ChangeTable data={changes.old} />
                </div>
              )}
              {changes.attributes && (
                <div>
                  <p className="font-semibold text-emerald-600 mb-1">Sesudah:</p>
                  <ChangeTable data={changes.attributes} />
                </div>
              )}
            </div>
          </details>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Log Aktivitas" description="Riwayat semua aktivitas pengguna dalam sistem" />
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value="" onChange={setSearch} placeholder="Cari nama, email, aktivitas..." />
          <FilterSelect
            value=""
            onChange={(v) => setParam('log_name', v)}
            options={logNames.map((n) => ({ label: n, value: n }))}
            placeholder="Semua Modul"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">Dari:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFrom(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">Sampai:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleDateTo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <DataTable columns={columns} data={data} meta={meta} loading={loading} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>
    </div>
  );
}
