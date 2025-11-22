import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../mocks/data';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/contexts/authContext';
import { createItem, uploadImage, getImageUrl } from '@/lib/database';
import AuthModal from '@/components/AuthModal';

// 表单验证模式
const formSchema = z.object({
  title: z.string().min(1, '请输入物品标题').max(100, '物品标题不能超过100个字符'),
  categoryId: z.string().min(1, '请选择物品分类'),
  price: z.number().min(0.01, '价格必须大于0').max(99999, '价格不能超过99999元'),
  description: z.string().max(500, '物品描述不能超过500个字符').optional().or(z.literal('')),
  publisher: z.string().min(1, '请输入发布者昵称').max(20, '发布者昵称不能超过20个字符'),
  contact: z.string().min(1, '请输入联系方式').max(50, '联系方式不能超过50个字符'),
});

export default function Publish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    price: 0,
    description: '',
    publisher: '',
    contact: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 特殊处理价格字段
    if (name === 'price') {
      const numValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 检查用户是否需要登录
  const checkUserAuth = () => {
    if (!user && !formData.publisher) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  // 处理图片上传
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('请上传JPG或PNG格式的图片');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    setImageFile(file);
    
    // 创建图片预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 验证表单
  const validateForm = () => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkUserAuth()) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 上传图片（如果有的话）
      let imageUrl = '';
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        await uploadImage(imageFile, fileName);
        imageUrl = getImageUrl(fileName);
      }

      // 准备要提交的数据
      const itemData = {
        title: formData.title,
        description: formData.description || '',
        price: formData.price,
        category: formData.categoryId,
        images: imageUrl ? [imageUrl] : [],
        seller_id: user?.id || `guest_${Date.now()}`,
        seller_name: formData.publisher || undefined,
        seller_contact: formData.contact || undefined,
        status: 'active' as const,
      };

      // 提交到数据库
      const newItem = await createItem(itemData);

      toast.success('物品发布成功！');
      
      // 延迟后返回首页
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('发布失败:', error);
      toast.error(error.message || '发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 认证成功后的处理
  const handleAuthSuccess = () => {
    // 如果是登录用户，自动填充昵称
    if (user?.email) {
      const displayName = user.email.split('@')[0];
      setFormData(prev => ({
        ...prev,
        publisher: displayName
      }));
    }
  };

  // 取消发布
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            发布闲置物品
          </h1>
          <button 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
            onClick={handleCancel}
          >
            取消
          </button>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          {/* 物品标题 */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="请输入1-20字的物品标题"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.title 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200`}
              maxLength={20}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* 物品分类 */}
          <div className="mb-6">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品分类 <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.categoryId 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200`}
            >
              <option value="">请选择物品分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
            )}
          </div>

          {/* 物品价格 */}
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品价格（元） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="请输入价格"
              step="0.01"
              min="0.01"
              max="99999"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.price 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* 物品描述 */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品描述
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="请输入物品描述（选填，最多200字）"
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200 focus:ring-blue-500 focus:border-blue-500`}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              已输入 {formData.description.length}/200 字
            </p>
          </div>

          {/* 物品图片 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品图片
            </label>
            <div className={`border-2 border-dashed ${
              imageFile ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer`}
                 onClick={() => document.getElementById('imageUpload')?.click()}>
              <input
                type="file"
                id="imageUpload"
                accept="image/jpeg, image/png"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="预览" 
                    className="max-h-60 mx-auto rounded-lg object-contain"
                  />
                  <button 
                    type="button"
                    className="absolute top-2 right-1/2 transform translate-x-1/2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview('');
                    }}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              ) : (
                <div>
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500 dark:text-gray-400">
                    点击上传图片（JPG/PNG，不超过5MB）
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 发布者昵称 */}
          <div className="mb-6">
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              发布者昵称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              placeholder="请输入1-8字的昵称"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.publisher 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200`}
              maxLength={8}
            />
            {errors.publisher && (
              <p className="mt-1 text-sm text-red-500">{errors.publisher}</p>
            )}
          </div>

          {/* 联系方式 */}
          <div className="mb-8">
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              联系方式 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="请输入联系方式（QQ、微信或电话）"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.contact 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all duration-200`}
              maxLength={20}
            />
            {errors.contact && (
              <p className="mt-1 text-sm text-red-500">{errors.contact}</p>
            )}
          </div>

          {/* 提交区域 */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-sm font-medium transition-colors duration-300 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  发布中...
                </>
              ) : (
                '提交发布'
              )}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-full text-sm font-medium transition-colors duration-300"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </button>
          </div>
        </form>
      </div>

      {/* 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}