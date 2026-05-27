'use client';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

const JADWAL: Record<string, { jam: string; mapel: string; guru: string }[]> = {
  Senin:   [{ jam: '07.00–08.30', mapel: 'Matematika', guru: 'Bpk. Ahmad' }, { jam: '08.30–10.00', mapel: 'Bahasa Indonesia', guru: 'Ibu. Sari' }, { jam: '10.15–11.45', mapel: 'IPA', guru: 'Bpk. Hendra' }],
  Selasa:  [{ jam: '07.00–08.30', mapel: 'IPS', guru: 'Ibu. Dewi' }, { jam: '08.30–10.00', mapel: 'Bahasa Inggris', guru: 'Ibu. Rina' }, { jam: '10.15–11.45', mapel: 'Seni Budaya', guru: 'Bpk. Fajar' }],
  Rabu:    [{ jam: '07.00–08.30', mapel: 'PKN', guru: 'Ibu. Lina' }, { jam: '08.30–10.00', mapel: 'Matematika', guru: 'Bpk. Ahmad' }, { jam: '10.15–11.45', mapel: 'PJOK', guru: 'Bpk. Yudi' }],
  Kamis:   [{ jam: '07.00–08.30', mapel: 'Bahasa Indonesia', guru: 'Ibu. Sari' }, { jam: '08.30–10.00', mapel: 'IPA', guru: 'Bpk. Hendra' }, { jam: '10.15–11.45', mapel: 'IPS', guru: 'Ibu. Dewi' }],
  Jumat:   [{ jam: '07.00–08.30', mapel: 'Bahasa Inggris', guru: 'Ibu. Rina' }, { jam: '08.30–09.30', mapel: 'Agama', guru: 'Bpk. Ustadz Ali' }],
};

const COLORS = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700'];

export default function JadwalPage() {
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  const todayCapital = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800">Jadwal Pelajaran</h1>
        <p className="text-sm text-slate-500 mt-0.5">Semester Ganjil 2025/2026</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {DAYS.map((day) => (
          <div key={day} className={`bg-white rounded-3xl overflow-hidden shadow-sm ${day === todayCapital ? 'ring-2 ring-blue-500' : ''}`}>
            <div className={`px-4 py-2.5 flex items-center justify-between ${day === todayCapital ? 'bg-blue-600' : 'bg-slate-50 border-b border-slate-100'}`}>
              <span className={`text-sm font-bold ${day === todayCapital ? 'text-white' : 'text-slate-700'}`}>{day}</span>
              {day === todayCapital && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Hari ini</span>}
            </div>
            <div className="divide-y divide-slate-50">
              {JADWAL[day].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className={`text-xs font-semibold px-2 py-1 rounded-xl ${COLORS[i % COLORS.length]}`}>
                    {item.jam}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.mapel}</p>
                    <p className="text-xs text-slate-400">{item.guru}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
