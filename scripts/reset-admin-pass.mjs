import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";

const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.users.findUnique({
    where: { email: "admin@bemfkip.uika.ac.id" },
  });

  if (!admin) {
    console.log("Admin account not found!");
    return;
  }

  const isMatchDefault = await compare("SuperAdmin2024!", admin.password);
  console.log("Is SuperAdmin2024! correct?", isMatchDefault);

  // Clear any failed attempts lock
  await prisma.admin_login_attempts.deleteMany();
  console.log("Cleared login attempts lock.");

  if (!isMatchDefault) {
    const newHash = await hash("SuperAdmin2024!", 12);
    await prisma.users.update({
      where: { id: admin.id },
      data: { password: newHash, must_change_password: false },
    });
    console.log("Updated Super Admin password hash to 'SuperAdmin2024!'");
  }

  await prisma.$disconnect();
}

check().catch(console.error);
