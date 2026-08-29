// Executes the real organization services and audit writer with isolated in-memory
// repository/auth adapters. NOT an HTTP, auth, Prisma, SQL or rollback integration test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const src = new URL('../src/', import.meta.url);
const authStub = 'data:text/javascript,' + encodeURIComponent(`
export async function adminRead(work) { return work(globalThis.__orgTest.tx, globalThis.__orgTest.actor); }
export async function adminMutation(request, work) { return work(globalThis.__orgTest.tx, globalThis.__orgTest.actor); }
`);
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === 'server-only') return { url: 'data:text/javascript,export{}', shortCircuit: true };
  if (specifier === './auth' && context.parentURL === new URL('server/admin/organization.ts', src).href) return { url: authStub, shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(specifier.slice(2) + '.ts', src).href, context);
  if (specifier.startsWith('.') && context.parentURL?.startsWith(src.href) && !specifier.endsWith('.ts')) return next(specifier + '.ts', context);
  return next(specifier, context);
} });
const service = await import('../src/server/admin/organization.ts');
hooks.deregister();
const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const P = id(1), OLD = id(2), D = id(3), OTHER = id(4), M = id(5), FOREIGN = id(6), ARCHIVED = id(7), B = id(8), OLD_DEPT = id(9);
const request = new Request('https://admin.example.test/api/admin');
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (value === undefined) return true;
    if (key === 'AND') return value.every((part) => matches(row, part));
    if (key === 'OR') return value.some((part) => matches(row, part));
    if (value && typeof value === 'object' && 'contains' in value) return String(row[key]).toLowerCase().includes(value.contains.toLowerCase());
    return row[key] === value;
  });
}
function harness(superAdmin = false) {
  const state = { actor: { id: id(10), name: 'Test actor', role: superAdmin ? 'SUPER_ADMIN' : 'ADMIN', must_change_password: false,
    assignment: superAdmin ? null : { period_id: P, department_id: D } }, audits: [], updates: [], calls: [], failAudit: false, staleWrite: false, dependencies: 0 };
  function table(name, rows) {
    return { rows,
      async findFirst(options = {}) { state.calls.push([name, 'findFirst', options]); return rows.find((r) => matches(r, options.where)) ?? null; },
      async findUnique(options) { if (options.select?._count) return { _count: { related: state.dependencies } }; return rows.find((r) => matches(r, options.where)) ?? null; },
      async findMany(options = {}) { state.calls.push([name, 'findMany', options]); return rows.filter((r) => matches(r, options.where)).slice(options.skip ?? 0, (options.skip ?? 0) + (options.take ?? rows.length)); },
      async count(options) { return rows.filter((r) => matches(r, options.where)).length; },
      async create({ data }) { const row = { id: id(100 + rows.length), version: 1, deleted_at: null, ...data }; rows.push(row); return row; },
      async updateMany({ where, data }) {
        state.updates.push({ name, where, data }); if (state.staleWrite) return { count: 0 };
        const found = rows.filter((r) => matches(r, where));
        for (const row of found) for (const [key, value] of Object.entries(data)) row[key] = value && typeof value === 'object' && 'increment' in value ? row[key] + value.increment : value;
        return { count: found.length };
      },
    };
  }
  const member = (rowId, dept, period = P) => ({ id: rowId, name: 'Test member', position: 'Anggota', display_order: 1, photo_url: null, department_id: dept, period_id: period, version: 1, deleted_at: null });
  state.tx = {
    periods: table('periods', [{ id: P, name: 'Active test period', status: 'AKTIF' }, { id: OLD, name: 'Archived test period', status: 'ARSIP' }]),
    departments: table('departments', [D, OTHER, OLD_DEPT].map((d) => ({ id: d, name: 'Test department', slug: `test-${d}`, period_id: d === OLD_DEPT ? OLD : P, version: 1, deleted_at: null }))),
    department_members: table('department_members', [member(M, D), member(FOREIGN, OTHER), member(ARCHIVED, OLD_DEPT, OLD)]),
    board_members: table('board_members', [member(B, null)]),
    activity_logs: { async create({ data }) { if (state.failAudit) throw new Error('injected audit failure'); state.audits.push(data); } },
  };
  globalThis.__orgTest = state;
  return state;
}
const memberInput = (patch = {}) => ({ name: 'Official test name', position: 'Anggota', photo_url: '', display_order: 1, ...patch });
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);
test('service scopes row lists AND counts plus period picker to live assignment', async () => {
  harness();
  const result = await service.listOrganization('department-members', new URLSearchParams());
  assert.deepEqual(result.items.map((r) => r.id), [M]); assert.equal(result.total, 1);
  const searched = await service.listOrganization('department-members', new URLSearchParams({ q: 'Anggota' }));
  assert.deepEqual(searched.items.map((r) => r.id), [M]); assert.equal(searched.total, 1);
  const periods = await service.organizationPeriods(new URLSearchParams());
  assert.deepEqual(periods.items.map((r) => r.id), [P]); assert.equal(periods.total, 1);
  await fails(service.listOrganization('department-members', new URLSearchParams({ period_id: OLD })), 'FORBIDDEN');
  await fails(service.listOrganization('department-members', new URLSearchParams({ department_id: OTHER })), 'FORBIDDEN');
});
test('department URL ID cannot overwrite assignment predicate during edit', async () => {
  const h = harness();
  await fails(service.editDepartment(request, OTHER, { description: 'Attempt', logo_url: '', version: 1 }), 'NOT_FOUND');
  assert.equal(h.updates.length, 0); assert.equal(h.audits.length, 0);
  await service.editDepartment(request, D, { description: 'Official text', logo_url: '', version: 1 });
  assert.equal(h.tx.departments.rows[0].description, 'Official text'); assert.equal(h.tx.departments.rows[1].description, undefined);
  assert.equal(h.audits[0].action, 'department.updated');
});
test('only Super Admin can create organization in a draft period; existing identity stays unchanged', async () => {
  let h = harness();
  const values = { name: 'Test official department', slug: 'test-official-department', description: '', logo_url: '', period_id: P };
  await fails(service.createDepartment(request, values), 'FORBIDDEN');
  await fails(service.deleteDepartment(request, D, { version: 1, confirmed: true }), 'FORBIDDEN');
  assert.equal(h.audits.length, 0);
  h = harness(true);
  const draft = id(20); h.tx.periods.rows.push({ id: draft, name: 'Draft test period', status: 'NONAKTIF' });
  const item = await service.createDepartment(request, { ...values, period_id: draft });
  assert.equal(item.period_id, draft); assert.equal(h.audits[0].action, 'department.created');
  assert.equal(h.tx.periods.rows.find((row) => row.id === draft).status, 'NONAKTIF');
});
test('foreign roster IDs cannot be edited or deleted; no mutation or audit', async () => {
  const h = harness();
  await fails(service.editMember(request, 'department-members', FOREIGN, memberInput({ version: 1 })), 'NOT_FOUND');
  await fails(service.deleteMember(request, 'department-members', FOREIGN, { version: 1, confirmed: true }), 'NOT_FOUND');
  assert.equal(h.updates.length, 0); assert.equal(h.audits.length, 0);
});
test('board read/create/edit/delete reject department Admin inside services', async () => {
  const h = harness();
  await fails(service.listOrganization('board-members', new URLSearchParams({ period_id: P })), 'FORBIDDEN');
  await fails(service.createMember(request, 'board-members', memberInput({ period_id: P, department_id: null })), 'FORBIDDEN');
  await fails(service.editMember(request, 'board-members', B, memberInput({ version: 1, department_id: null })), 'FORBIDDEN');
  await fails(service.deleteMember(request, 'board-members', B, { confirmed: true, version: 1 }), 'FORBIDDEN');
  assert.equal(h.audits.length, 0); assert.equal(h.updates.length, 0);
});
test('member creation rejects foreign scope and creates no user or assignment', async () => {
  const h = harness();
  await fails(service.createMember(request, 'department-members', memberInput({ period_id: P, department_id: OTHER })), 'FORBIDDEN');
  await service.createMember(request, 'department-members', memberInput({ period_id: P, department_id: D }));
  const created = h.tx.department_members.rows.at(-1);
  assert.equal(created.department_id, D); assert.equal(created.user_id, undefined);
  assert.equal(h.audits[0].action, 'department_member.created');
});
test('Super Admin core board accepts null but not a department from another period', async () => {
  const h = harness(true);
  await service.createMember(request, 'board-members', memberInput({ period_id: P, department_id: null }));
  assert.equal(h.tx.board_members.rows.at(-1).department_id, null);
  await fails(service.editMember(request, 'board-members', B, memberInput({ version: 1, department_id: OLD_DEPT })), 'NOT_FOUND');
  assert.equal(h.updates.length, 0);
});
test('archived organization is readable but all writes fail even for Super Admin', async () => {
  const h = harness(true);
  const listed = await service.listOrganization('department-members', new URLSearchParams({ period_id: OLD }));
  assert.equal(listed.total, 1); assert.equal(listed.can_create, false); assert.equal(listed.can_delete, false);
  await fails(service.editMember(request, 'department-members', ARCHIVED, memberInput({ version: 1 })), 'PERIOD_READ_ONLY');
  await fails(service.deleteMember(request, 'department-members', ARCHIVED, { confirmed: true, version: 1 }), 'PERIOD_READ_ONLY');
  await fails(service.createMember(request, 'department-members', memberInput({ period_id: OLD, department_id: OLD_DEPT })), 'PERIOD_READ_ONLY');
  await fails(service.editDepartment(request, OLD_DEPT, { name: 'Test department', slug: 'test', description: '', logo_url: '', version: 1 }), 'PERIOD_READ_ONLY');
  await fails(service.deleteDepartment(request, OLD_DEPT, { confirmed: true, version: 1 }), 'PERIOD_READ_ONLY');
  assert.equal(h.updates.length, 0); assert.equal(h.audits.length, 0);
});
test('stale versions and lost update races fail before success audit', async () => {
  const h = harness();
  await fails(service.editMember(request, 'department-members', M, memberInput({ version: 2 })), 'STALE_STATE');
  assert.equal(h.updates.length, 0);
  h.staleWrite = true;
  await fails(service.editMember(request, 'department-members', M, memberInput({ version: 1 })), 'STALE_STATE');
  assert.equal(h.audits.length, 0);
});
test('department deletion blocks dependencies; empty department uses soft delete and real audit writer', async () => {
  const h = harness(true); h.dependencies = 1;
  await fails(service.deleteDepartment(request, D, { confirmed: true, version: 1 }), 'DEPARTMENT_IN_USE');
  assert.equal(h.updates.length, 0);
  h.dependencies = 0;
  await service.deleteDepartment(request, D, { confirmed: true, version: 1 });
  assert.ok(h.tx.departments.rows[0].deleted_at instanceof Date);
  assert.equal(h.audits[0].details.soft_delete, true); assert.equal(h.audits[0].target_id, D);
});
test('roster soft deletion is versioned; an audit failure propagates instead of returning success', async () => {
  const h = harness();
  await service.deleteMember(request, 'department-members', M, { confirmed: true, version: 1 });
  assert.ok(h.tx.department_members.rows[0].deleted_at instanceof Date); assert.equal(h.tx.department_members.rows[0].version, 2);
  assert.equal(h.audits[0].action, 'department_member.deleted');
  h.failAudit = true;
  await assert.rejects(service.createMember(request, 'department-members', memberInput({ period_id: P, department_id: D })), /injected audit failure/);
  // Deliberately no rollback assertion: only PostgreSQL can prove DB atomicity.
});
