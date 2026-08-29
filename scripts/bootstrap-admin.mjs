// Operator-run only. No default account, embedded credential, or dummy seed.
// Read one JSON object from stdin: {"name":...,"email":...,"password":...}.
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { email, password, textField, objectInput } from '../src/lib/admin/validation.ts';
const db = new PrismaClient();
try {
  let raw = '';
  for await (const chunk of process.stdin) { raw += chunk; if (raw.length > 4096) throw new Error('Input too large'); }
  const input = objectInput(JSON.parse(raw), ['name', 'email', 'password']);
  const data = { name: textField(input.name, 'name', 3, 100), email: email(input.email), password: await hash(password(input.password, true), 12) };
  raw = '';
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(20260828, 2)`;
    if (await tx.users.count({ where: { role: 'SUPER_ADMIN' } })) throw new Error('Bootstrap refused: Super Admin already exists');
    const user = await tx.users.create({ data: { ...data, role: 'SUPER_ADMIN', account_status: 'AKTIF', must_change_password: true } });
    await tx.activity_logs.create({ data: { user_id: user.id, action: 'admin.bootstrapped', target_type: 'user', target_id: user.id } });
  }, { isolationLevel: 'Serializable' });
  console.log('Super Admin created; password change required on first login.');
} catch { console.error('Bootstrap failed. Check database availability and existing Super Admin. Credentials are not logged.'); process.exitCode = 1; }
finally { await db.$disconnect(); }
