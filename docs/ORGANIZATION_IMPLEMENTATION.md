# Organisasi Admin — v0.3.0

Source continuation setelah fondasi v0.2.0. Dokumen ini menjelaskan kode yang tersedia, bukan bukti build atau database sudah berjalan. Batas QA ada di `QA_ADMIN_FOUNDATION.md`.

## Cakupan dan keputusan

| Area | Implementasi source |
|---|---|
| Departemen | SA create/edit/soft-delete; Admin hanya edit deskripsi/logo departemen sendiri. Nama dan slug unik per periode, termasuk row yang dihapus. |
| Anggota Departemen | CRUD roster SA atau Admin yang ditugaskan pada departemen + periode tersebut. Tidak memberikan akses akun. |
| Struktur Pengurus | CRUD khusus SA. Departemen nullable untuk pengurus inti, sesuai rekonsiliasi GDO. |
| Pencarian | Nama departemen; nama/jabatan anggota/pengurus. Filter periode/departemen. Daftar dan lookup dibatasi 20 per halaman. Urut anggota menurut display_order, nama, id. |
| Form | Loading/error/empty/pending states, input dipertahankan saat gagal, konfirmasi penghapusan, pesan konflik versi, arsip hanya baca. Glass/pink CSS lama dipertahankan. |
| Konsistensi | Semua mutasi di wrapper auth/CSRF/transaksi serializable yang sama dengan audit; version predicate mencegah lost update. |

1. **Periode draf:** SA boleh menyiapkan departemen/roster/struktur pada NONAKTIF. PRD BR-01 menyebut otomatis aktif untuk *konten, proker, kegiatan*, bukan persiapan organisasi. Membuat organisasi tidak mengaktifkan periode/akun. Admin biasa tetap hanya pada periode AKTIF penugasannya. ARSIP tidak dapat ditulis siapapun.
2. **Kepemilikan:** period_id tidak dapat diganti. Department roster juga tidak dapat dipindah; hapus entri lama lalu buat entri baru untuk menjaga jejak. SA dapat mengoreksi departemen pengurus struktur dalam periode yang sama, termasuk NULL untuk inti. Departemen harus masih ada dan belum soft-delete.
3. **Akses terpisah:** user_id tidak diterima pada form/API organisasi. Relasi opsional pada schema tetap tersedia, tetapi picker/link akun ditunda ke Users/Admin Access. Tidak membuat user atau assignment otomatis dari nama anggota/pengurus.
4. **Penghapusan:** hanya soft-delete dengan confirmed=true dan version. Tidak ada restore/hard-delete API. Departemen dengan assignment belum dicabut atau board/roster/konten/proker/event/dokumen yang belum dihapus ditolak. Nama/slug tetap dicadangkan; membuat ulang nama/slug yang sama menghasilkan konflik, bukan pemulihan diam-diam.
5. **Urutan positif:** tulis anggota/pengurus harus >=1, mengikuti SRS 8.9. Default baru 1 menggantikan 0. Migration tidak menulis ulang nilai 0 di arsip lama; edit row lama yang masih writable harus memperbaiki urutannya. Soft-delete row lama tidak mewajibkan koreksi data historis.
6. **Gambar:** HTTPS tanpa kredensial, metadata saja; server tidak mengambil URL. Upload, pemeriksaan MIME/JPG/PNG/ukuran 2 MB dan preview foto **belum tersedia**. Jangan menyebut requirement foto selesai hanya karena input URL ada.
7. **Audit:** create/edit/delete menghasilkan action organisasi dengan id periode/departemen dan metadata terpilih. Edit mencatat nama field yang berubah, bukan seluruh isi form. Log bukan snapshot lengkap setiap versi.

## API Admin

Semua route memakai wrapper response/error dan cache private/no-store. Mutasi memakai Origin, CSRF, sesi server, akun aktif dan assignment terkini. Body JSON maksimum 32 KiB. Tidak ada route backend Public/Portal baru.

| Path di bawah `/api/admin` | Metode | Kontrak |
|---|---|---|
| `/organization/periods` | GET | Lookup periode, q/page; Admin hanya mendapat satu periode penugasan; SA lintas periode. Hanya id/nama/status, bukan endpoint manajemen periode. |
| `/departments` | GET, POST | GET period_id, department_id opsional, q/page; POST name, slug, description, logo_url, period_id (SA). |
| `/departments/[id]` | PATCH, DELETE | PATCH data identitas/info sesuai role + version; DELETE confirmed + version (SA). |
| `/department-members` | GET, POST | GET filter scope/q/page; POST name, position, photo_url, display_order, period_id, department_id. |
| `/department-members/[id]` | PATCH, DELETE | PATCH name, position, photo_url, display_order, version; DELETE confirmed + version. |
| `/board-members` | GET, POST | Khusus SA; POST kontrak anggota dengan department_id boleh NULL. |
| `/board-members/[id]` | PATCH, DELETE | Khusus SA; PATCH juga menerima department_id; DELETE confirmed + version. |

GET daftar membutuhkan period_id untuk SA; Admin dapat menghilangkannya agar menggunakan assignment. Filter asing ditolak 403, ID resource di luar scope diperlakukan 404. Predicate assignment tetap digunakan saat SELECT dan UPDATE, tidak ditimpa id dari URL. Field tak dikenal ditolak, termasuk user_id, role, status, deleted_at dan perpindahan periode.

## Migration

`202608280001_admin_foundation` tetap byte-identik terhadap paket v0.2.0. `202608280002_organization_crud` menambahkan version pada tiga tabel, default urutan positif, auto-increment version untuk direct SQL, soft-delete guards, larangan pindah roster, blocker dependensi departemen dan guard referensi departemen yang sudah dihapus.

Guard baru melengkapi composite FK department+period dan guard arsip yang sudah ada. Ini tidak menggantikan RBAC server atau kewajiban user DB aplikasi tidak mempunyai hak DDL/disable-trigger. Migration belum di-apply; concurrency dua koneksi belum diuji.

## Batas dan kelanjutan

Belum ada pengurutan drag-and-drop/bulk, restore, link akun, upload gambar, sinkronisasi otomatis roster ↔ struktur, atau akses backend publik. Tidak ada data demo/seed organisasi. Modul berikutnya: Users/Admin Access dan Program Studi (termasuk last-active-SA safeguard dan revoke manual), kemudian Konten/review/publish, Proker, Event/peserta/CSV, Dokumen, Aspirasi.
