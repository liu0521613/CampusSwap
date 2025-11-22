import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { categories } from '../mocks/data';
import { Item } from '../types';
import { Empty } from '../components/Empty';
import DatabaseTest from '../components/DatabaseTest';
import LoginButton from '../components/LoginButton';
import { getItemsSafe, getItemsByCategorySafe } from '@/lib/database-safe';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 加载物品数据
  useEffect(() => {
    loadItems();
  }, [selectedCategory]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (selectedCategory) {
        data = await getItemsByCategorySafe(selectedCategory);
      } else {
        data = await getItemsSafe();
      }
      
      console.log('加载到的数据:', data);
      setItems(data || []);
    } catch (err: any) {
      console.error('加载物品失败:', err);
      setError(`加载失败: ${err.message || '请刷新重试'}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 根据选中的分类筛选物品
  const filteredItems = selectedCategory 
    ? items.filter(item => item.categoryId === selectedCategory)
    : items;

  // 导航到物品详情页
  const handleItemClick = (itemId: string) => {
    navigate(`/detail/${itemId}`);
  };

  // 导航到发布页面
  const handlePublishClick = () => {
    navigate('/publish');
  };

  // 导航到分类页面
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/category/${categoryId}`);
  };

  // 导航回首页（显示所有物品）
  const handleShowAllClick = () => {
    setSelectedCategory(null);
    navigate('/');
  };

  // 刷新数据
  const handleRefresh = () => {
    loadItems();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 数据库连接状态 */}
      <div className="container mx-auto px-4 py-4">
        <DatabaseTest />
      </div>

      {/* 顶部标题区 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            校园二手交易平台
          </h1>
          <div className="flex items-center space-x-2">
            <button 
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300"
              onClick={handleRefresh}
              title="刷新数据"
            >
              <i className="fa-solid fa-sync-alt"></i>
            </button>
            <LoginButton />
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2"
              onClick={handlePublishClick}
            >
              <i className="fa-solid fa-plus"></i>
              发布物品
            </button>
          </div>
        </div>
      </div>

      {/* 分类导航区 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm py-3">
        <div className="container mx-auto px-4 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 pb-1 min-w-max">
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={handleShowAllClick}
            >
              全部
            </button>
            {categories.map(category => (
              <button 
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
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
              onClick={handleRefresh}
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
                item={item}
                onClick={handleItemClick}
              />
            ))}
          </div>
        ) : (
          <Empty />
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