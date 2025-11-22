-- 简单修复：暂时禁用 items 表的 RLS
-- 在 Supabase SQL Editor 中运行

-- 方法 1：禁用 RLS（临时解决方案）
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- 如果后续需要重新启用，请使用这个命令：
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 验证 RLS 状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'items';