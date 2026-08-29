# Platform Digital BEM FKIP UIKA

Next.js App Router + TypeScript + Tailwind. Recovered foundation dilanjutkan dengan Admin v0.4.0: fondasi + organisasi + akses akun + prodi. Backend aktif hanya Admin/Super Admin.

- Audit: docs/SOURCE_AUDIT_2026-08-28.md
- Users/Admin Access + prodi: docs/ADMIN_ACCESS_IMPLEMENTATION.md
- CRUD organisasi: docs/ORGANIZATION_IMPLEMENTATION.md
- Status modul: docs/IMPLEMENTATION_BASELINE.md
- Verifikasi dan batas QA: docs/QA_ADMIN_FOUNDATION.md
- Schema dan migration: prisma/
- Business/auth services: src/server/admin/
- Pure policy/validation: src/lib/admin/
- Unit tests tanpa dependency aplikasi: node --experimental-strip-types --test tests/*.test.mjs

Tidak ada seed konten/organisasi atau kredensial default. Public/Portal tetap data boundary kosong. Instalasi dependency, konfigurasi DATABASE_URL/ADMIN_ORIGIN, PostgreSQL, bootstrap akun nyata, provider, build dan deployment dilakukan pengelola. Bootstrap script operator membaca JSON dari stdin dan tidak mencetak password.

Schema bukan bukti CRUD selesai. Baca tabel modul dan QA sebelum melanjutkan.
