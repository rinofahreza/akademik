<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploymentStatus;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;

class EmploymentStatusController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = EmploymentStatus::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->get('all') === 'true') {
            return response()->json(['data' => $query->where('status', true)->get()]);
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'   => 'required|string|max:20|unique:employment_statuses,code',
            'name'   => 'required|string|max:100',
            'status' => 'boolean',
        ]);

        $item = EmploymentStatus::create($validated);

        return response()->json(['message' => 'Status kerja berhasil ditambahkan.', 'data' => $item], 201);
    }

    public function show(EmploymentStatus $employmentStatus)
    {
        return response()->json(['data' => $employmentStatus]);
    }

    public function update(Request $request, EmploymentStatus $employmentStatus)
    {
        $validated = $request->validate([
            'code'   => 'required|string|max:20|unique:employment_statuses,code,' . $employmentStatus->id,
            'name'   => 'required|string|max:100',
            'status' => 'boolean',
        ]);

        $employmentStatus->update($validated);

        return response()->json(['message' => 'Status kerja berhasil diperbarui.', 'data' => $employmentStatus]);
    }

    public function destroy(EmploymentStatus $employmentStatus)
    {
        $employmentStatus->delete();

        return response()->json(['message' => 'Status kerja berhasil dihapus.']);
    }
}
