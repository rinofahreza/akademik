<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@akademik.id'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('Super Admin');

        $admin = User::firstOrCreate(
            ['email' => 'admin@akademik.id'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $admin->assignRole('Admin');

        $guru = User::firstOrCreate(
            ['email' => 'guru@akademik.id'],
            [
                'name' => 'Guru Demo',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $guru->assignRole('Guru');

        $pimpinan = User::firstOrCreate(
            ['email' => 'pimpinan@akademik.id'],
            [
                'name' => 'Pimpinan',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $pimpinan->assignRole('Pimpinan');
    }
}
