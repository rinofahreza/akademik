<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\User;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SiswaController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        // Ambil tahun ajaran aktif
        $tahunAjaranAktif = \App\Models\TahunAjaran::where('is_active', true)->first();
        $tahunAjaranId = $tahunAjaranAktif?->id;
        
        $query = Siswa::with([
            'tingkatPendidikan', 
            'user',
            'kelasRecords' => fn($q) => $q->when($tahunAjaranId, fn($q) => $q->where('tahun_ajaran_id', $tahunAjaranId))->with(['kelas', 'tahunAjaran'])
        ]);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('nomor_induk', 'like', '%' . $request->search . '%')
                  ->orWhere('nisn', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('tingkat_pendidikan_id')) {
            $query->where('tingkat_pendidikan_id', $request->tingkat_pendidikan_id);
        }

        if ($request->filled('kelas_id')) {
            $query->whereHas('kelasRecords', fn($q) => $q->where('kelas_id', $request->kelas_id));
        }

        if ($request->filled('tahun_ajaran_id')) {
            $query->whereHas('kelasRecords', fn($q) => $q->where('tahun_ajaran_id', $request->tahun_ajaran_id));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_bayar'            => 'required|string|size:7|regex:/^[0-9]{7}$/|unique:siswas,kode_bayar',
            'nomor_induk'           => 'nullable|string|max:50|unique:siswas,nomor_induk',
            'nisn'                  => 'nullable|string|max:20|unique:siswas,nisn',
            'no_kk'                 => 'required|string|size:16|regex:/^[0-9]{16}$/|unique:siswas,no_kk',
            'nik'                   => 'nullable|string|size:16|regex:/^[0-9]{16}$/|unique:siswas,nik',
            'nama_lengkap'          => 'required|string|max:200',
            'jenis_kelamin'         => 'required|in:L,P',
            'tempat_lahir'          => 'required|string|max:100',
            'tanggal_lahir'         => 'required|date',
            'alamat'                => 'nullable|string',
            'telepon_orang_tua'     => 'nullable|string|max:20',
            'tingkat_pendidikan_id' => 'required|exists:tingkat_pendidikans,id',
            'kelas_id'              => 'nullable|exists:kelas,id',
            'tahun_ajaran_id'       => 'nullable|exists:tahun_ajarans,id',
            'status'                => 'boolean',
        ]);

        $defaultPassword = $validated['kode_bayar'];
        $email = $validated['kode_bayar'] . '@siswa.akademik.id';

        $user = User::create([
            'name'      => $validated['nama_lengkap'],
            'email'     => $email,
            'password'  => Hash::make($defaultPassword),
            'is_active' => $validated['status'] ?? true,
        ]);
        $user->assignRole('Siswa');

        $kelasId = $validated['kelas_id'] ?? null;
        $tahunAjaranId = $validated['tahun_ajaran_id'] ?? null;
        unset($validated['kelas_id'], $validated['tahun_ajaran_id']);

        $validated['user_id'] = $user->id;
        $item = Siswa::create($validated);

        if ($kelasId && $tahunAjaranId) {
            SiswaKelas::create([
                'siswa_id'        => $item->id,
                'kelas_id'        => $kelasId,
                'tahun_ajaran_id' => $tahunAjaranId,
            ]);
        }

        return response()->json([
            'message'          => 'Siswa berhasil ditambahkan.',
            'default_password' => $defaultPassword,
            'login_email'      => $email,
            'data'             => $item->load(['tingkatPendidikan', 'kelasRecords' => fn($q) => $q->whereHas('tahunAjaran', fn($q) => $q->where('is_active', true))->with(['kelas', 'tahunAjaran'])->orderBy('id', 'desc'), 'user']),
        ], 201);
    }

    public function show(Siswa $siswa)
    {
        return response()->json(['data' => $siswa->load(['tingkatPendidikan', 'kelasRecords' => fn($q) => $q->whereHas('tahunAjaran', fn($q) => $q->where('is_active', true))->with(['kelas', 'tahunAjaran'])->orderBy('id', 'desc'), 'user'])]);
    }

    public function update(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'kode_bayar'            => 'required|string|size:7|regex:/^[0-9]{7}$/|unique:siswas,kode_bayar,' . $siswa->id,
            'nomor_induk'           => 'nullable|string|max:50|unique:siswas,nomor_induk,' . $siswa->id,
            'nisn'                  => 'nullable|string|max:20|unique:siswas,nisn,' . $siswa->id,
            'no_kk'                 => 'required|string|size:16|regex:/^[0-9]{16}$/|unique:siswas,no_kk,' . $siswa->id,
            'nik'                   => 'nullable|string|size:16|regex:/^[0-9]{16}$/|unique:siswas,nik,' . $siswa->id,
            'nama_lengkap'          => 'required|string|max:200',
            'jenis_kelamin'         => 'required|in:L,P',
            'tempat_lahir'          => 'required|string|max:100',
            'tanggal_lahir'         => 'required|date',
            'alamat'                => 'nullable|string',
            'telepon_orang_tua'     => 'nullable|string|max:20',
            'tingkat_pendidikan_id' => 'required|exists:tingkat_pendidikans,id',
            'status'                => 'boolean',
        ]);

        $siswa->update($validated);

        if ($siswa->user) {
            $siswa->user->update([
                'name'      => $validated['nama_lengkap'],
                'is_active' => $validated['status'] ?? $siswa->user->is_active,
            ]);
        }

        return response()->json([
            'message' => 'Siswa berhasil diperbarui.',
            'data'    => $siswa->load(['tingkatPendidikan', 'kelasRecords' => fn($q) => $q->whereHas('tahunAjaran', fn($q) => $q->where('is_active', true))->with(['kelas', 'tahunAjaran'])->orderBy('id', 'desc'), 'user']),
        ]);
    }

    public function toggleStatus(Siswa $siswa)
    {
        $siswa->update(['status' => !$siswa->status]);

        if ($siswa->user) {
            $siswa->user->update(['is_active' => $siswa->status]);
        }

        return response()->json([
            'message' => 'Status berhasil diperbarui.',
            'status'  => $siswa->status,
        ]);
    }

    public function destroy(Siswa $siswa)
    {
        $user = $siswa->user;
        $siswa->delete();
        if ($user) {
            $user->delete();
        }

        return response()->json(['message' => 'Siswa berhasil dihapus.']);
    }
}
