import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import type { Transaction } from "./db";
import { transaction } from "./db";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { actorFromAccount, type AdminActor } from "@/lib/admin/policy";
import { ABSOLUTE_TIMEOUT_MS, assertCsrf, assertOrigin, failedLogin, randomToken, sessionExpired, tokenHash, validToken } from "@/lib/admin/security";
import { email, objectInput, password } from "@/lib/admin/validation";

const secure = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = secure ? "__Host-bem_admin_session" : "bem_admin_session";
export const CSRF_COOKIE = secure ? "__Host-bem_admin_csrf" : "bem_admin_csrf";
const cookieOptions = { httpOnly: true, secure, sameSite: "strict" as const, path: "/" };
const accountInclude = { admin_assignments_user: { include: { period: true, department: true } } } as const;
let dummyPassword: Promise<string> | undefined;

export async function requestToken() { return (await cookies()).get(SESSION_COOKIE)?.value; }
export async function csrfToken() {
  const jar = await cookies();
  let token = jar.get(CSRF_COOKIE)?.value;
  if (!validToken(token)) {
    token = randomToken();
    jar.set(CSRF_COOKIE, token, cookieOptions);
  }
  return token;
}
export async function checkMutation(request: Request, sessionHash?: string) {
  assertOrigin(request.headers.get("origin"), process.env.ADMIN_ORIGIN);
  assertCsrf((await cookies()).get(CSRF_COOKIE)?.value, request.headers.get("x-csrf-token"), sessionHash);
}
async function setSessionCookies(token: string, csrf: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...cookieOptions, maxAge: ABSOLUTE_TIMEOUT_MS / 1000 });
  jar.set(CSRF_COOKIE, csrf, cookieOptions);
}
async function createSession(tx: Transaction, userId: string, token: string, csrf: string) {
  const now = new Date();
  // Explicit single-browser policy. Replace prior session on login/password change.
  await tx.admin_sessions.deleteMany({ where: { user_id: userId } });
  await tx.admin_sessions.create({ data: { user_id: userId, token_hash: tokenHash(token), csrf_hash: tokenHash(csrf),
    last_seen_at: now, expires_at: new Date(now.getTime() + ABSOLUTE_TIMEOUT_MS) } });
}
export async function authenticate(tx: Transaction, token: string | undefined, allowPasswordChange = false) {
  if (!validToken(token)) throw new AdminError(401, "SESSION_INVALID", "Silakan masuk sebagai Admin.");
  const session = await tx.admin_sessions.findUnique({ where: { token_hash: tokenHash(token) },
    include: { user: { include: accountInclude } } });
  if (!session || sessionExpired(session)) throw new AdminError(401, "SESSION_INVALID", "Sesi berakhir. Silakan masuk kembali.");
  const actor = actorFromAccount(session.user);
  if (actor.must_change_password && !allowPasswordChange) throw new AdminError(403, "PASSWORD_CHANGE_REQUIRED", "Ganti password awal sebelum mengakses Admin.");
  await tx.admin_sessions.update({ where: { id: session.id }, data: { last_seen_at: new Date() } });
  return { actor, session };
}
export async function adminRead<T>(work: (tx: Transaction, actor: AdminActor) => Promise<T>) {
  const token = await requestToken();
  if (!validToken(token)) throw new AdminError(401, "SESSION_INVALID", "Silakan masuk sebagai Admin.");
  return transaction(async (tx) => { const { actor } = await authenticate(tx, token); return work(tx, actor); });
}
export async function adminMutation<T>(request: Request, work: (tx: Transaction, actor: AdminActor) => Promise<T>) {
  await checkMutation(request);
  const token = await requestToken();
  if (!validToken(token)) throw new AdminError(401, "SESSION_INVALID", "Silakan masuk sebagai Admin.");
  return transaction(async (tx) => {
    const { actor, session } = await authenticate(tx, token);
    await checkMutation(request, session.csrf_hash);
    return work(tx, actor);
  });
}
export async function requireAdminPage(allowPasswordChange = false) {
  try {
    const token = await requestToken();
    if (!validToken(token)) redirect("/admin/login");
    return await transaction(async (tx) => (await authenticate(tx, token, allowPasswordChange)).actor);
  } catch (error) {
    if (error instanceof AdminError) {
      if (error.code === "PASSWORD_CHANGE_REQUIRED") redirect("/admin/ganti-password");
      if (error.status === 401 || error.code === "ASSIGNMENT_INACTIVE") redirect("/admin/login");
    }
    throw error;
  }
}
export async function login(request: Request, value: unknown) {
  await checkMutation(request);
  const input = objectInput(value, ["email", "password"]);
  const address = email(input.email), supplied = password(input.password);
  const key = tokenHash(address);
  const dummy = await (dummyPassword ??= hash(randomToken(), 12));
  const token = randomToken(), csrf = randomToken();

  let specificReason = "";

  const result = await transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    const now = new Date();
    const attempts = await tx.admin_login_attempts.findUnique({ where: { key } });
    if (attempts?.locked_until && attempts.locked_until > now) return { ok: false as const, locked: true };
    const user = await tx.users.findUnique({ where: { email: address }, include: accountInclude });
    const correct = await compare(supplied, user?.password ?? dummy);

    if (!user) {
      specificReason = "Email Admin tidak terdaftar di sistem.";
    } else if (user.role === "MAHASISWA") {
      specificReason = "Akun ini terdaftar sebagai Mahasiswa, bukan Admin. Silakan masuk via Portal Mahasiswa.";
    } else if (!correct) {
      specificReason = "Password Admin salah. Periksa kembali penulisan huruf besar/kecil.";
    } else if (user.account_status !== "AKTIF") {
      specificReason = "Akun Admin Anda sedang dinonaktifkan oleh Super Admin.";
    }

    let actor: AdminActor | null = null;
    if (correct && user) {
      try { actor = actorFromAccount(user); } catch (error) { if (!(error instanceof AdminError)) throw error; }
    }
    if (!actor) {
      const next = failedLogin(attempts, now);
      await tx.admin_login_attempts.upsert({ where: { key }, create: { key, ...next }, update: next });
      await audit(tx, null, next.locked_until ? "admin.login.locked" : "admin.login.failed", null, null, { login_key: key });
      return { ok: false as const, locked: !!next.locked_until };
    }
    await tx.admin_login_attempts.deleteMany({ where: { key } });
    await createSession(tx, actor.id, token, csrf);
    await audit(tx, actor.id, "admin.login", "user", actor.id);
    return { ok: true as const, actor };
  });

  if (!result.ok) {
    throw new AdminError(
      result.locked ? 429 : 401,
      result.locked ? "LOGIN_LOCKED" : "INVALID_CREDENTIALS",
      result.locked
        ? "Percobaan masuk dibatasi karena 5 kali salah password berturut-turut. Coba lagi setelah 30 menit."
        : specificReason || "Email atau password salah, atau akses Admin tidak aktif."
    );
  }
  await setSessionCookies(token, csrf);
  return { redirect: result.actor.must_change_password ? "/admin/ganti-password" : "/admin/dashboard", csrf };
}
export async function logout(request: Request) {
  await checkMutation(request);
  const token = await requestToken();
  if (validToken(token)) await transaction(async (tx) => {
    const session = await tx.admin_sessions.findUnique({ where: { token_hash: tokenHash(token) } });
    if (session) {
      await checkMutation(request, session.csrf_hash);
      await tx.admin_sessions.delete({ where: { id: session.id } });
      await audit(tx, session.user_id, "admin.logout", "user", session.user_id);
    }
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  jar.set(CSRF_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return { redirect: "/admin/login" };
}
export async function changePassword(request: Request, value: unknown) {
  await checkMutation(request);
  const input = objectInput(value, ["current_password", "password", "confirmation"]);
  const current = password(input.current_password), next = password(input.password, true);
  if (next !== input.confirmation || next === current) throw new AdminError(422, "VALIDATION", "Konfirmasi harus cocok dan password baru harus berbeda.");
  const oldToken = await requestToken(), token = randomToken(), csrf = randomToken();
  if (!validToken(oldToken)) throw new AdminError(401, "SESSION_INVALID", "Silakan masuk sebagai Admin.");
  const changed = await transaction(async (tx) => {
    const { actor, session } = await authenticate(tx, oldToken, true);
    await checkMutation(request, session.csrf_hash);
    const key = tokenHash(`password:${actor.id}`);
    const attempts = await tx.admin_login_attempts.findUnique({ where: { key } });
    if (attempts?.locked_until && attempts.locked_until > new Date()) throw new AdminError(429, "LOGIN_LOCKED", "Perubahan password dibatasi sementara.");
    if (!(await compare(current, session.user.password))) {
      const nextAttempt = failedLogin(attempts, new Date());
      await tx.admin_login_attempts.upsert({ where: { key }, create: { key, ...nextAttempt }, update: nextAttempt });
      await audit(tx, actor.id, "admin.password.failed", "user", actor.id);
      return false;
    }
    await tx.admin_login_attempts.deleteMany({ where: { key } });
    const nextHash = await hash(next, 12);
    await tx.users.update({ where: { id: actor.id }, data: { password: nextHash, must_change_password: false } });
    await createSession(tx, actor.id, token, csrf);
    await audit(tx, actor.id, "admin.password.changed", "user", actor.id);
    return true;
  });
  if (!changed) throw new AdminError(422, "INVALID_CREDENTIALS", "Password saat ini tidak cocok.");
  await setSessionCookies(token, csrf);
  return { redirect: "/admin/dashboard", csrf };
}
