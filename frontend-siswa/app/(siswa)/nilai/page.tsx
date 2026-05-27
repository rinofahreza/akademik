'use client';

const NILAI = [
  { mapel: 'Matematika',       uh: 78,  uts: 80, uas: 85, rata: 81 },
  { mapel: 'Bahasa Indonesia', uh: 85,  uts: 88, uas: 90, rata: 87.7 },
  { mapel: 'IPA',              uh: 75,  uts: 78, uas: 82, rata: 78.3 },
  { mapel: 'IPS',              uh: 80,  uts: 82, uas: 84, rata: 82 },
  { mapel: 'Bahasa Inggris',   uh: 88,  uts: 90, uas: 92, rata: 90 },
  { mapel: 'PKN',              uh: 82,  uts: 85, uas: 87, rata: 84.7 },
  { mapel: 'Seni Budaya',      uh: 90,  uts: 88, uas: 91, rata: 89.7 },
  { mapel: 'PJOK',             uh: 85,  uts: 87, uas: 88, rata: 86.7 },
  { mapel: 'Agama',            uh: 88,  uts: 90, uas: 92, rata: 90 },
];

function getNilaiColor(nilai: number) {
  if (nilai >= 90) return 'text-emerald-600 bg-emerald-50';
  if (nilai >= 80) return 'text-blue-600 bg-blue-50';
  if (nilai >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export default function NilaiPage() {
  const rataRata = NILAI.reduce((acc, n) => acc + n.rata, 0) / NILAI.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800">Nilai</h1>
        <p className="text-sm text-slate-500 mt-0.5">Semester Ganjil 2025/2026</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-4 text-white shadow-sm">
          <p className="text-sm text-blue-100 mb-1">Rata-rata Nilai</p>
          <p className="text-4xl font-bold">{rataRata.toFixed(1)}</p>
          <p className="text-xs text-blue-200 mt-1">Dari {NILAI.length} mata pelajaran</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="grid grid-cols-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              <span className="col-span-2">Mata Pelajaran</span>
              <span className="text-center">UH</span>
              <span className="text-center">UTS</span>
              <span className="text-center">UAS</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {NILAI.map((item, i) => (
              <div key={i} className="px-4 py-3">
                <div className="grid grid-cols-5 items-center">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-800 leading-tight">{item.mapel}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg mt-0.5 inline-block ${getNilaiColor(item.rata)}`}>
                      {item.rata.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-center text-slate-600">{item.uh}</span>
                  <span className="text-sm text-center text-slate-600">{item.uts}</span>
                  <span className="text-sm text-center text-slate-600">{item.uas}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
