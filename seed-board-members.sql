-- Insert Bendahara dan Sekretaris untuk board members
-- Board members dengan department_id NULL = pengurus inti BEM

DO $$
DECLARE
    active_period_id UUID;
BEGIN
    -- Get active period ID
    SELECT id INTO active_period_id FROM periods WHERE status = 'AKTIF' LIMIT 1;
    
    IF active_period_id IS NULL THEN
        RAISE EXCEPTION 'No active period found';
    END IF;
    
    -- Insert Sekretaris Umum (jika belum ada)
    INSERT INTO board_members (
        name, 
        position, 
        photo_url, 
        display_order, 
        department_id, 
        period_id, 
        user_id
    )
    SELECT 
        'Mutiara Suyatna',
        'Sekretaris Umum',
        NULL,
        3,
        NULL,
        active_period_id,
        NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM board_members 
        WHERE position = 'Sekretaris Umum' 
        AND period_id = active_period_id
        AND deleted_at IS NULL
    );
    
    -- Insert Bendahara Umum (jika belum ada)
    INSERT INTO board_members (
        name, 
        position, 
        photo_url, 
        display_order, 
        department_id, 
        period_id, 
        user_id
    )
    SELECT 
        'Muh. Faiz Alfarezi',
        'Bendahara Umum',
        NULL,
        4,
        NULL,
        active_period_id,
        NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM board_members 
        WHERE position = 'Bendahara Umum' 
        AND period_id = active_period_id
        AND deleted_at IS NULL
    );
    
    RAISE NOTICE 'Board members inserted successfully for period %', active_period_id;
END $$;
