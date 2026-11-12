import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@'));
  
  // Cek semua periods
  const periods = await prisma.periods.findMany({
    select: { id: true, name: true, status: true, year_start: true, year_end: true, visi: true }
  });
  console.log('\n📅 Semua Periods:');
  for (const p of periods) {
    console.log(`  - ${p.name} | Status: ${p.status} | ${p.year_start}-${p.year_end}`);
    console.log(`    ID: ${p.id}`);
    console.log(`    Visi: ${p.visi?.substring(0, 60) || '(kosong)'}...`);
  }

  const activePeriod = periods.find(p => p.status === 'AKTIF');
  if (!activePeriod) {
    console.log('\n❌ TIDAK ADA PERIOD AKTIF!');
    return;
  }

  // Cek work programs
  const wp = await prisma.work_programs.count({ where: { period_id: activePeriod.id } });
  const depts = await prisma.departments.count({ where: { period_id: activePeriod.id } });
  const boardMembers = await prisma.board_members.count({ where: { period_id: activePeriod.id } });
  
  console.log('\n📊 Data di period aktif:');
  console.log(`  - Departemen: ${depts}`);
  console.log(`  - Program Kerja: ${wp}`);
  console.log(`  - Board Members: ${boardMembers}`);
  
  // Cek department details
  const deptList = await prisma.departments.findMany({
    where: { period_id: activePeriod.id },
    select: { name: true, slug: true, _count: { select: { work_programs_department: true } } }
  });
  console.log('\n📂 Departemen dan proker:');
  for (const d of deptList) {
    console.log(`  - ${d.name}: ${d._count.work_programs_department} proker`);
  }
}

main()
  .finally(() => prisma.$disconnect());
