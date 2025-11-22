-- ============================================
-- 快速修复：确认用户邮箱
-- ============================================
-- 问题：confirmed_at 是生成列，不能直接更新
-- 解决：只更新 email_confirmed_at，confirmed_at 会自动更新
-- ============================================

-- 步骤1：查看所有未确认的用户
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ============================================
-- 步骤2：确认特定用户的邮箱
-- ============================================
-- 将 'your-email@example.com' 替换为你的实际邮箱
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = '2784565967@qq.com' 
  AND email_confirmed_at IS NULL;

-- 步骤3：验证结果（confirmed_at 会自动更新）
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  updated_at
FROM auth.users
WHERE email = '2784565967@qq.com';

-- ============================================
-- 批量确认所有未验证用户（谨慎使用！）
-- ============================================
-- 取消下面的注释来确认所有用户的邮箱
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
--   updated_at = NOW()
-- WHERE email_confirmed_at IS NULL;

