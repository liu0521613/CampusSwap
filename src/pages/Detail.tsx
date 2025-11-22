import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categories } from '../mocks/data';
import { ItemCard } from '../components/ItemCard';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getItemSafe, getSellerInfoSafe, getItemsSafe, markItemAsSold, deleteItemSafe } from '@/lib/database-safe';
import { SafeItem, SellerInfo } from '@/lib/database-safe';
import { Item } from '@/types';
import { useAuth } from '@/contexts/authContext';
import { toast } from 'sonner';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<SafeItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<SafeItem[]>([]);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 检查当前用户是否是卖家（只允许注册用户管理自己的商品）
  // 注意：卖家可以查看自己的所有商品，但只能管理活跃状态的商品
  const isSeller = user && item && user.id === item.seller_id;
  const canManage = isSeller && item.status === 'active';

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await getItemSafe(id);
      
      if (!data) {
        setItem(null);
        setLoading(false);
        return;
      }
      
      setItem(data);
      
      // 加载卖家信息
      const seller = await getSellerInfoSafe(data.seller_id);
      setSellerInfo(seller);
      
      // 加载相关物品
      const allItems = await getItemsSafe();
      const related = allItems
        .filter(related => related.category === data.category && related.id !== data.id)
        .slice(0, 5);
      setRelatedItems(related);
    } catch (err: any) {
      console.error('加载物品详情失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            {error || '物品不存在'}
          </h2>
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

  const category = categories.find(cat => cat.id === item.category);
  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x200?text=暂无图片';
  const formattedDate = format(new Date(item.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  
  // 获取卖家信息（优先使用物品中保存的信息，否则使用获取的卖家信息）
  const publisher = item.seller_name || sellerInfo?.seller_name || 
    (item.seller_id.startsWith('guest_') ? '游客用户' : '用户');
  const contact = item.seller_contact || sellerInfo?.seller_contact || '未提供';

  const handleItemClick = (itemId: string) => {
    navigate(`/detail/${itemId}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewCategory = () => {
    navigate(`/category/${item.category}`);
  };

  // 标记为已卖
  const handleMarkAsSold = async () => {
    if (!item || !canManage) return;
    
    setIsManaging(true);
    try {
      await markItemAsSold(item.id);
      toast.success('已标记为已售出');
      // 重新加载物品信息
      await loadItem();
    } catch (error: any) {
      console.error('标记为已卖失败:', error);
      toast.error(error.message || '操作失败，请稍后重试');
    } finally {
      setIsManaging(false);
    }
  };

  // 删除商品
  const handleDelete = async () => {
    if (!item || !canManage) return;
    
    setIsManaging(true);
    try {
      await deleteItemSafe(item.id);
      toast.success('商品已删除');
      // 延迟后返回首页
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error: any) {
      console.error('删除商品失败:', error);
      toast.error(error.message || '删除失败，请稍后重试');
    } finally {
      setIsManaging(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            物品详情
          </h1>
          <button 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
            onClick={handleBackToHome}
          >
            返回首页
          </button>
        </div>
      </div>

      {/* 物品信息区 */}
      <div className="container mx-auto px-4 py-6">
        {/* 图片展示 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md mb-6">
          <img 
            src={imageUrl} 
            alt={item.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=暂无图片';
            }}
          />
        </div>

        {/* 基础信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h2>
              {/* 状态标签 */}
              {item.status === 'sold' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-600 text-white text-sm mb-2">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  已售出
                </div>
              )}
              {item.status === 'removed' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white text-sm mb-2">
                  <i className="fa-solid fa-trash mr-1"></i>
                  已删除
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-red-500">¥{item.price.toFixed(2)}</div>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full mr-2">
              {category?.name || '其他'}
            </span>
            <span>{formattedDate}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">物品描述</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{item.description || '暂无描述'}</p>
          </div>
        </div>

        {/* 发布者信息区 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-circle text-blue-600 dark:text-blue-400"></i>
            卖家信息
          </h3>
          <div className="flex items-start mb-4">
            {/* 卖家头像 */}
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              {sellerInfo?.seller_avatar ? (
                <img 
                  src={sellerInfo.seller_avatar} 
                  alt={publisher}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${sellerInfo?.seller_avatar ? 'hidden' : ''}`}>
                <i className="fa-solid fa-user text-2xl text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
            
            {/* 卖家详细信息 */}
            <div className="flex-1">
              <div className="mb-3">
                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">{publisher}</p>
                {sellerInfo?.seller_email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <i className="fa-solid fa-envelope mr-1"></i>
                    {sellerInfo.seller_email}
                  </p>
                )}
              </div>
              
              {/* 联系方式 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                <div className="flex items-center mb-2">
                  <i className="fa-solid fa-phone text-blue-600 dark:text-blue-400 mr-2"></i>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">联系方式</span>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 ml-6 break-all">
                  {contact}
                </p>
              </div>
              
              {/* 卖家标识 */}
              {item.seller_id.startsWith('guest_') ? (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                  <i className="fa-solid fa-user-clock mr-1"></i>
                  游客用户
                </div>
              ) : (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-xs">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  注册用户
                </div>
              )}
            </div>
          </div>
          
          {/* 安全提示 */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start">
              <i className="fa-solid fa-shield-halved text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5"></i>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">安全提示</p>
                <p className="text-yellow-700 dark:text-yellow-400">
                  交易时请选择公共场所，注意财产安全，谨防诈骗。建议使用平台提供的安全交易方式。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 卖家管理按钮区 */}
        {isSeller && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <i className="fa-solid fa-cog"></i>
                商品管理
              </h3>
              <button
                onClick={() => navigate('/my-items')}
                className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 text-sm font-medium flex items-center gap-1"
              >
                <i className="fa-solid fa-list"></i>
                查看所有商品
              </button>
            </div>
            {canManage && (
              <div className="flex space-x-3">
                <button
                  onClick={handleMarkAsSold}
                  disabled={isManaging}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isManaging ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      处理中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check-circle"></i>
                      标记为已售出
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isManaging}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-trash"></i>
                  删除商品
                </button>
              </div>
            )}
            {!canManage && (
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <i className="fa-solid fa-info-circle mr-1"></i>
                此商品状态为"{item.status === 'sold' ? '已售出' : '已删除'}"，无法进行管理操作
              </div>
            )}
          </div>
        )}

        {/* 操作按钮区 */}
        <div className="flex space-x-4 mb-8">
          <button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            onClick={handleViewCategory}
          >
            <i className="fa-solid fa-th-large"></i>
            浏览同分类物品
          </button>
          <button 
            className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-full text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            onClick={handleBackToHome}
          >
            <i className="fa-solid fa-home"></i>
            返回首页
          </button>
        </div>

        {/* 删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                确认删除
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                确定要删除这个商品吗？删除后无法恢复。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isManaging}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isManaging ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 相关物品推荐 */}
        {relatedItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">相关推荐</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {relatedItems.map(relatedItem => (
                <ItemCard 
                  key={relatedItem.id}
                  item={relatedItem as Item}
                  onClick={handleItemClick}
                />
              ))}
            </div>
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