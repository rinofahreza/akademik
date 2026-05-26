<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class TahunAjaranController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = TahunAjaran::query();

        if ($request->filled('search')) {
            $query->where('nama_tahun_ajaran', 'like', '%' . $request->search . '%');
        }

        if ($request->get('all') === 'true') {
            return response()->json(['data' => $query->get()]);
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_tahun_ajaran' => 'required|string|max:50|unique:tahun_ajarans,nama_tahun_ajaran',
            'tanggal_mulai'     => 'required|date',
            'tanggal_selesai'   => 'required|date|after:tanggal_mulai',
            'is_active'         => 'boolean',
        ]);

        if (!empty($validated['is_active'])) {
            TahunAjaran::where('is_active', true)->update(['is_active' => false]);
        }

        $item = TahunAjaran::create($validated);

        return response()->json(['message' => 'Tahun ajaran berhasil ditambahkan.', 'data' => $item], 201);
    }

    public function show(TahunAjaran $tahunAjaran)
    {
        return response()->json(['data' => $tahunAjaran]);
    }

    public function update(Request $request, TahunAjaran $tahunAjaran)
    {
        $validated = $request->validate([
            'nama_tahun_ajaran' => 'required|string|max:50|unique:tahun_ajarans,nama_tahun_ajaran,' . $tahunAjaran->id,
            'tanggal_mulai'     => 'required|date',
            'tanggal_selesai'   => 'required|date|after:tanggal_mulai',
            'is_active'         => 'boolean',
        ]);

        if (!empty($validated['is_active'])) {
            TahunAjaran::where('id', '!=', $tahunAjaran->id)->where('is_active', true)->update(['is_active' => false]);
        }

        $tahunAjaran->update($validated);

        return response()->json(['message' => 'Tahun ajaran berhasil diperbarui.', 'data' => $tahunAjaran]);
    }

    public function destroy(TahunAjaran $tahunAjaran)
    {
        if ($tahunAjaran->is_active) {
            return response()->json(['message' => 'Tidak dapat menghapus tahun ajaran yang sedang aktif.'], 422);
        }

        $tahunAjaran->delete();

        return response()->json(['message' => 'Tahun ajaran berhasil dihapus.']);
    }

    public function setActive(TahunAjaran $tahunAjaran)
    {
        TahunAjaran::where('is_active', true)->update(['is_active' => false]);
        $tahunAjaran->update(['is_active' => true]);

        return response()->json(['message' => 'Tahun ajaran berhasil diaktifkan.', 'data' => $tahunAjaran]);
    }
}
