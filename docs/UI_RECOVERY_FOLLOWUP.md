# Tindak lanjut recovery UI — 22 September 2026

Baseline recovery: `main`, HEAD `8885e02`, dengan 61 tracked files modified dan 33 untracked files. Perubahan sesi redesign sebelumnya dipertahankan.

## Perbaikan frontend

- Badge netral Admin menggunakan warna teks tema terang.
- Toolbar listing memakai `bg-surface`; class typography tanpa plugin diganti `article-content` dengan CSS lokal untuk heading, paragraf, list, tautan, kutipan, dan preformatted text.
- Hover gambar kegiatan Beranda dan gambar utama berita memiliki ancestor `group`.
- Tanggal Beranda, berita, dan detail kegiatan eksplisit Asia/Jakarta.
- Label status pendaftaran kegiatan serta proker ditunda/dibatalkan ditampilkan sesuai nilai yang tersedia.
- Pagination berita menolak angka non-integer/tidak finite/offset di luar batas dan mengarahkan halaman melampaui total ke halaman terakhir, dengan query/kategori tetap dipertahankan.
- Form daftar mahasiswa menampilkan loading/error prodi, menyediakan retry, mempertahankan input, dan menahan submit ketika prodi belum tersedia.
- Copy dokumen menjelaskan batas layanan pencatatan informasi dan belum tersedianya upload/download berkas.
- Browser QA memiliki pemeriksaan pagination dan retry prodi serta exit gagal untuk kegagalan halaman/interaksi/page error. Output dapat diarahkan melalui `BEM_QA_OUTPUT`.

## Batas perubahan

Tidak mengubah backend, API contract, auth/RBAC, Prisma, database, dependency, atau data arsip/sejarah hardcoded. Tidak menjalankan migrasi atau seed. Hero desktop tetap memakai foto kabinet dan hero mobile tetap gradient.

## Verifikasi

- Production build: lulus, exit code 0 (`npm exec -- next build`). Build menghasilkan 77 halaman dan route tanpa menjalankan script migrasi. Peringatan `metadataBase` dan deteksi penggunaan dinamis `cookies` pada route Portal tetap muncul selama optimasi, tetapi build selesai.
- Typecheck: lulus, exit code 0 (`npm run typecheck -- --incremental false`).
- Browser QA: lulus, exit code 0 (`BEM_QA_ORIGIN=http://127.0.0.1:3001 node scripts/ui-browser-qa.mjs`). Sebanyak 85 pemeriksaan (17 route × 5 viewport: 360, 390, 768, 1024, dan 1440 px) seluruhnya berstatus 200, memiliki `h1`, tanpa horizontal overflow, dan tanpa tombol yang kehilangan accessible label. `pageErrors` dan `consoleErrors` kosong.
- Interaction browser: 15/15 lulus. Cakupan meliputi buka/tutup/navigasi menu mobile; navigasi bulan, pemilihan tanggal, keyboard, dan persistensi filter kalender; pencarian berita; penanganan page berita invalid dan redirect page di luar rentang; kegagalan load program studi 503, tombol submit yang dinonaktifkan, retry, serta persistensi input; kegagalan submit aspirasi dengan input tetap tersimpan dan tombol kembali aktif; bukti hanya satu POST yang dicegat sehingga tidak ada write server; dan CSS reduced motion.
- Syntax script QA dan whitespace diff: lulus (`node --check scripts/ui-browser-qa.mjs` dan `git diff --check`). Script memakai timeout navigasi 90 detik secara konsisten, mengabaikan hanya pesan console 503 yang berasal dari response yang sengaja dicegat, dan gagal jika ada console error lain.
- Unit suite: 66 lulus, 2 gagal (`npm test`, exit code 1). Kegagalan baseline tetap pada test `origin rejects suffix, null, insecure origin, missing config` karena `assertOrigin` tidak melempar pada salah satu kasus, serta loader `tests/organization-service.test.mjs` yang tidak dapat meresolusi `next/cache`. Empat test UI lulus. Auth/backend tidak diubah untuk menyembunyikan kedua kegagalan tersebut.

## Batas verifikasi Admin dan Portal

Browser QA mencakup halaman login Admin, shell/form Portal tanpa sesi terautentikasi, dan perilaku form aspirasi saat request POST sengaja dicegat. QA ini tidak memverifikasi dashboard atau halaman Admin/Portal dalam sesi pengguna terautentikasi, mutasi CRUD, upload/download, enforcement RBAC per role, persistensi database, atau alur logout/session expiry. Tidak ada request mutasi dari browser QA yang diteruskan ke server.

## Pekerjaan yang belum dinyatakan selesai

- Keselarasan komposisi berita Beranda/panel departemen terhadap referensi.
- Verifikasi sumber resmi data arsip dan sejarah hardcoded.
- QA mutasi Admin, upload, dan Portal dengan sesi pengguna terautentikasi; tidak boleh dianggap tercakup oleh pemeriksaan halaman publik.
- Dua kegagalan test baseline memerlukan penanganan tersendiri di luar perbaikan visual ini.
