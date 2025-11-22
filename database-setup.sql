-- Supabase 数据库初始化脚本
-- 请在 Supabase 控制台的 SQL Editor 中运行以下 SQL

-- 创建 items 表
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  seller_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 categories 表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略 (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略
-- 用户可以查看所有活跃的商品
CREATE POLICY "Public can view active items"
    ON items FOR SELECT
    USING (status = 'active');

-- 用户可以插入自己的商品
CREATE POLICY "Users can insert own items"
    ON items FOR INSERT
    WITH CHECK (auth.uid()::text = seller_id);

-- 用户只能更新自己的商品
CREATE POLICY "Users can update own items"
    ON items FOR UPDATE
    USING (auth.uid()::text = seller_id)
    WITH CHECK (auth.uid()::text = seller_id);

-- 用户只能删除自己的商品
CREATE POLICY "Users can delete own items"
    ON items FOR DELETE
    USING (auth.uid()::text = seller_id);

-- 所有人都可以查看分类
CREATE POLICY "Public can view categories"
    ON categories FOR SELECT
    USING (true);

-- 插入一些示例分类数据
INSERT INTO categories (name, icon) VALUES
('数码产品', 'fa-laptop'),
('图书教材', 'fa-book'),
('生活用品', 'fa-home'),
('运动健身', 'fa-dumbbell'),
('美妆个护', 'fa-spray-can'),
('服装配饰', 'fa-shirt'),
('食品零食', 'fa-utensils'),
('其他', 'fa-ellipsis-h')
ON CONFLICT DO NOTHING;

-- 创建 Storage bucket 用于存储图片
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- 为 Storage bucket 设置权限
CREATE POLICY "Public can view item images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'item-images');

CREATE POLICY "Anyone can upload item images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'item-images');

CREATE POLICY "Users can update own item images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own item images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- 完成提示
SELECT 'Database setup completed successfully!' as message;