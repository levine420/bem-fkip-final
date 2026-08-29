# Implementation Baseline — 28 Agustus 2026

## Status yang dapat dibuktikan

Recovered Next.js foundation dilanjutkan dengan **source Admin v0.4.0**, bukan backend production-ready.
Audit snapshot awal: `SOURCE_AUDIT_2026-08-28.md`. Verifikasi aktual: `QA_ADMIN_FOUNDATION.md`.

Hierarki: instruksi user/handoff terbaru → PRD → SRS → Logical ERD → Physical ERD → IA/flow/wireframe → visual prototype.

| Area | Source saat ini | Belum selesai |
|---|---|---|
| Data model | 17 Prisma models (16 domain + 1 guard internal), 197 scalar columns + tiga SQL migrations; composite FK, archive/log/soft-delete guards, counter SA aktif | Prisma validate/generate dan apply migrations belum dijalankan |
| Admin auth | Email/password bcrypt cost 12; hashed server session; idle 60 menit, absolute 12 jam; single-browser; CSRF + Origin; lock 5 gagal/30 menit; ganti password awal; logout | Uji DB/HTTP/browser; notifikasi email, reset melalui email; trusted IP metadata / perimeter rate limit |
| RBAC | Akun aktif + assignment periode aktif diperiksa tiap service; scope query organisasi department+period; SA guard Periode/Log/Struktur/Users/Prodi; AdminPage guard | Integrasi auth/DB/HTTP belum diuji; modul lain belum punya CRUD |
| Periode | Create draf; edit dengan version; aktivasi atomik + arsip lama + revoke akun/assignment/sesi; audit transaksi; list search/filter/sort/page 20; UI konfirmasi/error/loading | Uji integrasi dan konkurensi PostgreSQL; upload foto (baru URL metadata) |
| Activity Log | Insert dari auth/Periode/organisasi/akses/prodi dalam transaksi; immutable DB trigger; SA list search/tanggal/pagination | Filter user tersedia API, belum picker UI; detail/IP/browser tidak ditampilkan/direkam |
| Departemen | SA create/edit/soft-delete, Admin edit info sendiri; filter/search/pagination/lookup; UI + API, version guard, dependency blockers, audit | Build/DB/browser; upload logo, restore |
| Roster anggota | CRUD terpisah dari struktur/akun; scope department+period, positive order, version, soft-delete, audit, UI + API | Build/DB/browser; upload foto, link user |
| Struktur | CRUD SA, core tanpa departemen, koreksi departemen dalam periode sama, version/soft-delete/audit, UI + API | Build/DB/browser; upload foto, link user, drag-and-drop |
| Konten/review/publish | Schema tag/review + placeholder terlindungi | Editor, sanitasi rich text, workflow service/API, audit & QA |
| Proker | Schema target/indikator/catatan, scope BEM nullable | CRUD/transisi/UI |
| Event/peserta/CSV | Schema form dinamis + jawaban + alasan ditolak + unique peserta | Service kuota/locking, form schema validation, CSV injection defense/export, UI |
| Dokumen | Schema ownership dept/BEM + metadata | CRUD/upload/private download/UI |
| Aspirasi | Schema flag anonim + kategori PRD/SRS; placeholder SA saja | Private DTO, response workflow, notifikasi, penetapan penanggung jawab ALTIORA |
| Users/Admin Access | SA list/create Admin/edit nama; disable/enable; revoke permanen; reset password sementara, must-change + pemutusan sesi; last-active-SA safeguard; version/audit/UI; mahasiswa existing list/status dengan alasan | Prisma/DB/bcrypt/HTTP/browser; invitation/email/token reset; link roster/user; role reassignment sengaja tidak diizinkan |
| Program Studi | SA CRUD master, version/audit, soft-delete hanya tanpa referensi, code/name unik tanpa beda kapitalisasi; search/page/lookup/UI | Prisma/DB/browser; restore belum tersedia |
| Public/Portal | Source dan data boundary lama tidak diperluas | Tetap frontend foundation; tidak membaca Prisma |

## Catatan desain implementasi

- Schema domain bukan bukti fitur CRUD selesai. Tidak ada endpoint create aspirasi/registrasi mahasiswa/public data.
- `src/types/entities.ts` masih kontrak frontend legacy, tidak menjadi tipe backend dan belum dipakai untuk response Admin. Schema yang direkonsiliasi adalah model backend. Jangan memasukkan data Prisma ke boundary legacy tanpa mapping DTO.
- Tidak ada hard delete Periode; tidak ada arsip aktif tanpa pengganti. Setup awal dapat nol aktif. Trigger deferred menjaga satu aktif setelah aktivasi pertama.
- Admin assignment satu akun → satu departemen/periode; pengurus baru memerlukan akun baru. Tidak otomatis mengubah pengurus menjadi Admin.
- SQL khusus pada service hanya advisory lock berparameter; transaksi serializable retry maksimal 3. Trigger database adalah defense-in-depth, bukan pengganti RBAC server.
- Pengguna database aplikasi harus non-owner dan tanpa hak DDL/disable-trigger. Pemilik DB tetap secara teknis dapat mengubah schema; tidak mengklaim kebal DBA.
- Auth membaca ulang akun/assignment pada setiap request; tidak mempercayai role dari client atau snapshot JWT.
- Semua string Periode dirender sebagai teks React, tidak memakai dangerouslySetInnerHTML. URL foto hanya metadata HTTPS, tidak di-fetch server.
- Organisasi memakai teks React dan metadata gambar dengan batas yang sama. Keputusan/kontrak rinci: `ORGANIZATION_IMPLEMENTATION.md`.
- Akun mahasiswa di Admin tidak berarti backend Portal bertambah. Kontrak, batas password/email, temporary disable vs permanent revoke dan rollout migration: `ADMIN_ACCESS_IMPLEMENTATION.md`.
- Category editor, settings, rich-text sanitization, storage provider, email delivery, dan backend public/mahasiswa belum diimplementasikan.

## Dependensi source

Prisma/@prisma/client 6.19.0 dipasangkan eksplisit untuk API client yang dipakai di source; bukan klaim versi terbaru. bcryptjs 3.0.3 dan server-only ditambahkan ke manifest saja. Tidak ada instalasi atau lockfile buatan.
Unit tests memakai TypeScript stripping native Node (Node >=22.18 atau 24). TypeScript tetap diperiksa terpisah setelah dependency tersedia.

## Batas operasional

Pengelola environment menyediakan DATABASE_URL dan ADMIN_ORIGIN (origin browser persis). Tidak ada `.env` atau kredensial yang dibuat. `scripts/bootstrap-admin.mjs` hanya dijalankan operator pada database kosong untuk akun nyata, input JSON lewat stdin tanpa default/print password. Account pertama wajib mengganti password.
Build, migrasi, provider, deployment dan email tidak dijalankan oleh assistant.
