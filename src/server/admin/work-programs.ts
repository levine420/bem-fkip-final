import "server-only";
import type { Prisma } from "@prisma/client";
import { adminMutation, adminRead } from "./auth";
import { audit } from "./audit";
import { AdminError } from "@/lib/admin/errors";
import { departmentScope } from "@/lib/admin/policy";
import { pagination, uuid, textField, integer } from "@/lib/admin/validation";
import { generateSlug } from "@/lib/admin/slug";

const workProgramSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  target_time: true,
  success_indicator: true,
  progress_notes: true,
  status: true,
  display_order: true,
  department_id: true,
  period_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  department: { select: { id: true, name: true, slug: true } },
  period: { select: { id: true, name: true } },
} as const;

export async function listWorkPrograms(params: URLSearchParams) {
  const { q, take, skip, page } = pagination(params);
  const status = params.get("status");
  const department_id = params.get("department_id");

  return adminRead(async (tx, actor) => {
    await ensureDefaultWorkPrograms(tx);

    const scope = departmentScope(actor);

    const where: Prisma.work_programsWhereInput = {
      deleted_at: null,
      ...(actor.role === "ADMIN" ? { department_id: scope.department_id, period_id: scope.period_id } : {}),
      ...(status ? { status: status as any } : {}),
      ...(department_id && actor.role === "SUPER_ADMIN" ? { department_id: uuid(department_id) } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
    };

    const [items, total] = await Promise.all([
      tx.work_programs.findMany({
        where,
        select: workProgramSelect,
        take,
        skip,
        orderBy: [{ display_order: "asc" }, { created_at: "desc" }, { id: "asc" }],
      }),
      tx.work_programs.count({ where }),
    ]);

    return { items, total, page, page_size: take };
  });
}

export async function createWorkProgram(request: Request, input: {
  name: string;
  description: string;
  target_time?: string;
  success_indicator?: string;
  progress_notes?: string;
  status?: string;
  display_order?: number;
  department_id?: string;
}) {
  return adminMutation(request, async (tx, actor) => {
    const scope = departmentScope(actor);
    const name = textField(input.name, "name", 1, 150);
    const description = textField(input.description, "description", 1, 500);
    const target_time = input.target_time ? textField(input.target_time, "target_time", 0, 150) : null;
    const success_indicator = input.success_indicator ? textField(input.success_indicator, "success_indicator", 0, 300) : null;
    const progress_notes = input.progress_notes ? textField(input.progress_notes, "progress_notes", 0, 2000) : null;
    const status = (input.status || "BELUM_MULAI") as any;
    const display_order = input.display_order !== undefined ? integer(input.display_order, "display_order", 0, 1000) : 0;

    const activePeriod = await tx.periods.findFirst({ where: { status: "AKTIF" }, select: { id: true } });
    const period_id = actor.role === "ADMIN" && scope.period_id ? scope.period_id : (activePeriod?.id ?? "");

    if (!period_id) {
      throw new AdminError(400, "NO_ACTIVE_PERIOD", "Tidak ada periode aktif.");
    }

    const deptId = actor.role === "ADMIN" ? scope.department_id : (input.department_id ? uuid(input.department_id) : null);
    const slug = generateSlug(name) + "-" + Date.now().toString(36);

    const program = await tx.work_programs.create({
      data: {
        name,
        slug,
        description,
        target_time,
        success_indicator,
        progress_notes,
        status,
        display_order,
        department_id: deptId,
        period_id,
      },
      select: workProgramSelect,
    });

    await audit(tx, actor.id, "WORK_PROGRAM_CREATE", "work_programs", program.id, { name: program.name });
    return program;
  });
}

export async function updateWorkProgram(request: Request, id: string, input: {
  name?: string;
  description?: string;
  target_time?: string;
  success_indicator?: string;
  progress_notes?: string;
  status?: string;
  display_order?: number;
}) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.work_programs.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Program kerja tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat mengubah program kerja departemen lain.");
      }
    }

    const updates: Prisma.work_programsUpdateInput = {};
    if (input.name !== undefined) updates.name = textField(input.name, "name", 1, 150);
    if (input.description !== undefined) updates.description = textField(input.description, "description", 1, 500);
    if (input.target_time !== undefined) updates.target_time = input.target_time ? textField(input.target_time, "target_time", 0, 150) : null;
    if (input.success_indicator !== undefined) updates.success_indicator = input.success_indicator ? textField(input.success_indicator, "success_indicator", 0, 300) : null;
    if (input.progress_notes !== undefined) updates.progress_notes = input.progress_notes ? textField(input.progress_notes, "progress_notes", 0, 2000) : null;
    if (input.status !== undefined) updates.status = input.status as any;
    if (input.display_order !== undefined) updates.display_order = integer(input.display_order, "display_order", 0, 1000);

    const program = await tx.work_programs.update({
      where: { id: uuid(id) },
      data: updates,
      select: workProgramSelect,
    });

    await audit(tx, actor.id, "WORK_PROGRAM_UPDATE", "work_programs", program.id, { name: program.name });
    return program;
  });
}

export async function deleteWorkProgram(request: Request, id: string) {
  return adminMutation(request, async (tx, actor) => {
    const existing = await tx.work_programs.findFirst({
      where: { id: uuid(id), deleted_at: null },
      select: { id: true, department_id: true, name: true },
    });

    if (!existing) {
      throw new AdminError(404, "NOT_FOUND", "Program kerja tidak ditemukan.");
    }

    if (actor.role === "ADMIN") {
      const scope = departmentScope(actor);
      if (existing.department_id !== scope.department_id) {
        throw new AdminError(403, "FORBIDDEN", "Tidak dapat menghapus program kerja departemen lain.");
      }
    }

    await tx.work_programs.update({
      where: { id: uuid(id) },
      data: { deleted_at: new Date() },
    });

    await audit(tx, actor.id, "WORK_PROGRAM_DELETE", "work_programs", id, { name: existing.name });
    return { success: true };
  });
}

export const INITIAL_WORK_PROGRAMS = [
  // PSDM
  {
    name: "LKMM (Latihan Kepemimpinan Manajemen Mahasiswa)",
    slug: "lkmm-2026",
    description: "Program pelatihan terstruktur yang merancang pembekalan keterampilan kepemimpinan, manajemen organisasi, komunikasi efektif, pengelolaan sumber daya, hingga penyelesaian masalah.",
    target_time: "19 – 21 Desember 2026",
    success_indicator: "Seluruh Mahasiswa FKIP UIKA",
    status: "BELUM_MULAI",
    order: 1,
    deptSlug: "psdm",
  },
  {
    name: "PSDM MENGAJAR — Berbagi Ilmu, Tumbuhkan Inspirasi",
    slug: "psdm-mengajar-2026",
    description: "Kegiatan volunteer mahasiswa Fakultas Keguruan untuk memberikan pendampingan belajar kepada masyarakat melalui kegiatan literasi, numerasi, kreativitas, dan permainan edukatif.",
    target_time: "25 Oktober 2026 & 02 Mei 2027",
    success_indicator: "Mahasiswa FKIP (Volunteer) & Anak-anak/Masyarakat",
    status: "BELUM_MULAI",
    order: 2,
    deptSlug: "psdm",
  },
  {
    name: "CRITICAL MIND LAB (Work-Cafe & Masterclass)",
    slug: "critical-mind-lab-2026",
    description: "Workshop interaktif secara berkala berkonsep Work-Café & Live Case Clinic (30% teori, 70% praktik) untuk mengkaji isu, menyusun opini berbasis data, dan melatih nalar kritis.",
    target_time: "29 Januari 2026 & 18 April 2027",
    success_indicator: "Mahasiswa Kampus (Umum Lintas Jurusan) & Fungsionaris BEM",
    status: "BERJALAN",
    order: 3,
    deptSlug: "psdm",
  },

  // MINBA
  {
    name: "FKIP Edufest",
    slug: "fkip-edufest-2026",
    description: "Kegiatan perlombaan skala mahasiswa dan pelajar sekolah sebagai wadah kompetisi dan pengembangan minat bakat di berbagai bidang (seperti lomba Matematika & debat Inggris).",
    target_time: "Jangka Menengah (2026–2027)",
    success_indicator: "Mahasiswa FKIP/UIKA & Pelajar Tingkat Sekolah",
    status: "BELUM_MULAI",
    order: 4,
    deptSlug: "minba",
  },
  {
    name: "FKIP Culture",
    slug: "fkip-culture-2026",
    description: "Kegiatan seni dan budaya yang menampilkan keberagaman budaya dari berbagai negara/daerah. Pertunjukan seni, pakaian adat, tarian, dan stan kreatif via kolaborasi eksternal.",
    target_time: "Jangka Pendek (2026–2027)",
    success_indicator: "Seluruh Mahasiswa FKIP & Publik",
    status: "BELUM_MULAI",
    order: 5,
    deptSlug: "minba",
  },
  {
    name: "FKIP Sport Day",
    slug: "fkip-sport-day-2026",
    description: "Kegiatan olahraga rutin mingguan/dwimingguan sebagai wadah menyalurkan minat bakat olahraga mahasiswa FKIP, latihan terstruktur, dan mini kompetisi antar prodi.",
    target_time: "Jangka Panjang (Rutin Mingguan)",
    success_indicator: "Seluruh Mahasiswa FKIP UIKA",
    status: "BERJALAN",
    order: 6,
    deptSlug: "minba",
  },
  {
    name: "Workshop Kreativitas & Pengembangan Diri",
    slug: "workshop-kreativitas-2026",
    description: "Workshop pengembangan kreativitas dan potensi mahasiswa UIKA berkolaborasi dengan mahasiswa Teknologi Pendidikan sebagai pemateri (pembuatan media & animasi edukasi).",
    target_time: "Jangka Pendek (2026–2027)",
    success_indicator: "Seluruh Mahasiswa FKIP UIKA",
    status: "BELUM_MULAI",
    order: 7,
    deptSlug: "minba",
  },

  // KASTRAT
  {
    name: "FKIP Education Forum — Forum Kajian Pendidikan & Kebijakan",
    slug: "fkip-education-forum-2026",
    description: "Forum akademik strategis membahas isu kebijakan pendidikan nasional via seminar dan talkshow dengan menghadirkan pimpinan fakultas, akademisi, praktisi pendidikan, dan tokoh publik.",
    target_time: "1 Kali Per Periode",
    success_indicator: "Mahasiswa FKIP/UIKA, Dosen, Akademisi, Praktisi & Umum",
    status: "BELUM_MULAI",
    order: 8,
    deptSlug: "kastrat",
  },
  {
    name: "NALAR FKIP",
    slug: "nalar-fkip-2026",
    description: "Forum diskusi intelektual berkala setiap dua minggu sekali (hari Rabu) sebagai wadah nalar kritis mahasiswa melalui kajian isu, bedah buku, dan diseminasi publikasi infografis.",
    target_time: "Setiap 2 Minggu (Hari Rabu)",
    success_indicator: "Seluruh Mahasiswa FKIP UIKA",
    status: "BERJALAN",
    order: 9,
    deptSlug: "kastrat",
  },
  {
    name: "KASTRAT RESEARCH (Ruang Riset Pendidikan)",
    slug: "kastrat-research-2026",
    description: "Program riset intelektual mahasiswa melalui analisis isu pendidikan dan penulisan karya ilmiah yang dipublikasikan pada jurnal, seminar, dan media publikasi akademik.",
    target_time: "Sepanjang Periode Kepengurusan",
    success_indicator: "Mahasiswa FKIP UIKA Bogor",
    status: "BERJALAN",
    order: 10,
    deptSlug: "kastrat",
  },

  // SOSGAM
  {
    name: "JEJAK BERKAH RAMADAN",
    slug: "jejak-berkah-ramadan-2027",
    description: "Program sosial kepedulian masyarakat di bulan Ramadan berupa pembagian takjil, santunan anak yatim & duafa, serta aksi solidaritas sosial bersama masyarakat.",
    target_time: "05 Maret 2027 (Ramadan)",
    success_indicator: "Mahasiswa UIKA & Masyarakat yang Membutuhkan",
    status: "BELUM_MULAI",
    order: 11,
    deptSlug: "sosgam",
  },
  {
    name: "RUANG BERBAGI",
    slug: "ruang-berbagi-2026",
    description: "Program aksi sosial dan tanggap bencana sebagai wadah kepedulian mahasiswa untuk membantu mahasiswa maupun masyarakat yang tertimpa sakit, musibah, atau kondisi darurat.",
    target_time: "Tentatif (Kondisional)",
    success_indicator: "Mahasiswa FKIP & Masyarakat Membutuhkan",
    status: "BERJALAN",
    order: 12,
    deptSlug: "sosgam",
  },
  {
    name: "MAJLIS FIKRAH",
    slug: "majlis-fikrah-2026",
    description: "Kajian dan sharing Islami interaktif berkala (4 bulan sekali) yang menghadirkan pemateri inspiratif dengan topik-topik keislaman yang relevan bagi mahasiswa.",
    target_time: "25 Desember 2026 & Berkala",
    success_indicator: "Mahasiswa Universitas Ibn Khaldun Bogor",
    status: "BELUM_MULAI",
    order: 13,
    deptSlug: "sosgam",
  },
  {
    name: "LENTERA FKIP QUR'ANI",
    slug: "lentera-fkip-qurani-2026",
    description: "Program bimbingan dan evaluasi kemampuan membaca Al-Qur'an serta dasar-dasar tajwid bagi mahasiswa untuk membentuk karakter religius dan berintegritas.",
    target_time: "13 November 2026",
    success_indicator: "Mahasiswa FKIP UIKA",
    status: "BELUM_MULAI",
    order: 14,
    deptSlug: "sosgam",
  },

  // KOMINFO
  {
    name: "BEM FKIPEDIA",
    slug: "bem-fkipedia-2026",
    description: "Pengelolaan platform portal website resmi BEM FKIP UIKA sebagai media publikasi terpadu seputar kegiatan, beasiswa, informasi akademik, dan program kerja yang dapat diakses mahasiswa & umum.",
    target_time: "Sepanjang Periode",
    success_indicator: "Mahasiswa, Civitas Akademika, Calon Mahasiswa & Umum",
    status: "BERJALAN",
    order: 15,
    deptSlug: "kominfo",
  },
  {
    name: "Tanya-Tanya FKIP",
    slug: "tanya-tanya-fkip-2026",
    description: "Program wawancara singkat dan kreatif bersama mahasiswa FKIP yang mengangkat topik seputar lifestyle, tren, opini kampus, hingga isu hangat yang dikemas secara santai di media sosial.",
    target_time: "1–2 Kali Dalam Seminggu",
    success_indicator: "Mahasiswa FKIP & Pengguna Media Sosial",
    status: "BERJALAN",
    order: 16,
    deptSlug: "kominfo",
  },
  {
    name: "BEMEDACTION (BEM Media Action)",
    slug: "bemedaction-2026",
    description: "Pusat pengelolaan media informasi dan komunikasi BEM FKIP yang mencakup penyediaan desain grafis, publikasi kegiatan, peringatan hari besar, dokumentasi foto/video, dan pengarsipan media digital.",
    target_time: "Sepanjang Periode Kepengurusan",
    success_indicator: "BEM FKIP, Mahasiswa FKIP & Masyarakat Umum",
    status: "BERJALAN",
    order: 17,
    deptSlug: "kominfo",
  },
];

export async function ensureDefaultWorkPrograms(tx: any) {
  try {
    const period = await tx.periods.findFirst({ where: { status: "AKTIF" } });
    if (!period) return;

    const deptMap: Record<string, string> = {};
    const depts = [
      { name: "Sosial dan Agama (SOSGAM)", slug: "sosgam", description: "Bertanggung jawab atas program kepedulian sosial dan pengembangan spiritual keagamaan mahasiswa." },
      { name: "Minat dan Bakat (MINBA)", slug: "minba", description: "Mewadahi dan mengembangkan minat serta bakat mahasiswa FKIP di bidang olahraga, seni, dan kreativitas." },
      { name: "Peningkatan Sumber Daya Mahasiswa (PSDM)", slug: "psdm", description: "Bertanggung jawab atas peningkatan kualitas dan kapasitas sumber daya mahasiswa melalui pelatihan." },
      { name: "Komunikasi dan Informasi (KOMINFO)", slug: "kominfo", description: "Bertanggung jawab atas pengelolaan informasi dan publikasi seluruh kegiatan BEM." },
      { name: "Kajian Aksi dan Isu Strategis (KASTRAT)", slug: "kastrat", description: "Melakukan kajian dan aksi strategis terhadap isu-isu pendidikan dan kebijakan kampus." },
    ];

    for (const d of depts) {
      let dept = await tx.departments.findFirst({ where: { period_id: period.id, slug: d.slug } });
      if (!dept) {
        dept = await tx.departments.create({
          data: { name: d.name, slug: d.slug, description: d.description, period_id: period.id },
        });
      }
      deptMap[d.slug] = dept.id;
    }

    const hasInitial = await tx.work_programs.findFirst({ where: { period_id: period.id, slug: "lkmm-2026" } });
    if (hasInitial) return;

    for (const p of INITIAL_WORK_PROGRAMS) {
      const deptId = deptMap[p.deptSlug];
      const existing = await tx.work_programs.findFirst({ where: { period_id: period.id, slug: p.slug } });
      if (!existing) {
        await tx.work_programs.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            target_time: p.target_time,
            success_indicator: p.success_indicator,
            status: p.status as any,
            display_order: p.order,
            department_id: deptId,
            period_id: period.id,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Auto sync work_programs failed:", err);
  }
}
