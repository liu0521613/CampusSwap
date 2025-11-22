-- 修复 RLS 策略问题
-- 在 Supabase SQL Editor 中运行以下 SQL

-- 首先删除现有的策略
DROP POLICY IF EXISTS "Public can view active items" ON items;
DROP POLICY IF EXISTS "Users can insert own items" ON items;
DROP POLICY IF EXISTS "Users can update own items" ON items;
DROP POLICY IF EXISTS "Users can delete own items" ON items;

-- 创建新的更宽松的策略（允许游客发布）
-- 允许所有人查看活跃商品
CREATE POLICY "Public can view active items"
    ON items FOR SELECT
    USING (status = 'active');

-- 允许所有人插入商品（包括游客）
CREATE POLICY "Allow insert for all users" 
    ON items FOR INSERT 
    WITH CHECK (status = 'active');

-- 允许作者更新自己的商品
CREATE POLICY "Users can update own items"
    ON items FOR UPDATE
    USING (
      CASE 
        WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = seller_id
        ELSE seller_id LIKE 'guest_%' -- 游客只能更新自己的guest_id
      END
    )
    WITH CHECK (
      CASE 
        WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = seller_id
        ELSE seller_id LIKE 'guest_%'
      END
    );

-- 允许作者删除自己的商品
CREATE POLICY "Users can delete own items"
    ON items FOR DELETE
    USING (
      CASE 
        WHEN auth.uid() IS NOT NULL THEN auth.uid()::text = seller_id
        ELSE seller_id LIKE 'guest_%'
      END
    );

-- 验证策略
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'items';