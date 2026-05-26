<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = Role::with('permissions');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->get('all') === 'true') {
            return response()->json(['data' => Role::all()]);
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json(['message' => 'Role berhasil ditambahkan.', 'data' => $role->load('permissions')], 201);
    }

    public function show(Role $role)
    {
        return response()->json(['data' => $role->load('permissions')]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100|unique:roles,name,' . $role->id,
            'permissions'   => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json(['message' => 'Role berhasil diperbarui.', 'data' => $role->load('permissions')]);
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    public function permissions()
    {
        return response()->json(['data' => Permission::all()]);
    }
}
