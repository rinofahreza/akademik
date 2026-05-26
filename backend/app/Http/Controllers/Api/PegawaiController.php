<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\User;
use App\Traits\HasServerSideTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PegawaiController extends Controller
{
    use HasServerSideTable;

    public function index(Request $request)
    {
        $query = Pegawai::with(['category', 'position', 'employmentStatus', 'subject', 'tingkatPendidikan', 'user']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', '%' . $request->search . '%')
                  ->orWhere('nig', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('pegawai_category_id')) {
            $query->where('pegawai_category_id', $request->pegawai_category_id);
        }

        if ($request->filled('pegawai_position_id')) {
            $query->where('pegawai_position_id', $request->pegawai_position_id);
        }

        if ($request->filled('employment_status_id')) {
            $query->where('employment_status_id', $request->employment_status_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('tingkat_pendidikan_id')) {
            $query->where('tingkat_pendidikan_id', $request->tingkat_pendidikan_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        return response()->json($this->paginateQuery($query, $request));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nig'                  => 'nullable|string|max:50|unique:pegawais,nig',
            'nama_lengkap'         => 'required|string|max:200',
            'email'                => 'nullable|email|max:200',
            'nomor_hp'             => 'nullable|string|max:20',
            'jenis_kelamin'        => 'required|in:L,P',
            'tempat_lahir'         => 'nullable|string|max:100',
            'tanggal_lahir'        => 'nullable|date',
            'alamat'               => 'nullable|string',
            'pegawai_category_id'  => 'required|exists:pegawai_categories,id',
            'pegawai_position_id'  => 'required|exists:pegawai_positions,id',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'subject_id'           => 'nullable|exists:subjects,id',
            'tingkat_pendidikan_id' => 'nullable|exists:tingkat_pendidikans,id',
            'status'               => 'boolean',
        ]);

        $emailPrefix = $validated['nig']
            ? $validated['nig']
            : now()->format('ymdHis');

        $loginEmail = $validated['email'] ?? ($emailPrefix . '@pegawai.akademik.id');

        $defaultPassword = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'), 0, 8);

        $user = User::create([
            'name'      => $validated['nama_lengkap'],
            'email'     => $loginEmail,
            'password'  => Hash::make($defaultPassword),
            'is_active' => $validated['status'] ?? true,
        ]);
        $user->assignRole('Pegawai');

        $validated['user_id'] = $user->id;
        $item = Pegawai::create($validated);

        return response()->json([
            'message'          => 'Pegawai berhasil ditambahkan.',
            'default_password' => $defaultPassword,
            'login_email'      => $loginEmail,
            'data'             => $item->load(['category', 'position', 'employmentStatus', 'subject', 'tingkatPendidikan', 'user']),
        ], 201);
    }

    public function show(Pegawai $pegawai)
    {
        return response()->json(['data' => $pegawai->load(['category', 'position', 'employmentStatus', 'subject', 'tingkatPendidikan', 'user'])]);
    }

    public function update(Request $request, Pegawai $pegawai)
    {
        $validated = $request->validate([
            'nig'                  => 'nullable|string|max:50|unique:pegawais,nig,' . $pegawai->id,
            'nama_lengkap'         => 'required|string|max:200',
            'email'                => 'nullable|email|max:200',
            'nomor_hp'             => 'nullable|string|max:20',
            'jenis_kelamin'        => 'required|in:L,P',
            'tempat_lahir'         => 'nullable|string|max:100',
            'tanggal_lahir'        => 'nullable|date',
            'alamat'               => 'nullable|string',
            'pegawai_category_id'  => 'required|exists:pegawai_categories,id',
            'pegawai_position_id'  => 'required|exists:pegawai_positions,id',
            'employment_status_id' => 'required|exists:employment_statuses,id',
            'subject_id'           => 'nullable|exists:subjects,id',
            'tingkat_pendidikan_id' => 'nullable|exists:tingkat_pendidikans,id',
            'status'               => 'boolean',
        ]);

        $pegawai->update($validated);

        if ($pegawai->user) {
            $pegawai->user->update([
                'name'      => $validated['nama_lengkap'],
                'is_active' => $validated['status'] ?? $pegawai->user->is_active,
            ]);
        }

        return response()->json([
            'message' => 'Pegawai berhasil diperbarui.',
            'data'    => $pegawai->load(['category', 'position', 'employmentStatus', 'subject', 'tingkatPendidikan', 'user']),
        ]);
    }

    public function toggleStatus(Pegawai $pegawai)
    {
        $pegawai->update(['status' => !$pegawai->status]);

        if ($pegawai->user) {
            $pegawai->user->update(['is_active' => $pegawai->status]);
        }

        return response()->json([
            'message' => 'Status berhasil diperbarui.',
            'status'  => $pegawai->status,
        ]);
    }

    public function destroy(Pegawai $pegawai)
    {
        $user = $pegawai->user;
        $pegawai->delete();
        if ($user) {
            $user->delete();
        }

        return response()->json(['message' => 'Pegawai berhasil dihapus.']);
    }
}
