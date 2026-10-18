-- Buat Super Admin user
INSERT INTO users (
  id, 
  name, 
  email, 
  password, 
  role, 
  account_status, 
  email_verified_at,
  must_change_password,
  created_at, 
  updated_at
)
VALUES (
  gen_random_uuid(),
  'Super Admin',
  'admin@fkip.ac.id',
  '$2b$12$jfY/MApJRLFEzzPcowRD3.S3/F8HnaWbVv5Vs478dY3.kWEx3X3fq',
  'SUPER_ADMIN',
  'AKTIF',
  CURRENT_TIMESTAMP,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
