-- ============================================
-- 禁用邮箱验证（仅用于开发环境）
-- ============================================
-- 警告：此脚本会禁用邮箱验证，仅应在开发环境中使用！
-- 生产环境应保持邮箱验证功能开启以确保安全性
-- ============================================

-- 方法1：在 Supabase Dashboard 中手动设置（推荐）
-- 1. 进入 Supabase Dashboard
-- 2. 点击左侧菜单 "Authentication" -> "Settings"
-- 3. 找到 "Email Auth" 部分
-- 4. 关闭 "Confirm email" 选项
-- 5. 保存设置

-- 方法2：使用 SQL 直接修改（如果方法1不可用）
-- 注意：这需要访问 Supabase 的内部配置表，可能需要管理员权限

-- 方法3：手动确认用户邮箱（用于测试）
-- 如果你已经注册了用户，可以使用以下SQL手动确认邮箱：

-- 步骤1：查看所有未确认的用户
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- 步骤2：手动确认特定用户的邮箱
-- 替换 'YOUR_USER_EMAIL' 为你的实际邮箱地址
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'YOUR_USER_EMAIL' 
  AND email_confirmed_at IS NULL;
-- 注意：confirmed_at 是生成列，会自动根据 email_confirmed_at 更新

-- 或者使用用户ID确认（从步骤1的查询结果中获取ID）
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = NOW(),
--   updated_at = NOW()
-- WHERE id = 'YOUR_USER_ID' 
--   AND email_confirmed_at IS NULL;
-- 注意：confirmed_at 是生成列，会自动根据 email_confirmed_at 更新

-- 步骤3：确认所有用户的邮箱（仅用于开发测试！谨慎使用！）
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
--   updated_at = NOW()
-- WHERE email_confirmed_at IS NULL;
-- 注意：confirmed_at 是生成列，会自动根据 email_confirmed_at 更新

-- 步骤4：验证确认结果
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'YOUR_USER_EMAIL';

-- ============================================
-- 推荐方案：在 Dashboard 中设置
-- ============================================
-- 1. 登录 Supabase Dashboard
-- 2. 选择你的项目
-- 3. 进入 Authentication -> Settings
-- 4. 在 "Email Auth" 部分，找到 "Confirm email" 开关
-- 5. 关闭它
-- 6. 保存设置
-- 
-- 这样新注册的用户就不需要验证邮箱了
-- ============================================

