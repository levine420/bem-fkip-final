import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding full Admin Control Center data to PostgreSQL database...");

  // 1. Get or find Super Admin user
  let saUser = await db.users.findUnique({
    where: { email: "admin@bemfkip.uika.ac.id" },
  });

  if (!saUser) {
    console.log("Creating Super Admin account...");
    saUser = await db.users.create({
      data: {
        name: "Ahmad Rizki (Super Admin)",
        email: "admin@bemfkip.uika.ac.id",
        password: "$2a$12$K8p5aJ5UfL8Z1M1r5X5Q1.6Q1n9m1r5X5Q1.6Q1n9m1r5X5Q1.6Q1",
        role: "SUPER_ADMIN",
        account_status: "AKTIF",
        must_change_password: false,
      },
    });
  }

  // 2. Create Active Period
  console.log("Seeding Active Period...");
  let activePeriod = await db.periods.findFirst({
    where: { status: "AKTIF" },
  });

  if (!activePeriod) {
    activePeriod = await db.periods.create({
      data: {
        name: "Kabinet Bakti Nusantara 2024–2025",
        visi: "Wadah Terdepan Membangun Integritas, Inovasi Digital, dan Sinergi Pendidikan FKIP UIKA Bogor yang Berdaya Saing.",
        misi: "1. Mengoptimalkan advokasi dan kesejahteraan mahasiswa FKIP UIKA.\n2. Mewujudkan digitalisasi layanan dan transparansi program kerja.\n3. Mengembangkan bakat akademik, seni, dan olahraga mahasiswa.\n4. Menguatkan pengabdian masyarakat berbasis edukasi berkarakter.\n5. Membangun jaringan kepemimpinan dan kolaborasi antar-lembaga.",
        year_start: 2024,
        year_end: 2025,
        status: "AKTIF",
        version: 1,
      },
    });
  }

  const periodId = activePeriod.id;

  // 3. Create Departments
  console.log("Seeding Departments...");
  const deptData = [
    {
      name: "Advokasi & Kesejahteraan Mahasiswa",
      slug: "advokesma",
      description: "Menampung aspirasi, mengawal isu beasiswa & UKT, dan mendampingi mahasiswa FKIP UIKA.",
    },
    {
      name: "Komunikasi & Informasi",
      slug: "kominfo",
      description: "Pusat media publikasi digital, manajemen situs web terpadu, dan kehumasan BEM FKIP UIKA.",
    },
    {
      name: "Pengembangan Sumber Daya Manusia",
      slug: "psdm",
      description: "Fokus pada kaderisasi, pelatihan kepemimpinan (LKMM), dan manajerial organisasi mahasiswa.",
    },
    {
      name: "Pemuda & Olahraga",
      slug: "pemora",
      description: "Mengembangkan potensi minat bakat olahraga dan kompetisi mahasiswa FKIP UIKA.",
    },
    {
      name: "Sosial & Pengabdian Masyarakat",
      slug: "sosmas",
      description: "Penyelenggara Bina Desa Edukasi dan program pengabdian masyarakat berkelanjutan.",
    },
    {
      name: "Pendidikan & Riset Kebijakan",
      slug: "pendidikan-riset",
      description: "Mengkaji isu kurikulum pendidikan nasional, karya tulis ilmiah, dan debat mahasiswa.",
    },
  ];

  const createdDepts = [];
  for (const d of deptData) {
    let dept = await db.departments.findFirst({
      where: { period_id: periodId, slug: d.slug },
    });
    if (!dept) {
      dept = await db.departments.create({
        data: {
          name: d.name,
          slug: d.slug,
          description: d.description,
          period_id: periodId,
        },
      });
    }
    createdDepts.push(dept);
  }

  const advoDept = createdDepts.find((d) => d.slug === "advokesma") || createdDepts[0];
  const kominfoDept = createdDepts.find((d) => d.slug === "kominfo") || createdDepts[1];
  const psdmDept = createdDepts.find((d) => d.slug === "psdm") || createdDepts[2];
  const pendDept = createdDepts.find((d) => d.slug === "pendidikan-riset") || createdDepts[5];

  // 4. Create Board Members (Struktur Pengurus)
  console.log("Seeding Board Members...");
  const boardData = [
    { name: "M. Farhan Rasyid", position: "Ketua Umum BEM FKIP UIKA", order: 1 },
    { name: "Siti Rahmawati", position: "Wakil Ketua Umum BEM FKIP", order: 2 },
    { name: "Ahmad Hidayat", position: "Sekretaris Jenderal", order: 3 },
    { name: "Dina Fitriani", position: "Bendahara Umum", order: 4 },
    { name: "Rizky Pratama", position: "Kepala Departemen ADVOKESMA", order: 5, deptId: advoDept.id },
    { name: "Nurul Aini", position: "Kepala Departemen KOMINFO", order: 6, deptId: kominfoDept.id },
  ];

  for (const b of boardData) {
    const existing = await db.board_members.findFirst({
      where: { period_id: periodId, name: b.name },
    });
    if (!existing) {
      await db.board_members.create({
        data: {
          name: b.name,
          position: b.position,
          display_order: b.order,
          department_id: b.deptId || null,
          period_id: periodId,
          user_id: null,
        },
      });
    }
  }

  // 5. Create Contents (Berita & Pengumuman)
  console.log("Seeding Published Contents...");
  const contentsData = [
    {
      title: "Pembukaan Pendaftaran Beasiswa UIKA Prestasi Gelombang II 2026",
      slug: "pembukaan-pendaftaran-beasiswa-uika-prestasi-2026",
      seo_slug: "beasiswa-uika-prestasi-2026",
      meta_title: "Beasiswa UIKA Prestasi 2026",
      meta_description: "BEM FKIP UIKA membuka posko pendampingan pendaftaran Beasiswa Prestasi Mahasiswa Aktif.",
      excerpt: "Departemen ADVOKESMA BEM FKIP UIKA membuka posko pendampingan pendaftaran Beasiswa Prestasi Mahasiswa Aktif Gelombang II.",
      body: "BEM FKIP UIKA melalui Departemen Advokasi dan Kesejahteraan Mahasiswa resmi membuka posko layanan bantuan pendaftaran Beasiswa Prestasi Gelombang II. Mahasiswa yang memenuhi kriteria IPK minimal 3.50 dapat mengajukan berkas secara langsung melalui Portal Mahasiswa.",
      category: "PENGUMUMAN",
      status: "TERBIT",
      deptId: advoDept.id,
    },
    {
      title: "Peluncuran Platform Digital BEM FKIP UIKA Terpadu v0.4.0",
      slug: "peluncuran-platform-digital-bem-fkip-uika-v0-4-0",
      seo_slug: "platform-digital-bem-fkip-uika",
      meta_title: "Platform Digital BEM FKIP UIKA",
      meta_description: "Portal terpadu layanan mahasiswa, transparansi proker, dan perpustakaan dokumen.",
      excerpt: "Inovasi digitalisasi BEM FKIP UIKA resmi diluncurkan untuk mempermudah bank aspirasi, pendaftaran kegiatan, dan transparansi publik.",
      body: "Dalam rangka modernisasi tata kelola organisasi, BEM FKIP UIKA meluncurkan Platform Digital Terpadu yang mencakup fitur Bank Aspirasi privat, integrasi kegiatan, dan perpustakaan dokumen kelembagaan.",
      category: "BERITA",
      status: "TERBIT",
      deptId: kominfoDept.id,
    },
    {
      title: "Kajian Kritis: Transformasi Kurikulum Pendidikan Nasional di Era AI",
      slug: "kajian-kritis-transformasi-kurikulum-pendidikan-era-ai",
      seo_slug: "kajian-kurikulum-pendidikan-ai",
      meta_title: "Kajian Kurikulum Pendidikan Era AI",
      meta_description: "Rilis hasil kajian akademis Departemen Pendidikan BEM FKIP UIKA Bogor.",
      excerpt: "Departemen Pendidikan merilis naskah kajian kritis mengenai implikasi kecerdasan buatan terhadap profesionalisme calon pendidik.",
      body: "Pesatnya perkembangan kecerdasan buatan menuntut calon pendidik di FKIP UIKA untuk memiliki adaptabilitas tinggi terhadap etika penggunaan AI dan integrasi teknologi pembelajaran.",
      category: "KAJIAN",
      status: "TERBIT",
      deptId: pendDept.id,
    },
  ];

  for (const c of contentsData) {
    const existing = await db.contents.findFirst({
      where: { slug: c.slug },
    });
    if (!existing) {
      await db.contents.create({
        data: {
          title: c.title,
          slug: c.slug,
          seo_slug: c.seo_slug,
          meta_title: c.meta_title,
          meta_description: c.meta_description,
          excerpt: c.excerpt,
          reading_time: 4,
          body: c.body,
          category: c.category,
          status: c.status,
          author_id: saUser.id,
          department_id: c.deptId,
          period_id: periodId,
          published_at: new Date(),
        },
      });
    }
  }

  // 6. Create Work Programs (Program Kerja)
  console.log("Seeding Work Programs...");
  const prokerData = [
    {
      name: "FKIP Digital Fest & Lomba Media Pembelajaran 2026",
      slug: "fkip-digital-fest-2026",
      description: "Kompetisi nasional pembuatan inovasi media pembelajaran berbasis web & aplikasi interaktif antar mahasiswa FKIP se-Indonesia.",
      target_time: "Triwulan III 2026",
      success_indicator: "500+ peserta dari 20 perguruan tinggi",
      status: "BERJALAN",
      order: 1,
      deptId: kominfoDept.id,
    },
    {
      name: "Posko Bantuan & Pendampingan UKT Mahasiswa",
      slug: "posko-bantuan-ukt-mahasiswa",
      description: "Layanan verifikasi berkas dan pengawalan permohonan keringanan biaya kuliah bagi mahasiswa kurang mampu.",
      target_time: "Agustus 2026",
      success_indicator: "100% permohonan advokasi terverifikasi",
      status: "SELESAI",
      order: 2,
      deptId: advoDept.id,
    },
    {
      name: "Latihan Keterampilan Manajemen Mahasiswa (LKMM-TD)",
      slug: "lkmm-td-2026",
      description: "Pelatihan kepemimpinan dasar dan tata kelola organisasi bagi pengurus ORMAWA se-FKIP UIKA Bogor.",
      target_time: "Oktober 2026",
      success_indicator: "80 delegasi organisasi terlatih",
      status: "BELUM_MULAI",
      order: 3,
      deptId: psdmDept.id,
    },
  ];

  for (const p of prokerData) {
    const existing = await db.work_programs.findFirst({
      where: { period_id: periodId, slug: p.slug },
    });
    if (!existing) {
      await db.work_programs.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          target_time: p.target_time,
          success_indicator: p.success_indicator,
          status: p.status,
          display_order: p.order,
          department_id: p.deptId,
          period_id: periodId,
        },
      });
    }
  }

  // 7. Create Events (Kegiatan)
  console.log("Seeding Events...");
  const eventsData = [
    {
      name: "Seminar Nasional Pendidikan: Mengajar Kreatif di Era AI",
      slug: "seminar-nasional-pendidikan-era-ai",
      description: "Seminar luring menghadirkan narasumber pakar teknologi pendidikan dan praktisi kurikulum nasional.",
      location: "Aula KH. Sholeh Iskandar, UIKA Bogor",
      start_time: new Date(Date.now() + 15 * 86400000),
      end_time: new Date(Date.now() + 15 * 86400000 + 25200000),
      max_participants: 300,
      status: "TERBIT",
      registration_status: "TERBUKA",
      deptId: pendDept.id,
    },
    {
      name: "Pekan Olahraga & Seni FKIP (PORSE-FKIP 2026)",
      slug: "porse-fkip-2026",
      description: "Ajang turnamen futsal, bulutangkis, dan lomba seni tari tradisional antar-prodi FKIP UIKA.",
      location: "GOR UIKA Bogor",
      start_time: new Date(Date.now() + 30 * 86400000),
      end_time: new Date(Date.now() + 35 * 86400000),
      max_participants: 500,
      status: "TERBIT",
      registration_status: "SEGERA_DIBUKA",
      deptId: kominfoDept.id,
    },
  ];

  for (const e of eventsData) {
    const existing = await db.events.findFirst({
      where: { slug: e.slug },
    });
    if (!existing) {
      await db.events.create({
        data: {
          name: e.name,
          slug: e.slug,
          description: e.description,
          location: e.location,
          start_time: e.start_time,
          end_time: e.end_time,
          max_participants: e.max_participants,
          status: e.status,
          registration_status: e.registration_status,
          created_by_user_id: saUser.id,
          department_id: e.deptId,
          period_id: periodId,
        },
      });
    }
  }

  // 8. Create Documents (Dokumen Organisasi)
  console.log("Seeding Documents...");
  const docsData = [
    {
      name: "AD / ART & GBHO BEM FKIP UIKA Bogor 2024–2025",
      filename: "AD_ART_GBHO_FKIP_2024.pdf",
      storageKey: "docs/AD_ART_GBHO_FKIP_2024.pdf",
      fileType: "application/pdf",
      fileSize: 2450000n,
      category: "AD_ART",
      isPublic: true,
    },
    {
      name: "Surat Keputusan (SK) Dekan Pengesahan Pengurus BEM FKIP",
      filename: "SK_Pengurus_BEM_FKIP_UIKA.pdf",
      storageKey: "docs/SK_Pengurus_BEM_FKIP_UIKA.pdf",
      fileType: "application/pdf",
      fileSize: 1850000n,
      category: "SK",
      isPublic: true,
    },
    {
      name: "Laporan Pertanggungjawaban Tengah Periode (LPJ 6 Bulan)",
      filename: "LPJ_Tengah_Periode_BEM_FKIP.pdf",
      storageKey: "docs/LPJ_Tengah_Periode_BEM_FKIP.pdf",
      fileType: "application/pdf",
      fileSize: 4200000n,
      category: "LPJ",
      isPublic: true,
    },
  ];

  for (const doc of docsData) {
    const existing = await db.documents.findFirst({
      where: { storage_key: doc.storageKey },
    });
    if (!existing) {
      await db.documents.create({
        data: {
          name: doc.name,
          original_filename: doc.filename,
          storage_key: doc.storageKey,
          file_type: doc.fileType,
          file_size: doc.fileSize,
          category: doc.category,
          is_public: doc.isPublic,
          uploader_id: saUser.id,
          period_id: periodId,
        },
      });
    }
  }

  // 9. Create Aspirations (Bank Aspirasi)
  console.log("Seeding Aspirations...");
  const aspData = [
    {
      title: "Permohonan Penambahan Ruang Laboratorium Komputer FKIP",
      body: "Mohon agar sarana lab komputer di gedung FKIP ditambah kapasitasnya mengingat jumlah mahasiswa prodi terus bertambah.",
      category: "FASILITAS",
      status: "DIPROSES",
      response: "Aspirasi telah diterima Tim ADVOKESMA dan sedang diajukan ke Wakil Dekan II Bidang Sarana Prasarana.",
    },
    {
      title: "Kejelasan Alur Pengajuan Keringanan UKT Semester Ganjil",
      body: "Mohon informasi syarat dan alur pengajuan penundaan pembayaran UKT untuk mahasiswa tingkat akhir.",
      category: "AKADEMIK",
      status: "SELESAI",
      response: "Alur resmi permohonan keringanan UKT telah dipublikasikan di Portal Mahasiswa menu Advokasi.",
    },
  ];

  for (const a of aspData) {
    const existing = await db.aspirations.findFirst({
      where: { period_id: periodId, title: a.title },
    });
    if (!existing) {
      await db.aspirations.create({
        data: {
          title: a.title,
          body: a.body,
          category: a.category,
          status: a.status,
          response: a.response,
          is_anonymous: false,
          user_id: saUser.id,
          handler_id: saUser.id,
          responded_at: new Date(),
          period_id: periodId,
        },
      });
    }
  }

  console.log("🎉 SUCCESS! Seed database completed 100%. All Admin Control Center modules are filled!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
