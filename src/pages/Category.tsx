import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categories } from '../mocks/data';
import { ItemCard } from '../components/ItemCard';
import { Empty } from '../components/Empty';
import { getItemsByCategorySafe } from '@/lib/database-safe';
import { SafeItem } from '@/lib/database-safe';
import { Item } from '@/types';

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<SafeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const category = categories.find(cat => cat.id === id);
  
  useEffect(() => {
    if (id && category) {
      loadItems();
    }
  }, [id]);

  const loadItems = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getItemsByCategorySafe(id);
      setItems(data || []);
    } catch (err: any) {
      console.error('加载分类物品失败:', err);
      setError(err.message || '加载失败，请刷新重试');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">分类不存在</h2>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
            onClick={() => navigate('/')}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleItemClick = (itemId: string) => {
    navigate(`/detail/${itemId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {category.name}
          </h1>
          <button 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
            onClick={handleBackToHome}
          >
            返回首页
          </button>
        </div>
      </div>

      {/* 物品列表区 */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <ItemCard 
                key={item.id}
                item={item as Item}
                onClick={handleItemClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-box-open text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">该分类暂无物品</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              快来发布该分类的第一个物品吧！
            </p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300"
              onClick={() => navigate('/publish')}
            >
              发布物品
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