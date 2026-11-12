-- Script untuk mengisi data Program Kerja BEM FKIP ALTIORA 2026-2027
-- Berdasarkan dokumen DRAFT PROGRAM KERJA dan GDO BEM FKIP

-- Dapatkan period_id yang aktif
DO $$
DECLARE
    v_period_id UUID;
    v_dept_sekretaris UUID;
    v_dept_bendahara UUID;
    v_dept_sosgam UUID;
    v_dept_psdm UUID;
    v_dept_minba UUID;
    v_dept_kominfo UUID;
    v_dept_kastrat UUID;
BEGIN
    -- Ambil period aktif
    SELECT id INTO v_period_id FROM periods WHERE status = 'AKTIF' LIMIT 1;
    
    IF v_period_id IS NULL THEN
        RAISE EXCEPTION 'Tidak ada period yang aktif';
    END IF;

    -- Update VISI MISI Period jika belum diisi
    UPDATE periods 
    SET 
        visi = 'Manifestasi BEM FKIP UIKA sebagai organisasi yang Kolaboratif, Inovatif, Transparatif dan Adaptif dalam memberikan kebermanfaatan untuk KBM FKIP UIKA',
        misi = E'1. Mewujudkan tata kelola organisasi yang transparan, akuntabel dan profesional.\n2. Menguatkan kolaborasi dan sinergi antarmahasiswa.\n3. Menghadirkan program kerja yang inovatif dan relevan sesuai dengan kebutuhan mahasiswa.\n4. Membangun organisasi yang adaptif terhadap perkembangan dan tantangan zaman.\n5. Memberikan pelayanan, pengembangan dan kebermanfaatan yang nyata bagi KBM FKIP UIKA.'
    WHERE id = v_period_id;

    -- Cari atau buat departemen
    -- Sekretaris
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Sekretaris', 'sekretaris', 'Bertanggung jawab atas penyelenggaraan kegiatan kesekretariatan guna menunjang kelancaran organisasi', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_sekretaris;
    
    IF v_dept_sekretaris IS NULL THEN
        SELECT id INTO v_dept_sekretaris FROM departments WHERE period_id = v_period_id AND slug = 'sekretaris';
    END IF;

    -- Bendahara
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Bendahara', 'bendahara', 'Bertanggung jawab terhadap setiap pemasukan maupun pengeluaran uang atau biaya yang diperlukan untuk kepentingan BEM-FKIP', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_bendahara;
    
    IF v_dept_bendahara IS NULL THEN
        SELECT id INTO v_dept_bendahara FROM departments WHERE period_id = v_period_id AND slug = 'bendahara';
    END IF;

    -- Sosial dan Agama
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Sosial dan Agama', 'sosial-dan-agama', 'Bertanggung jawab atas pelaksanaan program kerja yang berkaitan dengan kepedulian sosial dan pengembangan spiritual keagamaan mahasiswa', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_sosgam;
    
    IF v_dept_sosgam IS NULL THEN
        SELECT id INTO v_dept_sosgam FROM departments WHERE period_id = v_period_id AND slug = 'sosial-dan-agama';
    END IF;

    -- Peningkatan Sumber Daya Mahasiswa
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Peningkatan Sumber Daya Mahasiswa', 'peningkatan-sumber-daya-mahasiswa', 'Bertanggung jawab atas peningkatan kualitas dan kapasitas sumber daya mahasiswa', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_psdm;
    
    IF v_dept_psdm IS NULL THEN
        SELECT id INTO v_dept_psdm FROM departments WHERE period_id = v_period_id AND slug = 'peningkatan-sumber-daya-mahasiswa';
    END IF;

    -- Minat dan Bakat
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Minat dan Bakat', 'minat-dan-bakat', 'Bertanggung jawab mewadahi dan mengembangkan minat serta bakat mahasiswa FKIP di bidang olahraga, seni, dan kreativitas', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_minba;
    
    IF v_dept_minba IS NULL THEN
        SELECT id INTO v_dept_minba FROM departments WHERE period_id = v_period_id AND slug = 'minat-dan-bakat';
    END IF;

    -- Komunikasi dan Informasi
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Komunikasi dan Informasi', 'komunikasi-dan-informasi', 'Bertanggung jawab atas pengelolaan informasi dan publikasi seluruh kegiatan BEM baik keluar maupun keluar', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_kominfo;
    
    IF v_dept_kominfo IS NULL THEN
        SELECT id INTO v_dept_kominfo FROM departments WHERE period_id = v_period_id AND slug = 'komunikasi-dan-informasi';
    END IF;

    -- Kajian Isu dan Aksi Strategis
    INSERT INTO departments (name, slug, description, period_id)
    VALUES ('Kajian Isu dan Aksi Strategis', 'kajian-isu-dan-aksi-strategis', 'Bertanggung jawab melakukan kajian dan aksi strategis terhadap isu-isu pendidikan, kebijakan kampus, maupun sosial-politik yang relevan bagi mahasiswa', v_period_id)
    ON CONFLICT (period_id, slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_kastrat;
    
    IF v_dept_kastrat IS NULL THEN
        SELECT id INTO v_dept_kastrat FROM departments WHERE period_id = v_period_id AND slug = 'kajian-isu-dan-aksi-strategis';
    END IF;

    -- ============================================
    -- INSERT PROGRAM KERJA SEKRETARIS
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Rapat Mingguan Pengurus Inti', 'rapat-mingguan-pengurus-inti', 
     'Rapat rutin pengurus inti yang dilaksanakan untuk membahas perkembangan kegiatan organisasi, menyampaikan informasi, serta mengoordinasikan tugas dan kebutuhan setiap pengurus.',
     'Setiap hari Jumat atau sesuai kesepakatan', 
     'Menjaga komunikasi dan koordinasi antar pengurus inti, memantau perkembangan kegiatan dan tugas kepengurusan',
     'BERJALAN', 1, v_dept_sekretaris, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Rapat Triwulan: Evaluasi dan Strategi Organisasi', 'rapat-triwulan-evaluasi-dan-strategi-organisasi',
     'Rapat evaluasi yang dilaksanakan setiap tiga bulan untuk meninjau perkembangan kepengurusan, mengevaluasi pelaksanaan program kerja, serta menyusun rencana kegiatan pada periode berikutnya.',
     'Triwulan I: November, Triwulan II: Februari, Triwulan III: Mei',
     'Mengevaluasi pelaksanaan program kerja dan kinerja kepengurusan',
     'BERJALAN', 2, v_dept_sekretaris, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Monitoring, Evaluasi, dan Tindak Lanjut Program Kerja', 'monitoring-evaluasi-dan-tindak-lanjut-program-kerja',
     'Kegiatan pemantauan dan evaluasi terhadap pelaksanaan program kerja serta keterlibatan anggota dalam kepengurusan.',
     'Setiap akhir program kerja',
     'Mengetahui perkembangan dan ketercapaian program kerja serta mengevaluasi keterlibatan dan kinerja anggota',
     'BERJALAN', 3, v_dept_sekretaris, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Digitalisasi dan Pengelolaan Arsip Administrasi', 'digitalisasi-dan-pengelolaan-arsip-administrasi',
     'Pengelolaan dan penyimpanan dokumen administrasi BEM secara digital agar arsip organisasi tersusun dengan rapi, mudah diakses, dan tersimpan dengan aman.',
     'Selama satu periode kepengurusan',
     'Menata dan mengelola arsip organisasi secara lebih rapi dan terstruktur',
     'BERJALAN', 4, v_dept_sekretaris, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA BENDAHARA
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('BEM Finance System', 'bem-finance-system',
     'Sistem pengelolaan keuangan BEM berbasis digital yang mencakup pencatatan pemasukan dan pengeluaran, pengarsipan bukti transaksi, serta pelaporan keuangan secara terstruktur yang dapat diakses oleh pengurus inti.',
     'Selama periode masa jabatan',
     'Mewujudkan pengelolaan keuangan BEM yang tertib, transparan, akuntabel, dan terintegrasi melalui sistem digital',
     'BERJALAN', 1, v_dept_bendahara, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Finance Clinic', 'finance-clinic',
     'Program pendampingan dan konsultasi keuangan bagi pengurus BEM dalam penyusunan RAB, pengelolaan anggaran, dan pencatatan transaksi, guna mewujudkan pengelolaan keuangan setiap kegiatan yang lebih tertib dan transparan.',
     'Menyesuaikan',
     'Memastikan RAB yang disusun setiap divisi realistis dan sesuai kebutuhan',
     'BERJALAN', 2, v_dept_bendahara, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA SOSIAL DAN AGAMA
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('LENTERA FKIP QURANI', 'lentera-fkip-qurani',
     'Kegiatan yang bertujuan untuk mengetahui, mengevaluasi, dan meningkatkan kemampuan mahasiswa dalam membaca Al-Quran serta memahami dasar-dasar tajwid.',
     '13 November 2026',
     'Meningkatkan kemampuan mahasiswa dalam membaca Al-Quran dengan baik dan benar',
     'BELUM_MULAI', 1, v_dept_sosgam, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('JEJAK BERKAH RAMADAN', 'jejak-berkah-ramadan',
     'Program kegiatan sosial yang dilaksanakan pada bulan Ramadan sebagai bentuk kepedulian dan semangat berbagi kepada sesama. Kegiatan dapat berupa berbagi takjil, santunan kepada anak yatim atau duafa.',
     '05 Maret 2027',
     'Menumbuhkan rasa empati, kepedulian, dan solidaritas mahasiswa',
     'BELUM_MULAI', 2, v_dept_sosgam, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('MAJLIS FIKRAH', 'majlis-fikrah',
     'Kegiatan kajian dan sharing Islami yang menghadirkan pemateri dengan tema yang beragam dan relevan dengan kehidupan mahasiswa.',
     'Dilaksanakan 4 kali dalam satu periode (mulai 25 Desember 2026)',
     'Menambah wawasan keislaman dan mendorong mahasiswa menerapkan ilmu dalam kehidupan sehari-hari',
     'BELUM_MULAI', 3, v_dept_sosgam, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('RUANG BERBAGI', 'ruang-berbagi',
     'Program sosial yang menjadi wadah untuk memberikan bantuan kepada mahasiswa maupun masyarakat yang mengalami sakit, musibah, bencana, atau kondisi tertentu yang membutuhkan dukungan.',
     'Tentatif, sesuai kebutuhan',
     'Menumbuhkan kepedulian dan solidaritas mahasiswa',
     'BERJALAN', 4, v_dept_sosgam, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA PSDM
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('LKMM (Latihan Kepemimpinan Manajemen Mahasiswa)', 'lkmm',
     'Program pelatihan yang dirancang untuk membekali mahasiswa dengan keterampilan kepemimpinan dan manajemen organisasi secara terstruktur. Menggabungkan materi teori, diskusi, simulasi, dan praktik langsung.',
     '19-21 Desember 2026',
     'Membekali mahasiswa dengan keterampilan kepemimpinan, manajemen organisasi, komunikasi, dan kerja sama tim',
     'BELUM_MULAI', 1, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('UPGRADING', 'upgrading',
     'Program yang bertujuan meningkatkan wawasan, keterampilan, dan kapasitas anggota organisasi melalui pembekalan materi, pelatihan, serta kegiatan interaktif.',
     '07-08 November 2026',
     'Meningkatkan kualitas sumber daya anggota dan membangun semangat berorganisasi',
     'SELESAI', 2, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('PSDM MENGAJAR - Berbagi Ilmu, Tumbuhkan Inspirasi', 'psdm-mengajar',
     'Kegiatan volunteer mahasiswa Fakultas Keguruan untuk memberikan pendampingan belajar kepada masyarakat melalui kegiatan literasi, numerasi, kreativitas, dan permainan edukatif.',
     '25 Oktober 2026 dan 02 Mei 2027',
     'Meningkatkan kepedulian sosial mahasiswa dan mengembangkan kemampuan mengajar',
     'BERJALAN', 3, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('CRITICAL MIND LAB (Work-Cafe & Masterclass)', 'critical-mind-lab',
     'Workshop interaktif dengan konsep Work-Café & Live Case Clinic. Menggunakan komposisi 30% materi dan 70% praktik untuk melatih kemampuan berpikir kritis dan problem solving.',
     '29 Januari 2027, 18 April 2027',
     'Melatih kemampuan mahasiswa dalam berpikir kritis, menganalisis isu, dan menyusun argumentasi',
     'BELUM_MULAI', 4, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('PathWays Together to The Industry', 'pathways-together-to-the-industry',
     'Program kunjungan ke perusahaan dari beragam bidang atau sektor industry bersama mahasiswa FKIP UIKA untuk mengenal dan mengetahui aktivitas di dunia kerja profesional.',
     'Januari (Tentatif)',
     'Membuka pilihan karier baru dan memperkenalkan mahasiswa ke dunia kerja',
     'BELUM_MULAI', 5, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Internship BEM FKIP', 'internship-bem-fkip',
     'Program magang bagi mahasiswa untuk ikut serta secara langsung dalam kepengurusan dan aktivitas organisasi BEM FKIP selama jangka waktu 3 bulan.',
     'Tentatif',
     'Memberikan wadah bagi mahasiswa untuk mengenal dan merasakan langsung dinamika berorganisasi',
     'BELUM_MULAI', 6, v_dept_psdm, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA MINAT DAN BAKAT
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Workshop Kreativitas dan Pengembangan Diri', 'workshop-kreativitas-dan-pengembangan-diri',
     'Kegiatan workshop yang berfokus pada pengembangan kreativitas, kemampuan, dan potensi mahasiswa UIKA dengan mengundang pemateri yang profesional.',
     'Jangka Pendek',
     'Meningkatkan kreativitas, keterampilan, serta kemampuan mahasiswa dalam mengembangkan potensi diri',
     'BELUM_MULAI', 1, v_dept_minba, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Smash Day 2026', 'smash-day-2026',
     'Kegiatan olahraga bulu tangkis yang menjadi wadah bagi mahasiswa FKIP UIKA untuk menyalurkan minat dan bakat. Dikemas dengan konsep fun badminton yang mengutamakan keseruan dan kebersamaan.',
     'Jangka Panjang (Rutin setiap minggu)',
     'Menjadi wadah penyaluran minat dan bakat olahraga serta meningkatkan sportivitas',
     'BERJALAN', 2, v_dept_minba, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('FKIP Interculture', 'fkip-interculture',
     'Kegiatan seni dan budaya yang menampilkan keberagaman budaya berlingkup internasional. Setiap program studi mengirimkan perwakilan untuk menampilkan representasi budaya negara tertentu.',
     'Jangka Pendek',
     'Meningkatkan apresiasi mahasiswa terhadap keberagaman budaya',
     'BELUM_MULAI', 3, v_dept_minba, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('FKIP Inspire Festival', 'fkip-inspire-festival',
     'Kegiatan perlombaan yang menjadi wadah bagi mahasiswa dan pelajar untuk mengembangkan serta menyalurkan kemampuan di berbagai bidang.',
     'Jangka Menengah',
     'Menjadi wadah kompetisi dan pengembangan minat bakat serta memperluas relasi',
     'BELUM_MULAI', 4, v_dept_minba, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA KOMINFO
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('Tanya-Tanya FKIP', 'tanya-tanya-fkip',
     'Program wawancara singkat bersama mahasiswa FKIP yang mengangkat berbagai topik ringan dan menarik seputar lifestyle, tren, quotes, pertanyaan random, kehidupan kampus, hingga opini mahasiswa.',
     '1-2 kali seminggu',
     'Menghasilkan konten interaktif yang menghibur sekaligus menampilkan perspektif mahasiswa FKIP',
     'BERJALAN', 1, v_dept_kominfo, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('BEMPERS', 'bempers',
     'Program pengelolaan dan penataan mading BEM sebagai media informasi sekaligus wadah kreativitas mahasiswa. Konten diperbarui secara berkala.',
     'Rutin 1 bulan sekali',
     'Menyediakan media informasi yang menarik sekaligus menjadi wadah kreativitas mahasiswa',
     'BERJALAN', 2, v_dept_kominfo, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('BEM FKIPEDIA', 'bem-fkipedia',
     'Program pengelolaan website sebagai media publikasi dan informasi BEM FKIP yang menyoroti berbagai kegiatan, program kerja, pencapaian, dan kontribusi BEM FKIP.',
     'Berkelanjutan',
     'Meningkatkan publikasi dan penyebaran informasi mengenai BEM FKIP',
     'BERJALAN', 3, v_dept_kominfo, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('BEMEDACTION (BEM Media Action)', 'bemedaction',
     'Program pusat pengelolaan media informasi dan komunikasi BEM FKIP yang mencakup penyediaan desain, publikasi, dokumentasi kegiatan, dan pengelolaan media sosial.',
     'Sepanjang periode kepengurusan',
     'Mendukung kebutuhan media, publikasi, dokumentasi, dan pengelolaan informasi BEM FKIP',
     'BERJALAN', 4, v_dept_kominfo, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    -- ============================================
    -- INSERT PROGRAM KERJA KASTRAT
    -- ============================================
    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('NALAR FKIP', 'nalar-fkip',
     'Forum diskusi intelektual yang dilaksanakan secara berkala setiap dua minggu sekali sebagai ruang bagi mahasiswa FKIP untuk membangun nalar kritis melalui kegiatan kajian isu, bedah buku, diskusi tematik, maupun pembahasan fenomena pendidikan dan sosial.',
     'Setiap 2 minggu sekali di hari Rabu',
     'Membangun budaya berpikir kritis dan reflektif di kalangan mahasiswa FKIP',
     'BERJALAN', 1, v_dept_kastrat, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('KASTRAT RESEARCH', 'kastrat-research',
     'Program pengembangan intelektual mahasiswa melalui proses identifikasi isu, pengumpulan data, analisis, dan penulisan karya ilmiah yang mengangkat berbagai persoalan pendidikan dan kehidupan mahasiswa.',
     'Selama satu periode kepengurusan',
     'Meningkatkan kemampuan mahasiswa dalam melakukan penelitian dan penulisan ilmiah',
     'BERJALAN', 2, v_dept_kastrat, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    INSERT INTO work_programs (name, slug, description, target_time, success_indicator, status, display_order, department_id, period_id)
    VALUES 
    ('FKIP Education Forum', 'fkip-education-forum',
     'Forum akademik yang membahas isu-isu strategis dan aktual dalam bidang pendidikan melalui seminar, diskusi panel, atau talkshow. Menghadirkan pimpinan fakultas, akademisi, praktisi pendidikan sebagai narasumber.',
     '1 kali dalam satu periode kepengurusan',
     'Meningkatkan wawasan mahasiswa terhadap isu strategis dalam dunia pendidikan',
     'BELUM_MULAI', 3, v_dept_kastrat, v_period_id)
    ON CONFLICT (period_id, department_id, name) DO UPDATE 
    SET description = EXCLUDED.description, target_time = EXCLUDED.target_time;

    RAISE NOTICE 'Data program kerja berhasil dimasukkan untuk period_id: %', v_period_id;
END $$;
