// 安全版本的数据库操作，带有更好的错误处理
import { supabase } from './supabase'

export interface SafeItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  seller_id: string
  seller_name?: string
  seller_contact?: string
  status: 'active' | 'sold' | 'removed'
  created_at: string
  updated_at: string
}

export interface SellerInfo {
  seller_id: string
  seller_name: string
  seller_contact: string
  seller_email?: string
  seller_avatar?: string
}

// 获取所有商品（安全版本）
export async function getItemsSafe(): Promise<SafeItem[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50) // 限制数量避免过载

    if (error) {
      console.error('数据库查询错误:', error)
      throw new Error(`数据库查询失败: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('获取商品失败:', error)
    throw error
  }
}

// 按分类获取商品（安全版本）
export async function getItemsByCategorySafe(categoryId: string): Promise<SafeItem[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('分类查询错误:', error)
      throw new Error(`分类查询失败: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('按分类获取商品失败:', error)
    throw error
  }
}

// 获取单个商品详情（安全版本）
// 注意：此函数会返回所有状态的商品，RLS 策略会控制访问权限
export async function getItemSafe(id: string): Promise<SafeItem | null> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('获取商品详情错误:', error)
      if (error.code === 'PGRST116') {
        // 记录不存在
        return null
      }
      throw new Error(`获取商品详情失败: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('获取商品详情失败:', error)
    throw error
  }
}

// 标记商品为已卖（安全版本）
export async function markItemAsSold(itemId: string): Promise<SafeItem | null> {
  try {
    const { data, error } = await supabase
      .from('items')
      .update({ 
        status: 'sold',
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('标记为已卖失败:', error)
      throw new Error(`标记为已卖失败: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('标记为已卖失败:', error)
    throw error
  }
}

// 删除商品（安全版本，软删除）
export async function deleteItemSafe(itemId: string): Promise<SafeItem | null> {
  try {
    const { data, error } = await supabase
      .from('items')
      .update({ 
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('删除商品失败:', error)
      throw new Error(`删除商品失败: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('删除商品失败:', error)
    throw error
  }
}

// 获取卖家信息（安全版本）
export async function getSellerInfoSafe(sellerId: string): Promise<SellerInfo | null> {
  try {
    // 首先尝试从 items 表获取卖家信息（获取该卖家的最新物品信息）
    const { data: itemData } = await supabase
      .from('items')
      .select('seller_name, seller_contact')
      .eq('seller_id', sellerId)
      .not('seller_name', 'is', null)
      .limit(1)
      .maybeSingle()

    // 从 user_profiles 获取用户配置（如果 sellerId 是 UUID 格式）
    let profileData = null;
    if (!sellerId.startsWith('guest_')) {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('nickname, phone, avatar_url')
          .eq('id', sellerId)
          .maybeSingle()
        profileData = data;
      } catch (e) {
        // 忽略错误，可能 sellerId 不是有效的 UUID
      }
    }

    // 从当前登录用户获取邮箱（只能获取自己的邮箱）
    let sellerEmail: string | undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === sellerId) {
        sellerEmail = user.email;
      }
    } catch (e) {
      // 忽略错误，无法获取其他用户的邮箱是正常的
    }

    // 组合卖家信息（优先级：物品中保存的信息 > 用户配置 > 默认值）
    const sellerName = itemData?.seller_name || profileData?.nickname || 
      (sellerId.startsWith('guest_') ? '游客用户' : '用户');
    const sellerContact = itemData?.seller_contact || profileData?.phone || '未提供';

    return {
      seller_id: sellerId,
      seller_name: sellerName,
      seller_contact: sellerContact,
      seller_email: sellerEmail,
      seller_avatar: profileData?.avatar_url,
    }
  } catch (error) {
    console.error('获取卖家信息失败:', error)
    // 返回默认信息
    return {
      seller_id: sellerId,
      seller_name: sellerId.startsWith('guest_') ? '游客用户' : '用户',
      seller_contact: '未提供',
    }
  }
}