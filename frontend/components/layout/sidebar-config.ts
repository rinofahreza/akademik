import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  GraduationCap,
  Calendar,
  School,
  BookOpen,
  UserCog,
  Briefcase,
  ClipboardList,
  Users2,
  Building2,
  ActivitySquare,
  ListOrdered,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  children?: NavItem[];
}

export const navConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard.read',
  },
  {
    label: 'User Management',
    icon: Users,
    children: [
      {
        label: 'Users',
        href: '/users',
        icon: Users2,
        permission: 'user.read',
      },
      {
        label: 'Roles & Permissions',
        href: '/roles',
        icon: ShieldCheck,
        permission: 'role.read',
      },
    ],
  },
  {
    label: 'Master Akademik',
    icon: School,
    children: [
      {
        label: 'Tingkat Pendidikan',
        href: '/tingkat-pendidikan',
        icon: GraduationCap,
        permission: 'tingkat-pendidikan.read',
      },
      {
        label: 'Tahun Ajaran',
        href: '/tahun-ajaran',
        icon: Calendar,
        permission: 'tahun-ajaran.read',
      },
      {
        label: 'Kelas',
        href: '/kelas',
        icon: Building2,
        permission: 'kelas.read',
      },
      {
        label: 'Mata Pelajaran',
        href: '/subjects',
        icon: BookOpen,
        permission: 'subject.read',
      },
    ],
  },
  {
    label: 'Master Pegawai',
    icon: UserCog,
    children: [
      {
        label: 'Unit Pegawai',
        href: '/pegawai-categories',
        icon: ClipboardList,
        permission: 'pegawai-category.read',
      },
      {
        label: 'Posisi/Jabatan',
        href: '/pegawai-positions',
        icon: Briefcase,
        permission: 'pegawai-position.read',
      },
      {
        label: 'Status Kerja',
        href: '/employment-statuses',
        icon: ClipboardList,
        permission: 'employment-status.read',
      },
    ],
  },
  {
    label: 'Data Akademik',
    icon: School,
    children: [
      {
        label: 'Siswa',
        href: '/siswa',
        icon: Users,
        permission: 'siswa.read',
      },
      {
        label: 'Penempatan Kelas',
        href: '/siswa-kelas',
        icon: ListOrdered,
        permission: 'siswa-kelas.read',
      },
      {
        label: 'Pegawai',
        href: '/pegawai',
        icon: UserCog,
        permission: 'pegawai.read',
      },
    ],
  },
  {
    label: 'Log Aktivitas',
    href: '/activity-logs',
    icon: ActivitySquare,
    permission: 'activity-log.read',
  },
];
