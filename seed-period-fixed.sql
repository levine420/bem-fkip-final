-- Step 1: Buat periode Kabinet Altiora sebagai NONAKTIF (sesuai constraint)
INSERT INTO periods (id, name, visi, misi, year_start, year_end, status, version, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Kabinet Altiora 2026–2027',
  'Manifestasi BEM FKIP UIKA sebagai organisasi yang Kolaboratif, Inovatif, Transparatif dan Adaptif dalam Memberikan Kebermanfaatan Untuk KBM FKIP UIKA.',
  '1. Mewujudkan tata kelola organisasi yang transparan, akuntabel dan profesional.
2. Menguatkan kolaborasi dan sinergi antar mahasiswa.
3. Menghadirkan program kerja yang inovatif dan relevan sesuai dengan kebutuhan mahasiswa.
4. Membangun organisasi yang adaptif terhadap perkembangan dan tantangan zaman.
5. Memberikan pelayanan, pengembangan dan kebermanfaatan yang nyata bagi KBM FKIP UIKA.',
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
WHERE name = 'Kabinet Altiora 2026–2027' AND status = 'NONAKTIF';
