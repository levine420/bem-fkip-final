import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { AdminError } from "./errors.ts";

export const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const ABSOLUTE_TIMEOUT_MS = 12 * IDLE_TIMEOUT_MS;
export const LOGIN_LOCK_MS = 30 * 60 * 1000;

export function randomToken() {
  return randomBytes(32).toString("hex");
}

export function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function validToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function tokenMatches(token: string, hash: string) {
  return (
    validToken(token) &&
    validToken(hash) &&
    timingSafeEqual(Buffer.from(tokenHash(token), "hex"), Buffer.from(hash, "hex"))
  );
}

export function sessionExpired(session: { expires_at: Date; last_seen_at: Date }, now = new Date()) {
  return session.expires_at <= now || now.getTime() - session.last_seen_at.getTime() >= IDLE_TIMEOUT_MS;
}

export function assertOrigin(actual: string | null, configured: string | undefined) {
  if (!configured) throw new AdminError(503, "ADMIN_NOT_CONFIGURED", "Origin Admin belum dikonfigurasi oleh pengelola environment.");
  let expected: string;
  try {
    expected = new URL(configured).origin;
  } catch {
    throw new AdminError(503, "ADMIN_NOT_CONFIGURED", "Konfigurasi Origin Admin tidak valid.");
  }

  if (actual !== expected) {
    // In local development, accept 127.0.0.1 vs localhost gracefully
    if (process.env.NODE_ENV !== "production" && actual) {
      try {
        const actualUrl = new URL(actual);
        const expectedUrl = new URL(expected);
        if (
          (actualUrl.hostname === "localhost" || actualUrl.hostname === "127.0.0.1") &&
          (expectedUrl.hostname === "localhost" || expectedUrl.hostname === "127.0.0.1") &&
          (actualUrl.port === expectedUrl.port || !actualUrl.port)
        ) {
          return;
        }
      } catch {}
    }
    throw new AdminError(403, "CSRF", "Permintaan berasal dari origin yang tidak diizinkan.");
  }
}

export function assertCsrf(cookie: string | undefined, submitted: string | null, sessionHash?: string) {
  if (
    !validToken(cookie) ||
    !validToken(submitted) ||
    !timingSafeEqual(Buffer.from(cookie, "hex"), Buffer.from(submitted, "hex")) ||
    (sessionHash !== undefined && !tokenMatches(submitted, sessionHash))
  ) {
    throw new AdminError(403, "CSRF", "Sesi formulir tidak valid. Muat ulang halaman.");
  }
}

export function failedLogin(previous: { failures: number; window_start: Date; locked_until: Date | null } | null, now: Date) {
  const expiredLock = previous?.locked_until && previous.locked_until <= now;
  if (!previous || expiredLock || now.getTime() - previous.window_start.getTime() >= LOGIN_LOCK_MS) {
    return { failures: 1, window_start: now, locked_until: null };
  }
  const failures = previous.failures + 1;
  return {
    failures,
    window_start: previous.window_start,
    locked_until: failures >= 5 ? new Date(now.getTime() + LOGIN_LOCK_MS) : null,
  };
}
