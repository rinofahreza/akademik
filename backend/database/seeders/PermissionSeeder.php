<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $resources = [
            'dashboard',
            'user',
            'role',
            'siswa',
            'siswa-kelas',
            'pegawai',
            'kelas',
            'subject',
            'tingkat-pendidikan',
            'tahun-ajaran',
            'pegawai-category',
            'pegawai-position',
            'employment-status',
            'activity-log',
            'settings',
        ];

        $actions = ['create', 'read', 'update', 'delete'];

        foreach ($resources as $resource) {
            foreach ($actions as $action) {
                Permission::firstOrCreate(['name' => "{$resource}.{$action}", 'guard_name' => 'web']);
            }
        }

        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $guru = Role::firstOrCreate(['name' => 'Guru', 'guard_name' => 'web']);
        $pegawaiRole = Role::firstOrCreate(['name' => 'Pegawai', 'guard_name' => 'web']);
        $pimpinan = Role::firstOrCreate(['name' => 'Pimpinan', 'guard_name' => 'web']);
        $siswaRole = Role::firstOrCreate(['name' => 'Siswa', 'guard_name' => 'web']);

        $superAdmin->syncPermissions(Permission::all());

        $adminPermissions = [
            'dashboard.read',
            'activity-log.read',
            'user.create', 'user.read', 'user.update', 'user.delete',
            'role.read',
            'siswa.create', 'siswa.read', 'siswa.update', 'siswa.delete',
            'siswa-kelas.create', 'siswa-kelas.read', 'siswa-kelas.update', 'siswa-kelas.delete',
            'pegawai.create', 'pegawai.read', 'pegawai.update', 'pegawai.delete',
            'kelas.create', 'kelas.read', 'kelas.update', 'kelas.delete',
            'subject.create', 'subject.read', 'subject.update', 'subject.delete',
            'tingkat-pendidikan.create', 'tingkat-pendidikan.read', 'tingkat-pendidikan.update', 'tingkat-pendidikan.delete',
            'tahun-ajaran.create', 'tahun-ajaran.read', 'tahun-ajaran.update', 'tahun-ajaran.delete',
            'pegawai-category.create', 'pegawai-category.read', 'pegawai-category.update', 'pegawai-category.delete',
            'pegawai-position.create', 'pegawai-position.read', 'pegawai-position.update', 'pegawai-position.delete',
            'employment-status.create', 'employment-status.read', 'employment-status.update', 'employment-status.delete',
            'settings.read', 'settings.update',
        ];
        $admin->syncPermissions($adminPermissions);

        $guruPermissions = [
            'dashboard.read',
            'siswa.read',
            'kelas.read',
            'subject.read',
            'tingkat-pendidikan.read',
            'tahun-ajaran.read',
        ];
        $guru->syncPermissions($guruPermissions);

        $pegawaiRole->syncPermissions([
            'dashboard.read',
        ]);

        $pimpinanPermissions = [
            'dashboard.read',
            'activity-log.read',
            'siswa.read',
            'pegawai.read',
            'kelas.read',
            'subject.read',
            'tingkat-pendidikan.read',
            'tahun-ajaran.read',
            'pegawai-category.read',
            'pegawai-position.read',
            'employment-status.read',
        ];
        $pimpinan->syncPermissions($pimpinanPermissions);

        $siswaRole->syncPermissions([
            'dashboard.read',
            'siswa.read',
            'kelas.read',
            'tahun-ajaran.read',
            'tingkat-pendidikan.read',
        ]);
    }
}
