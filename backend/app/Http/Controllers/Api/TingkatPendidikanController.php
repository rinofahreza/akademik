<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TingkatPendidikan;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class TingkatPendidikanController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = TingkatPendidikan::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
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
            'name'   => 'required|string|max:100|unique:tingkat_pendidikans,name',
            'status' => 'boolean',
        ]);

        $item = TingkatPendidikan::create($validated);

        return response()->json(['message' => 'Tingkat pendidikan berhasil ditambahkan.', 'data' => $item], 201);
    }

    public function show(TingkatPendidikan $tingkatPendidikan)
    {
        return response()->json(['data' => $tingkatPendidikan]);
    }

    public function update(Request $request, TingkatPendidikan $tingkatPendidikan)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:tingkat_pendidikans,name,' . $tingkatPendidikan->id,
            'status' => 'boolean',
        ]);

        $tingkatPendidikan->update($validated);

        return response()->json(['message' => 'Tingkat pendidikan berhasil diperbarui.', 'data' => $tingkatPendidikan]);
    }

    public function destroy(TingkatPendidikan $tingkatPendidikan)
    {
        $tingkatPendidikan->delete();

        return response()->json(['message' => 'Tingkat pendidikan berhasil dihapus.']);
    }
}
