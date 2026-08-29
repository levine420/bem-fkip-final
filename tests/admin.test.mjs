import test from 'node:test';
import assert from 'node:assert/strict';
import { actorFromAccount, assertActivation, assertResourceScope, assertVersion, assertWritablePeriod, departmentScope, requireSuperAdmin } from '../src/lib/admin/policy.ts';
import { assertCsrf, assertOrigin, failedLogin, IDLE_TIMEOUT_MS, LOGIN_LOCK_MS, randomToken, sessionExpired, tokenHash, tokenMatches } from '../src/lib/admin/security.ts';
import { email, integer, objectInput, pagination, password, periodInput, uuid } from '../src/lib/admin/validation.ts';
import { departmentInput, deleteInput, memberDepartment, memberInput, optionalImageUrl, organizationScope, requireOrganizationAccess } from '../src/lib/admin/organization.ts';
import { assertUserAction, assertUserEdit, createAdminInput, editAdminInput, studyProgramInput, userActionInput } from '../src/lib/admin/access.ts';
const account = (patch = {}) => ({ id: 'user-one', name: 'Test admin', role: 'ADMIN', account_status: 'AKTIF', deleted_at: null, must_change_password: false,
  admin_assignments_user: { department_id: 'dept-one', period_id: 'period-one', revoked_at: null, department: { deleted_at: null }, period: { status: 'AKTIF' } }, ...patch });
const admin = () => actorFromAccount(account());
const superAdmin = () => actorFromAccount(account({ role: 'SUPER_ADMIN', admin_assignments_user: null }));
const rejects = (fn, code) => assert.throws(fn, (e) => e.code === code);
for (const patch of [{ role: 'MAHASISWA' }, { role: 'UNKNOWN' }, { account_status: 'NONAKTIF' }, { account_status: 'BELUM_VERIFIKASI' }, { deleted_at: new Date() }]) {
  test(`deny account: ${JSON.stringify(patch)}`, () => rejects(() => actorFromAccount(account(patch)), 'SESSION_INVALID'));
}
test('admin requires assignment and live department/period', () => {
  for (const assignment of [null, { ...account().admin_assignments_user, revoked_at: new Date() }, { ...account().admin_assignments_user, period: { status: 'ARSIP' } }, { ...account().admin_assignments_user, period: { status: 'NONAKTIF' } }, { ...account().admin_assignments_user, department: { deleted_at: new Date() } }]) rejects(() => actorFromAccount(account({ admin_assignments_user: assignment })), 'ASSIGNMENT_INACTIVE');
});
test('super admin valid without period assignment', () => assert.equal(superAdmin().assignment, null));
test('server scope is department AND period, never OR', () => {
  assert.deepEqual(departmentScope(admin()), { department_id: 'dept-one', period_id: 'period-one' });
  for (const resource of [{ department_id: 'dept-other', period_id: 'period-one' }, { department_id: 'dept-one', period_id: 'period-other' }, { department_id: null, period_id: 'period-one' }]) rejects(() => assertResourceScope(admin(), resource), 'FORBIDDEN');
  assertResourceScope(admin(), { department_id: 'dept-one', period_id: 'period-one' });
});
test('missing assignment fails closed', () => rejects(() => departmentScope({ ...admin(), assignment: null }), 'FORBIDDEN'));
test('privileged mutations reject department admin', () => { rejects(() => requireSuperAdmin(admin()), 'FORBIDDEN'); requireSuperAdmin(superAdmin()); });
test('archive cannot be written even by super admin', () => {
  requireSuperAdmin(superAdmin()); rejects(() => assertWritablePeriod('ARSIP'), 'PERIOD_READ_ONLY'); rejects(() => assertWritablePeriod('UNKNOWN'), 'PERIOD_READ_ONLY'); assertWritablePeriod('NONAKTIF'); assertWritablePeriod('AKTIF');
});
test('activation only draft and exact current active confirmation', () => {
  assertActivation('NONAKTIF', null, null); assertActivation('NONAKTIF', 'old', 'old');
  for (const state of ['AKTIF', 'ARSIP']) rejects(() => assertActivation(state, 'old', 'old'), 'INVALID_TRANSITION');
  rejects(() => assertActivation('NONAKTIF', 'new', 'old'), 'STALE_STATE'); rejects(() => assertActivation('NONAKTIF', 'new', null), 'STALE_STATE');
});
test('stale edit version rejected', () => { assertVersion(3, 3); rejects(() => assertVersion(4, 3), 'STALE_STATE'); });
test('256-bit tokens, hashes and constant-time matcher', () => {
  const a = randomToken(), b = randomToken(); assert.notEqual(a, b); assert.match(a, /^[a-f0-9]{64}$/); assert.notEqual(a, tokenHash(a)); assert.equal(tokenMatches(a, tokenHash(a)), true); assert.equal(tokenMatches(b, tokenHash(a)), false); assert.equal(tokenMatches('bad', 'bad'), false);
});
test('idle timeout exact 60-minute boundary', () => {
  const start = new Date('2026-08-28T00:00:00Z'), state = { last_seen_at: start, expires_at: new Date(start.getTime() + 12 * IDLE_TIMEOUT_MS) };
  assert.equal(sessionExpired(state, new Date(start.getTime() + IDLE_TIMEOUT_MS - 1)), false); assert.equal(sessionExpired(state, new Date(start.getTime() + IDLE_TIMEOUT_MS)), true);
});
test('absolute expiry rejects even with recent activity', () => { const now = new Date(); assert.equal(sessionExpired({ expires_at: now, last_seen_at: now }, now), true); });
test('origin rejects suffix, null, insecure origin, missing config', () => {
  assertOrigin('https://admin.example.test', 'https://admin.example.test');
  for (const origin of [null, 'null', 'https://admin.example.test.attacker.test', 'http://admin.example.test']) rejects(() => assertOrigin(origin, 'https://admin.example.test'), 'CSRF');
  rejects(() => assertOrigin('https://admin.example.test', undefined), 'ADMIN_NOT_CONFIGURED');
});
test('CSRF cookie/header and session binding all required', () => {
  const a = randomToken(), b = randomToken(); assertCsrf(a, a); assertCsrf(a, a, tokenHash(a));
  for (const args of [[undefined, a], [a, null], [a, b], [a, a, tokenHash(b)], ['', '']]) rejects(() => assertCsrf(...args), 'CSRF');
});
test('fifth login failure locks 30 minutes and resets after expiry', () => {
  const now = new Date('2026-08-28T00:00:00Z'); let state = null;
  for (let n = 1; n <= 5; n++) { state = failedLogin(state, now); assert.equal(state.failures, n); assert.equal(!!state.locked_until, n === 5); }
  assert.equal(state.locked_until.getTime(), now.getTime() + LOGIN_LOCK_MS); assert.equal(failedLogin(state, new Date(now.getTime() + LOGIN_LOCK_MS)).failures, 1);
});
const period = () => ({ name: 'Kabinet Uji', visi: 'Visi pengujian', misi: 'Misi pengujian', year_start: '2026', year_end: '2026', photo_url: '' });
test('SRS allows same-year period and nullable photo', () => assert.deepEqual(periodInput(period()), { ...period(), year_start: 2026, year_end: 2026, photo_url: null }));
test('period mass assignment rejected', () => { for (const [key, value] of [['status', 'AKTIF'], ['id', 'overridden'], ['author_id', 'other']]) rejects(() => periodInput({ ...period(), [key]: value }), 'VALIDATION'); });
test('period rejects missing mission/vision and backwards/malformed year', () => {
  for (const patch of [{ visi: ' ' }, { misi: '' }, { year_end: 2025 }, { year_start: '2026junk' }, { name: 'xx' }]) rejects(() => periodInput({ ...period(), ...patch }), 'VALIDATION');
});
test('photo refuses unsafe protocols and URL credentials', () => {
  for (const photo_url of ['javascript:alert(1)', 'data:image/png;base64,test', 'http://example.test/x', 'https://user:secret@example.test/x']) rejects(() => periodInput({ ...period(), photo_url }), 'VALIDATION');
  assert.equal(periodInput({ ...period(), photo_url: 'https://example.test/photo.png' }).photo_url, 'https://example.test/photo.png');
});
test('password not silently trimmed or bcrypt-truncated', () => {
  assert.equal(password(' Abcdefghij12 ', true), ' Abcdefghij12 ');
  for (const value of ['short', 'abcdefghijk123', 'A'.repeat(73), 'Ä'.repeat(37)]) rejects(() => password(value, true), 'VALIDATION');
});
test('email normalized and format validated', () => { assert.equal(email(' ADMIN@Example.test '), 'admin@example.test'); rejects(() => email('not-email'), 'VALIDATION'); });
test('strict integers, UUID, object input', () => {
  for (const value of ['1e3', '2.5', '', NaN, -1, true]) rejects(() => integer(value, 'version', 1, 100), 'VALIDATION');
  rejects(() => uuid("' OR 1=1 --"), 'VALIDATION'); rejects(() => objectInput([], []), 'VALIDATION');
});
test('pagination bounded and malformed pages rejected', () => {
  assert.deepEqual(pagination(new URLSearchParams('page=2&q= Kabinet ')), { page: 2, q: 'Kabinet', take: 20, skip: 20 });
  for (const q of ['page=0', 'page=-1', 'page=100001', `q=${'a'.repeat(101)}`]) rejects(() => pagination(new URLSearchParams(q)), 'VALIDATION');
});

const orgPeriod = '10000000-0000-4000-8000-000000000001', orgDept = '20000000-0000-4000-8000-000000000001';
const orgOther = '30000000-0000-4000-8000-000000000001';
const scopedAdmin = () => ({ ...admin(), assignment: { period_id: orgPeriod, department_id: orgDept } });
const deptData = () => ({ name: 'Departemen Uji', slug: 'departemen-uji', description: '', logo_url: '', period_id: orgPeriod });
const memberData = () => ({ name: 'Anggota Uji', position: 'Anggota', photo_url: '', display_order: '1', period_id: orgPeriod, department_id: orgDept });
test('organization filters default to assignment and cannot broaden it', () => {
  assert.deepEqual(organizationScope(scopedAdmin(), null), { period_id: orgPeriod, department_id: orgDept });
  assert.deepEqual(organizationScope(scopedAdmin(), orgPeriod, ''), { period_id: orgPeriod, department_id: orgDept });
  for (const [period, dept] of [[orgOther, orgDept], [orgPeriod, orgOther], [orgOther, orgOther]]) rejects(() => organizationScope(scopedAdmin(), period, dept), 'FORBIDDEN');
  rejects(() => organizationScope({ ...scopedAdmin(), assignment: null }, orgPeriod), 'FORBIDDEN');
});
test('Super Admin must select a valid organization period explicitly', () => {
  assert.deepEqual(organizationScope(superAdmin(), orgPeriod), { period_id: orgPeriod, department_id: undefined });
  assert.deepEqual(organizationScope(superAdmin(), orgPeriod, orgDept), { period_id: orgPeriod, department_id: orgDept });
  rejects(() => organizationScope(superAdmin(), null), 'VALIDATION');
});
test('organization action matrix denies department create/delete and all board access for Admin', () => {
  for (const action of ['read', 'create', 'edit', 'delete']) {
    requireOrganizationAccess(superAdmin(), 'board-members', action);
    requireOrganizationAccess(scopedAdmin(), 'department-members', action);
    rejects(() => requireOrganizationAccess(scopedAdmin(), 'board-members', action), 'FORBIDDEN');
  }
  for (const action of ['create', 'delete']) rejects(() => requireOrganizationAccess(scopedAdmin(), 'departments', action), 'FORBIDDEN');
  for (const action of ['read', 'edit']) requireOrganizationAccess(scopedAdmin(), 'departments', action);
});
test('Admin department edit whitelist excludes identity and authority fields', () => {
  const input = { description: ' Deskripsi resmi ', logo_url: '', version: 1 };
  assert.deepEqual(departmentInput(input, scopedAdmin(), true), { description: 'Deskripsi resmi', logo_url: null });
  for (const key of ['name', 'slug', 'period_id', 'department_id', 'deleted_at', 'role', 'user_id']) rejects(() => departmentInput({ ...input, [key]: 'injected' }, scopedAdmin(), true), 'VALIDATION');
  rejects(() => departmentInput(deptData(), scopedAdmin()), 'FORBIDDEN');
});
test('department names and slugs validate without silently changing identifiers', () => {
  assert.deepEqual(departmentInput(deptData(), superAdmin()), { name: 'Departemen Uji', slug: 'departemen-uji', description: null, logo_url: null });
  for (const slug of ['UPPERCASE', '-prefix', 'suffix-', 'double--dash', 'has spaces', 'a/b', 'x'.repeat(151)]) rejects(() => departmentInput({ ...deptData(), slug }, superAdmin()), 'VALIDATION');
  for (const name of ['xx', 'n'.repeat(101)]) rejects(() => departmentInput({ ...deptData(), name }, superAdmin()), 'VALIDATION');
});
test('department ownership cannot be changed even by Super Admin edit', () => {
  rejects(() => departmentInput({ ...deptData(), version: 1 }, superAdmin(), true), 'VALIDATION');
});
test('roster and board validate names, positions and strictly positive order', () => {
  assert.deepEqual(memberInput(memberData(), false), { name: 'Anggota Uji', position: 'Anggota', photo_url: null, display_order: 1 });
  for (const board of [false, true]) for (const patch of [{ name: 'xx' }, { position: '' }, { position: 'p'.repeat(101) }, { display_order: 0 }, { display_order: -1 }, { display_order: 1.2 }, { display_order: '1e3' }]) rejects(() => memberInput({ ...memberData(), ...patch }, board), 'VALIDATION');
});
test('only board accepts explicit null department for core leadership', () => {
  assert.equal(memberDepartment(null, true), null); assert.equal(memberDepartment(orgDept, false), orgDept);
  for (const value of [undefined, '', 'invalid', null]) rejects(() => memberDepartment(value, false), 'VALIDATION');
  rejects(() => memberDepartment(undefined, true), 'VALIDATION');
});
test('member forms cannot grant accounts or move periods; roster department immutable on edit', () => {
  for (const board of [false, true]) for (const key of ['user_id', 'role', 'account_status', 'deleted_at', 'id']) rejects(() => memberInput({ ...memberData(), [key]: 'injected' }, board), 'VALIDATION');
  const { period_id, department_id, ...editable } = memberData();
  memberInput({ ...editable, version: 1 }, false, true);
  memberInput({ ...editable, department_id: null, version: 1 }, true, true);
  rejects(() => memberInput({ ...editable, department_id, version: 1 }, false, true), 'VALIDATION');
  for (const board of [false, true]) rejects(() => memberInput({ ...editable, period_id, version: 1 }, board, true), 'VALIDATION');
});
test('organization images are optional HTTPS metadata with credentials refused', () => {
  for (const value of [undefined, null, '']) assert.equal(optionalImageUrl(value, 'photo_url'), null);
  assert.equal(optionalImageUrl('https://example.test/photo.png', 'photo_url'), 'https://example.test/photo.png');
  for (const value of ['http://example.test/x', 'javascript:alert(1)', 'data:image/png,test', 'https://user:secret@example.test/x', 'x'.repeat(1025)]) rejects(() => optionalImageUrl(value, 'logo_url'), 'VALIDATION');
});
test('soft deletion requires literal confirmation, version and no extra fields', () => {
  assert.equal(deleteInput({ confirmed: true, version: '2' }), 2);
  for (const confirmed of [undefined, false, 'true', 1]) rejects(() => deleteInput({ confirmed, version: 1 }), 'CONFIRMATION_REQUIRED');
  for (const version of [undefined, 0, '1junk']) rejects(() => deleteInput({ confirmed: true, version }), 'VALIDATION');
  rejects(() => deleteInput({ confirmed: true, version: 1, force: true }), 'VALIDATION');
});

const initialAdmin = (patch = {}) => ({ name: 'Test Admin', email: 'ADMIN@example.test', role: 'ADMIN', password: 'TestingOnly123!', confirmation: 'TestingOnly123!', period_id: orgPeriod, department_id: orgDept, ...patch });
const managedUser = (patch = {}) => ({ id: 'target', name: 'Test target', role: 'ADMIN', account_status: 'AKTIF', deleted_at: null, email_verified_at: null,
  admin_assignments_user: { id: 'assignment', period_id: orgPeriod, department_id: orgDept, revoked_at: null, period: { status: 'AKTIF' }, department: { deleted_at: null } }, ...patch });
test('Admin creation canonicalizes email and requires immutable assignment identifiers', () => {
  const data = createAdminInput(initialAdmin()); assert.equal(data.email, 'admin@example.test'); assert.equal(data.department_id, orgDept);
  for (const patch of [{ department_id: null }, { period_id: undefined }, { role: 'MAHASISWA' }, { role: 'OWNER' }, { confirmation: 'different' }]) rejects(() => createAdminInput(initialAdmin(patch)), 'VALIDATION');
});
test('Super Admin creation has no department or period and cannot inject account state', () => {
  const data = initialAdmin({ role: 'SUPER_ADMIN', period_id: null, department_id: null });
  assert.equal(createAdminInput(data).period_id, null);
  rejects(() => createAdminInput({ ...data, period_id: orgPeriod }), 'VALIDATION');
  for (const key of ['id', 'account_status', 'must_change_password', 'email_verified_at', 'nim', 'program_studi_id', 'deleted_at']) rejects(() => createAdminInput({ ...data, [key]: 'injected' }), 'VALIDATION');
});
test('Admin name edit cannot alter email, role, assignment, password or academic identity', () => {
  assert.deepEqual(editAdminInput({ name: ' Test Name ', version: 3 }), { name: 'Test Name', version: 3 });
  for (const key of ['email', 'role', 'department_id', 'period_id', 'password', 'nim', 'program_studi_id', 'angkatan']) rejects(() => editAdminInput({ name: 'Test Name', version: 1, [key]: 'injected' }), 'VALIDATION');
});
test('access changes require literal confirmation, version and bounded reason', () => {
  for (const action of ['disable', 'enable', 'revoke', 'reset-password']) {
    const input = { version: 1, reason: 'Official test reason', confirmed: true, ...(action === 'reset-password' ? { password: 'TemporaryOnly123!', confirmation: 'TemporaryOnly123!' } : {}) };
    assert.equal(userActionInput(action, input).reason, input.reason);
    rejects(() => userActionInput(action, { ...input, confirmed: 'true' }), 'CONFIRMATION_REQUIRED');
    for (const reason of ['', 'short', 'x'.repeat(501)]) rejects(() => userActionInput(action, { ...input, reason }), 'VALIDATION');
  }
  rejects(() => userActionInput('disable', { version: 1, confirmed: true, reason: 'Official test reason', password: 'injected' }), 'VALIDATION');
});
test('self disable, enable, revoke and managed password reset are forbidden', () => {
  for (const action of ['disable', 'enable', 'revoke', 'reset-password']) rejects(() => assertUserAction(managedUser({ id: 'actor' }), 'actor', action, 2), 'SELF_ACTION');
});
test('last active Super Admin cannot be disabled; other active SA may be suspended', () => {
  const sa = managedUser({ role: 'SUPER_ADMIN', admin_assignments_user: null });
  for (const count of [0, 1]) rejects(() => assertUserAction(sa, 'actor', 'disable', count), 'LAST_SUPER_ADMIN');
  assertUserAction(sa, 'actor', 'disable', 2);
});
test('temporary suspension can resume only while the original assignment is live', () => {
  const target = managedUser({ account_status: 'NONAKTIF' }); assertUserAction(target, 'actor', 'enable', 2);
  for (const assignment of [null, { ...target.admin_assignments_user, revoked_at: new Date() }, { ...target.admin_assignments_user, period: { status: 'ARSIP' } }, { ...target.admin_assignments_user, period: { status: 'NONAKTIF' } }, { ...target.admin_assignments_user, department: { deleted_at: new Date() } }]) {
    const user = { ...target, admin_assignments_user: assignment };
    rejects(() => assertUserAction(user, 'actor', 'enable', 2), 'TARGET_ASSIGNMENT_INACTIVE');
    rejects(() => assertUserEdit(user), 'TARGET_ASSIGNMENT_INACTIVE');
    rejects(() => assertUserAction(user, 'actor', 'reset-password', 2), 'TARGET_ASSIGNMENT_INACTIVE');
  }
});
test('revocation applies only to a not-yet-revoked department assignment', () => {
  assertUserAction(managedUser(), 'actor', 'revoke', 2);
  for (const patch of [{ role: 'SUPER_ADMIN' }, { admin_assignments_user: null }, { admin_assignments_user: { ...managedUser().admin_assignments_user, revoked_at: new Date() } }, { admin_assignments_user: { ...managedUser().admin_assignments_user, period: { status: 'ARSIP' } } }]) rejects(() => assertUserAction(managedUser(patch), 'actor', 'revoke', 2), 'INVALID_TRANSITION');
});
test('student status management never verifies email, edits identity or resets student password', () => {
  const student = managedUser({ role: 'MAHASISWA', account_status: 'NONAKTIF', admin_assignments_user: null });
  rejects(() => assertUserAction(student, 'actor', 'enable', 2), 'EMAIL_UNVERIFIED');
  assertUserAction({ ...student, email_verified_at: new Date() }, 'actor', 'enable', 2);
  rejects(() => assertUserEdit(student), 'FORBIDDEN');
  rejects(() => assertUserAction(student, 'actor', 'reset-password', 2), 'FORBIDDEN');
  assertUserAction({ ...student, account_status: 'BELUM_VERIFIKASI' }, 'actor', 'disable', 2);
});
test('invalid account transitions and deleted targets fail closed', () => {
  rejects(() => assertUserAction(managedUser(), 'actor', 'enable', 2), 'INVALID_TRANSITION');
  rejects(() => assertUserAction(managedUser({ account_status: 'NONAKTIF' }), 'actor', 'disable', 2), 'INVALID_TRANSITION');
  for (const action of ['disable', 'enable', 'revoke', 'reset-password']) rejects(() => assertUserAction(managedUser({ deleted_at: new Date() }), 'actor', action, 2), 'NOT_FOUND');
});
test('study program code is canonical and short; name and field whitelist enforced', () => {
  assert.deepEqual(studyProgramInput({ code: ' abc-1 ', name: ' Test Study Program ' }), { code: 'ABC-1', name: 'Test Study Program' });
  for (const code of ['', 'A'.repeat(11), 'two words', '../', '-start', 'end_', 'two--dash']) rejects(() => studyProgramInput({ code, name: 'Test Program' }), 'VALIDATION');
  for (const name of ['xx', 'x'.repeat(256)]) rejects(() => studyProgramInput({ code: 'TEST', name }), 'VALIDATION');
  rejects(() => studyProgramInput({ code: 'TEST', name: 'Test Program', deleted_at: null }), 'VALIDATION');
});
