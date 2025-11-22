import React from 'react';
import { Item, Category } from '../types';
import { categories } from '../mocks/data';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ItemCardProps {
  item: Item;
  onClick: (itemId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const category = categories.find(cat => cat.id === item.category);
  
  // 格式化日期为相对时间，处理可能的无效日期
  let formattedDate = '刚刚';
  try {
    if (item.created_at) {
      const date = new Date(item.created_at);
      if (!isNaN(date.getTime())) {
        formattedDate = formatDistanceToNow(date, { 
          addSuffix: true,
          locale: zhCN
        });
      }
    }
  } catch (error) {
    console.error('日期格式化错误:', error);
    formattedDate = '刚刚';
  }

  // 获取第一张图片
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(item.id)}
    >
      <div className="relative aspect-video">
        <img 
          src={imageUrl} 
          alt={item.title}
          className={`w-full h-full object-cover ${item.status === 'sold' ? 'opacity-60' : ''}`}
          onError={(e) => {
            // 图片加载失败时使用占位图
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=暂无图片';
          }}
        />
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {category?.name || '其他'}
        </div>
        {/* 状态标签 */}
        {item.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <i className="fa-solid fa-check-circle"></i>
            已售出
          </div>
        )}
        {item.status === 'removed' && (
          <div className="absolute top-2 right-2 bg-red-600 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <i className="fa-solid fa-trash"></i>
            已删除
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 h-12">
          {item.title}
        </h3>
        <div className="mt-2 flex justify-between items-center">
          <div className="text-red-500 font-semibold">
            ¥{item.price.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};