'use client';

const SUMMARY = { hadir: 18, izin: 1, sakit: 1, alfa: 0, total: 20 };

const RECORDS = [
  { tanggal: '27 Mei 2026', hari: 'Rabu',    status: 'hadir' },
  { tanggal: '26 Mei 2026', hari: 'Selasa',  status: 'hadir' },
  { tanggal: '25 Mei 2026', hari: 'Senin',   status: 'hadir' },
  { tanggal: '23 Mei 2026', hari: 'Sabtu',   status: 'hadir' },
  { tanggal: '22 Mei 2026', hari: 'Jumat',   status: 'izin' },
  { tanggal: '21 Mei 2026', hari: 'Kamis',   status: 'hadir' },
  { tanggal: '20 Mei 2026', hari: 'Rabu',    status: 'hadir' },
  { tanggal: '19 Mei 2026', hari: 'Selasa',  status: 'sakit' },
  { tanggal: '18 Mei 2026', hari: 'Senin',   status: 'hadir' },
  { tanggal: '16 Mei 2026', hari: 'Sabtu',   status: 'hadir' },
];

const STATUS_STYLE: Record<string, string> = {
  hadir: 'bg-emerald-100 text-emerald-700',
  izin:  'bg-blue-100 text-blue-700',
  sakit: 'bg-amber-100 text-amber-700',
  alfa:  'bg-red-100 text-red-700',
};

export default function KehadiranPage() {
  const pct = Math.round((SUMMARY.hadir / SUMMARY.total) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800">Kehadiran</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mei 2026</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-800">Ringkasan Kehadiran</span>
            <span className="text-sm font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hadir', value: SUMMARY.hadir, style: 'bg-emerald-50 text-emerald-600' },
              { label: 'Izin',  value: SUMMARY.izin,  style: 'bg-blue-50 text-blue-600' },
              { label: 'Sakit', value: SUMMARY.sakit, style: 'bg-amber-50 text-amber-600' },
              { label: 'Alfa',  value: SUMMARY.alfa,  style: 'bg-red-50 text-red-600' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-3 text-center ${item.style}`}>
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-[10px] font-medium opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-800">Riwayat Kehadiran</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {RECORDS.map((rec, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{rec.tanggal}</p>
                  <p className="text-xs text-slate-400">{rec.hari}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLE[rec.status]}`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
