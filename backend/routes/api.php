<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmploymentStatusController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\PegawaiCategoryController;
use App\Http\Controllers\Api\PegawaiController;
use App\Http\Controllers\Api\PegawaiPositionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\SiswaKelasController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TahunAjaranController;
use App\Http\Controllers\Api\TingkatPendidikanController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);

    Route::middleware('permission:dashboard.read')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
    });

    Route::middleware('permission:user.read')->get('/users', [UserController::class, 'index']);
    Route::middleware('permission:user.create')->post('/users', [UserController::class, 'store']);
    Route::middleware('permission:user.read')->get('/users/{user}', [UserController::class, 'show']);
    Route::middleware('permission:user.update')->put('/users/{user}', [UserController::class, 'update']);
    Route::middleware('permission:user.delete')->delete('/users/{user}', [UserController::class, 'destroy']);

    Route::middleware('permission:role.read')->get('/roles', [RoleController::class, 'index']);
    Route::middleware('permission:role.create')->post('/roles', [RoleController::class, 'store']);
    Route::middleware('permission:role.read')->get('/roles/{role}', [RoleController::class, 'show']);
    Route::middleware('permission:role.update')->put('/roles/{role}', [RoleController::class, 'update']);
    Route::middleware('permission:role.delete')->delete('/roles/{role}', [RoleController::class, 'destroy']);
    Route::middleware('permission:role.read')->get('/permissions', [RoleController::class, 'permissions']);

    Route::middleware('permission:tingkat-pendidikan.read')->get('/tingkat-pendidikan', [TingkatPendidikanController::class, 'index']);
    Route::middleware('permission:tingkat-pendidikan.create')->post('/tingkat-pendidikan', [TingkatPendidikanController::class, 'store']);
    Route::middleware('permission:tingkat-pendidikan.read')->get('/tingkat-pendidikan/{tingkatPendidikan}', [TingkatPendidikanController::class, 'show']);
    Route::middleware('permission:tingkat-pendidikan.update')->put('/tingkat-pendidikan/{tingkatPendidikan}', [TingkatPendidikanController::class, 'update']);
    Route::middleware('permission:tingkat-pendidikan.delete')->delete('/tingkat-pendidikan/{tingkatPendidikan}', [TingkatPendidikanController::class, 'destroy']);

    Route::middleware('permission:tahun-ajaran.read')->get('/tahun-ajaran', [TahunAjaranController::class, 'index']);
    Route::middleware('permission:tahun-ajaran.create')->post('/tahun-ajaran', [TahunAjaranController::class, 'store']);
    Route::middleware('permission:tahun-ajaran.read')->get('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'show']);
    Route::middleware('permission:tahun-ajaran.update')->put('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'update']);
    Route::middleware('permission:tahun-ajaran.delete')->delete('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'destroy']);
    Route::middleware('permission:tahun-ajaran.update')->put('/tahun-ajaran/{tahunAjaran}/set-active', [TahunAjaranController::class, 'setActive']);

    Route::middleware('permission:pegawai-category.read')->get('/pegawai-categories', [PegawaiCategoryController::class, 'index']);
    Route::middleware('permission:pegawai-category.create')->post('/pegawai-categories', [PegawaiCategoryController::class, 'store']);
    Route::middleware('permission:pegawai-category.read')->get('/pegawai-categories/{pegawaiCategory}', [PegawaiCategoryController::class, 'show']);
    Route::middleware('permission:pegawai-category.update')->put('/pegawai-categories/{pegawaiCategory}', [PegawaiCategoryController::class, 'update']);
    Route::middleware('permission:pegawai-category.delete')->delete('/pegawai-categories/{pegawaiCategory}', [PegawaiCategoryController::class, 'destroy']);

    Route::middleware('permission:pegawai-position.read')->get('/pegawai-positions', [PegawaiPositionController::class, 'index']);
    Route::middleware('permission:pegawai-position.create')->post('/pegawai-positions', [PegawaiPositionController::class, 'store']);
    Route::middleware('permission:pegawai-position.read')->get('/pegawai-positions/{pegawaiPosition}', [PegawaiPositionController::class, 'show']);
    Route::middleware('permission:pegawai-position.update')->put('/pegawai-positions/{pegawaiPosition}', [PegawaiPositionController::class, 'update']);
    Route::middleware('permission:pegawai-position.delete')->delete('/pegawai-positions/{pegawaiPosition}', [PegawaiPositionController::class, 'destroy']);

    Route::middleware('permission:employment-status.read')->get('/employment-statuses', [EmploymentStatusController::class, 'index']);
    Route::middleware('permission:employment-status.create')->post('/employment-statuses', [EmploymentStatusController::class, 'store']);
    Route::middleware('permission:employment-status.read')->get('/employment-statuses/{employmentStatus}', [EmploymentStatusController::class, 'show']);
    Route::middleware('permission:employment-status.update')->put('/employment-statuses/{employmentStatus}', [EmploymentStatusController::class, 'update']);
    Route::middleware('permission:employment-status.delete')->delete('/employment-statuses/{employmentStatus}', [EmploymentStatusController::class, 'destroy']);

    Route::middleware('permission:subject.read')->get('/subjects', [SubjectController::class, 'index']);
    Route::middleware('permission:subject.create')->post('/subjects', [SubjectController::class, 'store']);
    Route::middleware('permission:subject.read')->get('/subjects/{subject}', [SubjectController::class, 'show']);
    Route::middleware('permission:subject.update')->put('/subjects/{subject}', [SubjectController::class, 'update']);
    Route::middleware('permission:subject.delete')->delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

    Route::middleware('permission:kelas.read')->get('/kelas', [KelasController::class, 'index']);
    Route::middleware('permission:kelas.create')->post('/kelas', [KelasController::class, 'store']);
    Route::middleware('permission:kelas.read')->get('/kelas/{kelas}', [KelasController::class, 'show']);
    Route::middleware('permission:kelas.update')->put('/kelas/{kelas}', [KelasController::class, 'update']);
    Route::middleware('permission:kelas.delete')->delete('/kelas/{kelas}', [KelasController::class, 'destroy']);

    Route::middleware('permission:siswa.read')->get('/siswa', [SiswaController::class, 'index']);
    Route::middleware('permission:siswa.create')->post('/siswa', [SiswaController::class, 'store']);
    Route::middleware('permission:siswa.read')->get('/siswa/{siswa}', [SiswaController::class, 'show']);
    Route::middleware('permission:siswa.update')->put('/siswa/{siswa}', [SiswaController::class, 'update']);
    Route::middleware('permission:siswa.update')->patch('/siswa/{siswa}/toggle-status', [SiswaController::class, 'toggleStatus']);
    Route::middleware('permission:siswa.delete')->delete('/siswa/{siswa}', [SiswaController::class, 'destroy']);

    Route::middleware('permission:siswa-kelas.read')->get('/siswa-kelas', [SiswaKelasController::class, 'index']);
    Route::middleware('permission:siswa-kelas.create')->post('/siswa-kelas', [SiswaKelasController::class, 'store']);
    Route::middleware('permission:siswa-kelas.update')->put('/siswa-kelas/{siswaKelas}', [SiswaKelasController::class, 'update']);
    Route::middleware('permission:siswa-kelas.delete')->delete('/siswa-kelas/{siswaKelas}', [SiswaKelasController::class, 'destroy']);
    Route::middleware('permission:siswa-kelas.create')->post('/siswa-kelas/naik-massal', [SiswaKelasController::class, 'naikKelasMassal']);
    Route::middleware('permission:siswa-kelas.read')->get('/siswa-kelas/kelas-summary', [SiswaKelasController::class, 'kelasSummary']);
    Route::middleware('permission:siswa-kelas.read')->get('/siswa-kelas/kelas/{kelasId}/siswa', [SiswaKelasController::class, 'kelasSiswa']);
    Route::middleware('permission:siswa-kelas.update')->post('/siswa-kelas/kelas/{kelasId}/sync', [SiswaKelasController::class, 'syncKelas']);

    Route::middleware('permission:pegawai.read')->get('/pegawai', [PegawaiController::class, 'index']);
    Route::middleware('permission:pegawai.create')->post('/pegawai', [PegawaiController::class, 'store']);
    Route::middleware('permission:pegawai.read')->get('/pegawai/{pegawai}', [PegawaiController::class, 'show']);
    Route::middleware('permission:pegawai.update')->put('/pegawai/{pegawai}', [PegawaiController::class, 'update']);
    Route::middleware('permission:pegawai.update')->patch('/pegawai/{pegawai}/toggle-status', [PegawaiController::class, 'toggleStatus']);
    Route::middleware('permission:pegawai.delete')->delete('/pegawai/{pegawai}', [PegawaiController::class, 'destroy']);

    Route::middleware('permission:activity-log.read')->group(function () {
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/log-names', [ActivityLogController::class, 'logNames']);
    });

    // Siswa portal - akses berdasarkan relasi user->siswa
    Route::get('/siswa-portal/profile', [SiswaController::class, 'myProfile']);
});
