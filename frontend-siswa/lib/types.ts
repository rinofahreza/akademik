export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface TingkatPendidikan {
  id: number;
  name: string;
}

export interface TahunAjaran {
  id: number;
  nama: string;
  is_active: boolean;
}

export interface Kelas {
  id: number;
  nama_kelas: string;
}

export interface SiswaKelas {
  id: number;
  siswa_id: number;
  kelas_id: number;
  tahun_ajaran_id: number;
  kelas?: Kelas;
  tahun_ajaran?: TahunAjaran;
}

export interface SiswaProfile {
  id: number;
  user_id: number;
  kode_bayar: string;
  nomor_induk: string | null;
  nisn: string | null;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string | null;
  telepon_orang_tua: string | null;
  status: boolean;
  tingkat_pendidikan?: TingkatPendidikan;
  kelas_records?: SiswaKelas[];
  user?: AuthUser;
}
