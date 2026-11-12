-- Quick insert board members via Supabase SQL Editor
-- Jalankan query ini di: Supabase Dashboard > SQL Editor

DO $$
DECLARE
    v_period_id UUID;
BEGIN
    -- Get active period ID
    SELECT id INTO v_period_id FROM periods WHERE status = 'AKTIF' LIMIT 1;
    
    -- Insert Sekretaris Umum
    INSERT INTO board_members (name, position, display_order, period_id)
    VALUES ('Mutiara Suyatna', 'Sekretaris Umum', 3, v_period_id)
    ON CONFLICT DO NOTHING;
    
    -- Insert Bendahara Umum
    INSERT INTO board_members (name, position, display_order, period_id)
    VALUES ('Muh. Faiz Alfarezi', 'Bendahara Umum', 4, v_period_id)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Done! Period ID: %', v_period_id;
END $$;
