import { supabase } from './supabase'
import { Item, Category } from '@/types'

// 获取所有商品
export async function getItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 获取单个商品详情
export async function getItem(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// 搜索商品
export async function searchItems(query: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 按分类获取商品
export async function getItemsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('category', categoryId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 创建新商品
export async function createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新商品
export async function updateItem(id: string, updates: Partial<Item>) {
  const { data, error } = await supabase
    .from('items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 删除商品（软删除，标记为已删除）
export async function deleteItem(id: string) {
  const { data, error } = await supabase
    .from('items')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 获取所有分类
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

// 上传图片到 Supabase Storage
export async function uploadImage(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(path, file)

  if (error) throw error
  return data
}

// 获取图片公共 URL
export function getImageUrl(path: string) {
  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(path)
  
  return data.publicUrl
}