import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database data...\n');

  // Get active period
  const activePeriod = await prisma.periods.findFirst({
    where: { status: 'AKTIF' },
    select: { id: true, name: true }
  });

  if (!activePeriod) {
    console.error('❌ No active period found.');
    return;
  }

  console.log(`📅 Active period: ${activePeriod.name}\n`);

  // Check departments
  const departments = await prisma.departments.findMany({
    where: {
      period_id: activePeriod.id,
      deleted_at: null
    },
    select: { id: true, name: true, slug: true },
    orderBy: { slug: 'asc' }
  });

  console.log(`📂 Departments (${departments.length}):`);
  departments.forEach(d => console.log(`   - ${d.name} (${d.slug})`));

  // Check board members
  const boardMembers = await prisma.board_members.findMany({
    where: {
      period_id: activePeriod.id,
      deleted_at: null
    },
    select: { name: true, position: true, department_id: true },
    orderBy: { display_order: 'asc' }
  });

  console.log(`\n👥 Board Members (${boardMembers.length}):`);
  boardMembers.forEach(bm => {
    const deptInfo = bm.department_id ? ' (Kepala Dept)' : ' (BPH)';
    console.log(`   - ${bm.name} - ${bm.position}${deptInfo}`);
  });

  // Check department members by department
  console.log(`\n📋 Department Members by Department:\n`);
  
  for (const dept of departments) {
    const members = await prisma.department_members.findMany({
      where: {
        department_id: dept.id,
        period_id: activePeriod.id,
        deleted_at: null
      },
      select: { name: true, position: true },
      orderBy: { display_order: 'asc' }
    });

    console.log(`   ${dept.name.toUpperCase()} (${members.length} staff):`);
    if (members.length === 0) {
      console.log('      ⚠️  No staff members found');
    } else {
      members.forEach(m => console.log(`      - ${m.name} (${m.position})`));
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
