<?php

namespace Database\Seeders;

use App\Models\EmploymentStatus;
use App\Models\PegawaiCategory;
use App\Models\PegawaiPosition;
use App\Models\Subject;
use App\Models\TahunAjaran;
use App\Models\TingkatPendidikan;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $tingkatList = ['PG', 'TK', 'SD', 'SMP', 'SMA'];
        foreach ($tingkatList as $name) {
            TingkatPendidikan::firstOrCreate(['name' => $name], ['status' => true]);
        }

        TahunAjaran::firstOrCreate(
            ['nama_tahun_ajaran' => '2024/2025'],
            [
                'tanggal_mulai' => '2024-07-15',
                'tanggal_selesai' => '2025-06-30',
                'is_active' => true,
            ]
        );

        TahunAjaran::firstOrCreate(
            ['nama_tahun_ajaran' => '2025/2026'],
            [
                'tanggal_mulai' => '2025-07-14',
                'tanggal_selesai' => '2026-06-30',
                'is_active' => false,
            ]
        );

        EmploymentStatus::firstOrCreate(['code' => 'PKWT'], ['name' => 'Pegawai Kontrak', 'status' => true]);
        EmploymentStatus::firstOrCreate(['code' => 'PKWTT'], ['name' => 'Pegawai Tetap', 'status' => true]);

        $subjectList = [
            'Bahasa Inggris', 'Bahasa Indonesia', 'Matematika', 'Fisika',
            'Kimia', 'Biologi', 'Pendidikan Agama Islam', 'IPS', 'IPA', 'PJOK',
            'Seni Budaya', 'TIK', 'PKn',
        ];
        foreach ($subjectList as $name) {
            Subject::firstOrCreate(['name' => $name], ['status' => true]);
        }

        $categories = [
            'Guru' => [
                'Guru Kelas', 'Guru Bidang Studi', 'Wali Kelas', 'Koordinator Kurikulum',
            ],
            'Tata Usaha' => [
                'Teknisi Sekolah', 'Teknisi Jaringan', 'Teknisi Listrik',
                'Administrasi Sekolah', 'Operator Sekolah', 'Bendahara',
            ],
            'Toserba' => ['Staff Toserba'],
            'Cleaning Service' => ['Cleaning Service'],
            'Koperasi' => ['Staff Koperasi'],
            'Dapur' => ['Staff Dapur'],
            'Satpam' => ['Satpam'],
            'Driver' => ['Driver'],
        ];

        foreach ($categories as $categoryName => $positions) {
            $category = PegawaiCategory::firstOrCreate(['name' => $categoryName], ['status' => true]);
            foreach ($positions as $positionName) {
                PegawaiPosition::firstOrCreate(
                    ['pegawai_category_id' => $category->id, 'name' => $positionName],
                    ['status' => true]
                );
            }
        }
    }
}
