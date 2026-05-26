<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PegawaiPosition;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class PegawaiPositionController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = PegawaiPosition::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('pegawai_category_id')) {
            $query->where('pegawai_category_id', $request->pegawai_category_id);
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
            'pegawai_category_id' => 'required|exists:pegawai_categories,id',
            'name'                => 'required|string|max:100',
            'status'              => 'boolean',
        ]);

        $item = PegawaiPosition::create($validated);

        return response()->json(['message' => 'Posisi pegawai berhasil ditambahkan.', 'data' => $item->load('category')], 201);
    }

    public function show(PegawaiPosition $pegawaiPosition)
    {
        return response()->json(['data' => $pegawaiPosition->load('category')]);
    }

    public function update(Request $request, PegawaiPosition $pegawaiPosition)
    {
        $validated = $request->validate([
            'pegawai_category_id' => 'required|exists:pegawai_categories,id',
            'name'                => 'required|string|max:100',
            'status'              => 'boolean',
        ]);

        $pegawaiPosition->update($validated);

        return response()->json(['message' => 'Posisi pegawai berhasil diperbarui.', 'data' => $pegawaiPosition->load('category')]);
    }

    public function destroy(PegawaiPosition $pegawaiPosition)
    {
        $pegawaiPosition->delete();

        return response()->json(['message' => 'Posisi pegawai berhasil dihapus.']);
    }
}
