-- Update nama kabinet di database menjadi Kabinet Altiora 2026–2027
UPDATE periods 
SET 
  name = 'Kabinet Altiora 2026–2027',
  visi = 'Manifestasi BEM FKIP UIKA sebagai organisasi yang Kolaboratif, Inovatif, Transparatif dan Adaptif dalam Memberikan Kebermanfaatan Untuk KBM FKIP UIKA.',
  misi = '1. Mewujudkan tata kelola organisasi yang transparan, akuntabel dan profesional.
2. Menguatkan kolaborasi dan sinergi antar mahasiswa.
3. Menghadirkan program kerja yang inovatif dan relevan sesuai dengan kebutuhan mahasiswa.
4. Membangun organisasi yang adaptif terhadap perkembangan dan tantangan zaman.
5. Memberikan pelayanan, pengembangan dan kebermanfaatan yang nyata bagi KBM FKIP UIKA.'
WHERE name IN ('Kabinet Karya Bhakti 2026', 'Kabinet Harmoni Edukasi');
