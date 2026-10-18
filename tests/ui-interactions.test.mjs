import test from "node:test";
import assert from "node:assert/strict";
import { adminApi } from "../src/components/admin/api.ts";
import { toWibInput, fromWibInput } from "../src/lib/ui/event-time.ts";

test("event time preserves the instant across editing in WIB", () => {
  for (const value of ["2026-09-19T02:30:00.000Z", "2026-12-31T23:00:00.000Z"]) {
    assert.equal(fromWibInput(toWibInput(value)), value);
  }
  assert.equal(toWibInput("2026-09-19T02:30:00Z"), "2026-09-19T09:30");
  assert.throws(() => fromWibInput("invalid"), /tidak valid/);
});
test("malformed success cannot be mistaken for a completed admin mutation", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    return calls === 1 ? Response.json({ data: { csrf: "test-token" } }) : new Response("<html>upstream error</html>");
  });
  await assert.rejects(adminApi("/api/admin/events", "POST", {}), error => error.code === "INVALID_RESPONSE");
  assert.equal(calls, 2);
});
test("failed CSRF stops the mutation before it is sent", async t => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return new Response("unavailable", { status: 503 }); });
  await assert.rejects(adminApi("/api/admin/events", "POST", {}), /Sesi formulir/);
  assert.equal(calls, 1);
});
test("admin errors retain actionable server message and field errors", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: { code: "VALIDATION", message: "Nama wajib diisi.", fields: { name: "Wajib" } } }, { status: 422 }));
  await assert.rejects(adminApi("/api/admin/events"), error => error.message === "Nama wajib diisi." && error.fields.name === "Wajib");
});
