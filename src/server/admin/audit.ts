import "server-only";
import type { Prisma } from "@prisma/client";
import type { Transaction } from "./db";
// Only explicit metadata. Never pass request bodies, full users, tokens, passwords,
// aspiration identity, or private aspiration text into audit details.
export async function audit(tx: Transaction, userId: string | null, action: string,
  targetType: string | null, targetId: string | null, details: Prisma.InputJsonObject = {}) {
  await tx.activity_logs.create({ data: { user_id: userId, action, target_type: targetType, target_id: targetId, details } });
}
