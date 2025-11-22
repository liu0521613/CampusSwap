import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import { ItemCard } from '../components/ItemCard';
import { categories } from '../mocks/data';
import { SafeItem } from '@/lib/database-safe';
import { Item } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type StatusFilter = 'all' | 'active' | 'sold' | 'removed';

export default function MyItems() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<SafeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!user) {
      // 如果未登录，重定向到登录页
      navigate('/auth');
      return;
    }
    loadItems();
  }, [user, statusFilter]);

  const loadItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      // 根据筛选条件过滤
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('获取我的商品失败:', queryError);
        throw new Error(`获取商品失败: ${queryError.message}`);
      }

      setItems(data || []);
    } catch (err: any) {
      console.error('加载商品失败:', err);
      setError(err.message || '加载失败，请刷新重试');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const all = items.length;
    const active = items.filter(item => item.status === 'active').length;
    const sold = items.filter(item => item.status === 'sold').length;
    const removed = items.filter(item => item.status === 'removed').length;
    return { all, active, sold, removed };
  };

  const statusCounts = getStatusCounts();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '在售';
      case 'sold':
        return '已售出';
      case 'removed':
        return '已删除';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'sold':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'removed':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const handleItemClick = (itemId: string) => {
    navigate(`/detail/${itemId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!user) {
    return null; // 会在 useEffect 中重定向
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToHome}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              我的商品
            </h1>
          </div>
          <button
            onClick={() => navigate('/publish')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            发布新商品
          </button>
        </div>
      </div>

      {/* 状态筛选标签 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-3">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              全部 ({statusCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              在售 ({statusCounts.active})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'sold'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              已售出 ({statusCounts.sold})
            </button>
            <button
              onClick={() => setStatusFilter('removed')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === 'removed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              已删除 ({statusCounts.removed})
            </button>
          </div>
        </div>
      </div>

      {/* 商品列表区 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadItems}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              <i className="fa-solid fa-sync-alt mr-2"></i>
              刷新重试
            </button>
          </div>
        ) : items.length > 0 ? (
          <>
            {/* 统计信息 */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">总商品数</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{statusCounts.all}</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 shadow-sm border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">在售中</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.active}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">已售出</div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{statusCounts.sold}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 shadow-sm border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-600 dark:text-red-400 mb-1">已删除</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.removed}</div>
              </div>
            </div>

            {/* 商品网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => (
                <div key={item.id} className="relative">
                  <ItemCard
                    item={item as Item}
                    onClick={handleItemClick}
                  />
                  {/* 状态标签覆盖层 */}
                  {item.status !== 'active' && (
                    <div className={`absolute top-2 right-2 ${getStatusColor(item.status)} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10`}>
                      <i className={`fa-solid ${
                        item.status === 'sold' ? 'fa-check-circle' : 'fa-trash'
                      }`}></i>
                      {getStatusLabel(item.status)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-md text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-box-open text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              {statusFilter === 'all' ? '还没有发布过商品' : `没有${getStatusLabel(statusFilter)}的商品`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {statusFilter === 'all' 
                ? '快来发布你的第一个商品吧！' 
                : `当前筛选条件下没有商品，试试其他筛选条件或发布新商品。`}
            </p>
            <button
              onClick={() => navigate('/publish')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              发布商品
            </button>
          </div>
        )}
      </div>

      {/* 底部信息区 */}
      <footer className="fixed bottom-0 w-full bg-white dark:bg-gray-800 shadow-lg py-3 px-4">
        <div className="container mx-auto">
          <div className="text-center text-xs text-gray-500 mb-2">
            <p className="font-medium">安全提示：本平台仅提供信息发布，交易时请选择安全地点，谨防诈骗</p>
          </div>
          <div className="text-center text-xs text-gray-400">
            © 2025 校园二手交易平台 - 版权所有
          </div>
        </div>
      </footer>
    </div>
  );
}

