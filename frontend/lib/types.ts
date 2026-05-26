export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TingkatPendidikan {
  id: number;
  name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface TahunAjaran {
  id: number;
  nama_tahun_ajaran: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_active: boolean;
}

export interface PegawaiCategory {
  id: number;
  name: string;
  status: boolean;
}

export interface PegawaiPosition {
  id: number;
  pegawai_category_id: number;
  name: string;
  status: boolean;
  category?: PegawaiCategory;
}

export interface EmploymentStatus {
  id: number;
  code: string;
  name: string;
  status: boolean;
}

export interface Subject {
  id: number;
  name: string;
  status: boolean;
}

export interface Kelas {
  id: number;
  tingkat_pendidikan_id: number;
  tahun_ajaran_id: number;
  nama_kelas: string;
  wali_kelas_id: number | null;
  status: boolean;
  tingkat_pendidikan?: TingkatPendidikan;
  tahun_ajaran?: TahunAjaran;
  wali_kelas?: Pegawai;
}

export interface SiswaKelas {
  id: number;
  siswa_id: number;
  kelas_id: number;
  tahun_ajaran_id: number;
  siswa?: Siswa;
  kelas?: Kelas;
  tahun_ajaran?: TahunAjaran;
}

export interface Siswa {
  id: number;
  user_id: number | null;
  kode_bayar: string;
  nomor_induk: string | null;
  nisn: string | null;
  no_kk: string;
  nik: string | null;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string | null;
  tingkat_pendidikan_id: number;
  status: boolean;
  tingkat_pendidikan?: TingkatPendidikan;
  kelasAktif?: SiswaKelas;
  kelas_records?: SiswaKelas[];
  kelasRecords?: SiswaKelas[]; // keep for backward compatibility
  user?: User;
}

export interface Pegawai {
  id: number;
  user_id: number | null;
  nig: string | null;
  nama_lengkap: string;
  email: string | null;
  nomor_hp: string | null;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  pegawai_category_id: number;
  pegawai_position_id: number;
  employment_status_id: number;
  subject_id: number | null;
  tingkat_pendidikan_id: number | null;
  status: boolean;
  category?: PegawaiCategory;
  position?: PegawaiPosition;
  employment_status?: EmploymentStatus;
  subject?: Subject;
  tingkat_pendidikan?: TingkatPendidikan;
  user?: User;
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles?: Role[];
}
