import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed: Add department members (staff)...');

  // Get active period
  const activePeriod = await prisma.periods.findFirst({
    where: { status: 'AKTIF' },
    select: { id: true, name: true }
  });

  if (!activePeriod) {
    console.error('❌ No active period found.');
    return;
  }

  console.log(`📅 Using active period: ${activePeriod.name}`);

  // Get all departments
  const departments = await prisma.departments.findMany({
    where: {
      period_id: activePeriod.id,
      deleted_at: null
    },
    select: { id: true, name: true, slug: true }
  });

  const deptMap: Record<string, string> = {};
  departments.forEach(d => {
    deptMap[d.slug] = d.id;
  });

  console.log(`\n📂 Found ${departments.length} departments`);

  // Delete old department members
  console.log('\n🗑️  Cleaning old department members...');
  await prisma.department_members.updateMany({
    where: {
      period_id: activePeriod.id,
      deleted_at: null
    },
    data: { deleted_at: new Date() }
  });
  console.log('  ✅ Old members archived');

  // Staff data from PDF
  const staffMembers = [
    // DEPARTEMEN SOSIAL DAN AGAMA (SOSGAM) - 5 staff
    { name: 'Alfiah Nurazizah', position: 'Staf', department: 'sosgam', order: 1 },
    { name: 'Buchori Ahmad', position: 'Staf', department: 'sosgam', order: 2 },
    { name: 'Rachel Marsya Istifaiyah', position: 'Staf', department: 'sosgam', order: 3 },
    { name: 'Chica Salwa Fachira', position: 'Staf', department: 'sosgam', order: 4 },
    { name: 'Salsa Napisa', position: 'Staf', department: 'sosgam', order: 5 },

    // DEPARTEMEN PSDM - 6 staff
    { name: 'Cahyani Uswatun Hasanah', position: 'Staf', department: 'psdm', order: 1 },
    { name: 'Nayden Walid El Qirby', position: 'Staf', department: 'psdm', order: 2 },
    { name: 'Siti Mutiara Nurhayati Aliyar', position: 'Staf', department: 'psdm', order: 3 },
    { name: 'Abdul Rohim', position: 'Staf', department: 'psdm', order: 4 },
    { name: 'Muhammad Hashy Assidiq', position: 'Staf', department: 'psdm', order: 5 },
    { name: 'Alea Mutiara Meidita', position: 'Staf', department: 'psdm', order: 6 },

    // DEPARTEMEN MINBA - 5 staff
    { name: 'Syafira Nurul Falah', position: 'Staf', department: 'minba', order: 1 },
    { name: 'Zahirotul Siva', position: 'Staf', department: 'minba', order: 2 },
    { name: 'Dzalika Ayuria Marla', position: 'Staf', department: 'minba', order: 3 },
    { name: 'Nadila Putri Adelia', position: 'Staf', department: 'minba', order: 4 },
    { name: 'Nayila Miftiful Rizki Sobur', position: 'Staf', department: 'minba', order: 5 },

    // DEPARTEMEN KOMINFO - 4 staff
    { name: 'Siti Meilani Keisya Putri', position: 'Staf', department: 'kominfo', order: 1 },
    { name: 'Rafifah Sherilya Azzahra', position: 'Staf', department: 'kominfo', order: 2 },
    { name: 'Syahla Meilani Putri', position: 'Staf', department: 'kominfo', order: 3 },
    { name: 'Salwa Azzahra', position: 'Staf', department: 'kominfo', order: 4 },

    // DEPARTEMEN KASTRAT - 3 staff
    { name: 'Zinggea Awaliudien', position: 'Staf', department: 'kastrat', order: 1 },
    { name: 'Virgi Alfarisi', position: 'Staf', department: 'kastrat', order: 2 },
    { name: 'Ahmad Fadly', position: 'Staf', department: 'kastrat', order: 3 },
  ];

  console.log('\n👥 Creating department members...');

  let sosgamCount = 0, psdmCount = 0, minbaCount = 0, kominfoCount = 0, kastratCount = 0;

  for (const staff of staffMembers) {
    const deptId = deptMap[staff.department];
    
    if (!deptId) {
      console.warn(`  ⚠️  Department ${staff.department} not found for ${staff.name}`);
      continue;
    }

    await prisma.department_members.create({
      data: {
        name: staff.name,
        position: staff.position,
        display_order: staff.order,
        department_id: deptId,
        period_id: activePeriod.id,
        photo_url: null,
        version: 1
      }
    });

    // Count by department
    if (staff.department === 'sosgam') sosgamCount++;
    else if (staff.department === 'psdm') psdmCount++;
    else if (staff.department === 'minba') minbaCount++;
    else if (staff.department === 'kominfo') kominfoCount++;
    else if (staff.department === 'kastrat') kastratCount++;

    console.log(`  ✅ ${staff.name} - ${staff.department.toUpperCase()}`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary by Department:');
  console.log(`   - SOSGAM: ${sosgamCount} staff`);
  console.log(`   - PSDM: ${psdmCount} staff`);
  console.log(`   - MINBA: ${minbaCount} staff`);
  console.log(`   - KOMINFO: ${kominfoCount} staff`);
  console.log(`   - KASTRAT: ${kastratCount} staff`);
  console.log(`   - Total: ${staffMembers.length} staff`);
  console.log('\n🌐 Check frontend: /organisasi/departemen/[slug]');
  console.log('💡 Note: Hard refresh browser (Ctrl+Shift+R) to see changes immediately');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
