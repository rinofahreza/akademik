<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\SiswaKelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class SiswaKelasController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = SiswaKelas::with(['siswa.tingkatPendidikan', 'kelas', 'tahunAjaran']);

        if ($request->filled('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $request->tahun_ajaran_id);
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        if ($request->filled('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }

        if ($request->filled('search')) {
            $query->whereHas('siswa', fn($q) => $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                ->orWhere('nomor_induk', 'like', '%' . $request->search . '%'));
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id'        => 'required|exists:siswas,id',
            'kelas_id'        => 'required|exists:kelas,id',
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
        ], [
            'siswa_id.unique'        => 'Siswa ini sudah memiliki kelas di tahun ajaran tersebut.',
        ]);

        $exists = SiswaKelas::where('siswa_id', $validated['siswa_id'])
            ->where('tahun_ajaran_id', $validated['tahun_ajaran_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Siswa ini sudah memiliki kelas di tahun ajaran tersebut.'], 422);
        }

        $item = SiswaKelas::create($validated);

        return response()->json([
            'message' => 'Penempatan kelas berhasil ditambahkan.',
            'data'    => $item->load(['siswa', 'kelas', 'tahunAjaran']),
        ], 201);
    }

    public function update(Request $request, SiswaKelas $siswaKelas)
    {
        $validated = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $siswaKelas->update($validated);

        return response()->json([
            'message' => 'Penempatan kelas berhasil diperbarui.',
            'data'    => $siswaKelas->load(['siswa', 'kelas', 'tahunAjaran']),
        ]);
    }

    public function destroy(SiswaKelas $siswaKelas)
    {
        $siswaKelas->delete();
        return response()->json(['message' => 'Penempatan kelas berhasil dihapus.']);
    }

    public function naikKelasMassal(Request $request)
    {
        $validated = $request->validate([
            'dari_tahun_ajaran_id'   => 'required|exists:tahun_ajarans,id',
            'ke_tahun_ajaran_id'     => 'required|exists:tahun_ajarans,id|different:dari_tahun_ajaran_id',
            'kelas_mapping'          => 'required|array',
            'kelas_mapping.*.dari_kelas_id' => 'required|exists:kelas,id',
            'kelas_mapping.*.ke_kelas_id'   => 'required|exists:kelas,id',
        ], [
            'ke_tahun_ajaran_id.different' => 'Tahun ajaran tujuan tidak boleh sama dengan tahun ajaran asal.',
        ]);

        $mapping = collect($validated['kelas_mapping'])->keyBy('dari_kelas_id');
        $count = 0;

        $records = SiswaKelas::where('tahun_ajaran_id', $validated['dari_tahun_ajaran_id'])->get();

        foreach ($records as $record) {
            $map = $mapping->get($record->kelas_id);
            if (!$map) continue;

            $alreadyExists = SiswaKelas::where('siswa_id', $record->siswa_id)
                ->where('tahun_ajaran_id', $validated['ke_tahun_ajaran_id'])
                ->exists();

            if ($alreadyExists) continue;

            SiswaKelas::create([
                'siswa_id'        => $record->siswa_id,
                'kelas_id'        => $map['ke_kelas_id'],
                'tahun_ajaran_id' => $validated['ke_tahun_ajaran_id'],
            ]);
            $count++;
        }

        return response()->json(['message' => "{$count} siswa berhasil dinaikkan kelas."]);
    }

    public function kelasSummary(Request $request)
    {
        $query = Kelas::with(['tingkatPendidikan', 'tahunAjaran', 'waliKelas'])
            ->withCount([
                'siswaKelas' => fn($q) => $q->when(
                    $request->filled('tahun_ajaran_id'),
                    fn($q) => $q->where('tahun_ajaran_id', $request->tahun_ajaran_id)
                ),
            ]);

        if ($request->filled('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $request->tahun_ajaran_id);
        }

        if ($request->filled('tingkat_pendidikan_id')) {
            $query->where('tingkat_pendidikan_id', $request->tingkat_pendidikan_id);
        }

        if ($request->filled('search')) {
            $query->where('nama_kelas', 'like', '%' . $request->search . '%');
        }

        $query->orderBy('nama_kelas');

        $perPage = (int) $request->get('per_page', 20);
        $paginated = $query->paginate($perPage);

        $data = collect($paginated->items())->map(fn($k) => [
            'id'                   => $k->id,
            'nama_kelas'           => $k->nama_kelas,
            'tahun_ajaran_id'      => $k->tahun_ajaran_id,
            'tahun_ajaran'         => $k->tahunAjaran,
            'tingkat_pendidikan_id'=> $k->tingkat_pendidikan_id,
            'tingkat_pendidikan'   => $k->tingkatPendidikan,
            'wali_kelas'           => $k->waliKelas,
            'jumlah_siswa'         => $k->siswa_kelas_count,
            'status'               => $k->status,
        ]);

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
                'last_page'    => $paginated->lastPage(),
            ],
        ]);
    }

    public function kelasSiswa(Request $request, $kelasId)
    {
        $tahunAjaranId = $request->tahun_ajaran_id;

        $terdaftar = SiswaKelas::with('siswa.tingkatPendidikan')
            ->where('kelas_id', $kelasId)
            ->when($tahunAjaranId, fn($q) => $q->where('tahun_ajaran_id', $tahunAjaranId))
            ->get()
            ->map(fn($sk) => array_merge($sk->siswa->toArray(), ['siswa_kelas_id' => $sk->id]));

        $belumTerdaftarQuery = Siswa::with('tingkatPendidikan')
            ->where('status', true)
            ->when($tahunAjaranId, fn($q) => $q->whereDoesntHave('kelasRecords', fn($r) => $r->where('tahun_ajaran_id', $tahunAjaranId)));

        if ($request->filled('search')) {
            $belumTerdaftarQuery->where(fn($q) => $q
                ->where('nama_lengkap', 'like', '%' . $request->search . '%')
                ->orWhere('nomor_induk', 'like', '%' . $request->search . '%'));
        }

        $belumTerdaftarQuery->orderBy('nama_lengkap');

        $perPage = (int) $request->get('per_page', 50);
        $paginated = $belumTerdaftarQuery->paginate($perPage, ['*'], 'page_belum', $request->get('page_belum', 1));

        return response()->json([
            'data' => [
                'terdaftar'       => $terdaftar,
                'belum_terdaftar' => collect($paginated->items())->values(),
                'belum_meta'      => [
                    'current_page' => $paginated->currentPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                    'last_page'    => $paginated->lastPage(),
                ],
            ],
        ]);
    }

    public function syncKelas(Request $request, $kelasId)
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => 'required|exists:tahun_ajarans,id',
            'tambah'          => 'array',
            'tambah.*'        => 'exists:siswas,id',
            'hapus'           => 'array',
            'hapus.*'         => 'exists:siswas,id',
        ]);

        $tahunAjaranId = $validated['tahun_ajaran_id'];
        $tambah = $validated['tambah'] ?? [];
        $hapus  = $validated['hapus'] ?? [];

        foreach ($tambah as $siswaId) {
            $exists = SiswaKelas::where('siswa_id', $siswaId)
                ->where('tahun_ajaran_id', $tahunAjaranId)
                ->exists();
            if (!$exists) {
                SiswaKelas::create([
                    'siswa_id'        => $siswaId,
                    'kelas_id'        => $kelasId,
                    'tahun_ajaran_id' => $tahunAjaranId,
                ]);
            }
        }

        if (!empty($hapus)) {
            SiswaKelas::where('kelas_id', $kelasId)
                ->where('tahun_ajaran_id', $tahunAjaranId)
                ->whereIn('siswa_id', $hapus)
                ->delete();
        }

        return response()->json(['message' => 'Data kelas berhasil disimpan.']);
    }
}
