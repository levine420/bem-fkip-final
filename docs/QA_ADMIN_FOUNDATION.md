# QA Admin source — 28 Agustus 2026

## Dijalankan

- `node --experimental-strip-types --test tests/*.test.mjs`: **74 passed, 0 failed, 0 skipped**, Node 24.19.0. Terdiri dari 49 tes domain, 11 service organisasi, 14 service akses/prodi terisolasi.
- Native Node syntax check untuk 43 file server/domain/API/bootstrap/client helper/tests: **0 failure**. Tidak mencakup TSX. Ini parsing, bukan typecheck, dependency resolution penuh, atau eksekusi route.
- Audit source boundary: tidak ada endpoint API di luar `/api/admin`; Public/Portal dan dokumen referensi dibandingkan byte terhadap ZIP awal: 53 file diperiksa, seluruhnya identik. Dua puluh tiga route files seluruhnya di /api/admin. Migrations 001 dan 002 identik dengan paket sebelumnya.
- Audit schema/SQL struktural: 17 model/tabel dan 197 kolom scalar cocok (migrations 001–003); nullability dan 30 nama FK cocok; internal imports tidak ada yang hilang. Inspeksi statis sederhana, **bukan** parser SQL lengkap, `prisma validate`, atau eksekusi SQL.

Coverage unit nyata: penolakan mahasiswa/inactive/deleted/unknown roles; assignment revoked/archived/draft/deleted department; batas departemen+periode; scope NULL; Super Admin; arsip read-only; transisi aktivasi/stale confirmation/version; token hash; batas idle/absolute; origin dan CSRF session-binding; lock login; validasi Periode/tahun/URL/password/email/pagination/mass assignment.

Tambahan domain: matriks akses organisasi, filter tidak boleh memperluas assignment, whitelist edit info Admin, slug/nama, urutan positif, core board nullable, roster tidak pindah, larangan injeksi user/role, konfirmasi/version penghapusan.

`organization-service.test.mjs` menjalankan source service organisasi dan audit writer asli melalui loader native Node. Auth/transaksi/Prisma diganti adapter in-memory khusus tes. Kasus: scoped list/count/search/lookup; ID URL asing; board SA-only; create draf; create roster tidak membuat akun; core tanpa departemen; referensi lintas periode; archive write rejection; stale version/zero-row update; dependency blocker; soft-delete; kegagalan audit tidak dikembalikan sebagai sukses. Ini **bukan** bukti auth/HTTP/SQL/rollback/konkurensi database berhasil. Adapter sengaja tidak mengklaim meniru PostgreSQL atau membuktikan atomicity.

`access-service.test.mjs` juga menjalankan service/audit asli dengan auth/repository **dan bcrypt tiruan**. Memeriksa SA-only, DTO tanpa hash/aspirasi, filter/count mahasiswa, create account+assignment, must-change, penolakan periode/departemen invalid, disable/enable vs revoke, larangan self-action/last-SA, password reset tanpa secret response/audit, session-deletion calls, tidak melewati verifikasi mahasiswa, stale update, blocker referensi prodi, serta propagasi kegagalan audit. Tidak membuktikan hash bcrypt, cookies, sesi nyata, SQL trigger, atomicity atau konkurensi DB.

## Tidak dijalankan — tidak boleh dilaporkan lulus

- Full TypeScript typecheck dan build Next.js (dependency aplikasi tidak terpasang).
- Prisma validate, generate, migration diff/deploy (Prisma CLI/client tidak tersedia).
- PostgreSQL integration/concurrency/rollback/trigger tests (PostgreSQL tidak disediakan).
- bcrypt hash/compare execution (package tidak tersedia; unit tests hanya validasi password, bukan bcrypt).
- HTTP/cookie/RSC/browser/mobile/responsive/accessibility/E2E.
- Lint (belum ada konfigurasi lint).
- Dependency vulnerability scan, load test, deployment dan provider checks.

`tests/postgres-regression.sql` adalah **test artifact belum dieksekusi**. Memerlukan database disposable kosong dengan **ketiga migrations** terpasang; menolak database berisi users/periods, dan seluruh fixture dibungkus rollback. Mencakup cross-period FK, single-active, zero-active prevention, rollback pencabutan sesi, valid rollover/revocation, arsip immutable, audit update/delete/truncate; auto-version, positive order, dependency blocker, roster transfer, hard-delete rejection, soft-delete history, deleted-department reference dan restore rejection. Tambahan v0.4: counter/last-SA, penolakan direct counter edit, session revocation status/password, immutable role/academic identity, deferred active assignment, program code uniqueness/reference/version, student verification guard, permanent revoke, dan rollover akun terhapus. Tidak menggantikan uji dua koneksi untuk konkurensi.

## Gerbang verifikasi berikutnya untuk environment pengelola

Setelah dependency/config tersedia, jalankan typecheck, Prisma validate/generate, build, lalu migration dan SQL regression di DB disposable. Periksa:

1. Login valid/invalid, lima gagal bersamaan, lock tersimpan meski request gagal; password awal wajib diganti; salah password lama juga rate-limited.
2. Cookie HttpOnly/Secure/SameSite, CSRF mismatch/missing/wrong Origin, sesi lama invalid setelah login/logout/ganti password.
3. Admin dept tidak dapat membaca/mengubah Periode/Log lewat request manual; mahasiswa ditolak.
4. Dua aktivasi paralel dengan expected_active_id sama: satu sukses, satu conflict; satu active tersisa. Aktivasi bersamaan edit data lama tidak boleh menghasilkan write ke arsip.
5. Inject kegagalan audit: create/edit/aktivasi harus rollback, termasuk pencabutan akun/assignment/session.
6. Read arsip oleh SA boleh; edit/delete/ubah kepemilikan/insert anak arsip ditolak.
7. UI: form tidak hilang saat gagal, state sibuk, filter/page, konfirmasi aktivasi, kosong/error tanpa angka palsu.
8. Organisasi: request manual lintas departemen/periode, field injection user_id/role, scope count/search/lookup, board SA-only, arsip termasuk SA, upload belum tersedia.
9. Dua edit versi sama: satu sukses, satu conflict. Soft-delete departemen bersamaan insert anggota/assignment tidak boleh meninggalkan referensi hidup; soft-delete organisasi bersamaan arsip harus konsisten. Jalankan dengan dua koneksi DB nyata.
10. Lookup periode/departemen >20 hasil, pagination kosong setelah delete, pilihan core NULL, keyboard pada picker di dalam form, UI responsive dan status/error ARIA.
11. Dua SA saling menonaktifkan dalam dua transaksi: tidak boleh tersisa nol aktif; counter harus sama dengan jumlah akun aktual. Coba juga soft-delete, kegagalan audit dan rollback.
12. Create Admin vs pergantian periode; enable vs permanent revoke; password reset vs login/ganti password; semua sesi target harus invalid sesudah mutasi commit.
13. Master prodi delete vs insert referensi user; uniqueness kapitalisasi kode lama saat migration; NOT VALID student constraint tidak diam-diam memperbaiki akun lama.
14. UI akun: form create SA tanpa periode, Admin wajib periode aktif/departemen, field alasan/checkbox/reset password, error konflik, daftar mahasiswa tanpa data dummy, tidak ada kredensial di respons maupun payload audit.

## Risiko / pekerjaan tersisa

Fondasi ini belum memenuhi keseluruhan Definition of Done PRD. Tidak mengklaim siap deploy. Login memiliki pembatasan per email di DB, belum perimeter/IP limiter; IP tidak dipercayai dari X-Forwarded-For tanpa kontrak proxy. Kredensial awal/reset sementara tidak lewat email plaintext; invitation/email token reset belum dibuat. Organisasi, akses akun dan prodi tersedia di source tetapi perlu validasi runtime. Konten/proker/event/dokumen/aspirasi masih memerlukan service dan CRUD UI. Source package harus tetap dijaga agar kemajuan berikutnya tidak hanya tercatat dalam percakapan.
