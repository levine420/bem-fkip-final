# Users / Admin Access dan Program Studi — v0.4.0

Ini catatan source, bukan klaim runtime siap produksi. Baca `QA_ADMIN_FOUNDATION.md` untuk verifikasi yang benar-benar dijalankan.

## Sumber aturan dan keputusan

PRD F-ADM-03 dan SRS 8.7 memberi Super Admin kewenangan membuat/mengedit/menonaktifkan Admin serta melihat dan menonaktifkan mahasiswa. Pengelolaan akun mahasiswa yang **sudah ada** termasuk backend Admin; registrasi/login/verifikasi/backend Portal tidak dibuat pada pass ini.

| Keputusan | Implementasi |
|---|---|
| Akun baru | Hanya ADMIN atau SUPER_ADMIN. Aktif, password di-hash bcrypt cost 12, wajib ganti password awal. Tidak otomatis menautkan roster/board. |
| Penugasan Admin | Satu akun → satu departemen/periode AKTIF, dibuat atomik bersama akun. Pilihan period_id diperiksa lagi; perpindahan periode saat form terbuka menghasilkan konflik. |
| Edit | Nama akun Admin/SA saja. Email/NIM/role/prodi/angkatan dan assignment tidak dapat dipindah. Identitas mahasiswa tidak diedit melalui modul ini. |
| Nonaktif sementara | Account NONAKTIF + sesi dihapus; assignment tidak dicabut. Aktifkan kembali hanya jika syarat akun/assignment masih valid. |
| Cabut permanen | Khusus assignment ADMIN yang belum dicabut pada periode writable. Akun nonaktif, sesi dihapus, revoked_at tidak bisa direset. Tidak ada delete/reassign assignment. |
| Arsip | Admin periode arsip tidak bisa diaktifkan, diubah namanya atau direset password melalui manajemen ini. Periode baru memakai akun baru. Rollover tetap mencabut sesi/assignment akun terhapus tanpa mengubah identitas terhapus. |
| Super Admin terakhir | Service mengecek jumlah SA aktif; mutasi akses memakai advisory lock yang sama dengan bootstrap. SQL menjaga counter SA aktif dalam satu row, sehingga pengurangan serentak tidak hanya bergantung pada SELECT count. Constraint melarang nol setelah aktivasi SA pertama. |
| Akun sendiri | Tidak dapat disable/enable/revoke/reset lewat manajemen. Ganti password pribadi memakai route lama yang meminta password saat ini. Nama sendiri boleh diedit. |
| Mahasiswa | Daftar/search/filter/status untuk akun existing saja. Nonaktif memerlukan alasan; aktivasi kembali tidak dapat menggantikan verifikasi email. Tidak ada create/identity edit/password reset mahasiswa. |
| Program Studi | SA create/edit/soft-delete master code/name, search/page 20. Program yang masih direferensikan akun, termasuk nonaktif/terhapus, tidak bisa dihapus. Koreksi master berlaku untuk semua akun yang merujuknya. |

### Konflik kredensial awal

SRS 8.7 mencantumkan minimal 8 karakter dan email berisi kredensial awal. Source mempertahankan aturan kuat yang sudah digunakan di fondasi: minimal 12 karakter, huruf besar/kecil/angka, maksimal 72 byte UTF-8 untuk mencegah truncation bcrypt. **Password tidak dikirim lewat email, tidak dikembalikan API, dan tidak dicatat di audit.** Operator SA memasukkan password sementara dan menyampaikannya melalui saluran aman yang dikelola sendiri. Invitation/reset token dengan delivery provider masih belum dibuat, dan tidak diklaim terkirim.

Nama, email dan status ditampilkan hanya kepada SA. List menggunakan select DTO eksplisit: tanpa password/hash, token sesi, jawaban event atau aspirasi privat. Audit mencatat id, action, alasan status dan metadata terpilih. Jangan mengisi alasan dengan kredensial atau data sensitif yang tidak diperlukan.

### Konsekuensi identitas global

Aturan email unik global (termasuk mahasiswa dan akun terhapus) bertemu aturan akun Admin baru per periode serta role immutable. Akibatnya, email yang sudah dipakai akun mahasiswa/Admin lama **tidak bisa dipakai membuat akun Admin baru**. Source memilih mempertahankan keunikan identitas dan tidak mengubah role/recycle akun secara diam-diam. Model satu identitas dengan beberapa riwayat assignment akan lebih fleksibel bagi pengurus yang menjabat kembali, tetapi mengubah kebijakan handoff satu akun per periode; keputusan tersebut perlu ditetapkan secara eksplisit sebelum mengubah schema/auth. Jangan mengatasi konflik ini dengan data identitas dummy.

## API

Semua route di bawah `/api/admin`, memakai wrapper session/Origin/CSRF/response yang sudah ada dan `requireSuperAdmin` di dalam service. Body strict whitelist; mutation version dan audit berada dalam transaksi serializable. UI menggunakan daftar/picker terpaginasikan, state loading/error/empty/pending, konfirmasi tindakan berisiko dan input form tetap saat gagal.

| Path | Metode | Isi |
|---|---|---|
| `/users` | GET | cohort=admins/students, q, status, program_studi_id, page; default admins; 20 per halaman. |
| `/users` | POST | name, email, role, password, confirmation, department_id/period_id (NULL untuk SA). Tidak menerima role mahasiswa. |
| `/users/[id]` | PATCH | name + version. |
| `/users/[id]/disable` | POST | version, confirmed=true, reason 10–500 karakter. |
| `/users/[id]/enable` | POST | Kontrak tindakan sama; memeriksa assignment atau verifikasi email mahasiswa. |
| `/users/[id]/revoke` | POST | Kontrak tindakan sama; hanya assignment ADMIN yang belum dicabut. |
| `/users/[id]/reset-password` | POST | Kontrak tindakan + password + confirmation; harus berbeda dari password saat ini. Memutus sesi, mewajibkan ganti password, tidak mengaktifkan akun nonaktif. |
| `/study-programs` | GET, POST | GET q/page; POST code (1–10), name (3–255). Kode dinormalisasi uppercase. |
| `/study-programs/[id]` | PATCH, DELETE | PATCH code/name/version; DELETE version/confirmed, hanya jika tidak direferensikan. |

Tidak ada DELETE user, perubahan role, pindah assignment, pemulihan soft-delete, endpoint verifikasi email atau registrasi mahasiswa. Penghapusan prodi memakai soft-delete; nama/kode tetap unik dan tidak digunakan ulang.

## Migration 003

Migration 001 dan 002 tetap byte-identik terhadap paket sebelumnya. `202608280003_admin_access` memakai transaksi SQL eksplisit dan menambahkan:

- version users/study_programs, soft-delete prodi, case-insensitive code dengan CITEXT;
- singleton internal `admin_access_state` untuk jumlah SA aktif, diisi dari akun aktual dan dipelihara trigger; tidak diekspos API;
- penolakan hard-delete user/assignment/prodi, role dan identitas akademik immutable;
- pencabutan sesi saat perubahan status/password, revocation permanen, dan guard assignment aktif deferred untuk atomic create account+assignment;
- blocker referensi prodi serta guard email mahasiswa saat aktivasi;
- penggantian fungsi rollover agar akun yang sudah terhapus/nonaktif tidak ditulis ulang, tetapi sesi dan assignment tetap dicabut.

Migration menolak kondisi awal SA ada tetapi tidak ada SA aktif, atau Admin aktif tanpa assignment valid. Case-folding kode prodi dapat menemukan duplikat yang sebelumnya dibedakan kapitalisasi; **gagal, tidak merge/rename otomatis**. Operator perlu menyelesaikan konflik data resmi sebelum mencoba kembali. Perubahan DDL 003 dibungkus BEGIN/COMMIT agar kegagalan tidak meninggalkan setengah counter/guard.

Constraint `verified_student_activation` menggunakan NOT VALID: berlaku untuk INSERT/UPDATE baru, tetapi tidak diam-diam memverifikasi atau menulis ulang akun mahasiswa lama. Data lama yang tidak sesuai perlu ditinjau operator, kemudian constraint dapat divalidasi setelah masalahnya diselesaikan lewat prosedur verifikasi resmi.

Counter state dilindungi dari direct DML/TRUNCATE biasa; ini bukan klaim kebal terhadap DBA/owner yang dapat mengubah schema atau trigger. Role database aplikasi tetap harus tanpa DDL/disable-trigger. Gunakan migration SQL, jangan mengandalkan schema push untuk membuat invariant trigger.

## Yang belum diverifikasi / belum tersedia

- Prisma validate/generate, full TypeScript/build, penerapan migration, trigger/rollback/konkurensi PostgreSQL, bcrypt asli dan HTTP/browser/E2E belum dijalankan.
- Dua transaksi yang menonaktifkan dua SA sekaligus, create Admin vs rollover, enable vs revoke, prodi delete vs referensi baru perlu uji DB nyata.
- Invitation/email delivery, email reset token, MFA/step-up reauthentication, perimeter/IP limiter, link roster ke akun dan audit detail UI belum dibuat.
- Form baru belum menjalani QA browser/mobile/accessibility. CSS Futuristic Pink Glassmorphism lama dipakai tanpa perubahan CSS Public/Portal.

Kelanjutan source berikutnya: Konten + Review/Publish, lalu Proker, Event/Peserta/CSV, Dokumen, Aspirasi. Provider dan environment tetap dikelola user.
