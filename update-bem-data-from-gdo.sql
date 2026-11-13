-- Update data BEM FKIP sesuai dengan GDO (Grand Design Organisasi)
-- Berdasarkan file: mentahan/GDO BEM FKIP.md

-- 1. Update struktur kepengurusan inti (Gubernur, Wakil Gubernur, Sekretaris, Bendahara)
DO $$
DECLARE
    v_period_id UUID;
BEGIN
    -- Get active period ID
    SELECT id INTO v_period_id FROM periods WHERE status = 'AKTIF' LIMIT 1;
    
    -- Delete old board members data
    DELETE FROM board_members WHERE period_id = v_period_id;
    
    -- Insert struktur kepengurusan baru sesuai GDO
    -- Gubernur & Wakil Gubernur (data dari foto di GDO)
    INSERT INTO board_members (name, position, display_order, period_id, department_id)
    VALUES 
        ('Muhammad Julpi Ibrahim', 'Gubernur BEM', 1, v_period_id, NULL),
        ('Muhammad Panji Ramadhan', 'Wakil Gubernur BEM', 2, v_period_id, NULL);
    
    -- Sekretaris & Bendahara Umum (perlu diisi manual - tidak ada di GDO)
    INSERT INTO board_members (name, position, display_order, period_id, department_id)
    VALUES 
        ('Mutiara Suyatna', 'Sekretaris Umum', 3, v_period_id, NULL),
        ('Muh. Faiz Alfarezi', 'Bendahara Umum', 4, v_period_id, NULL);
    
    -- Sekretaris & Bendahara Internal (perlu diisi manual - tidak ada di GDO)
    INSERT INTO board_members (name, position, display_order, period_id, department_id)
    VALUES 
        ('[Nama Sekretaris Internal]', 'Sekretaris Internal', 5, v_period_id, NULL),
        ('[Nama Bendahara Internal]', 'Bendahara Internal', 6, v_period_id, NULL);
    
    RAISE NOTICE 'Board members updated successfully';
END $$;

-- 2. Update periode kepengurusan
UPDATE periods 
SET 
    name = 'Kabinet Altiora 2026-2027',
    tagline = 'Menyatukan Asa, Menggapai Altiora',
    logo_url = '/images/logo_bem.png'
WHERE status = 'AKTIF';

-- 3. Update atau insert departemen sesuai GDO
DO $$
DECLARE
    v_period_id UUID;
    v_dept_sosgam_id UUID;
    v_dept_minba_id UUID;
    v_dept_psdm_id UUID;
    v_dept_kominfo_id UUID;
    v_dept_kastrat_id UUID;
BEGIN
    SELECT id INTO v_period_id FROM periods WHERE status = 'AKTIF' LIMIT 1;
    
    -- Update/Insert Departemen Sosial dan Agama (SOSGAM)
    INSERT INTO departments (name, slug, description, period_id, display_order)
    VALUES (
        'Departemen Sosial dan Agama',
        'sosgam',
        'Bertanggung jawab atas pelaksanaan program kerja yang berkaitan dengan kepedulian sosial dan pengembangan spiritual keagamaan mahasiswa.',
        v_period_id,
        1
    )
    ON CONFLICT (slug, period_id) 
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO v_dept_sosgam_id;
    
    -- Update/Insert Departemen Minat dan Bakat (MINBA)
    INSERT INTO departments (name, slug, description, period_id, display_order)
    VALUES (
        'Departemen Minat dan Bakat',
        'minba',
        'Bertanggung jawab mewadahi dan mengembangkan minat serta bakat mahasiswa FKIP di bidang olahraga, seni, dan kreativitas.',
        v_period_id,
        2
    )
    ON CONFLICT (slug, period_id)
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO v_dept_minba_id;
    
    -- Update/Insert Departemen Peningkatan Sumber Daya Mahasiswa (PSDM)
    INSERT INTO departments (name, slug, description, period_id, display_order)
    VALUES (
        'Departemen Peningkatan Sumber Daya Mahasiswa',
        'psdm',
        'Bertanggung jawab atas peningkatan kualitas dan kapasitas sumber daya mahasiswa selama masa kepengurusan.',
        v_period_id,
        3
    )
    ON CONFLICT (slug, period_id)
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO v_dept_psdm_id;
    
    -- Update/Insert Departemen Komunikasi dan Informasi (KOMINFO)
    INSERT INTO departments (name, slug, description, period_id, display_order)
    VALUES (
        'Departemen Komunikasi dan Informasi',
        'kominfo',
        'Bertanggung jawab atas pengelolaan informasi dan publikasi seluruh kegiatan BEM baik keluar maupun keluar selama masa kepengurusan.',
        v_period_id,
        4
    )
    ON CONFLICT (slug, period_id)
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO v_dept_kominfo_id;
    
    -- Update/Insert Departemen Kajian Aksi dan Isu Strategis (KASTRAT)
    INSERT INTO departments (name, slug, description, period_id, display_order)
    VALUES (
        'Departemen Kajian Aksi dan Isu Strategis',
        'kastrat',
        'Bertanggung jawab melakukan kajian dan aksi strategis terhadap isu-isu pendidikan, kebijakan kampus, maupun sosial-politik yang relevan bagi mahasiswa.',
        v_period_id,
        5
    )
    ON CONFLICT (slug, period_id)
    DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description
    RETURNING id INTO v_dept_kastrat_id;
    
    RAISE NOTICE 'Departments updated successfully';
END $$;

-- 4. Update visi misi di about page atau metadata
-- (Ini bisa dilakukan via admin panel atau insert ke table khusus jika ada)

COMMIT;
