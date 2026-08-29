import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      account_status: true,
      must_change_password: true,
      admin_assignments_user: {
        select: {
          period: { select: { name: true, status: true } },
          department: { select: { name: true } },
          revoked_at: true,
        },
      },
    },
  });
  console.log("=== USERS IN DB ===");
  console.log(JSON.stringify(users, null, 2));

  const locks = await prisma.admin_login_attempts.findMany();
  console.log("=== LOGIN LOCKS ===");
  console.log(JSON.stringify(locks, null, 2));

  const periods = await prisma.periods.findMany({
    select: { id: true, name: true, status: true },
  });
  console.log("=== PERIODS IN DB ===");
  console.log(JSON.stringify(periods, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
