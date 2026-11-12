-- Insert Academic Calendar Events
INSERT INTO events (name, slug, description, location, start_time, end_time, status, registration_status, created_by_user_id, department_id, period_id)
VALUES 
('Pendaftaran Mahasiswa Baru Gelombang I', 'pendaftaran-mahasiswa-baru-gelombang-i-2026', 'Pendaftaran mahasiswa baru untuk tahun akademik 2026/2027', 'Kampus UIKA Bogor', '2026-08-01 00:00:00', '2026-08-31 23:59:59', 'TERBIT', 'SEGERA_DIBUKA', 'admin@fkip.ac.id', NULL, 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Registrasi Mahasiswa Lama', 'registrasi-mahasiswa-lama-2026', 'Registrasi untuk mahasiswa lama semester gasal 2026/2027', 'Kampus UIKA Bogor', '2026-08-10 00:00:00', '2026-08-21 23:59:59', 'TERBIT', 'SEGERA_DIBUKA', 'admin@fkip.ac.id', NULL, 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Masa Perkuliahan Dimulai', 'masa-perkuliahan-dimulai-2026', 'Perkuliahan semester gasal 2026/2027 dimulai', 'Semua Fakultas UIKA', '2026-08-24 00:00:00', NULL, 'TERBIT', 'TUTUP', 'admin@fkip.ac.id', NULL, 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('UTS Semester Gasal 2026/2027', 'uts-semester-gasal-2026-2027', 'Ujian Tengah Semester semester gasal 2026/2027', 'Semua Fakultas UIKA', '2026-09-05 00:00:00', '2026-09-17 23:59:59', 'TERBIT', 'TUTUP', 'admin@fkip.ac.id', NULL, 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('UAS Semester Gasal 2026/2027', 'uas-semester-gasal-2026-2027', 'Ujian Akhir Semester semester gasal 2026/2027', 'Semua Fakultas UIKA', '2026-12-14 00:00:00', '2026-12-26 23:59:59', 'TERBIT', 'TUTUP', 'admin@fkip.ac.id', NULL, 'dc2c4407-9f3a-4bb1-a035-733e05e42098')
ON CONFLICT (slug) DO NOTHING;

-- Insert Departments
INSERT INTO departments (name, slug, description, period_id)
VALUES 
('Departemen Dalam Negeri', 'dalam-negeri', 'Mengkoordinasikan internal organisasi dan pengembangan SDM', 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Departemen Luar Negeri', 'luar-negeri', 'Menjalin kerjasama dengan organisasi eksternal', 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Departemen Sosial Masyarakat', 'sosial-masyarakat', 'Menyelenggarakan program pengabdian masyarakat', 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Departemen Kaderisasi', 'kaderisasi', 'Mengembangkan kapasitas dan kualitas kader BEM', 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Departemen Olahraga & Seni', 'olahraga-seni', 'Menyelenggarakan kegiatan olahraga dan seni budaya', 'dc2c4407-9f3a-4bb1-a035-733e05e42098'),
('Departemen Hubungan Masyarakat', 'humas', 'Menangani publikasi dan manajemen media sosial', 'dc2c4407-9f3a-4bb1-a035-733e05e42098')
ON CONFLICT (period_id, name) DO NOTHING;
