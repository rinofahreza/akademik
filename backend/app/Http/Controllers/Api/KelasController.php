<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = Kelas::with(['tingkatPendidikan', 'tahunAjaran', 'waliKelas']);

        if ($request->filled('search')) {
            $query->where('nama_kelas', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tingkat_pendidikan_id')) {
            $query->where('tingkat_pendidikan_id', $request->tingkat_pendidikan_id);
        }

        if ($request->filled('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $request->tahun_ajaran_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        if ($request->get('all') === 'true') {
            return response()->json(['data' => $query->where('status', true)->get()]);
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tingkat_pendidikan_id' => 'required|exists:tingkat_pendidikans,id',
            'tahun_ajaran_id'       => 'required|exists:tahun_ajarans,id',
            'nama_kelas'            => 'required|string|max:100',
            'wali_kelas_id'         => 'nullable|exists:pegawais,id',
            'status'                => 'boolean',
        ]);

        $item = Kelas::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data'    => $item->load(['tingkatPendidikan', 'tahunAjaran', 'waliKelas']),
        ], 201);
    }

    public function show(Kelas $kelas)
    {
        return response()->json(['data' => $kelas->load(['tingkatPendidikan', 'tahunAjaran', 'waliKelas', 'siswas'])]);
    }

    public function update(Request $request, Kelas $kelas)
    {
        $validated = $request->validate([
            'tingkat_pendidikan_id' => 'required|exists:tingkat_pendidikans,id',
            'tahun_ajaran_id'       => 'required|exists:tahun_ajarans,id',
            'nama_kelas'            => 'required|string|max:100',
            'wali_kelas_id'         => 'nullable|exists:pegawais,id',
            'status'                => 'boolean',
        ]);

        $kelas->update($validated);

        return response()->json([
            'message' => 'Kelas berhasil diperbarui.',
            'data'    => $kelas->load(['tingkatPendidikan', 'tahunAjaran', 'waliKelas']),
        ]);
    }

    public function destroy(Kelas $kelas)
    {
        $kelas->delete();

        return response()->json(['message' => 'Kelas berhasil dihapus.']);
    }
}
