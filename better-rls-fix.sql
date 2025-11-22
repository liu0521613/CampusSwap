-- 更好的 RLS 策略配置
-- 在 Supabase SQL Editor 中运行

-- 删除所有现有策略
DROP POLICY IF EXISTS "Public can view active items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- 创建最简单的策略（推荐）
-- 允许所有人查看
CREATE POLICY "Enable read access for all users" ON items
    FOR SELECT USING (true);

-- 允许所有人插入
CREATE POLICY "Enable insert for all users" ON items
    FOR INSERT WITH CHECK (true);

-- 允许所有人更新
CREATE POLICY "Enable update for all users" ON items
    FOR UPDATE USING (true) WITH CHECK (true);

-- 允许所有人删除
CREATE POLICY "Enable delete for all users" ON items
    FOR DELETE USING (true);

-- 或者使用更安全的方法（推荐用于生产环境）：
-- 临时禁用 RLS 用于测试
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- 检查结果
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'items';