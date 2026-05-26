# Sistem Akademik Sekolah

Admin panel modern untuk sistem akademik sekolah/yayasan multi-tingkat pendidikan.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12, Sanctum, Spatie Permission |
| Database | MySQL |
| Frontend | Next.js 16, Tailwind CSS, Tanstack Table |
| State | Zustand |
| Forms | React Hook Form + Zod |

---

## Instalasi Backend

### 1. Masuk ke folder backend
```bash
cd backend
```

### 2. Install dependencies
```bash
composer install
```

### 3. Copy dan konfigurasi .env
```bash
cp .env.example .env
```
Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=akademik_sekolah
DB_USERNAME=root
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost
```

### 4. Generate app key
```bash
php artisan key:generate
```

### 5. Buat database MySQL
```bash
mysql -u root -p -e "CREATE DATABASE akademik_sekolah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 6. Jalankan migrasi dan seeder
```bash
php artisan migrate:fresh --seed
```

### 7. Jalankan backend server
```bash
php artisan serve --port=8000
```

---

## Instalasi Frontend

### 1. Masuk ke folder frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Konfigurasi environment
File `.env.local` sudah ada dengan isi:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Jalankan frontend
```bash
npm run dev
```

Akses di: **http://localhost:3000**

---

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@akademik.id | password |
| Admin | admin@akademik.id | password |
| Guru | guru@akademik.id | password |
| Pimpinan | pimpinan@akademik.id | password |

---

## Fitur

### Authentication
- Login / Logout dengan Laravel Sanctum token
- Protected routes
- Auto redirect ke login jika belum auth

### Role & Permission (Spatie)
- Dynamic sidebar berdasarkan permission `*.read`
- Tombol CRUD dikontrol permission frontend + backend
- Semua endpoint dilindungi middleware permission

### Menu
- **Dashboard** — statistik dinamis dari database
- **User Management** — Users, Roles & Permissions
- **Master Akademik** — Tingkat Pendidikan, Tahun Ajaran, Kelas, Mata Pelajaran
- **Master Pegawai** — Kategori, Posisi/Jabatan, Status Kerja
- **Data Akademik** — Siswa, Pegawai

### Server-Side Table
- Pagination (default 20/halaman)
- Search, Filter, Sorting
- Response format: `{ data: [], meta: { current_page, per_page, total, last_page } }`

---

## Struktur Folder

```
asshofa/
├── backend/              # Laravel 12
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Traits/HasServerSideTable.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
└── frontend/             # Next.js 16
    ├── app/
    │   ├── (auth)/login/
    │   └── (dashboard)/
    │       ├── dashboard/
    │       ├── users/
    │       ├── roles/
    │       ├── tingkat-pendidikan/
    │       ├── tahun-ajaran/
    │       ├── kelas/
    │       ├── subjects/
    │       ├── pegawai-categories/
    │       ├── pegawai-positions/
    │       ├── employment-statuses/
    │       ├── siswa/
    │       └── pegawai/
    ├── components/
    │   ├── layout/       # Sidebar, Topbar
    │   ├── tables/       # DataTable
    │   └── ui/           # Modal, Badge, etc.
    ├── hooks/useTable.ts
    ├── lib/axios.ts
    └── store/authStore.ts
```
