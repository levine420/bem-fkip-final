import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed: Update struktur kepengurusan BEM FKIP UIKA...');

  // Get active period
  const activePeriod = await prisma.periods.findFirst({
    where: { status: 'AKTIF' },
    select: { id: true, name: true }
  });

  if (!activePeriod) {
    console.error('❌ No active period found. Please create an active period first.');
    return;
  }

  console.log(`📅 Using active period: ${activePeriod.name}`);

  // 1. CREATE/UPDATE DEPARTMENTS
  console.log('\n📂 Creating/updating departments...');
  
  const departments = [
    { name: 'Sosial dan Agama', slug: 'sosgam', description: 'Departemen Sosial dan Agama (SOSGAM)' },
    { name: 'Peningkatan Sumber Daya Mahasiswa', slug: 'psdm', description: 'Departemen Peningkatan Sumber Daya Mahasiswa (PSDM)' },
    { name: 'Minat dan Bakat', slug: 'minba', description: 'Departemen Minat dan Bakat (MINBA)' },
    { name: 'Komunikasi dan Informasi', slug: 'kominfo', description: 'Departemen Komunikasi dan Informasi (KOMINFO)' },
    { name: 'Kajian Aksi dan Isu Strategis', slug: 'kastrat', description: 'Departemen Kajian Aksi dan Isu Strategis (KASTRAT)' }
  ];

  const departmentMap: Record<string, string> = {};

  for (const dept of departments) {
    const existing = await prisma.departments.findFirst({
      where: {
        slug: dept.slug,
        period_id: activePeriod.id,
        deleted_at: null
      }
    });

    if (existing) {
      await prisma.departments.update({
        where: { id: existing.id },
        data: {
          name: dept.name,
          description: dept.description,
          version: { increment: 1 }
        }
      });
      departmentMap[dept.slug] = existing.id;
      console.log(`  ✅ Updated: ${dept.name}`);
    } else {
      const created = await prisma.departments.create({
        data: {
          name: dept.name,
          slug: dept.slug,
          description: dept.description,
          period_id: activePeriod.id,
          status: 'AKTIF',
          version: 1
        }
      });
      departmentMap[dept.slug] = created.id;
      console.log(`  ✨ Created: ${dept.name}`);
    }
  }

  // 2. DELETE OLD BOARD MEMBERS (for clean slate)
  console.log('\n🗑️  Cleaning old board members...');
  await prisma.board_members.updateMany({
    where: {
      period_id: activePeriod.id,
      deleted_at: null
    },
    data: { deleted_at: new Date() }
  });
  console.log('  ✅ Old members archived');

  // 3. CREATE NEW BOARD MEMBERS
  console.log('\n👥 Creating new board members...');

  const boardMembers = [
    // BPH (Pengurus Inti - tanpa departemen)
    { name: 'Muhamad Julpi Ibrahim', position: 'Ketua Umum', display_order: 1, department_id: null },
    { name: 'Dzikri Pahlevy', position: 'Wakil Ketua', display_order: 2, department_id: null },
    { name: 'Mutiara Suyatna', position: 'Sekretaris Umum', display_order: 3, department_id: null },
    { name: 'Nur Faiz Alfarezi', position: 'Bendahara Umum', display_order: 4, department_id: null },
    { name: 'Santia Muhtar', position: 'Sekretaris Internal', display_order: 5, department_id: null },
    { name: 'Alma Abdillah Sukardi', position: 'Bendahara Internal', display_order: 6, department_id: null },
    
    // Kepala Departemen
    { name: 'Nuraini L. Making', position: 'Kepala Departemen', display_order: 7, department_id: departmentMap['sosgam'] },
    { name: 'Fahrurrozi', position: 'Kepala Departemen', display_order: 8, department_id: departmentMap['psdm'] },
    { name: 'Kirana Dinandra Putri', position: 'Kepala Departemen', display_order: 9, department_id: departmentMap['minba'] },
    { name: 'Sabrina Kafka Abhaya', position: 'Kepala Departemen', display_order: 10, department_id: departmentMap['kominfo'] },
    { name: 'M. Ilyas Khoirul Anam', position: 'Kepala Departemen', display_order: 11, department_id: departmentMap['kastrat'] }
  ];

  for (const member of boardMembers) {
    await prisma.board_members.create({
      data: {
        name: member.name,
        position: member.position,
        display_order: member.display_order,
        department_id: member.department_id,
        period_id: activePeriod.id,
        photo_url: null,
        version: 1
      }
    });
    console.log(`  ✅ ${member.name} - ${member.position}`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - BPH Members: 6`);
  console.log(`   - Kepala Departemen: 5`);
  console.log(`   - Total: ${boardMembers.length} pengurus`);
  console.log('\n🌐 Check frontend: /organisasi/struktur-kepengurusan');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
