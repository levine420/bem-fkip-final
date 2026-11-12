import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    // Get active period
    const activePeriod = await prisma.periods.findFirst({
      where: { status: 'AKTIF' }
    });

    if (!activePeriod) {
      throw new Error('No active period found');
    }

    console.log(`Active period: ${activePeriod.name} (${activePeriod.id})`);

    // Check if Sekretaris Umum exists
    const sekretarisExists = await prisma.board_members.findFirst({
      where: {
        position: 'Sekretaris Umum',
        period_id: activePeriod.id,
        deleted_at: null,
      }
    });

    if (!sekretarisExists) {
      await prisma.board_members.create({
        data: {
          name: 'Mutiara Suyatna',
          position: 'Sekretaris Umum',
          display_order: 3,
          period_id: activePeriod.id,
        }
      });
      console.log('✅ Sekretaris Umum inserted');
    } else {
      console.log('⚠️  Sekretaris Umum already exists');
    }

    // Check if Bendahara Umum exists
    const bendaharaExists = await prisma.board_members.findFirst({
      where: {
        position: 'Bendahara Umum',
        period_id: activePeriod.id,
        deleted_at: null,
      }
    });

    if (!bendaharaExists) {
      await prisma.board_members.create({
        data: {
          name: 'Muh. Faiz Alfarezi',
          position: 'Bendahara Umum',
          display_order: 4,
          period_id: activePeriod.id,
        }
      });
      console.log('✅ Bendahara Umum inserted');
    } else {
      console.log('⚠️  Bendahara Umum already exists');
    }

    console.log('\n🎉 Board members seeding completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
