-- ============================================
-- Supabase 认证系统设置 SQL 脚本
-- ============================================
-- 请在 Supabase 控制台的 SQL Editor 中运行以下 SQL
-- 这个脚本会设置用户配置表和相关的 RLS 策略
-- ============================================

-- 1. 创建用户配置表（用于存储用户的额外信息，如昵称、头像等）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 为 user_profiles 表创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON public.user_profiles(nickname);

-- 3. 启用行级安全策略 (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 用户可以查看所有公开的用户资料
CREATE POLICY "Public can view user profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

-- 用户可以插入自己的资料
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 用户只能删除自己的资料
CREATE POLICY "Users can delete own profile"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = id);

-- 5. 创建自动创建用户配置的函数
-- 当新用户注册时，自动创建对应的用户配置记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建触发器：当 auth.users 表有新用户时，自动创建 user_profiles 记录
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器：自动更新 updated_at 字段
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- 9. 更新 items 表的 RLS 策略，允许已认证用户查看所有活跃物品
-- （如果之前有更严格的策略，这个会覆盖它）
DROP POLICY IF EXISTS "Public can view active items" ON public.items;
CREATE POLICY "Public can view active items"
  ON public.items FOR SELECT
  USING (status = 'active');

-- 10. 更新 items 表的插入策略，允许已认证用户插入物品
DROP POLICY IF EXISTS "Users can insert own items" ON public.items;
CREATE POLICY "Users can insert own items"
  ON public.items FOR INSERT
  WITH CHECK (
    auth.uid()::text = seller_id OR 
    seller_id LIKE 'guest_%'
  );

-- 11. 创建获取用户配置的视图（方便查询）
CREATE OR REPLACE VIEW public.user_profile_view AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.nickname,
  p.avatar_url,
  p.phone,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id;

-- 12. 为视图启用 RLS
ALTER VIEW public.user_profile_view SET (security_invoker = true);

-- 13. 创建函数：获取当前用户的配置
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  nickname TEXT,
  avatar_url TEXT,
  phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    p.nickname,
    p.avatar_url,
    p.phone
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.id
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. 创建函数：更新用户昵称
CREATE OR REPLACE FUNCTION public.update_user_nickname(new_nickname TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nickname, updated_at)
  VALUES (auth.uid(), new_nickname, NOW())
  ON CONFLICT (id) 
  DO UPDATE SET 
    nickname = new_nickname,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 完成提示
-- ============================================
SELECT '认证系统设置完成！' as message,
       '用户配置表已创建，RLS策略已设置，触发器已配置。' as details;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 用户注册后，会自动在 user_profiles 表中创建记录
-- 2. 昵称会从注册时的 metadata 中获取，如果没有则使用邮箱用户名部分
-- 3. 可以通过以下方式查询用户配置：
--    SELECT * FROM public.user_profiles WHERE id = auth.uid();
-- 4. 可以通过以下方式更新昵称：
--    SELECT public.update_user_nickname('新昵称');
-- ============================================

