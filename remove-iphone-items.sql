-- 删除iPhone相关的商品
-- 请在 Supabase 控制台的 SQL Editor 中运行以下脚本

-- 首先查看是否包含iPhone的商品
SELECT id, title, price, created_at 
FROM items 
WHERE title ILIKE '%iPhone%' 
   OR title ILIKE '%iphone%'
   OR title ILIKE '%苹果手机%'
   OR title ILIKE '%Apple 手机%'
   OR description ILIKE '%iPhone%'
   OR description ILIKE '%iphone%';

-- 删除包含iPhone的商品（软删除，标记为已删除）
UPDATE items 
SET status = 'removed', updated_at = NOW()
WHERE title ILIKE '%iPhone%' 
   OR title ILIKE '%iphone%'
   OR title ILIKE '%苹果手机%'
   OR title ILIKE '%Apple 手机%'
   OR description ILIKE '%iPhone%'
   OR description ILIKE '%iphone%';

-- 显示删除后的结果确认
SELECT COUNT(*) as deleted_count
FROM items 
WHERE status = 'removed' 
AND (
  title ILIKE '%iPhone%' 
  OR title ILIKE '%iphone%'
  OR title ILIKE '%苹果手机%'
  OR title ILIKE '%Apple 手机%'
  OR description ILIKE '%iPhone%'
  OR description ILIKE '%iphone%'
);

SELECT 'iPhone相关商品删除完成！' as message;