import "server-only";
import { Prisma, PrismaClient } from "@prisma/client";
const globalDb = globalThis as unknown as { bemPrisma?: PrismaClient };
export function database() {
  if (!globalDb.bemPrisma) globalDb.bemPrisma = new PrismaClient();
  return globalDb.bemPrisma;
}
export type Transaction = Prisma.TransactionClient;
export async function transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await database().$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, timeout: 15000,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
}
