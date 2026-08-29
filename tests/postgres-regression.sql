-- UNEXECUTED here: requires an empty disposable PostgreSQL database with ALL THREE migrations applied.
-- Operator command: psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/postgres-regression.sql
-- Never run against production. All fixtures roll back; no persistent demo seed.
BEGIN;
DO $$
DECLARE p1 uuid; p2 uuid; d1 uuid; d2 uuid; d3 uuid; u1 uuid; u2 uuid; u3 uuid; a1 uuid; a2 uuid; sa uuid; sa2 uuid; sp1 uuid; sp2 uuid; student uuid; deleted_version integer; log_id uuid; members uuid; removable uuid; failed boolean;
BEGIN
  IF EXISTS(SELECT 1 FROM users) OR EXISTS(SELECT 1 FROM periods) THEN
    RAISE EXCEPTION 'Refusing: test requires empty disposable database';
  END IF;
  INSERT INTO periods(name,visi,misi,year_start,year_end) VALUES ('TEST ONLY ONE','Test','Test',2026,2026) RETURNING id INTO p1;
  INSERT INTO periods(name,visi,misi,year_start,year_end) VALUES ('TEST ONLY TWO','Test','Test',2027,2028) RETURNING id INTO p2;
  UPDATE periods SET status='AKTIF' WHERE id=p1;
  SET CONSTRAINTS ALL IMMEDIATE;
  SET CONSTRAINTS ALL DEFERRED;
  INSERT INTO users(name,email,password,role,account_status) VALUES ('Test SA','sa@example.test','NOT_A_REAL_PASSWORD','SUPER_ADMIN','AKTIF') RETURNING id INTO sa;
  IF (SELECT active_super_admins FROM admin_access_state WHERE id=1) <> 1 THEN RAISE EXCEPTION 'SA counter not initialized'; END IF;
  failed := false;
  BEGIN UPDATE users SET account_status='NONAKTIF' WHERE id=sa;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Last SA disabled'; END IF;
  INSERT INTO users(name,email,password,role,account_status) VALUES ('Test Backup SA','backup@example.test','NOT_A_REAL_PASSWORD','SUPER_ADMIN','AKTIF') RETURNING id INTO sa2;
  UPDATE users SET account_status='NONAKTIF' WHERE id=sa2;
  IF (SELECT active_super_admins FROM admin_access_state WHERE id=1) <> 1 THEN RAISE EXCEPTION 'SA counter drifted after disable'; END IF;
  failed := false;
  BEGIN UPDATE users SET deleted_at=now() WHERE id=sa;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Last SA soft-deleted'; END IF;
  failed := false;
  BEGIN UPDATE admin_access_state SET active_super_admins=99 WHERE id=1;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'SA guard directly editable'; END IF;
  INSERT INTO users(name,email,password,role,account_status) VALUES ('Test Admin','admin@example.test','NOT_A_REAL_PASSWORD','ADMIN','AKTIF') RETURNING id INTO u1;
  INSERT INTO departments(name,slug,period_id) VALUES ('TEST DEPT','test-dept',p1) RETURNING id INTO d1;
  INSERT INTO admin_assignments(user_id,department_id,period_id) VALUES (u1,d1,p1) RETURNING id INTO a1;
  INSERT INTO admin_sessions(user_id,token_hash,csrf_hash,last_seen_at,expires_at) VALUES (u1,repeat('a',64),repeat('b',64),now(),now()+interval '1 hour');
  UPDATE users SET account_status='NONAKTIF' WHERE id=u1;
  IF EXISTS(SELECT 1 FROM admin_sessions WHERE user_id=u1) THEN RAISE EXCEPTION 'Session survived suspension'; END IF;
  IF (SELECT revoked_at FROM admin_assignments WHERE id=a1) IS NOT NULL THEN RAISE EXCEPTION 'Temporary suspension revoked assignment'; END IF;
  UPDATE users SET account_status='AKTIF' WHERE id=u1;
  INSERT INTO admin_sessions(user_id,token_hash,csrf_hash,last_seen_at,expires_at) VALUES (u1,repeat('a',64),repeat('b',64),now(),now()+interval '1 hour');
  UPDATE users SET password='CHANGED_TEST_PASSWORD' WHERE id=u1;
  IF EXISTS(SELECT 1 FROM admin_sessions WHERE user_id=u1) THEN RAISE EXCEPTION 'Session survived password change'; END IF;
  INSERT INTO admin_sessions(user_id,token_hash,csrf_hash,last_seen_at,expires_at) VALUES (u1,repeat('a',64),repeat('b',64),now(),now()+interval '1 hour');
  failed := false;
  BEGIN UPDATE users SET role='SUPER_ADMIN' WHERE id=u1;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'User role transferred'; END IF;
  failed := false;
  BEGIN
    INSERT INTO users(name,email,password,role,account_status) VALUES ('Orphan Test Admin','orphan@example.test','NOT_REAL','ADMIN','AKTIF');
    SET CONSTRAINTS ALL IMMEDIATE;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  SET CONSTRAINTS ALL DEFERRED;
  IF NOT failed THEN RAISE EXCEPTION 'Active Admin committed without assignment'; END IF;
  -- Program lookup: case-insensitive codes, versioning and no broken identity.
  INSERT INTO study_programs(code,name) VALUES ('TEST1','Test Program One') RETURNING id INTO sp1;
  INSERT INTO study_programs(code,name) VALUES ('TEST2','Test Program Two') RETURNING id INTO sp2;
  failed := false;
  BEGIN INSERT INTO study_programs(code,name) VALUES ('test1','Other Test Program');
  EXCEPTION WHEN unique_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Case-variant program code duplicated'; END IF;
  INSERT INTO users(name,email,password,role,nim,angkatan,program_studi_id)
    VALUES ('Test Student','student@example.test','NOT_REAL','MAHASISWA','12345678',2026,sp1) RETURNING id INTO student;
  failed := false;
  BEGIN UPDATE users SET account_status='AKTIF' WHERE id=student;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Student activation bypassed email verification'; END IF;
  failed := false;
  BEGIN UPDATE users SET program_studi_id=sp2 WHERE id=student;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Academic identity transferred'; END IF;
  failed := false;
  BEGIN UPDATE study_programs SET deleted_at=now() WHERE id=sp1;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Referenced program deleted'; END IF;
  UPDATE study_programs SET name='Corrected Test Program' WHERE id=sp1;
  IF (SELECT version FROM study_programs WHERE id=sp1) <> 2 THEN RAISE EXCEPTION 'Program version not advanced'; END IF;
  UPDATE study_programs SET deleted_at=now() WHERE id=sp2;
  failed := false;
  BEGIN INSERT INTO users(name,email,password,role,nim,angkatan,program_studi_id)
    VALUES ('Test Invalid Program','invalid-program@example.test','NOT_REAL','MAHASISWA','87654321',2026,sp2);
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Deleted program accepted new reference'; END IF;
  INSERT INTO department_members(name,position,department_id,period_id) VALUES ('TEST MEMBER','Anggota',d1,p1) RETURNING id INTO members;
  -- Core board requires no synthetic department.
  INSERT INTO board_members(name,position,period_id) VALUES ('TEST CORE','Gubernur',p1);
  -- Direct SQL edits must advance optimistic versions (API uses WHERE version).
  UPDATE department_members SET position='Updated member' WHERE id=members;
  IF (SELECT version FROM department_members WHERE id=members) <> 2 THEN RAISE EXCEPTION 'Direct SQL did not increment version'; END IF;
  failed := false;
  BEGIN UPDATE department_members SET display_order=0 WHERE id=members;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Nonpositive member order accepted'; END IF;
  -- Live records/assignments block department soft deletion.
  failed := false;
  BEGIN UPDATE departments SET deleted_at=now() WHERE id=d1;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'In-use department soft-deleted'; END IF;
  INSERT INTO departments(name,slug,period_id) VALUES ('TEST REMOVABLE','test-removable',p1) RETURNING id INTO d2;
  INSERT INTO departments(name,slug,period_id) VALUES ('TEST DESTINATION','test-destination',p1) RETURNING id INTO d3;
  INSERT INTO users(name,email,password,role,account_status) VALUES ('Test Revocation','revoked@example.test','NOT_REAL','ADMIN','NONAKTIF') RETURNING id INTO u2;
  INSERT INTO admin_assignments(user_id,department_id,period_id) VALUES (u2,d3,p1) RETURNING id INTO a2;
  UPDATE users SET account_status='AKTIF' WHERE id=u2;
  INSERT INTO admin_sessions(user_id,token_hash,csrf_hash,last_seen_at,expires_at) VALUES (u2,repeat('c',64),repeat('d',64),now(),now()+interval '1 hour');
  UPDATE admin_assignments SET revoked_at=now() WHERE id=a2;
  IF (SELECT account_status FROM users WHERE id=u2)<>'NONAKTIF' OR EXISTS(SELECT 1 FROM admin_sessions WHERE user_id=u2) THEN RAISE EXCEPTION 'Revocation failed to disable account/session'; END IF;
  failed := false;
  BEGIN UPDATE admin_assignments SET revoked_at=NULL WHERE id=a2;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Revocation reversed'; END IF;
  failed := false;
  BEGIN DELETE FROM admin_assignments WHERE id=a2;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Assignment history deleted'; END IF;
  failed := false;
  BEGIN UPDATE users SET account_status='AKTIF' WHERE id=u2; SET CONSTRAINTS ALL IMMEDIATE;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  SET CONSTRAINTS ALL DEFERRED;
  IF NOT failed THEN RAISE EXCEPTION 'Revoked Admin reactivated'; END IF;
  -- Legacy soft-deleted account must not block archival of its old assignment.
  INSERT INTO users(name,email,password,role,account_status) VALUES ('Test Deleted Admin','deleted-admin@example.test','NOT_REAL','ADMIN','AKTIF') RETURNING id INTO u3;
  INSERT INTO admin_assignments(user_id,department_id,period_id) VALUES (u3,d3,p1);
  UPDATE users SET deleted_at=now() WHERE id=u3 RETURNING version INTO deleted_version;
  INSERT INTO department_members(name,position,department_id,period_id) VALUES ('TEST REMOVABLE MEMBER','Anggota',d2,p1) RETURNING id INTO removable;
  failed := false;
  BEGIN UPDATE department_members SET department_id=d3 WHERE id=removable;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Roster ownership transferred'; END IF;
  failed := false;
  BEGIN DELETE FROM department_members WHERE id=removable;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Organization hard-delete accepted'; END IF;
  UPDATE department_members SET deleted_at=now() WHERE id=removable;
  UPDATE departments SET deleted_at=now() WHERE id=d2;
  IF NOT EXISTS(SELECT 1 FROM department_members WHERE id=removable AND deleted_at IS NOT NULL) THEN RAISE EXCEPTION 'Soft-delete lost historical row'; END IF;
  failed := false;
  BEGIN INSERT INTO board_members(name,position,department_id,period_id) VALUES ('TEST BAD REFERENCE','Anggota',d2,p1);
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Deleted department accepted a new child'; END IF;
  failed := false;
  BEGIN UPDATE departments SET deleted_at=NULL WHERE id=d2;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Deleted organization record was restored without policy'; END IF;
  -- Cross-period department reference must fail.
  failed := false;
  BEGIN
    INSERT INTO department_members(name,position,department_id,period_id) VALUES ('BAD','BAD',d1,p2);
  EXCEPTION WHEN foreign_key_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Cross-period FK was not enforced'; END IF;
  -- Second active period must fail (partial unique index).
  failed := false;
  BEGIN UPDATE periods SET status='AKTIF' WHERE id=p2;
  EXCEPTION WHEN unique_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Multiple active periods accepted'; END IF;
  -- Removing the only active period must fail at commit validation.
  failed := false;
  BEGIN
    UPDATE periods SET status='ARSIP' WHERE id=p1;
    SET CONSTRAINTS ALL IMMEDIATE;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  SET CONSTRAINTS ALL DEFERRED;
  IF NOT failed THEN RAISE EXCEPTION 'Zero active after bootstrap accepted'; END IF;
  IF NOT EXISTS(SELECT 1 FROM admin_sessions WHERE user_id=u1) THEN RAISE EXCEPTION 'Failed transition did not rollback session revocation'; END IF;
  -- Valid atomic rollover revokes sessions and authority, keeps Super Admin active.
  UPDATE periods SET status='ARSIP' WHERE id=p1;
  UPDATE periods SET status='AKTIF' WHERE id=p2;
  SET CONSTRAINTS ALL IMMEDIATE;
  IF EXISTS(SELECT 1 FROM admin_sessions WHERE user_id=u1) THEN RAISE EXCEPTION 'Old session survived rollover'; END IF;
  IF (SELECT account_status FROM users WHERE id=u1) <> 'NONAKTIF' THEN RAISE EXCEPTION 'Old account still active'; END IF;
  IF (SELECT revoked_at FROM admin_assignments WHERE id=a1) IS NULL THEN RAISE EXCEPTION 'Assignment not revoked'; END IF;
  IF (SELECT account_status FROM users WHERE id=sa) <> 'AKTIF' THEN RAISE EXCEPTION 'SA deactivated incorrectly'; END IF;
  IF (SELECT version FROM users WHERE id=u3)<>deleted_version OR EXISTS(SELECT 1 FROM admin_assignments WHERE user_id=u3 AND revoked_at IS NULL) THEN RAISE EXCEPTION 'Rollover modified deleted identity or missed revocation'; END IF;
  IF (SELECT active_super_admins FROM admin_access_state WHERE id=1) <> (SELECT count(*) FROM users WHERE role='SUPER_ADMIN' AND account_status='AKTIF' AND deleted_at IS NULL) THEN RAISE EXCEPTION 'SA count inconsistent'; END IF;
  -- Archive immutable; cannot insert into it, move records out or delete them.
  failed := false;
  BEGIN UPDATE periods SET visi='Changed' WHERE id=p1;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Archived period editable'; END IF;
  failed := false;
  BEGIN UPDATE department_members SET period_id=p2 WHERE id=members;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Archived ownership transferable'; END IF;
  failed := false;
  BEGIN DELETE FROM department_members WHERE id=members;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Archived child deletable'; END IF;
  failed := false;
  BEGIN INSERT INTO departments(name,slug,period_id) VALUES ('BAD INSERT','bad-insert',p1);
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Insert into archive accepted'; END IF;
  INSERT INTO activity_logs(user_id,action) VALUES (sa,'test.action') RETURNING id INTO log_id;
  failed := false;
  BEGIN UPDATE activity_logs SET action='tampered' WHERE id=log_id;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Audit editable'; END IF;
  failed := false;
  BEGIN DELETE FROM activity_logs WHERE id=log_id;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Audit deletable'; END IF;
  failed := false;
  BEGIN TRUNCATE activity_logs;
  EXCEPTION WHEN check_violation THEN failed := true; END;
  IF NOT failed THEN RAISE EXCEPTION 'Audit truncatable'; END IF;
  RAISE NOTICE 'PostgreSQL invariant regression passed; fixtures will be rolled back';
END $$;
ROLLBACK;
