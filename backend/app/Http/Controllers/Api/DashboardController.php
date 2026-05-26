<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Pegawai;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use App\Models\TingkatPendidikan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $activeTahunAjaran = TahunAjaran::where('is_active', true)->first();

        $kelasQuery = Kelas::query();

        if ($activeTahunAjaran) {
            $kelasQuery->where('tahun_ajaran_id', $activeTahunAjaran->id);
        }

        $totalSiswa = $activeTahunAjaran
            ? SiswaKelas::where('tahun_ajaran_id', $activeTahunAjaran->id)->distinct('siswa_id')->count('siswa_id')
            : Siswa::count();

        $totalPegawai = Pegawai::count();
        $totalKelas   = $kelasQuery->count();

        $siswaPerTingkat = TingkatPendidikan::withCount([
            'siswas' => function ($q) use ($activeTahunAjaran) {
                if ($activeTahunAjaran) {
                    $q->whereHas('kelasRecords', fn($r) => $r->where('tahun_ajaran_id', $activeTahunAjaran->id));
                }
            },
        ])->get()->map(fn($t) => [
            'name'  => $t->name,
            'total' => $t->siswas_count,
        ]);

        $siswaPerKelas = Kelas::with('tingkatPendidikan')
            ->withCount([
                'siswaKelas' => function ($q) use ($activeTahunAjaran) {
                    if ($activeTahunAjaran) {
                        $q->where('tahun_ajaran_id', $activeTahunAjaran->id);
                    }
                },
            ])
            ->when($activeTahunAjaran, fn($q) => $q->where('tahun_ajaran_id', $activeTahunAjaran->id))
            ->get()
            ->map(fn($k) => [
                'name'   => $k->nama_kelas,
                'tingkat'=> $k->tingkatPendidikan->name ?? '-',
                'total'  => $k->siswa_kelas_count,
            ]);

        $pegawaiPerKategori = Pegawai::selectRaw('pegawai_category_id, count(*) as total')
            ->groupBy('pegawai_category_id')
            ->with('category')
            ->get()
            ->map(fn($p) => [
                'name'  => $p->category->name ?? '-',
                'total' => $p->total,
            ]);

        $pegawaiPerStatus = Pegawai::selectRaw('employment_status_id, count(*) as total')
            ->groupBy('employment_status_id')
            ->with('employmentStatus')
            ->get()
            ->map(fn($p) => [
                'name'  => $p->employmentStatus->name ?? '-',
                'code'  => $p->employmentStatus->code ?? '-',
                'total' => $p->total,
            ]);

        $userPerRole = DB::table('roles')
            ->leftJoin('model_has_roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('COUNT(model_has_roles.role_id) as total'))
            ->groupBy('roles.id', 'roles.name')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->name,
                'total' => (int) $r->total,
            ]);

        $guruBidangStudiCount = Pegawai::whereNotNull('subject_id')->count();

        return response()->json([
            'data' => [
                'total_siswa'           => $totalSiswa,
                'total_pegawai'         => $totalPegawai,
                'total_kelas'           => $totalKelas,
                'tahun_ajaran_aktif'    => $activeTahunAjaran,
                'siswa_per_tingkat'     => $siswaPerTingkat,
                'siswa_per_kelas'       => $siswaPerKelas,
                'pegawai_per_kategori'  => $pegawaiPerKategori,
                'pegawai_per_status'    => $pegawaiPerStatus,
                'user_per_role'         => $userPerRole,
                'guru_bidang_studi'     => $guruBidangStudiCount,
            ],
        ]);
    }
}
