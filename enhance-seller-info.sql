-- ============================================
-- 完善卖家信息功能 - 数据库扩展脚本
-- ============================================
-- 此脚本会为 items 表添加卖家信息字段
-- 请在 Supabase 控制台的 SQL Editor 中运行
-- ============================================

-- 1. 为 items 表添加卖家信息字段
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS seller_contact TEXT;

-- 2. 为新增字段添加注释
COMMENT ON COLUMN public.items.seller_name IS '卖家昵称或姓名';
COMMENT ON COLUMN public.items.seller_contact IS '卖家联系方式（QQ、微信或电话）';

-- 3. 创建索引（如果需要按卖家名称搜索）
CREATE INDEX IF NOT EXISTS idx_items_seller_name ON public.items(seller_name);

-- 4. 更新现有数据（可选）
-- 如果有现有数据，可以从 user_profiles 表更新卖家信息
-- UPDATE public.items i
-- SET 
--   seller_name = COALESCE(
--     (SELECT nickname FROM public.user_profiles WHERE id::text = i.seller_id),
--     split_part((SELECT email FROM auth.users WHERE id::text = i.seller_id), '@', 1),
--     '用户'
--   )
-- WHERE seller_name IS NULL;

-- 5. 创建视图：包含完整的卖家信息
CREATE OR REPLACE VIEW public.items_with_seller AS
SELECT 
  i.*,
  COALESCE(i.seller_name, up.nickname, split_part(au.email, '@', 1), '用户') as display_seller_name,
  COALESCE(i.seller_contact, up.phone, '未提供') as display_seller_contact,
  up.avatar_url as seller_avatar
FROM public.items i
LEFT JOIN public.user_profiles up ON i.seller_id = up.id::text
LEFT JOIN auth.users au ON i.seller_id = au.id::text
WHERE i.status = 'active';

-- 6. 创建函数：获取卖家的完整信息
CREATE OR REPLACE FUNCTION public.get_seller_info(seller_id_param TEXT)
RETURNS TABLE (
  seller_id TEXT,
  seller_name TEXT,
  seller_contact TEXT,
  seller_email TEXT,
  seller_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    seller_id_param,
    COALESCE(
      (SELECT seller_name FROM public.items WHERE seller_id = seller_id_param LIMIT 1),
      up.nickname,
      split_part(au.email, '@', 1),
      '用户'
    ) as seller_name,
    COALESCE(
      (SELECT seller_contact FROM public.items WHERE seller_id = seller_id_param LIMIT 1),
      up.phone,
      '未提供'
    ) as seller_contact,
    au.email as seller_email,
    up.avatar_url as seller_avatar
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.id
  WHERE au.id::text = seller_id_param
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建函数：更新物品的卖家信息
CREATE OR REPLACE FUNCTION public.update_item_seller_info(
  item_id_param TEXT,
  seller_name_param TEXT,
  seller_contact_param TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE public.items
  SET 
    seller_name = seller_name_param,
    seller_contact = seller_contact_param,
    updated_at = NOW()
  WHERE id = item_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 完成提示
-- ============================================
SELECT '卖家信息功能扩展完成！' as message,
       'items 表已添加 seller_name 和 seller_contact 字段' as details;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 发布物品时，seller_name 和 seller_contact 会被保存
-- 2. 查看物品详情时，会显示保存的卖家信息
-- 3. 如果物品没有保存卖家信息，会从 user_profiles 表获取
-- 4. 可以使用 get_seller_info() 函数获取完整的卖家信息
-- ============================================

