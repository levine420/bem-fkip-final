# Audit recovered source — 28 Agustus 2026

## Bukti sebelum perubahan

Recovery Notice dan Project Handoff dibaca penuh sebelum source diubah. Audit mengacu pada file ZIP, bukan historical-notes. Snapshot awal: 57 page.tsx (21 Admin), 0 route handlers, 0 server actions, tanpa Prisma, migration, session, RBAC, seed, test suite, dependency lockfile, atau konfigurasi lint. `package.json`: Next 16.2.9, React 19.2.0, Tailwind 4, TypeScript, Lucide. `AdminPage` hanya membungkus `WorkspaceShell`. Login disabled; link keluar hanya navigasi. `ModuleIntro` adalah placeholder. `public-data.ts` berisi array kosong; bukan database. Seluruh modul Control Center belum CRUD; Anggota Departemen belum punya route.

## Dokumen diperiksa

PRD v1.1.0, SRS v1.0.0, Logical ERD v1.0.0, Physical ERD v1.1.0, Information Architecture, Wireframe (6 volume), GDO ALTIORA (termasuk organogram hlm. 8), PERFAK 2026. File Database Dictionary, CDM, Sitemap/User Flow dan Design System terpisah tidak ditemukan. Tidak mengarang isinya. Prototype TanStack bukan arsitektur aplikasi.

## Rekonsiliasi

Instruksi user/handoff terkini mengikat; hierarki dokumen PRD → SRS → Logical → Physical → IA/flow/wireframe → prototype.

| Konflik | Keputusan / dasar |
|---|---|
| PRD FR-01.5 mengizinkan SA edit arsip; PRD BR-04 dan SRS BR-04 melarang | Tidak ada override arsip, termasuk SA. User menegaskan larangan. |
| Satu periode aktif vs bootstrap kosong/arsip manual | Bootstrap boleh nol aktif; sesudah aktivasi, pergantian harus atomik ke pengganti. Tidak ada endpoint arsip aktif tanpa pengganti. SRS BR-01. |
| Physical users mewajibkan NIM/prodi/angkatan untuk Admin | Nullable untuk Admin; CHECK mewajibkan untuk MAHASISWA. Tidak membangun backend mahasiswa. |
| board_members dianggap sumber hak Admin | Hak lewat admin_assignments; satu Admin satu assignment, immutable identitas periode/departemen. Roster tidak memberi hak login. SRS 7.3, 8.7, 8.10. |
| Struktur inti wajib departemen | board_members.department_id nullable. GDO organogram dan PRD profil memisahkan jajaran inti dari departemen. |
| Roster digabung pengurus | department_members terpisah, sesuai SRS 8.10. |
| Advokesma di PRD vs lima departemen GDO | Tidak membuat departemen palsu atau menyamakan Kastrat dengan Advokesma. Sampai penanggung jawab diputuskan, aspirasi SA saja. |
| ALTIORA/GDO vs daftar lama PRD | Data kabinet mengikuti GDO 2026–2027: Sosgam, Minba, Peningkatan SDM, Kominfo, Kajian Aksi dan Isu Strategis. Tidak seed otomatis. |
| Foto kabinet/review/tag/proker/form/anonim hilang dari Physical | Tambah photo_url; review_note/reviewer_id/reviewed_at; tags; target_time/success_indicator/progress_notes; registration_schema/decision_note; is_anonymous. Semua punya dasar PRD/SRS. |
| Proker harus departemen vs tiga program unggulan tingkat BEM GDO | department_id nullable untuk proker BEM; Admin dept tetap tak berhak atas scope NULL. |
| Slug route tanpa kolom | Tambah slug departemen/event/proker. Ini persiapan model, bukan backend publik. |
| Progres persentase/lampiran/komentar internal dari wireframe | Belum ditambahkan; status dan catatan memenuhi PRD/SRS. Hindari perluasan model tanpa kebutuhan utama. |
| Dokumen difilter dept tapi tanpa ownership | Tambah department_id nullable; NULL khusus SA. |
| Logical hard delete vs Physical soft delete | Pertahankan soft delete untuk integritas sejarah PRD BR-04; FK RESTRICT agar tak menghapus sejarah lewat cascade/SET NULL. Periode tidak dihapus. |
| Unique NIM/email parsial Physical vs identitas unik Logical/PRD | Global unique termasuk soft-deleted untuk mencegah penggunaan ulang identitas. Normalisasi email case-insensitive. |
| Nama kabinet unik SRS/Logical vs (name,year_start) Physical | Nama kabinet unik case-insensitive. year_end >= year_start mengikuti SRS, bukan > Physical. Tahun pendirian BEM belum terbukti: 2000 dalam PERFAK adalah pendirian KBM, tidak diasumsikan BEM. |
| Kuota Physical hanya DITERIMA vs SRS submit mengurangi kuota | MENUNGGU juga memakai kursi; DITOLAK melepas kursi. Implementasi event belum dibuat. |
| Checksum dokumen global unique | Tidak diterapkan: file resmi sama dapat dipakai lintas periode/scope. storage_key tetap unique. |
| Wireframe Google login/JWT/konfirmasi semua Save | Email+password, server session dapat dicabut (SRS mengizinkan); konfirmasi hanya high impact sesuai user. |
| Wireframe no raw SQL vs locking/check/index khusus PG | ORM utama; SQL parameterized terbatas locking. Migration SQL untuk invariant database. |
| IA route /portal/admin vs source /admin | Pertahankan /admin dan login terpisah; tidak migrasi URL publik/portal. |
| Kategori CRUD vs enum | Enum kategori tetap; tidak mengklaim kategori dinamis. Aspirasi memakai kategori PRD/SRS (AKADEMIK,FASILITAS,LAYANAN_KAMPUS,LAINNYA), bukan kategori tambahan Physical. Kontrak frontend lama belum dipakai backend. |
| Jadwal terbit ada FR tapi prioritas V2 | Belum scheduler dalam pass fondasi ini. |
| Kontak PERFAK | Kop adalah kontak DPM, bukan bukti kontak BEM; tidak disalin ke website BEM. |
| Physical mengklaim Citext unsupported Prisma | Prisma mendukung @db.Citext; extension tetap migration. Sumber: https://www.prisma.io/docs/orm/v6/overview/databases/postgresql |

## Batas pass implementasi

Schema Admin domain, migration artifacts, auth/RBAC, Periode, audit reader. CRUD modul lain tetap backlog. Tidak menginstal dependency, membuat DB/.env, mengirim email, mengatur storage/hosting, atau deploy. Tidak menambahkan endpoint publik/mahasiswa. Hasil pengujian aktual dicatat di `QA_ADMIN_FOUNDATION.md`, bukan diasumsikan dari keberadaan source.
