-- Check contents in database and fix publishing
SELECT 
  id, 
  title, 
  slug,
  status, 
  published_at,
  created_at,
  category
FROM contents 
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- Update all TERBIT contents to have published_at timestamp if NULL
UPDATE contents
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'TERBIT' 
  AND published_at IS NULL 
  AND deleted_at IS NULL;
