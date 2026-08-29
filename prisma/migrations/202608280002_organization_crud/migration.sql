-- Additive continuation: never rewrite the previously delivered foundation migration.
ALTER TABLE departments ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE board_members ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE department_members ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);
ALTER TABLE board_members ALTER COLUMN display_order SET DEFAULT 1;
ALTER TABLE department_members ALTER COLUMN display_order SET DEFAULT 1;

-- Increment even on direct SQL writes so stale API forms cannot overwrite them.
-- Existing archive data (including legacy order=0) is not rewritten by migration.
CREATE FUNCTION protect_organization_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Organization records require soft deletion' USING ERRCODE='23514';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NOT NULL THEN
      RAISE EXCEPTION 'Deleted organization record is immutable' USING ERRCODE='23514';
    END IF;
    NEW.version := OLD.version + 1;
  ELSE
    NEW.version := 1;
  END IF;
  IF NEW.deleted_at IS NULL THEN
    IF char_length(btrim(NEW.name::text)) NOT BETWEEN 3 AND 100 THEN
      RAISE EXCEPTION 'Organization name must be 3 to 100 characters' USING ERRCODE='23514';
    END IF;
    IF TG_TABLE_NAME <> 'departments' THEN
      IF char_length(btrim(NEW.position)) NOT BETWEEN 1 AND 100 OR NEW.display_order < 1 THEN
        RAISE EXCEPTION 'Position and positive display order required' USING ERRCODE='23514';
      END IF;
    END IF;
  END IF;
  IF TG_TABLE_NAME = 'department_members' AND TG_OP = 'UPDATE' THEN
    IF NEW.department_id IS DISTINCT FROM OLD.department_id THEN
      RAISE EXCEPTION 'Roster department cannot be transferred' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_organization_row BEFORE INSERT OR UPDATE OR DELETE ON departments
FOR EACH ROW EXECUTE FUNCTION protect_organization_row();
CREATE TRIGGER protect_organization_row BEFORE INSERT OR UPDATE OR DELETE ON board_members
FOR EACH ROW EXECUTE FUNCTION protect_organization_row();
CREATE TRIGGER protect_organization_row BEFORE INSERT OR UPDATE OR DELETE ON department_members
FOR EACH ROW EXECUTE FUNCTION protect_organization_row();

CREATE FUNCTION protect_department_deletion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    IF EXISTS(SELECT 1 FROM admin_assignments WHERE department_id=OLD.id AND revoked_at IS NULL)
      OR EXISTS(SELECT 1 FROM board_members WHERE department_id=OLD.id AND deleted_at IS NULL)
      OR EXISTS(SELECT 1 FROM department_members WHERE department_id=OLD.id AND deleted_at IS NULL)
      OR EXISTS(SELECT 1 FROM contents WHERE department_id=OLD.id AND deleted_at IS NULL)
      OR EXISTS(SELECT 1 FROM work_programs WHERE department_id=OLD.id AND deleted_at IS NULL)
      OR EXISTS(SELECT 1 FROM events WHERE department_id=OLD.id AND deleted_at IS NULL)
      OR EXISTS(SELECT 1 FROM documents WHERE department_id=OLD.id AND deleted_at IS NULL) THEN
      RAISE EXCEPTION 'Department still has live records or access assignments' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_department_deletion BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION protect_department_deletion();

-- Composite FK already enforces matching periods. This additionally prevents
-- new/live references to soft-deleted departments, including future modules.
CREATE FUNCTION require_live_department() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE removed timestamptz;
BEGIN
  IF NEW.department_id IS NULL THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'admin_assignments' THEN
    IF NEW.revoked_at IS NOT NULL THEN RETURN NEW; END IF;
  ELSE
    IF NEW.deleted_at IS NOT NULL THEN RETURN NEW; END IF;
  END IF;
  SELECT deleted_at INTO removed FROM departments WHERE id=NEW.department_id FOR SHARE;
  IF NOT FOUND OR removed IS NOT NULL THEN
    RAISE EXCEPTION 'A live department is required' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['admin_assignments','board_members','department_members','contents','work_programs','events','documents'] LOOP
    EXECUTE format('CREATE TRIGGER require_live_department BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION require_live_department()', t);
  END LOOP;
END $$;
