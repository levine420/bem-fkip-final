export const siteConfig = {
  name: "BEM FKIP UIKA",
  productName: "Platform Digital BEM FKIP UIKA",
  description:
    "Platform digital terpadu untuk informasi, layanan mahasiswa, transparansi organisasi, dan keberlanjutan data BEM FKIP UIKA lintas periode kepengurusan.",
  productVision:
    "Menjadi platform digital terpadu yang menghubungkan mahasiswa FKIP UIKA dengan layanan, informasi, dan aspirasi secara transparan, efisien, dan berkelanjutan lintas periode kepengurusan.",
  publicNavigation: [
    { label: "Beranda", href: "/" },
    { label: "Tentang", href: "/tentang" },
    { label: "Organisasi", href: "/organisasi" },
    { label: "Berita", href: "/berita" },
    { label: "Kegiatan", href: "/kegiatan/kalender" },
    { label: "Dokumen", href: "/dokumen" },
    { label: "Kontak", href: "/kontak" },
  ],
  quickLinks: [
    { title: "Berita & Pengumuman", description: "Sumber publikasi resmi BEM FKIP UIKA.", href: "/berita" },
    { title: "Kalender Kegiatan", description: "Agenda dan kegiatan yang dibuka untuk mahasiswa.", href: "/kegiatan/kalender" },
    { title: "Bank Aspirasi", description: "Kanal aspirasi privat untuk mahasiswa yang telah login.", href: "/layanan/bank-aspirasi" },
    { title: "Dokumen Organisasi", description: "Akses dokumen resmi yang berstatus publik.", href: "/dokumen" },
  ],
} as const;

export const portalNavigation = [
  { label: "Dashboard", href: "/portal/dashboard" },
  { label: "Kegiatan Saya", href: "/portal/kegiatan" },
  { label: "Aspirasi Saya", href: "/portal/aspirasi" },
  { label: "Profil", href: "/portal/profil" },
] as const;

export const adminNavigation = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Periode", href: "/admin/organisasi/periode" },
  { label: "Departemen", href: "/admin/organisasi/departemen" },
  { label: "Anggota Departemen", href: "/admin/organisasi/anggota" },
  { label: "Struktur Pengurus", href: "/admin/organisasi/struktur" },
  { label: "Konten", href: "/admin/konten" },
  { label: "Program Kerja", href: "/admin/program-kerja" },
  { label: "Kegiatan", href: "/admin/layanan/kegiatan" },
  { label: "Dokumen", href: "/admin/dokumen" },
  { label: "Aspirasi", href: "/admin/layanan/aspirasi" },
  { label: "Users / Admin Access", href: "/admin/pengguna/admin" },
  { label: "Program Studi", href: "/admin/program-studi" },
  { label: "Activity Log", href: "/admin/activity-log" },
  { label: "Pengaturan", href: "/admin/pengaturan" },
  { label: "Profil", href: "/admin/profil" },
] as const;
