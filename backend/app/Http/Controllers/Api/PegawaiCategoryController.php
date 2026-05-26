<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PegawaiCategory;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class PegawaiCategoryController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = PegawaiCategory::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->get('all') === 'true') {
            return response()->json(['data' => $query->where('status', true)->get()]);
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:pegawai_categories,name',
            'status' => 'boolean',
        ]);

        $item = PegawaiCategory::create($validated);

        return response()->json(['message' => 'Unit pegawai berhasil ditambahkan.', 'data' => $item], 201);
    }

    public function show(PegawaiCategory $pegawaiCategory)
    {
        return response()->json(['data' => $pegawaiCategory->load('positions')]);
    }

    public function update(Request $request, PegawaiCategory $pegawaiCategory)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:pegawai_categories,name,' . $pegawaiCategory->id,
            'status' => 'boolean',
        ]);

        $pegawaiCategory->update($validated);

        return response()->json(['message' => 'Unit pegawai berhasil diperbarui.', 'data' => $pegawaiCategory]);
    }

    public function destroy(PegawaiCategory $pegawaiCategory)
    {
        $pegawaiCategory->delete();

        return response()->json(['message' => 'Unit pegawai berhasil dihapus.']);
    }
}
