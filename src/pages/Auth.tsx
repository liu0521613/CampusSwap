import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/authContext';

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // 如果已登录，重定向到首页
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }

      if (!formData.nickname) {
        newErrors.nickname = '请输入昵称';
      } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
        newErrors.nickname = '昵称长度应在2-20个字符之间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // 检查是否是邮箱未确认错误
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            setEmailNotConfirmed(true);
            toast.error('邮箱未验证，请先验证您的邮箱');
          }
          throw error;
        }

        toast.success('登录成功！');
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nickname: formData.nickname,
            },
          },
        });

        if (error) throw error;

        // 检查是否需要邮箱验证
        if (data.user && !data.session) {
          // 用户已创建但需要验证邮箱
          setEmailNotConfirmed(true);
          toast.success('注册成功！请检查邮箱并点击验证链接');
        } else if (data.session) {
          // 如果邮箱验证已禁用，直接登录成功
          toast.success('注册成功！');
          setTimeout(() => {
            navigate('/');
          }, 500);
          return;
        } else {
          toast.success('注册成功！请检查邮箱验证链接');
        }
        
        // 注册成功后切换到登录模式
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: '',
            confirmPassword: '',
            nickname: '',
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('认证失败:', error);
      toast.error(error.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
    });
    setErrors({});
    setEmailNotConfirmed(false);
  };

  // 重发验证邮件
  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('请先输入邮箱地址');
      return;
    }

    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) throw error;

      toast.success('验证邮件已重新发送，请检查您的邮箱');
    } catch (error: any) {
      console.error('重发验证邮件失败:', error);
      toast.error(error.message || '重发验证邮件失败');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <i className="fa-solid fa-store text-white text-2xl"></i>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            校园二手交易平台
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? '欢迎回来' : '创建新账户'}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 昵称（仅注册时显示） */}
            {!isLogin && (
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  昵称 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-user text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.nickname
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all`}
                    placeholder="请输入昵称（2-20个字符）"
                    maxLength={20}
                  />
                </div>
                {errors.nickname && (
                  <p className="mt-1 text-sm text-red-500">{errors.nickname}</p>
                )}
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all`}
                  placeholder="请输入邮箱地址"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all`}
                  placeholder={isLogin ? '请输入密码' : '请输入密码（至少6个字符）'}
                  minLength={6}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* 确认密码（仅注册时显示） */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fa-solid fa-lock text-gray-400"></i>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none transition-all`}
                    placeholder="请再次输入密码"
                    minLength={6}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* 邮箱未确认提示 */}
            {emailNotConfirmed && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fa-solid fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                      邮箱未验证
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                      请检查您的邮箱并点击验证链接。如果没有收到邮件，可以点击下方按钮重新发送。
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail || !formData.email}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resendingEmail ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          发送中...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          重新发送验证邮件
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  处理中...
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                  {isLogin ? '登录' : '注册'}
                </>
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              onClick={handleToggleMode}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isLogin ? (
                <>
                  <i className="fa-solid fa-user-plus mr-1"></i>
                  还没有账户？立即注册
                </>
              ) : (
                <>
                  <i className="fa-solid fa-sign-in-alt mr-1"></i>
                  已有账户？立即登录
                </>
              )}
            </button>
          </div>

          {/* 分割线 */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">或</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 text-sm transition-colors inline-flex items-center gap-1"
            >
              <i className="fa-solid fa-arrow-left"></i>
              返回首页
            </Link>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>注册即表示您同意我们的服务条款和隐私政策</p>
        </div>
      </div>
    </div>
  );
}

