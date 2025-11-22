-- ============================================
-- 快速确认用户邮箱（用于开发测试）
-- ============================================
-- 使用方法：
-- 1. 将下面的 'your-email@example.com' 替换为你的实际邮箱
-- 2. 在 Supabase SQL Editor 中运行此脚本
-- ============================================

-- 查看所有未确认的用户
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- ============================================
-- 确认特定用户的邮箱（替换邮箱地址）
-- ============================================
-- 将 'your-email@example.com' 替换为你的实际邮箱
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'your-email@example.com' 
  AND email_confirmed_at IS NULL;

-- 验证是否成功（confirmed_at 是生成列，会自动更新）
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  updated_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- ============================================
-- 或者确认所有未验证用户的邮箱（谨慎使用！）
-- ============================================
-- 取消下面的注释来确认所有用户的邮箱
-- UPDATE auth.users
-- SET 
--   email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
--   updated_at = NOW()
-- WHERE email_confirmed_at IS NULL;
-- 注意：confirmed_at 是生成列，会自动根据 email_confirmed_at 更新

