# iPhone商品删除指南

## 方法1：通过Supabase控制台（推荐）

1. 打开浏览器，访问：https://supabase.com/dashboard
2. 登录你的账户
3. 选择项目：`alsgwxqelsnwhlbtjjxf`
4. 在左侧菜单中点击 "SQL Editor"
5. 复制并执行以下SQL代码：

```sql
-- 查看iPhone相关商品
SELECT id, title, price, status, created_at 
FROM items 
WHERE title ILIKE '%iPhone%' 
   OR title ILIKE '%iphone%'
   OR title ILIKE '%苹果手机%'
   OR title ILIKE '%Apple 手机%'
   OR description ILIKE '%iPhone%'
   OR description ILIKE '%iphone%';

-- 删除iPhone相关商品（软删除）
UPDATE items 
SET status = 'removed', updated_at = NOW()
WHERE title ILIKE '%iPhone%' 
   OR title ILIKE '%iphone%'
   OR title ILIKE '%苹果手机%'
   OR title ILIKE '%Apple 手机%'
   OR description ILIKE '%iPhone%'
   OR description ILIKE '%iphone%';

-- 确认删除结果
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
```

## 方法2：通过应用程序

如果你希望在应用程序中添加删除功能，我可以帮你：

1. 在商品详情页添加删除按钮（仅限商品发布者）
2. 在"我的物品"页面添加删除功能

## 方法3：直接数据库操作

如果你有数据库管理工具（如pgAdmin、DBeaver等），可以直接连接数据库并执行上述SQL语句。

---

**注意：**
- 删除操作是不可逆的（虽然是软删除，但商品不会再显示）
- 请确保你真的想删除这些商品
- 删除后可以刷新首页查看效果

**数据库连接信息：**
- URL: https://alsgwxqelsnwhlbtjjxf.supabase.co
- 项目ID: alsgwxqelsnwhlbtjjxf