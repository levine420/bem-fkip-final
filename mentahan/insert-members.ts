import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Mulai memasukkan data pengurus BEM FKIP Kabinet ALTIORA...\n');

  // Ambil period aktif
  const period = await prisma.periods.findFirst({ where: { status: 'AKTIF' } });
  if (!period) throw new Error('Tidak ada period yang aktif!');
  const periodId = period.id;
  console.log(`✅ Period aktif: ${period.name} (${period.year_start}-${period.year_end})`);

  // Ambil semua departemen
  const depts = await prisma.departments.findMany({ where: { period_id: periodId } });
  const deptMap: Record<string, string> = {};
  for (const d of depts) deptMap[d.slug] = d.id;
  console.log(`✅ Departemen ditemukan: ${depts.map(d => d.name).join(', ')}\n`);

  // ============================================
  // BOARD MEMBERS (Pengurus Inti / BPH)
  // ============================================
  const boardMembers = [
    { name: 'Muhamad Julpi Ibrahim', position: 'Gubernur BEM FKIP', display_order: 1 },
    { name: 'Dzikri Pahlevy', position: 'Wakil Gubernur BEM FKIP', display_order: 2 },
    { name: 'Mutiara Suyatna', position: 'Sekretaris Umum', display_order: 3 },
    { name: 'Santia Muhtar', position: 'Sekretaris Internal', display_order: 4 },
    { name: 'Muh. Faiz Alfarezi', position: 'Bendahara Umum', display_order: 5 },
    { name: 'Alma Abdillah Sukardi', position: 'Bendahara Internal', display_order: 6 },
  ];

  console.log('📌 Memasukkan Board Members (BPH)...');
  for (const m of boardMembers) {
    await prisma.board_members.upsert({
      where: {
        period_id_user_id: {
          period_id: periodId,
          user_id: null as any,
        },
      },
      create: {
        name: m.name,
        position: m.position,
        display_order: m.display_order,
        period_id: periodId,
      },
      update: {
        name: m.name,
        position: m.position,
        display_order: m.display_order,
      },
    }).catch(async () => {
      // upsert by name+position jika gagal
      const existing = await prisma.board_members.findFirst({
        where: { period_id: periodId, name: m.name }
      });
      if (!existing) {
        await prisma.board_members.create({
          data: {
            name: m.name,
            position: m.position,
            display_order: m.display_order,
            period_id: periodId,
          }
        });
        console.log(`  + ${m.name} (${m.position})`);
      } else {
        console.log(`  ~ ${m.name} sudah ada, skip`);
      }
    });
  }
  console.log('✅ Board Members selesai!\n');

  // ============================================
  // DEPARTMENT MEMBERS
  // ============================================
  type DeptMember = { name: string; position: string; display_order: number };
  const departmentMembers: Record<string, DeptMember[]> = {
    'sosial-dan-agama': [
      { name: 'Nuraini L. Making', position: 'Kepala Departemen', display_order: 1 },
      { name: 'Alfiah Nurazizah', position: 'Staf', display_order: 2 },
      { name: 'Buchori Ahmad', position: 'Staf', display_order: 3 },
      { name: 'Rachel Marsya Istifaiyah', position: 'Staf', display_order: 4 },
      { name: 'Chica Salwa Fachira', position: 'Staf', display_order: 5 },
      { name: 'Salsa Napisa', position: 'Staf', display_order: 6 },
    ],
    'peningkatan-sumber-daya-mahasiswa': [
      { name: 'Fahrurrozi', position: 'Kepala Departemen', display_order: 1 },
      { name: 'Cahyani Uswatun Hasanah', position: 'Staf', display_order: 2 },
      { name: 'Nayden Walid El Qirby', position: 'Staf', display_order: 3 },
      { name: 'Siti Mutiara Nurhayati Ahyar', position: 'Staf', display_order: 4 },
      { name: 'Abdul Rohim', position: 'Staf', display_order: 5 },
      { name: 'Muhammad Hasby Assidiq', position: 'Staf', display_order: 6 },
      { name: 'Alea Mutiara Meidita', position: 'Staf', display_order: 7 },
    ],
    'minat-dan-bakat': [
      { name: 'Kirana Dinandra Putri', position: 'Kepala Departemen', display_order: 1 },
      { name: 'Syafira Nurul Falah', position: 'Staf', display_order: 2 },
      { name: 'Zahrotul Sita', position: 'Staf', display_order: 3 },
      { name: 'Dzalika Ayuria Marla', position: 'Staf', display_order: 4 },
      { name: 'Nadila Putri Adelia', position: 'Staf', display_order: 5 },
      { name: 'Naylla Mifthul Rizki Sobur', position: 'Staf', display_order: 6 },
    ],
    'komunikasi-dan-informasi': [
      { name: 'Sabrina Kafka Athaya', position: 'Kepala Departemen', display_order: 1 },
      { name: 'Siti Meilani Keisya Putri', position: 'Staf', display_order: 2 },
      { name: 'Rafifah Sherilya Azzahra', position: 'Staf', display_order: 3 },
      { name: 'Syahla Meilani Putri', position: 'Staf', display_order: 4 },
      { name: 'Salwa Azzahra', position: 'Staf', display_order: 5 },
    ],
    'kajian-isu-dan-aksi-strategis': [
      { name: 'M. Ilyas Khoirul Anam', position: 'Kepala Departemen', display_order: 1 },
      { name: 'Zingga Awalludien', position: 'Staf', display_order: 2 },
      { name: 'Virgi Alfarisi', position: 'Staf', display_order: 3 },
      { name: 'Ahmad Fadly', position: 'Staf', display_order: 4 },
    ],
  };

  console.log('📌 Memasukkan anggota departemen...');
  for (const [slug, members] of Object.entries(departmentMembers)) {
    const deptId = deptMap[slug];
    if (!deptId) {
      console.log(`  ⚠️  Departemen '${slug}' tidak ditemukan, skip`);
      continue;
    }
    const deptName = depts.find(d => d.slug === slug)?.name;
    console.log(`\n  📂 ${deptName}:`);
    for (const m of members) {
      const existing = await prisma.department_members.findFirst({
        where: { department_id: deptId, name: m.name }
      });
      if (!existing) {
        await prisma.department_members.create({
          data: {
            name: m.name,
            position: m.position,
            display_order: m.display_order,
            department_id: deptId,
            period_id: periodId,
          }
        });
        console.log(`    + ${m.name} (${m.position})`);
      } else {
        console.log(`    ~ ${m.name} sudah ada, skip`);
      }
    }
  }

  console.log('\n✅ Semua anggota departemen selesai!\n');

  // Ringkasan
  const totalBoard = await prisma.board_members.count({ where: { period_id: periodId } });
  const totalDeptMembers = await prisma.department_members.count({ where: { period_id: periodId } });
  console.log(`📊 Ringkasan akhir:`);
  console.log(`   - Board Members (BPH): ${totalBoard} orang`);
  console.log(`   - Anggota Departemen: ${totalDeptMembers} orang`);
}

main()
  .then(() => {
    console.log('\n✨ Semua data pengurus berhasil dimasukkan!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
