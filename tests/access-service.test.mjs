// Real access/master services + audit writer, isolated auth/DB/bcrypt adapters.
// These tests do NOT execute SQL, real bcrypt, HTTP, transaction rollback or races.
import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const src = new URL('../src/', import.meta.url);
const asModule = (source) => 'data:text/javascript,' + encodeURIComponent(source);
const hooks = registerHooks({ resolve(specifier, context, next) {
  if (specifier === 'server-only') return { url: asModule('export{}'), shortCircuit: true };
  if (specifier === 'bcryptjs') return { url: asModule(`export async function hash(s,cost) { globalThis.__accessTest.hashCosts.push(cost); return 'fake$'+s; } export async function compare(s,h) { return h === 'fake$'+s; }`), shortCircuit: true };
  if (specifier === './auth' && context.parentURL?.startsWith(new URL('server/admin/', src).href)) return { url: asModule(`export async function adminRead(work) { return work(globalThis.__accessTest.tx, globalThis.__accessTest.actor); } export async function adminMutation(request,work) { return work(globalThis.__accessTest.tx, globalThis.__accessTest.actor); }`), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(specifier.slice(2)+'.ts', src).href, context);
  if (specifier.startsWith('.') && context.parentURL?.startsWith(src.href) && !specifier.endsWith('.ts')) return next(specifier+'.ts', context);
  return next(specifier, context);
} });
const access = await import('../src/server/admin/access.ts');
const master = await import('../src/server/admin/study-programs.ts');
hooks.deregister();
const id = (n) => `20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const ACTOR=id(1), SA=id(2), ADMIN=id(3), STUDENT=id(4), ARCHIVED=id(5), PERIOD=id(6), DEPT=id(7), ASSIGNMENT=id(8), PROGRAM=id(9);
const request = new Request('https://admin.example.test/api/admin');
function matches(row, where={}) {
  return Object.entries(where).every(([key,value]) => {
    if (value === undefined) return true;
    if (key==='AND') return value.every((part) => matches(row,part));
    if (key==='OR') return value.some((part) => matches(row,part));
    if (value && typeof value==='object') {
      if ('in' in value) return value.in.includes(row[key]);
      if ('contains' in value) return String(row[key]??'').toLowerCase().includes(value.contains.toLowerCase());
      if ('is' in value) return row[key]!=null && matches(row[key],value.is);
    }
    return row[key]===value;
  });
}
function project(row, select) {
  if (!row) return null;
  if (!select) return structuredClone(row);
  return Object.fromEntries(Object.entries(select).map(([key,value]) => [key, value===true ? row[key] : project(row[key],value.select)]));
}
function harness(role='SUPER_ADMIN') {
  const h={ actor:{ id:ACTOR, name:'Test actor',role,must_change_password:false,assignment:null }, calls:[],audits:[],hashCosts:[],failAudit:false,stale:false,locks:0 };
  const assignment={ id:ASSIGNMENT,period_id:PERIOD,department_id:DEPT,revoked_at:null,
    period:{ id:PERIOD,name:'Test period',status:'AKTIF' },department:{ id:DEPT,name:'Test department',deleted_at:null } };
  const user=(uid,role,patch={})=>({ id:uid,name:'Test user',email:`test${uid}@example.test`,role,account_status:'AKTIF',deleted_at:null,version:1,password:'fake$OldPassword123!',must_change_password:false,email_verified_at:null,nim:null,angkatan:null,program_studi_id:null,study_program:null,admin_assignments_user:null,private_aspiration:'NEVER RETURN',...patch });
  function table(name,rows) {
    const model={ rows,
      async findFirst(options={}) { h.calls.push([name,'findFirst',options]); return project(rows.find(r=>matches(r,options.where)),options.select); },
      async findUnique(options) { h.calls.push([name,'findUnique',options]); return project(rows.find(r=>matches(r,options.where)),options.select); },
      async findMany(options={}) { h.calls.push([name,'findMany',options]); return rows.filter(r=>matches(r,options.where)).slice(options.skip??0,(options.skip??0)+(options.take??rows.length)).map(r=>project(r,options.select)); },
      async count({where}) { return rows.filter(r=>matches(r,where)).length; },
      async create({data,select}) { h.calls.push([name,'create']); const row={id:id(100+rows.length),version:1,deleted_at:null,...data}; rows.push(row); return project(row,select); },
      async updateMany({where,data}) { h.calls.push([name,'updateMany',{where,data}]); if(h.stale) return {count:0}; const found=rows.filter(r=>matches(r,where)); for(const row of found) for(const [k,v] of Object.entries(data)) row[k]=v && typeof v==='object' && 'increment' in v ? row[k]+v.increment : v; return {count:found.length}; },
      async deleteMany({where}) { h.calls.push([name,'deleteMany',{where}]); const found=rows.filter(r=>matches(r,where)); for(const row of found) rows.splice(rows.indexOf(row),1); return {count:found.length}; },
    }; return model;
  }
  h.tx={
    async $queryRaw(){h.locks++;return[];},
    users:table('users',[user(ACTOR,'SUPER_ADMIN'),user(SA,'SUPER_ADMIN'),user(ADMIN,'ADMIN',{admin_assignments_user:assignment}),user(STUDENT,'MAHASISWA',{nim:'12345678',angkatan:2026,program_studi_id:PROGRAM,study_program:{id:PROGRAM,code:'TEST',name:'Test Study'}}),user(ARCHIVED,'ADMIN',{account_status:'NONAKTIF',admin_assignments_user:{...assignment,revoked_at:new Date(),period:{id:id(20),name:'Old test period',status:'ARSIP'}}})]),
    departments:table('departments',[{id:DEPT,period_id:PERIOD,deleted_at:null,period:{status:'AKTIF'}}]),
    admin_assignments:table('admin_assignments',[{id:ASSIGNMENT,user_id:ADMIN,revoked_at:null,department_id:DEPT,period_id:PERIOD}]),
    admin_sessions:table('admin_sessions',[{id:id(30),user_id:ADMIN},{id:id(31),user_id:STUDENT}]),
    study_programs:table('study_programs',[{id:PROGRAM,code:'TEST',name:'Test Study',version:1,deleted_at:null,_count:{users_study_program:1}}]),
    activity_logs:{async create({data}){if(h.failAudit)throw new Error('injected audit failure');h.audits.push(data);}},
  };
  globalThis.__accessTest=h;return h;
}
const createInput=(patch={})=>({name:'Created test admin',email:'created@example.test',role:'ADMIN',password:'InitialTest123!',confirmation:'InitialTest123!',department_id:DEPT,period_id:PERIOD,...patch});
const actionInput=(patch={})=>({version:1,confirmed:true,reason:'Official test access reason',...patch});
const fails=(promise,code)=>assert.rejects(promise,e=>e.code===code);
test('all user and study-program services enforce Super Admin before repository access',async()=>{
  const h=harness('ADMIN');
  for(const call of [()=>access.listUsers(new URLSearchParams()),()=>access.createAdmin(request,createInput()),()=>access.editAdmin(request,ADMIN,{name:'Changed Name',version:1}),()=>access.changeUserAccess(request,ADMIN,'disable',actionInput()),()=>master.listStudyPrograms(new URLSearchParams()),()=>master.createStudyProgram(request,{code:'NEW',name:'New Test Program'}),()=>master.editStudyProgram(request,PROGRAM,{code:'EDIT',name:'Edited Program',version:1}),()=>master.deleteStudyProgram(request,PROGRAM,{version:1,confirmed:true})]) await fails(call(),'FORBIDDEN');
  assert.equal(h.calls.length,0);assert.equal(h.audits.length,0);
});
test('user list filters cohort and student search/count while returning only selected fields',async()=>{
  harness();
  const students=await access.listUsers(new URLSearchParams({cohort:'students',q:'12345678'}));
  assert.deepEqual(students.items.map(u=>u.id),[STUDENT]);assert.equal(students.total,1);
  const byProgram=await access.listUsers(new URLSearchParams({cohort:'students',q:'Study',program_studi_id:PROGRAM}));assert.equal(byProgram.total,1);
  const admins=await access.listUsers(new URLSearchParams());assert.equal(admins.total,4);
  for(const row of [...students.items,...admins.items]){assert.equal('password' in row,false);assert.equal('private_aspiration' in row,false);}
});
test('Admin creation persists one assignment, requires password change and never returns credentials',async()=>{
  const h=harness();const result=await access.createAdmin(request,createInput());
  assert.deepEqual(Object.keys(result),['id']);
  const row=h.tx.users.rows.at(-1);assert.equal(row.account_status,'AKTIF');assert.equal(row.must_change_password,true);assert.equal(row.password,'fake$InitialTest123!');assert.equal(row.email_verified_at,undefined);
  const a=h.tx.admin_assignments.rows.at(-1);assert.equal(a.user_id,row.id);assert.equal(a.period_id,PERIOD);assert.equal(a.department_id,DEPT);
  assert.deepEqual(h.hashCosts,[12]);assert.equal(h.audits[0].action,'user.admin.created');assert.equal(JSON.stringify(h.audits).includes('InitialTest123'),false);
});
test('Super Admin creation is independent of periods and creates no assignment',async()=>{
  const h=harness();await access.createAdmin(request,createInput({role:'SUPER_ADMIN',department_id:null,period_id:null}));
  assert.equal(h.tx.admin_assignments.rows.length,1);assert.equal(h.tx.users.rows.at(-1).role,'SUPER_ADMIN');
});
test('Admin creation rejects cross-period, draft, archived and deleted departments before hashing',async()=>{
  for(const status of ['NONAKTIF','ARSIP']){const h=harness();h.tx.departments.rows[0].period.status=status;await fails(access.createAdmin(request,createInput()),'PERIOD_NOT_ACTIVE');assert.equal(h.hashCosts.length,0);}
  let h=harness();await fails(access.createAdmin(request,createInput({period_id:id(999)})),'DEPARTMENT_UNAVAILABLE');assert.equal(h.hashCosts.length,0);
  h=harness();h.tx.departments.rows[0].deleted_at=new Date();await fails(access.createAdmin(request,createInput()),'DEPARTMENT_UNAVAILABLE');
});
test('temporary disable/enable deletes sessions but preserves assignment and verification state',async()=>{
  const h=harness();await access.changeUserAccess(request,ADMIN,'disable',actionInput());
  assert.equal(h.tx.users.rows.find(u=>u.id===ADMIN).account_status,'NONAKTIF');assert.equal(h.tx.admin_assignments.rows[0].revoked_at,null);assert.equal(h.tx.admin_sessions.rows.some(s=>s.user_id===ADMIN),false);
  await access.changeUserAccess(request,ADMIN,'enable',actionInput({version:2}));
  const row=h.tx.users.rows.find(u=>u.id===ADMIN);assert.equal(row.account_status,'AKTIF');assert.equal(row.email_verified_at,null);assert.equal(h.audits.length,2);
});
test('permanent revoke disables account and records the specific assignment',async()=>{
  const h=harness();await access.changeUserAccess(request,ADMIN,'revoke',actionInput());
  assert.ok(h.tx.admin_assignments.rows[0].revoked_at instanceof Date);assert.equal(h.tx.users.rows.find(u=>u.id===ADMIN).account_status,'NONAKTIF');assert.equal(h.tx.admin_sessions.rows.some(s=>s.user_id===ADMIN),false);assert.equal(h.audits[0].details.assignment_id,ASSIGNMENT);
});
test('archived accounts cannot be renamed, enabled or password-reset',async()=>{
  const h=harness();await fails(access.editAdmin(request,ARCHIVED,{name:'Changed Name',version:1}),'TARGET_ASSIGNMENT_INACTIVE');
  await fails(access.changeUserAccess(request,ARCHIVED,'enable',actionInput()),'TARGET_ASSIGNMENT_INACTIVE');
  await fails(access.changeUserAccess(request,ARCHIVED,'reset-password',actionInput({password:'TemporaryTest123!',confirmation:'TemporaryTest123!'})),'TARGET_ASSIGNMENT_INACTIVE');assert.equal(h.audits.length,0);
});
test('last active Super Admin and self-management cannot bypass safeguards',async()=>{
  let h=harness();await fails(access.changeUserAccess(request,ACTOR,'disable',actionInput()),'SELF_ACTION');assert.equal(h.audits.length,0);
  h=harness();h.tx.users.rows.find(u=>u.id===ACTOR).account_status='NONAKTIF'; // Auth stub deliberately isolates the service counter check.
  await fails(access.changeUserAccess(request,SA,'disable',actionInput()),'LAST_SUPER_ADMIN');assert.equal(h.audits.length,0);
});
test('password reset compares current secret, drops sessions and keeps inactive status without secret audit',async()=>{
  const h=harness();const row=h.tx.users.rows.find(u=>u.id===ADMIN);row.account_status='NONAKTIF';
  await fails(access.changeUserAccess(request,ADMIN,'reset-password',actionInput({password:'OldPassword123!',confirmation:'OldPassword123!'})),'VALIDATION');
  await access.changeUserAccess(request,ADMIN,'reset-password',actionInput({password:'TemporaryTest123!',confirmation:'TemporaryTest123!'}));
  assert.equal(row.password,'fake$TemporaryTest123!');assert.equal(row.must_change_password,true);assert.equal(row.account_status,'NONAKTIF');assert.equal(h.tx.admin_sessions.rows.some(s=>s.user_id===ADMIN),false);assert.equal(JSON.stringify(h.audits).includes('TemporaryTest123'),false);
});
test('student disable has an audit reason; enable cannot bypass email verification',async()=>{
  const h=harness();await access.changeUserAccess(request,STUDENT,'disable',actionInput());
  assert.equal(h.audits[0].details.reason,'Official test access reason');
  await fails(access.changeUserAccess(request,STUDENT,'enable',actionInput({version:2})),'EMAIL_UNVERIFIED');
  await fails(access.changeUserAccess(request,STUDENT,'reset-password',actionInput({version:2,password:'TemporaryTest123!',confirmation:'TemporaryTest123!'})),'FORBIDDEN');assert.equal(h.hashCosts.length,0);
});
test('user stale versions and lost update produce no session deletion or success audit',async()=>{
  const h=harness();await fails(access.editAdmin(request,ADMIN,{name:'Changed Name',version:99}),'STALE_STATE');
  h.stale=true;await fails(access.changeUserAccess(request,ADMIN,'disable',actionInput()),'STALE_STATE');assert.equal(h.audits.length,0);assert.equal(h.tx.admin_sessions.rows.some(s=>s.user_id===ADMIN),true);
});
test('master create/edit is versioned and referenced programs cannot be deleted',async()=>{
  const h=harness();await master.createStudyProgram(request,{code:'new',name:'New Test Program'});assert.equal(h.tx.study_programs.rows.at(-1).code,'NEW');
  await master.editStudyProgram(request,PROGRAM,{code:'EDIT',name:'Edited Test Program',version:1});assert.equal(h.tx.study_programs.rows[0].version,2);
  await fails(master.deleteStudyProgram(request,PROGRAM,{confirmed:true,version:2}),'STUDY_PROGRAM_IN_USE');
  h.tx.study_programs.rows[0]._count.users_study_program=0;
  await master.deleteStudyProgram(request,PROGRAM,{confirmed:true,version:2});assert.ok(h.tx.study_programs.rows[0].deleted_at instanceof Date);assert.equal(h.audits.at(-1).details.soft_delete,true);
});
test('master rejects stale data and propagates audit failure instead of reporting success',async()=>{
  const h=harness();await fails(master.editStudyProgram(request,PROGRAM,{code:'EDIT',name:'Edited Test Program',version:2}),'STALE_STATE');assert.equal(h.audits.length,0);
  h.failAudit=true;await assert.rejects(master.createStudyProgram(request,{code:'NEW',name:'New Test Program'}),/injected audit failure/);
  // No rollback claim: the adapter does not emulate PostgreSQL transactions.
});
