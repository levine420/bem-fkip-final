-- Step 1: Buat periode sebagai NONAKTIF (sesuai constraint)
INSERT INTO periods (id, name, visi, misi, year_start, year_end, status, version, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Kabinet Karya Bhakti 2026',
  'Mewujudkan BEM FKIP UIKA yang inklusif, inovatif, dan berdaya guna',
  'Menjalankan program kerja responsif, meningkatkan kualitas akademik dan non-akademik, membangun sinergi untuk ekosistem kampus yang kondusif.',
  2026,
  2027,
  'NONAKTIF',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Step 2: Aktifkan periode (trigger allow NONAKTIF -> AKTIF transition)
UPDATE periods 
SET status = 'AKTIF' 
WHERE name = 'Kabinet Karya Bhakti 2026' AND status = 'NONAKTIF';
