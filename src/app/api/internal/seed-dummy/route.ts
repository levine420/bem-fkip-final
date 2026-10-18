/**
 * API INTERNAL — HANYA UNTUK SEED DUMMY DATA
 * Hapus file ini setelah selesai!
 * Panggil: POST http://localhost:3000/api/internal/seed-dummy
 * Header: x-seed-key: bem-fkip-seed-2026
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/public/db";

const SEED_KEY = "bem-fkip-seed-2026";

export async function POST(req: NextRequest) {
  // Guard: hanya dari localhost
  const host = req.headers.get("host") || "";
  if (!host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Guard: secret key
  if (req.headers.get("x-seed-key") !== SEED_KEY) {
    return NextResponse.json({ error: "Invalid seed key" }, { status: 401 });
  }

  try {
    // ── Periode aktif ──
    const period = await db.periods.findFirst({
      where: { status: "AKTIF" },
      select: { id: true, name: true },
    });
    if (!period) {
      return NextResponse.json({ error: "Tidak ada periode AKTIF. Buat periode dulu di Admin Panel." }, { status: 400 });
    }

    // ── Author (admin pertama) ──
    const author = await db.users.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, deleted_at: null },
      select: { id: true, name: true, email: true },
      orderBy: { created_at: "asc" },
    });
    if (!author) {
      return NextResponse.json({ error: "Tidak ada user admin. Login ke admin panel dulu." }, { status: 400 });
    }

    const results: string[] = [];
    results.push(`Periode: ${period.name}`);
    results.push(`Author: ${author.name} (${author.email})`);

    // ── 5 Berita Dummy ──
    const beritaDummy = [
      {
        title: "BEM FKIP UIKA Raih Penghargaan Organisasi Mahasiswa Terbaik 2026",
        slug: "bem-fkip-uika-raih-penghargaan-organisasi-terbaik-2026",
        excerpt: "BEM FKIP UIKA berhasil meraih penghargaan bergengsi sebagai Organisasi Mahasiswa Terbaik tingkat Universitas pada Dies Natalis UIKA ke-63.",
        body: "BEM FKIP UIKA kembali mencatat prestasi membanggakan di lingkungan Universitas Ibn Khaldun Bogor. Pada rangkaian acara Dies Natalis UIKA ke-63 yang digelar meriah di Gedung Serba Guna kampus, BEM FKIP UIKA dinobatkan sebagai Organisasi Mahasiswa Terbaik tingkat universitas.\n\nPenghargaan ini diberikan atas dasar penilaian komprehensif yang mencakup program kerja yang inovatif, tingkat partisipasi mahasiswa yang tinggi, transparansi pengelolaan organisasi, serta kontribusi nyata dalam pengembangan akademik dan kesejahteraan mahasiswa.\n\n\"Penghargaan ini adalah milik seluruh fungsionaris dan mahasiswa FKIP yang telah mendukung setiap langkah gerak kami,\" ujar Ketua Umum BEM FKIP UIKA dalam sambutannya.\n\nBeberapa program unggulan yang menjadi pertimbangan dewan juri antara lain program Bina Desa Edukasi, Advokasi UKT Transparan, dan FKIP Goes to School yang telah menjangkau lebih dari 500 siswa SMA di Bogor Raya.",
        category: "BERITA" as const,
        tags: ["penghargaan", "prestasi", "organisasi"],
        reading_time: 3,
        daysAgo: 2,
      },
      {
        title: "Hasil Kajian: Tantangan Mahasiswa FKIP di Era Kurikulum Merdeka",
        slug: "kajian-tantangan-mahasiswa-fkip-era-kurikulum-merdeka",
        excerpt: "Departemen KASTRAT merilis kajian mendalam tentang adaptasi mahasiswa keguruan terhadap implementasi Kurikulum Merdeka di sekolah mitra.",
        body: "Departemen Kajian Aksi dan Isu Strategis (KASTRAT) BEM FKIP UIKA merilis kajian terbaru bertajuk \"Tantangan Mahasiswa Keguruan dalam Implementasi Kurikulum Merdeka: Perspektif Calon Pendidik.\"\n\nKajian ini dilakukan selama dua bulan dengan melibatkan 120 responden dari berbagai program studi di FKIP UIKA, serta wawancara mendalam dengan 15 guru pamong dari sekolah mitra.\n\nTemuan utama kajian menunjukkan bahwa 68% mahasiswa merasa belum siap mengimplementasikan pendekatan pembelajaran berdiferensiasi yang menjadi inti Kurikulum Merdeka. Hambatan utama yang ditemukan antara lain:\n\n1. Kurangnya pemahaman mendalam tentang asesmen formatif berbasis proyek\n2. Keterbatasan referensi materi ajar yang relevan dan kontekstual\n3. Gap antara teori di kampus dengan realita di lapangan\n\nDepartemen KASTRAT merekomendasikan agar FKIP UIKA memperkuat konten Kurikulum Merdeka dalam mata kuliah Perencanaan Pembelajaran.",
        category: "KAJIAN" as const,
        tags: ["kajian", "kurikulum-merdeka", "pendidikan"],
        reading_time: 5,
        daysAgo: 4,
      },
      {
        title: "Pengumuman: Pendaftaran Program Magang Departemen FKIP Semester Ganjil 2026/2027",
        slug: "pendaftaran-magang-departemen-fkip-semester-ganjil-2026",
        excerpt: "BEM FKIP UIKA membuka pendaftaran program magang mahasiswa di berbagai departemen untuk mendukung pengembangan kompetensi non-akademik mahasiswa.",
        body: "BEM FKIP UIKA dengan bangga mengumumkan pembukaan pendaftaran Program Magang Mahasiswa Semester Ganjil 2026/2027.\n\nDEPARTEMEN YANG MEMBUKA PENERIMAAN MAGANG:\n- Dept. Komunikasi dan Informasi (KOMINFO) — 4 posisi\n- Dept. Sosial dan Agama (SOSGAM) — 3 posisi\n- Dept. Minat dan Bakat (MINBA) — 5 posisi\n- Dept. Kajian Aksi dan Isu Strategis (KASTRAT) — 3 posisi\n- Dept. Peningkatan Sumber Daya Mahasiswa (PSDM) — 4 posisi\n\nPERSYARATAN UMUM:\n- Mahasiswa aktif FKIP UIKA semester 2-6\n- IPK minimal 3.00\n- Bersedia mengikuti program selama 1 semester penuh\n\nPendaftaran dibuka mulai 20 Oktober - 5 November 2026.",
        category: "PENGUMUMAN" as const,
        tags: ["magang", "pendaftaran", "pengumuman"],
        reading_time: 3,
        daysAgo: 1,
      },
      {
        title: "BEM FKIP UIKA Gelar Aksi Advokasi Transparansi Biaya Kuliah Tunggal",
        slug: "aksi-advokasi-transparansi-biaya-kuliah-tunggal-2026",
        excerpt: "Ratusan mahasiswa FKIP UIKA bersama BEM menggelar aksi damai menuntut transparansi penghitungan BKT dan kemudahan akses keringanan UKT.",
        body: "Ratusan mahasiswa FKIP Universitas Ibn Khaldun Bogor turun ke lapangan dalam aksi damai yang dikoordinir BEM FKIP UIKA, Selasa (15/10/2026). Aksi ini dilatarbelakangi oleh aspirasi mahasiswa terkait kebijakan Biaya Kuliah Tunggal (BKT) yang dinilai kurang transparan.\n\nDalam aksi tersebut, massa membawa berbagai tuntutan:\n\n1. Transparansi rumusan perhitungan BKT per program studi\n2. Kemudahan dan percepatan proses pengajuan keringanan UKT\n3. Penambahan kuota keringanan UKT untuk mahasiswa kurang mampu\n4. Pembentukan tim pendamping advokasi UKT\n\nKoordinator lapangan menyampaikan bahwa aksi ini adalah bentuk advokasi terstruktur berdasarkan data aspirasi dari lebih dari 200 mahasiswa.\n\nPihak dekanat FKIP menyambut baik dan berkomitmen untuk menjadwalkan dialog terbuka dalam waktu dekat.",
        category: "BERITA" as const,
        tags: ["advokasi", "ukt", "bkt", "mahasiswa"],
        reading_time: 4,
        daysAgo: 3,
      },
      {
        title: "Delegasi FKIP UIKA Raih Juara 2 Lomba Debat Pendidikan Nasional 2026",
        slug: "delegasi-fkip-uika-juara-2-debat-pendidikan-nasional-2026",
        excerpt: "Tim debat yang difasilitasi BEM FKIP UIKA berhasil meraih Juara 2 dalam kompetisi debat pendidikan tingkat nasional yang diikuti 48 perguruan tinggi.",
        body: "Tim delegasi mahasiswa FKIP UIKA yang difasilitasi oleh BEM FKIP UIKA kembali mengharumkan nama almamater di kancah nasional. Dalam Kompetisi Debat Pendidikan Nasional (KDPN) 2026 di Universitas Pendidikan Indonesia, tim FKIP UIKA berhasil merebut posisi Runner-Up dari 48 tim peserta.\n\nTema besar kompetisi tahun ini adalah \"Masa Depan Pendidikan Indonesia: Antara Digitalisasi dan Karakter Bangsa.\" Tim FKIP UIKA terdiri dari Hana Azzahra, Reza Fauzan, dan Dini Rahmawati — semuanya mahasiswa angkatan 2024.\n\nSetelah melewati babak penyisihan, perempat final, dan semifinal, tim melaju ke grand final sebelum tumbang tipis menghadapi tim tuan rumah.\n\n\"Ini pengalaman luar biasa. Debat bukan sekadar berbicara, tapi tentang data, logika, dan keberanian,\" ujar Hana Azzahra.\n\nBEM FKIP UIKA berencana membentuk komunitas debat mahasiswa FKIP yang lebih terstruktur mulai November 2026.",
        category: "BERITA" as const,
        tags: ["debat", "prestasi", "nasional"],
        reading_time: 4,
        daysAgo: 5,
      },
    ];

    results.push("\n📰 Berita:");
    for (const berita of beritaDummy) {
      const publishedAt = new Date(Date.now() - berita.daysAgo * 24 * 60 * 60 * 1000);
      const existing = await db.contents.findFirst({ where: { slug: berita.slug } });
      if (existing) {
        await db.contents.update({
          where: { id: existing.id },
          data: { title: berita.title, excerpt: berita.excerpt, body: berita.body, category: berita.category, tags: berita.tags, reading_time: berita.reading_time, status: "TERBIT", published_at: publishedAt },
        });
        results.push(`  ✏️  Updated: ${berita.slug}`);
      } else {
        await db.contents.create({
          data: { title: berita.title, slug: berita.slug, excerpt: berita.excerpt, body: berita.body, category: berita.category, tags: berita.tags, reading_time: berita.reading_time, status: "TERBIT", published_at: publishedAt, author_id: author.id, period_id: period.id },
        });
        results.push(`  ✅ Created: ${berita.slug}`);
      }
    }

    // ── 5 Kegiatan Dummy ──
    const kegiatanDummy = [
      { name: "FKIP Leadership Camp 2026", slug: "fkip-leadership-camp-2026", description: "Program pengembangan kepemimpinan intensif 3 hari 2 malam untuk fungsionaris BEM FKIP dan mahasiswa terpilih. Mencakup materi manajemen organisasi, public speaking, dan team building berbasis alam.", location: "Bumi Perkemahan Sukabumi, Jawa Barat", start_time: new Date("2026-11-15T08:00:00+07:00"), end_time: new Date("2026-11-17T17:00:00+07:00"), registration_deadline: new Date("2026-11-10T23:59:00+07:00"), max_participants: 60, status: "TERBIT" as const, registration_status: "TERBUKA" as const },
      { name: "Seminar Nasional Pendidikan: Guru Digital di Era AI", slug: "seminar-nasional-guru-digital-era-ai-2026", description: "Seminar nasional tentang tantangan dan peluang guru Indonesia menghadapi kecerdasan buatan (AI) dalam dunia pendidikan. Menghadirkan pembicara dari Kemendikbud dan pakar teknologi pendidikan.", location: "Aula Gedung FKIP UIKA, Bogor", start_time: new Date("2026-11-22T08:30:00+07:00"), end_time: new Date("2026-11-22T16:00:00+07:00"), registration_deadline: new Date("2026-11-20T23:59:00+07:00"), max_participants: 300, status: "TERBIT" as const, registration_status: "TERBUKA" as const },
      { name: "Bakti Sosial Edukasi: FKIP Mengajar di Pelosok Bogor", slug: "bakti-sosial-fkip-mengajar-pelosok-bogor-2026", description: "Program pengabdian masyarakat berupa kegiatan mengajar dan bimbingan belajar gratis untuk siswa SD-SMP di wilayah terpencil Kabupaten Bogor. Dibuka untuk seluruh mahasiswa FKIP dan umum.", location: "Desa Cileungsi Kidul, Kabupaten Bogor", start_time: new Date("2026-12-06T07:00:00+07:00"), end_time: new Date("2026-12-07T17:00:00+07:00"), registration_deadline: new Date("2026-12-01T23:59:00+07:00"), max_participants: 80, status: "TERBIT" as const, registration_status: "TERBUKA" as const },
      { name: "Pelatihan Media Pembelajaran Berbasis Canva & AI", slug: "pelatihan-media-pembelajaran-canva-ai-2026", description: "Workshop intensif satu hari tentang pembuatan media pembelajaran digital menggunakan Canva, PowerPoint modern, dan tools AI generatif. Cocok untuk calon guru dan pendidik.", location: "Laboratorium Komputer FKIP UIKA Lantai 2", start_time: new Date("2026-11-08T09:00:00+07:00"), end_time: new Date("2026-11-08T15:00:00+07:00"), registration_deadline: new Date("2026-11-06T23:59:00+07:00"), max_participants: 40, status: "TERBIT" as const, registration_status: "SEGERA_DIBUKA" as const },
      { name: "FKIP Olympic 2026: Kompetisi Akademik & Seni Antar Prodi", slug: "fkip-olympic-2026-kompetisi-akademik-seni", description: "Ajang kompetisi tahunan antar program studi di FKIP UIKA: olimpiade sains pendidikan, debat, karya tulis ilmiah, seni tari, dan paduan suara. Terbuka untuk semua mahasiswa FKIP.", location: "Kampus UIKA Bogor (Multi Venue)", start_time: new Date("2026-12-13T08:00:00+07:00"), end_time: new Date("2026-12-14T20:00:00+07:00"), registration_deadline: new Date("2026-12-08T23:59:00+07:00"), max_participants: 500, status: "TERBIT" as const, registration_status: "SEGERA_DIBUKA" as const },
    ];

    results.push("\n📅 Kegiatan:");
    for (const kegiatan of kegiatanDummy) {
      const existing = await db.events.findFirst({ where: { slug: kegiatan.slug, deleted_at: null } });
      if (existing) {
        await db.events.update({ where: { id: existing.id }, data: { name: kegiatan.name, description: kegiatan.description, location: kegiatan.location, start_time: kegiatan.start_time, end_time: kegiatan.end_time, registration_deadline: kegiatan.registration_deadline, max_participants: kegiatan.max_participants, status: kegiatan.status, registration_status: kegiatan.registration_status } });
        results.push(`  ✏️  Updated: ${kegiatan.slug}`);
      } else {
        await db.events.create({ data: { name: kegiatan.name, slug: kegiatan.slug, description: kegiatan.description, location: kegiatan.location, start_time: kegiatan.start_time, end_time: kegiatan.end_time, registration_deadline: kegiatan.registration_deadline, max_participants: kegiatan.max_participants, status: kegiatan.status, registration_status: kegiatan.registration_status, created_by_user_id: author.id, period_id: period.id, registration_schema: [] } });
        results.push(`  ✅ Created: ${kegiatan.slug}`);
      }
    }

    results.push("\n✅ SEED SELESAI!");
    return NextResponse.json({ success: true, log: results.join("\n") });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
