import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Mulai memasukkan data program kerja...\n');

    // Baca file SQL
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'insert-proker-data.sql'),
      'utf-8'
    );

    // Jalankan SQL menggunakan $executeRawUnsafe
    await prisma.$executeRawUnsafe(sqlContent);

    console.log('✅ Data program kerja berhasil dimasukkan!');
    console.log('\n📊 Ringkasan:');
    
    // Hitung jumlah program kerja per departemen
    const departments = await prisma.departments.findMany({
      where: {
        period: {
          status: 'AKTIF'
        }
      },
      include: {
        _count: {
          select: {
            work_programs_department: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('\nDepartemen dan jumlah program kerja:');
    for (const dept of departments) {
      console.log(`- ${dept.name}: ${dept._count.work_programs_department} program kerja`);
    }

    // Total program kerja
    const totalProker = await prisma.work_programs.count({
      where: {
        period: {
          status: 'AKTIF'
        }
      }
    });

    console.log(`\n📌 Total: ${totalProker} program kerja`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('\n✨ Selesai!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
