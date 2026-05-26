<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = Subject::query();

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
            'name'   => 'required|string|max:100|unique:subjects,name',
            'status' => 'boolean',
        ]);

        $item = Subject::create($validated);

        return response()->json(['message' => 'Mata pelajaran berhasil ditambahkan.', 'data' => $item], 201);
    }

    public function show(Subject $subject)
    {
        return response()->json(['data' => $subject]);
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:subjects,name,' . $subject->id,
            'status' => 'boolean',
        ]);

        $subject->update($validated);

        return response()->json(['message' => 'Mata pelajaran berhasil diperbarui.', 'data' => $subject]);
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->json(['message' => 'Mata pelajaran berhasil dihapus.']);
    }
}
