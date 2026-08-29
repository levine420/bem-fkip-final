export type UserRole = "MAHASISWA" | "ADMIN" | "SUPER_ADMIN";
export type UserAccountStatus = "AKTIF" | "NONAKTIF" | "BELUM_VERIFIKASI";
export type PeriodStatus = "AKTIF" | "NONAKTIF" | "ARSIP";
export type ContentStatus = "DRAF" | "MENUNGGU_REVIEW" | "TERBIT" | "REVISI";
export type ContentCategory = "BERITA" | "PENGUMUMAN" | "KAJIAN" | "RILIS_PERS" | "LAINNYA";
export type WorkProgramStatus = "BELUM_MULAI" | "BERJALAN" | "SELESAI" | "DITUNDA" | "DIBATALKAN";
export type AspirationCategory = "AKADEMIK" | "FASILITAS" | "KEGIATAN" | "KESEJAHTERAAN" | "LAINNYA";
export type AspirationStatus = "MASUK" | "DIPROSES" | "SELESAI" | "DITOLAK";
export type EventStatus = "DRAF" | "TERBIT" | "BERJALAN" | "SELESAI" | "DIBATALKAN" | "DIARSIPKAN";
export type RegistrationStatus = "SEGERA_DIBUKA" | "TERBUKA" | "PENUH" | "TUTUP";
export type EventRegistrationStatus = "MENUNGGU" | "DITERIMA" | "DITOLAK" | "HADIR" | "TIDAK_HADIR";
export type DocumentCategory = "LPJ" | "PROPOSAL" | "SK" | "AD_ART" | "LAPORAN" | "ARSIP";

export interface User {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  nim: string;
  angkatan: number;
  avatar_url: string | null;
  role: UserRole;
  account_status: UserAccountStatus;
  program_studi_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Period {
  id: string;
  name: string;
  visi: string | null;
  misi: string | null;
  year_start: number;
  year_end: number;
  status: PeriodStatus;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  period_id: string;
  created_at: string;
  updated_at: string;
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
  department_id: string | null;
  period_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  seo_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  reading_time: number | null;
  body: string;
  thumbnail_url: string | null;
  view_count: number;
  category: ContentCategory;
  status: ContentStatus;
  author_id: string;
  department_id: string | null;
  period_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkProgram {
  id: string;
  name: string;
  description: string | null;
  status: WorkProgramStatus;
  display_order: number;
  department_id: string;
  period_id: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  poster_url: string | null;
  start_time: string;
  end_time: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  status: EventStatus;
  registration_status: RegistrationStatus;
  created_by_user_id: string;
  department_id: string;
  period_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  status: EventRegistrationStatus;
  registration_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Aspiration {
  id: string;
  title: string;
  body: string;
  category: AspirationCategory;
  status: AspirationStatus;
  response: string | null;
  user_id: string;
  handler_id: string | null;
  responded_at: string | null;
  period_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  original_filename: string;
  storage_key: string;
  file_type: string;
  file_size: number;
  download_count: number;
  is_public: boolean;
  checksum: string | null;
  category: DocumentCategory;
  uploader_id: string;
  period_id: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
