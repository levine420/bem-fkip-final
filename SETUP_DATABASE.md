# Setup Database PostgreSQL — Platform BEM FKIP UIKA

## Pilihan 1: PostgreSQL Lokal (Mac)

### Install PostgreSQL via Homebrew
```bash
# Kalau Homebrew install masih jalan, cancel dulu (Ctrl+C)
# Lalu install ulang:
brew install postgresql@16

# Atau pakai PostgreSQL versi latest:
brew install postgresql
```

### Start PostgreSQL Service
```bash
# Untuk postgresql@16:
brew services start postgresql@16

# Atau postgresql latest:
brew services start postgresql
```

### Create Database
```bash
# Buat database untuk aplikasi
createdb bem_fkip_uika
```

### Test Connection
```bash
# Cek bisa connect
psql -d bem_fkip_uika -c "SELECT version();"
```

---

## Pilihan 2: PostgreSQL via Docker (Lebih Cepat)

### Pull & Run PostgreSQL Container
```bash
docker run --name bem-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bem_fkip_uika \
  -p 5432:5432 \
  -d postgres:16
```

### Test Connection
```bash
docker exec -it bem-postgres psql -U postgres -d bem_fkip_uika -c "SELECT version();"
```

**Connection String untuk Docker:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bem_fkip_uika"
```

---

## Pilihan 3: PostgreSQL Cloud (Instant, No Install)

### Supabase (Free, Recommended)
1. Buka https://supabase.com/dashboard
2. Create new project
3. Tunggu ~2 menit provisioning
4. Copy **Connection String** dari Settings → Database
5. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Railway (Free)
1. Buka https://railway.app
2. New Project → Add PostgreSQL
3. Copy **DATABASE_URL** dari Variables tab

### Neon (Free)
1. Buka https://neon.tech
2. Create project
3. Copy **Connection String**

---

## Setelah PostgreSQL Ready

### 1. Create `.env` File
Buat file `.env` di root project (`/Users/macbookair/Desktop/bem-fkip-final/.env`):

```bash
# Untuk lokal Mac:
DATABASE_URL="postgresql://macbookair@localhost:5432/bem_fkip_uika"

# Untuk Docker:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bem_fkip_uika"

# Untuk Cloud (Supabase/Railway/Neon):
DATABASE_URL="postgresql://[username]:[password]@[host]:5432/[database]"
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

Output yang benar:
```
✔ Generated Prisma Client
```

### 3. Deploy Migrations
```bash
npm run db:deploy
```

Output yang benar:
```
✔ Migration 202608280001_admin_foundation applied
✔ Migration 202608280002_organization_crud applied
✔ Migration 202608280003_admin_access applied
```

### 4. Bootstrap Super Admin Pertama
```bash
npm run admin:bootstrap
```

Script akan tanya:
```
Nama Super Admin: Ahmad Rizki
Email: admin@bemfkip.uika.ac.id
Password: (min 12 char, harus ada uppercase/lowercase/digit)
```

Password requirement:
- Minimal 12 karakter
- Harus ada huruf besar (A-Z)
- Harus ada huruf kecil (a-z)
- Harus ada angka (0-9)
- Maksimal 72 bytes

Contoh password valid: `SuperAdmin2024!`

### 5. Start Dev Server
```bash
npm run dev
```

Aplikasi jalan di: `http://localhost:3000`

### 6. Test Login Admin
1. Buka browser: `http://localhost:3000/admin/login`
2. Login dengan email & password Super Admin yang tadi dibuat
3. Kalau berhasil, redirect ke `/admin/dashboard`

---

## Verifikasi Lengkap

Setelah login, test modul-modul ini:

### ✅ Periode Kepengurusan
- `/admin/organisasi/periode`
- Create periode baru (NONAKTIF)
- Edit periode
- Activate periode (akan swap dengan periode aktif sebelumnya)
- Coba edit periode ARSIP → harus ditolak 403

### ✅ Departemen
- `/admin/organisasi/departemen`
- Create departemen baru (untuk periode AKTIF)
- Edit departemen
- Soft delete departemen yang tidak punya dependency

### ✅ Anggota Departemen (Roster)
- `/admin/organisasi/anggota`
- Create anggota untuk departemen
- Edit posisi/display_order
- Delete anggota

### ✅ Struktur Pengurus (Board)
- `/admin/organisasi/struktur`
- Create pengurus inti (department_id bisa NULL untuk Ketua/Wakil/Sekjen/Bendahara)
- Create Kepala Departemen (department_id wajib diisi)

### ✅ User Management
- `/admin/pengguna/admin`
- Create Admin baru (wajib pilih departemen + periode AKTIF)
- Create Super Admin baru (tidak perlu departemen/periode)
- Edit nama Admin
- Disable/Enable akun
- Revoke assignment (permanent, untuk Admin Dept)
- Reset password (akan force must_change_password)

### ✅ Program Studi
- `/admin/program-studi`
- Create program studi (code + name)
- Edit program studi
- Soft delete (hanya yang tidak direferensikan user)

### ✅ Activity Log
- `/admin/activity-log`
- Lihat semua audit trail
- Search/filter/pagination
- Verify tidak ada password/hash yang ke-log

---

## Troubleshooting

### Error: "relation does not exist"
**Cause:** Migrations belum di-deploy
**Fix:** `npm run db:deploy`

### Error: "Prisma Client not generated"
**Cause:** Prisma Client belum di-generate
**Fix:** `npm run db:generate`

### Error: "password authentication failed"
**Cause:** Connection string salah
**Fix:** Cek `.env`, pastikan username/password/host benar

### Error: "database does not exist"
**Cause:** Database belum dibuat
**Fix:** `createdb bem_fkip_uika` (untuk lokal)

### Bootstrap script error: "Cannot find 'readline'"
**Cause:** Module native Node belum support
**Fix:** Input manual via environment variable:
```bash
ADMIN_NAME="Ahmad Rizki" \
ADMIN_EMAIL="admin@bemfkip.uika.ac.id" \
ADMIN_PASSWORD="SuperAdmin2024!" \
npm run admin:bootstrap
```

---

## Next Steps Setelah Database Ready

Setelah verifikasi foundation sukses, lanjut ke:

1. **Implement Modul Konten + Review/Publish**
   - Backend service: create, edit, submit review, publish, revise
   - API routes: `/api/admin/contents/*`
   - Admin UI: ContentManager, ContentEditor, ContentReview
   - Workflow: DRAF → MENUNGGU_REVIEW → TERBIT/REVISI

2. **Implement Modul Program Kerja**
3. **Implement Modul Event + Peserta**
4. **Implement Modul Dokumen**
5. **Implement Modul Aspirasi**

---

Kalau udah setup PostgreSQL (pilih salah satu dari 3 pilihan di atas), kasih tau gua biar gua lanjut ke step generate Prisma & deploy migrations!
