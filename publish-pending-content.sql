-- Publish all content that is currently in MENUNGGU_REVIEW status
-- This is a one-time migration script to clean up old content workflow

UPDATE contents
SET 
  status = 'TERBIT',
  published_at = COALESCE(published_at, NOW())
WHERE 
  status = 'MENUNGGU_REVIEW'
  AND deleted_at IS NULL;

-- Check results
SELECT id, title, status, published_at 
FROM contents 
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
