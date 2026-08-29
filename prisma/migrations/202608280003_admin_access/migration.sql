-- Forward-only continuation. Run after migrations 001 and 002.
-- Case-folding existing program codes may reveal duplicates: fail, never merge.
BEGIN;
ALTER TABLE users ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
-- Enforced for new writes; legacy unverified students are not silently verified.
ALTER TABLE users ADD CONSTRAINT verified_student_activation CHECK
  (role <> 'MAHASISWA' OR account_status <> 'AKTIF' OR email_verified_at IS NOT NULL) NOT VALID;
ALTER TABLE study_programs ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE study_programs ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE study_programs ALTER COLUMN code TYPE CITEXT USING code::citext;
ALTER TABLE study_programs ADD CONSTRAINT program_code_length CHECK (char_length(code::text) BETWEEN 1 AND 10);

CREATE TABLE "admin_access_state" (
  "id" INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  "active_super_admins" INTEGER NOT NULL DEFAULT 0 CHECK (active_super_admins >= 0),
  "initialized" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT keep_active_super_admin CHECK (NOT initialized OR active_super_admins >= 1)
);
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM users WHERE role='SUPER_ADMIN')
    AND NOT EXISTS(SELECT 1 FROM users WHERE role='SUPER_ADMIN' AND account_status='AKTIF' AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Preflight failed: existing Super Admin accounts have no active account' USING ERRCODE='23514';
  END IF;
  IF EXISTS(SELECT 1 FROM users u WHERE u.role='ADMIN' AND u.account_status='AKTIF' AND u.deleted_at IS NULL
    AND NOT EXISTS(SELECT 1 FROM admin_assignments a JOIN periods p ON p.id=a.period_id
      JOIN departments d ON d.id=a.department_id AND d.period_id=a.period_id
      WHERE a.user_id=u.id AND a.revoked_at IS NULL AND p.status='AKTIF' AND d.deleted_at IS NULL)) THEN
    RAISE EXCEPTION 'Preflight failed: active Admin has invalid assignment' USING ERRCODE='23514';
  END IF;
END $$;
INSERT INTO admin_access_state(id,active_super_admins,initialized)
SELECT 1,count(*)::integer,count(*)>0 FROM users WHERE role='SUPER_ADMIN' AND account_status='AKTIF' AND deleted_at IS NULL;

-- A shared counter row serializes concurrent removals in the database itself.
-- A SELECT count(*) alone is insufficient under concurrent snapshot reads.
CREATE FUNCTION maintain_super_admin_count() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE was_active boolean := false; becomes_active boolean; delta integer;
BEGIN
  IF TG_OP='UPDATE' THEN was_active := OLD.role='SUPER_ADMIN' AND OLD.account_status='AKTIF' AND OLD.deleted_at IS NULL; END IF;
  becomes_active := NEW.role='SUPER_ADMIN' AND NEW.account_status='AKTIF' AND NEW.deleted_at IS NULL;
  delta := becomes_active::integer - was_active::integer;
  IF delta <> 0 THEN
    UPDATE admin_access_state SET active_super_admins=active_super_admins+delta, initialized=initialized OR becomes_active WHERE id=1;
    IF NOT FOUND THEN RAISE EXCEPTION 'Admin access guard missing' USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER maintain_super_admin_count AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION maintain_super_admin_count();

CREATE FUNCTION protect_admin_access_state() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'UPDATE' OR pg_trigger_depth() < 2 THEN
    RAISE EXCEPTION 'Admin access state is trigger-managed' USING ERRCODE='23514';
  END IF;
  IF NEW.id <> OLD.id OR (OLD.initialized AND NOT NEW.initialized) THEN
    RAISE EXCEPTION 'Admin access state cannot be reset' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_admin_access_state BEFORE INSERT OR UPDATE OR DELETE ON admin_access_state
FOR EACH ROW EXECUTE FUNCTION protect_admin_access_state();
CREATE TRIGGER reject_domain_truncate BEFORE TRUNCATE ON admin_access_state
FOR EACH STATEMENT EXECUTE FUNCTION reject_domain_truncate();

CREATE FUNCTION protect_user_access() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'User history cannot be hard-deleted' USING ERRCODE='23514'; END IF;
  IF TG_OP='INSERT' THEN NEW.version := 1; RETURN NEW; END IF;
  IF OLD.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Deleted user immutable' USING ERRCODE='23514'; END IF;
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.program_studi_id IS DISTINCT FROM OLD.program_studi_id OR NEW.angkatan IS DISTINCT FROM OLD.angkatan THEN
    RAISE EXCEPTION 'Role and academic identity cannot be transferred' USING ERRCODE='23514';
  END IF;
  NEW.version := OLD.version+1;
  IF NEW.account_status IS DISTINCT FROM OLD.account_status OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    OR NEW.password IS DISTINCT FROM OLD.password OR (NEW.must_change_password AND NOT OLD.must_change_password) THEN
    DELETE FROM admin_sessions WHERE user_id=OLD.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_user_access BEFORE INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION protect_user_access();

CREATE FUNCTION protect_assignment_revocation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Assignment history cannot be deleted' USING ERRCODE='23514'; END IF;
  IF OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS DISTINCT FROM OLD.revoked_at THEN
    RAISE EXCEPTION 'Revocation is permanent' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_assignment_revocation BEFORE UPDATE OR DELETE ON admin_assignments
FOR EACH ROW EXECUTE FUNCTION protect_assignment_revocation();
CREATE FUNCTION apply_assignment_revocation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.revoked_at IS NOT NULL THEN
    DELETE FROM admin_sessions WHERE user_id=NEW.user_id;
    UPDATE users SET account_status='NONAKTIF' WHERE id=NEW.user_id AND role='ADMIN' AND deleted_at IS NULL AND account_status<>'NONAKTIF';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER apply_assignment_revocation AFTER INSERT OR UPDATE ON admin_assignments
FOR EACH ROW EXECUTE FUNCTION apply_assignment_revocation();

-- Preserve archive rollover when an old account is already deleted/nonactive.
-- No updates to immutable deleted identities; assignments and sessions still revoke.
CREATE OR REPLACE FUNCTION revoke_period_admins() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status='AKTIF' AND NEW.status='ARSIP' THEN
    DELETE FROM admin_sessions WHERE user_id IN (SELECT user_id FROM admin_assignments WHERE period_id=OLD.id);
    UPDATE users SET account_status='NONAKTIF' WHERE role='ADMIN' AND deleted_at IS NULL AND account_status<>'NONAKTIF'
      AND id IN (SELECT user_id FROM admin_assignments WHERE period_id=OLD.id);
    UPDATE admin_assignments SET revoked_at=CURRENT_TIMESTAMP WHERE period_id=OLD.id AND revoked_at IS NULL;
  END IF;
  RETURN NEW;
END $$;

-- Deferred check permits atomic account + assignment creation, but no active
-- department Admin may commit without a usable assignment on the active period.
CREATE FUNCTION require_active_admin_assignment() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target uuid;
BEGIN
  IF TG_TABLE_NAME='users' THEN target := NEW.id; ELSE target := NEW.user_id; END IF;
  IF EXISTS(SELECT 1 FROM users WHERE id=target AND role='ADMIN' AND account_status='AKTIF' AND deleted_at IS NULL)
    AND NOT EXISTS(SELECT 1 FROM admin_assignments a JOIN departments d ON d.id=a.department_id AND d.period_id=a.period_id
      JOIN periods p ON p.id=a.period_id WHERE a.user_id=target AND a.revoked_at IS NULL AND d.deleted_at IS NULL AND p.status='AKTIF') THEN
    RAISE EXCEPTION 'Active Admin requires active assignment' USING ERRCODE='23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER require_active_admin_assignment AFTER INSERT OR UPDATE ON users
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_active_admin_assignment();
CREATE CONSTRAINT TRIGGER require_active_admin_assignment AFTER INSERT OR UPDATE ON admin_assignments
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION require_active_admin_assignment();

CREATE FUNCTION protect_study_program() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Study programs require soft deletion' USING ERRCODE='23514'; END IF;
  IF TG_OP='UPDATE' THEN
    IF OLD.deleted_at IS NOT NULL THEN RAISE EXCEPTION 'Deleted program immutable' USING ERRCODE='23514'; END IF;
    IF NEW.id<>OLD.id THEN RAISE EXCEPTION 'Program identity immutable' USING ERRCODE='23514'; END IF;
    IF NEW.deleted_at IS NOT NULL AND EXISTS(SELECT 1 FROM users WHERE program_studi_id=OLD.id) THEN
      RAISE EXCEPTION 'Program still referenced by users' USING ERRCODE='23514';
    END IF;
    NEW.version := OLD.version+1;
  ELSE NEW.version := 1;
  END IF;
  IF NEW.deleted_at IS NULL AND (char_length(btrim(NEW.name::text)) NOT BETWEEN 3 AND 255
    OR NEW.code::text !~* '^[a-z0-9]+([-_][a-z0-9]+)*$') THEN
    RAISE EXCEPTION 'Invalid study program fields' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_study_program BEFORE INSERT OR UPDATE OR DELETE ON study_programs
FOR EACH ROW EXECUTE FUNCTION protect_study_program();
CREATE FUNCTION require_live_study_program() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE removed timestamptz;
BEGIN
  IF NEW.program_studi_id IS NULL THEN RETURN NEW; END IF;
  SELECT deleted_at INTO removed FROM study_programs WHERE id=NEW.program_studi_id FOR SHARE;
  IF NOT FOUND OR removed IS NOT NULL THEN RAISE EXCEPTION 'Live study program required' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER require_live_study_program BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION require_live_study_program();
COMMIT;
