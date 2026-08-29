-- Hand-authored initial migration; not applied by the assistant.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE "user_role" AS ENUM ('MAHASISWA', 'ADMIN', 'SUPER_ADMIN');

CREATE TYPE "user_account_status" AS ENUM ('AKTIF', 'NONAKTIF', 'BELUM_VERIFIKASI');

CREATE TYPE "period_status" AS ENUM ('AKTIF', 'NONAKTIF', 'ARSIP');

CREATE TYPE "content_status" AS ENUM ('DRAF', 'MENUNGGU_REVIEW', 'TERBIT', 'REVISI');

CREATE TYPE "content_category" AS ENUM ('BERITA', 'PENGUMUMAN', 'KAJIAN', 'RILIS_PERS', 'LAINNYA');

CREATE TYPE "work_program_status" AS ENUM ('BELUM_MULAI', 'BERJALAN', 'SELESAI', 'DITUNDA', 'DIBATALKAN');

CREATE TYPE "event_status" AS ENUM ('DRAF', 'TERBIT', 'BERJALAN', 'SELESAI', 'DIBATALKAN', 'DIARSIPKAN');

CREATE TYPE "registration_status" AS ENUM ('SEGERA_DIBUKA', 'TERBUKA', 'PENUH', 'TUTUP');

CREATE TYPE "event_registration_status" AS ENUM ('MENUNGGU', 'DITERIMA', 'DITOLAK', 'HADIR', 'TIDAK_HADIR');

CREATE TYPE "aspiration_category" AS ENUM ('AKADEMIK', 'FASILITAS', 'LAYANAN_KAMPUS', 'LAINNYA');

CREATE TYPE "aspiration_status" AS ENUM ('MASUK', 'DIPROSES', 'SELESAI', 'DITOLAK');

CREATE TYPE "document_category" AS ENUM ('LPJ', 'PROPOSAL', 'SK', 'AD_ART', 'LAPORAN', 'ARSIP');

CREATE TABLE "study_programs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(10) NOT NULL UNIQUE,
  "name" CITEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "email" CITEXT NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "email_verified_at" TIMESTAMPTZ,
  "nim" VARCHAR(20) UNIQUE,
  "angkatan" SMALLINT,
  "program_studi_id" UUID,
  "avatar_url" VARCHAR(1024),
  "role" user_role NOT NULL DEFAULT 'MAHASISWA',
  "account_status" user_account_status NOT NULL DEFAULT 'BELUM_VERIFIKASI',
  "must_change_password" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "periods" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" CITEXT NOT NULL UNIQUE,
  "visi" VARCHAR(500) NOT NULL,
  "misi" TEXT NOT NULL,
  "photo_url" VARCHAR(1024),
  "year_start" SMALLINT NOT NULL,
  "year_end" SMALLINT NOT NULL,
  "status" period_status NOT NULL DEFAULT 'NONAKTIF',
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "departments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" CITEXT NOT NULL,
  "slug" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "logo_url" VARCHAR(1024),
  "period_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  UNIQUE ("period_id", "name"),
  UNIQUE ("period_id", "slug"),
  UNIQUE ("id", "period_id")
);

CREATE TABLE "admin_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE,
  "department_id" UUID NOT NULL,
  "period_id" UUID NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "board_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "position" VARCHAR(100) NOT NULL,
  "photo_url" VARCHAR(1024),
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "department_id" UUID,
  "period_id" UUID NOT NULL,
  "user_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  UNIQUE ("period_id", "user_id")
);

CREATE TABLE "department_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) NOT NULL,
  "position" VARCHAR(100) NOT NULL,
  "photo_url" VARCHAR(1024),
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "department_id" UUID NOT NULL,
  "period_id" UUID NOT NULL,
  "user_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  UNIQUE ("department_id", "user_id")
);

CREATE TABLE "contents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(200) NOT NULL,
  "slug" CITEXT NOT NULL UNIQUE,
  "seo_slug" CITEXT,
  "meta_title" VARCHAR(255),
  "meta_description" TEXT,
  "excerpt" TEXT,
  "reading_time" INTEGER,
  "body" TEXT NOT NULL,
  "thumbnail_url" VARCHAR(1024),
  "view_count" INTEGER NOT NULL DEFAULT 0,
  "category" content_category NOT NULL DEFAULT 'BERITA',
  "status" content_status NOT NULL DEFAULT 'DRAF',
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "review_note" TEXT,
  "reviewer_id" UUID,
  "reviewed_at" TIMESTAMPTZ,
  "author_id" UUID NOT NULL,
  "department_id" UUID,
  "period_id" UUID NOT NULL,
  "published_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "work_programs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(150) NOT NULL,
  "slug" VARCHAR(150) NOT NULL,
  "description" VARCHAR(500) NOT NULL,
  "target_time" VARCHAR(150),
  "success_indicator" VARCHAR(300),
  "progress_notes" TEXT,
  "status" work_program_status NOT NULL DEFAULT 'BELUM_MULAI',
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "department_id" UUID,
  "period_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ,
  UNIQUE ("period_id", "slug"),
  UNIQUE ("period_id", "department_id", "name")
);

CREATE TABLE "events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(150) NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "location" VARCHAR(200) NOT NULL,
  "poster_url" VARCHAR(1024),
  "start_time" TIMESTAMPTZ NOT NULL,
  "end_time" TIMESTAMPTZ,
  "registration_deadline" TIMESTAMPTZ,
  "max_participants" INTEGER,
  "registration_schema" JSONB NOT NULL DEFAULT '[]',
  "status" event_status NOT NULL DEFAULT 'DRAF',
  "registration_status" registration_status NOT NULL DEFAULT 'TUTUP',
  "created_by_user_id" UUID NOT NULL,
  "department_id" UUID NOT NULL,
  "period_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "event_registrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "event_id" UUID NOT NULL,
  "status" event_registration_status NOT NULL DEFAULT 'MENUNGGU',
  "registration_data" JSONB,
  "decision_note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("user_id", "event_id")
);

CREATE TABLE "aspirations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(150) NOT NULL,
  "body" VARCHAR(2000) NOT NULL,
  "category" aspiration_category NOT NULL,
  "status" aspiration_status NOT NULL DEFAULT 'MASUK',
  "response" VARCHAR(1000),
  "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
  "user_id" UUID NOT NULL,
  "handler_id" UUID,
  "responded_at" TIMESTAMPTZ,
  "period_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "original_filename" VARCHAR(255) NOT NULL,
  "storage_key" VARCHAR(1024) NOT NULL UNIQUE,
  "file_type" VARCHAR(100) NOT NULL,
  "file_size" BIGINT NOT NULL,
  "download_count" INTEGER NOT NULL DEFAULT 0,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "checksum" VARCHAR(128),
  "category" document_category NOT NULL DEFAULT 'ARSIP',
  "uploader_id" UUID NOT NULL,
  "department_id" UUID,
  "period_id" UUID NOT NULL,
  "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ
);

CREATE TABLE "activity_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "action" VARCHAR(100) NOT NULL,
  "target_type" VARCHAR(100),
  "target_id" UUID,
  "details" JSONB,
  "ip_address" VARCHAR(45),
  "user_agent" VARCHAR(500),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "admin_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE,
  "token_hash" VARCHAR(64) NOT NULL UNIQUE,
  "csrf_hash" VARCHAR(64) NOT NULL,
  "last_seen_at" TIMESTAMPTZ NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "admin_login_attempts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR(64) NOT NULL UNIQUE,
  "failures" INTEGER NOT NULL DEFAULT 0,
  "window_start" TIMESTAMPTZ NOT NULL,
  "locked_until" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "users" ADD CONSTRAINT "users_study_program_fkey" FOREIGN KEY ("program_studi_id") REFERENCES "study_programs" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "departments" ADD CONSTRAINT "departments_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "board_members" ADD CONSTRAINT "board_members_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "board_members" ADD CONSTRAINT "board_members_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "department_members" ADD CONSTRAINT "department_members_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "department_members" ADD CONSTRAINT "department_members_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "department_members" ADD CONSTRAINT "department_members_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "contents" ADD CONSTRAINT "contents_author_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "contents" ADD CONSTRAINT "contents_reviewer_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "events" ADD CONSTRAINT "events_creator_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "aspirations" ADD CONSTRAINT "aspirations_submitter_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "aspirations" ADD CONSTRAINT "aspirations_handler_fkey" FOREIGN KEY ("handler_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "aspirations" ADD CONSTRAINT "aspirations_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "documents" ADD CONSTRAINT "documents_uploader_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "contents" ADD CONSTRAINT "contents_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "contents" ADD CONSTRAINT "contents_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "work_programs" ADD CONSTRAINT "work_programs_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "work_programs" ADD CONSTRAINT "work_programs_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "events" ADD CONSTRAINT "events_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "events" ADD CONSTRAINT "events_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "documents" ADD CONSTRAINT "documents_department_fkey" FOREIGN KEY ("department_id", "period_id") REFERENCES "departments" ("id", "period_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "documents" ADD CONSTRAINT "documents_period_fkey" FOREIGN KEY ("period_id") REFERENCES "periods" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE INDEX "users_program_studi_id_idx" ON "users" ("program_studi_id");

CREATE INDEX "departments_period_id_idx" ON "departments" ("period_id");

CREATE INDEX "admin_assignments_user_id_idx" ON "admin_assignments" ("user_id");

CREATE INDEX "admin_assignments_department_id_period_id_idx" ON "admin_assignments" ("department_id", "period_id");

CREATE INDEX "admin_assignments_period_id_idx" ON "admin_assignments" ("period_id");

CREATE INDEX "board_members_department_id_period_id_idx" ON "board_members" ("department_id", "period_id");

CREATE INDEX "board_members_period_id_idx" ON "board_members" ("period_id");

CREATE INDEX "board_members_user_id_idx" ON "board_members" ("user_id");

CREATE INDEX "department_members_department_id_period_id_idx" ON "department_members" ("department_id", "period_id");

CREATE INDEX "department_members_period_id_idx" ON "department_members" ("period_id");

CREATE INDEX "department_members_user_id_idx" ON "department_members" ("user_id");

CREATE INDEX "contents_author_id_idx" ON "contents" ("author_id");

CREATE INDEX "contents_reviewer_id_idx" ON "contents" ("reviewer_id");

CREATE INDEX "contents_department_id_period_id_idx" ON "contents" ("department_id", "period_id");

CREATE INDEX "contents_period_id_idx" ON "contents" ("period_id");

CREATE INDEX "work_programs_department_id_period_id_idx" ON "work_programs" ("department_id", "period_id");

CREATE INDEX "work_programs_period_id_idx" ON "work_programs" ("period_id");

CREATE INDEX "events_created_by_user_id_idx" ON "events" ("created_by_user_id");

CREATE INDEX "events_department_id_period_id_idx" ON "events" ("department_id", "period_id");

CREATE INDEX "events_period_id_idx" ON "events" ("period_id");

CREATE INDEX "event_registrations_user_id_idx" ON "event_registrations" ("user_id");

CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations" ("event_id");

CREATE INDEX "aspirations_user_id_idx" ON "aspirations" ("user_id");

CREATE INDEX "aspirations_handler_id_idx" ON "aspirations" ("handler_id");

CREATE INDEX "aspirations_period_id_idx" ON "aspirations" ("period_id");

CREATE INDEX "documents_uploader_id_idx" ON "documents" ("uploader_id");

CREATE INDEX "documents_department_id_period_id_idx" ON "documents" ("department_id", "period_id");

CREATE INDEX "documents_period_id_idx" ON "documents" ("period_id");

CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs" ("user_id");

CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" ("created_at");

CREATE INDEX "activity_logs_action_created_at_idx" ON "activity_logs" ("action", "created_at");

CREATE INDEX "activity_logs_target_type_target_id_idx" ON "activity_logs" ("target_type", "target_id");

CREATE INDEX "admin_sessions_user_id_idx" ON "admin_sessions" ("user_id");

CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions" ("expires_at");

CREATE INDEX "admin_login_attempts_updated_at_idx" ON "admin_login_attempts" ("updated_at");

-- Cross-document invariant reconciliation (PRD/SRS supersede Physical details).
CREATE UNIQUE INDEX periods_one_active ON periods(status) WHERE status = 'AKTIF';
CREATE UNIQUE INDEX work_programs_bem_name ON work_programs(period_id, name) WHERE department_id IS NULL;
ALTER TABLE users ADD CONSTRAINT student_identity_required CHECK
  (role <> 'MAHASISWA' OR (nim IS NOT NULL AND btrim(nim) <> '' AND angkatan IS NOT NULL AND program_studi_id IS NOT NULL));
ALTER TABLE users ADD CONSTRAINT email_canonical CHECK (email::text = lower(btrim(email::text)));
ALTER TABLE periods ADD CONSTRAINT period_years CHECK (year_start BETWEEN 1000 AND 9999 AND year_end BETWEEN year_start AND 9999);
ALTER TABLE periods ADD CONSTRAINT period_text CHECK (length(btrim(name::text)) BETWEEN 3 AND 100 AND length(btrim(visi)) > 0 AND length(btrim(misi)) > 0);
ALTER TABLE periods ADD CONSTRAINT period_version CHECK (version > 0);
ALTER TABLE contents ADD CONSTRAINT content_slug CHECK (slug::text ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE contents ADD CONSTRAINT content_counters CHECK (view_count >= 0 AND (reading_time IS NULL OR reading_time > 0));
ALTER TABLE contents ADD CONSTRAINT content_review_note CHECK (status <> 'REVISI' OR length(btrim(review_note)) > 0 AND review_note IS NOT NULL);
ALTER TABLE contents ADD CONSTRAINT content_published_at CHECK (status <> 'TERBIT' OR published_at IS NOT NULL);
ALTER TABLE contents ADD CONSTRAINT content_tags CHECK (cardinality(tags) <= 5);
ALTER TABLE departments ADD CONSTRAINT department_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE work_programs ADD CONSTRAINT program_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE work_programs ADD CONSTRAINT program_order CHECK (display_order >= 0);
ALTER TABLE board_members ADD CONSTRAINT board_order CHECK (display_order >= 0);
ALTER TABLE department_members ADD CONSTRAINT roster_order CHECK (display_order >= 0);
ALTER TABLE events ADD CONSTRAINT event_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE events ADD CONSTRAINT event_dates CHECK ((end_time IS NULL OR end_time > start_time) AND (registration_deadline IS NULL OR registration_deadline < start_time));
ALTER TABLE events ADD CONSTRAINT event_quota CHECK (max_participants IS NULL OR max_participants > 0);
ALTER TABLE events ADD CONSTRAINT event_form CHECK (jsonb_typeof(registration_schema) = 'array');
ALTER TABLE event_registrations ADD CONSTRAINT rejection_reason CHECK (status <> 'DITOLAK' OR decision_note IS NOT NULL AND length(btrim(decision_note)) > 0);
ALTER TABLE aspirations ADD CONSTRAINT aspiration_response CHECK (status NOT IN ('SELESAI','DITOLAK') OR response IS NOT NULL AND length(btrim(response)) >= 10);
ALTER TABLE documents ADD CONSTRAINT document_size CHECK (file_size >= 1 AND download_count >= 0);
ALTER TABLE admin_login_attempts ADD CONSTRAINT login_failures CHECK (failures >= 0);

CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := CURRENT_TIMESTAMP; RETURN NEW; END;
$$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['users','study_programs','periods','departments','admin_assignments','board_members','department_members','contents','work_programs','events','event_registrations','aspirations','documents','admin_login_attempts'] LOOP
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t);
  END LOOP;
END $$;

CREATE FUNCTION reject_log_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Activity log is append-only' USING ERRCODE = '23514'; END;
$$;
CREATE TRIGGER log_immutable BEFORE UPDATE OR DELETE OR TRUNCATE ON activity_logs
FOR EACH STATEMENT EXECUTE FUNCTION reject_log_mutation();

CREATE FUNCTION protect_period() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Periods cannot be deleted' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'NONAKTIF' THEN RAISE EXCEPTION 'Create period as draft' USING ERRCODE = '23514'; END IF;
  ELSE
    IF OLD.status = 'ARSIP' THEN RAISE EXCEPTION 'Archived period is immutable' USING ERRCODE = '23514'; END IF;
    IF NEW.id <> OLD.id THEN RAISE EXCEPTION 'Period identity is immutable' USING ERRCODE = '23514'; END IF;
    IF NEW.status <> OLD.status AND NOT
      ((OLD.status = 'NONAKTIF' AND NEW.status = 'AKTIF') OR (OLD.status = 'AKTIF' AND NEW.status = 'ARSIP'))
    THEN RAISE EXCEPTION 'Invalid period transition' USING ERRCODE = '23514'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_period BEFORE INSERT OR UPDATE OR DELETE ON periods FOR EACH ROW EXECUTE FUNCTION protect_period();

CREATE FUNCTION require_active_period() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Zero active only while every period is still a setup draft.
  IF EXISTS (SELECT 1 FROM periods WHERE status <> 'NONAKTIF')
    AND (SELECT count(*) FROM periods WHERE status = 'AKTIF') <> 1
  THEN RAISE EXCEPTION 'Exactly one active period required after bootstrap' USING ERRCODE = '23514'; END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER require_active_period AFTER INSERT OR UPDATE OR DELETE ON periods
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_active_period();

CREATE FUNCTION protect_period_child() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid uuid; s period_status;
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.period_id <> OLD.period_id OR NEW.id <> OLD.id) THEN
    RAISE EXCEPTION 'Period ownership and identity are immutable' USING ERRCODE = '23514';
  END IF;
  pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.period_id ELSE NEW.period_id END;
  -- Locks conflict with period rollover; recheck status after waiting.
  SELECT status INTO s FROM periods WHERE id = pid FOR SHARE;
  IF s IS NULL OR s = 'ARSIP' THEN RAISE EXCEPTION 'Period not writable' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['departments','admin_assignments','board_members','department_members','contents','work_programs','events','aspirations','documents'] LOOP
    EXECUTE format('CREATE TRIGGER protect_period_child BEFORE INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION protect_period_child()', t);
  END LOOP;
END $$;

CREATE FUNCTION protect_registration() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE eid uuid; pid uuid; s period_status;
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.event_id <> OLD.event_id OR NEW.user_id <> OLD.user_id OR NEW.id <> OLD.id) THEN
    RAISE EXCEPTION 'Registration ownership immutable' USING ERRCODE = '23514';
  END IF;
  eid := CASE WHEN TG_OP = 'DELETE' THEN OLD.event_id ELSE NEW.event_id END;
  SELECT period_id INTO pid FROM events WHERE id = eid;
  SELECT status INTO s FROM periods WHERE id = pid FOR SHARE;
  IF s IS NULL OR s = 'ARSIP' THEN RAISE EXCEPTION 'Period not writable' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_registration BEFORE INSERT OR UPDATE OR DELETE ON event_registrations
FOR EACH ROW EXECUTE FUNCTION protect_registration();

CREATE FUNCTION protect_assignment() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (NEW.user_id <> OLD.user_id OR NEW.department_id <> OLD.department_id) THEN
    RAISE EXCEPTION 'Admin assignment cannot be transferred' USING ERRCODE = '23514';
  END IF;
  IF NEW.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id AND role = 'ADMIN' AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Assignment requires department admin account' USING ERRCODE = '23514';
  END IF;
  IF NEW.revoked_at IS NULL AND NOT EXISTS (SELECT 1 FROM departments WHERE id = NEW.department_id AND period_id = NEW.period_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Department unavailable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_assignment BEFORE INSERT OR UPDATE ON admin_assignments FOR EACH ROW EXECUTE FUNCTION protect_assignment();

-- Revoke before archive, while the old period is still writable.
CREATE FUNCTION revoke_period_admins() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'AKTIF' AND NEW.status = 'ARSIP' THEN
    DELETE FROM admin_sessions WHERE user_id IN (SELECT user_id FROM admin_assignments WHERE period_id = OLD.id);
    UPDATE users SET account_status = 'NONAKTIF' WHERE role = 'ADMIN'
      AND id IN (SELECT user_id FROM admin_assignments WHERE period_id = OLD.id);
    UPDATE admin_assignments SET revoked_at = CURRENT_TIMESTAMP WHERE period_id = OLD.id AND revoked_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER revoke_period_admins BEFORE UPDATE ON periods FOR EACH ROW EXECUTE FUNCTION revoke_period_admins();

CREATE FUNCTION protect_user_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id <> OLD.id OR NEW.email IS DISTINCT FROM OLD.email OR NEW.nim IS DISTINCT FROM OLD.nim THEN
    RAISE EXCEPTION 'User identity immutable' USING ERRCODE = '23514';
  END IF;
  IF NEW.role <> OLD.role AND EXISTS(SELECT 1 FROM admin_assignments WHERE user_id = OLD.id) THEN
    RAISE EXCEPTION 'Assigned admin role immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_user_identity BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION protect_user_identity();

-- TRUNCATE bypasses row triggers: disallow it on persistent domain tables.
CREATE FUNCTION reject_domain_truncate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Domain tables cannot be truncated' USING ERRCODE = '23514'; END;
$$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['users','study_programs','periods','departments','admin_assignments','board_members','department_members','contents','work_programs','events','event_registrations','aspirations','documents'] LOOP
    EXECUTE format('CREATE TRIGGER reject_domain_truncate BEFORE TRUNCATE ON %I FOR EACH STATEMENT EXECUTE FUNCTION reject_domain_truncate()', t);
  END LOOP;
END $$;
