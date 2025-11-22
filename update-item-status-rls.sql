-- ============================================
-- 更新商品状态管理 RLS 策略
-- ============================================
-- 此脚本会更新 RLS 策略，允许卖家查看和管理自己的所有商品
-- 包括已售出和已删除的商品
-- ============================================

-- 1. 删除旧的 SELECT 策略（如果存在）
DROP POLICY IF EXISTS "Public can view active items" ON public.items;

-- 2. 创建新的 SELECT 策略：所有人都可以查看活跃的商品
CREATE POLICY "Public can view active items"
  ON public.items FOR SELECT
  USING (status = 'active');

-- 3. 创建策略：卖家可以查看自己的所有商品（包括已售出和已删除的）
CREATE POLICY "Sellers can view own items"
  ON public.items FOR SELECT
  USING (
    auth.uid()::text = seller_id
  );

-- 4. 更新 UPDATE 策略：卖家可以更新自己的商品状态
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
CREATE POLICY "Sellers can update own items"
  ON public.items FOR UPDATE
  USING (auth.uid()::text = seller_id)
  WITH CHECK (auth.uid()::text = seller_id);

-- 5. 更新 DELETE 策略（实际上我们使用软删除，所以这个策略用于标记为已删除）
-- 注意：真正的删除应该通过 UPDATE status = 'removed' 来实现

-- 6. 确保 INSERT 策略允许卖家插入商品
DROP POLICY IF EXISTS "Users can insert own items" ON public.items;
CREATE POLICY "Sellers can insert own items"
  ON public.items FOR INSERT
  WITH CHECK (
    auth.uid()::text = seller_id OR 
    seller_id LIKE 'guest_%'
  );

-- ============================================
-- 完成提示
-- ============================================
SELECT '商品状态管理 RLS 策略更新完成！' as message,
       '卖家现在可以查看和管理自己的所有商品（包括已售出和已删除的）' as details;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 所有用户都可以查看 status = 'active' 的商品
-- 2. 卖家可以查看自己的所有商品（无论状态如何）
-- 3. 卖家可以更新自己的商品状态（标记为已售出、删除等）
-- 4. 卖家可以插入新商品
-- ============================================

