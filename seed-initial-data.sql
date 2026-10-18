-- Buat periode aktif
INSERT INTO periods (id, name, visi, misi, year_start, year_end, status, version, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Kabinet Karya Bhakti 2026',
  'Mewujudkan BEM FKIP UIKA yang inklusif, inovatif, dan berdaya guna bagi seluruh mahasiswa',
  'Menjalankan program kerja yang responsif terhadap kebutuhan mahasiswa, meningkatkan kualitas akademik dan non-akademik, serta membangun sinergi dengan berbagai pihak untuk menciptakan ekosistem kampus yang kondusif dan berprestasi.',
  2026,
  2027,
  'AKTIF',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
