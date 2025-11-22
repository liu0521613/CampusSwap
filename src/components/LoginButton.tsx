import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/authContext'
import AuthModal from './AuthModal'

export default function LoginButton() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate('/my-items')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-1"
          title="我的商品"
        >
          <i className="fa-solid fa-box"></i>
          <span className="hidden sm:inline">我的商品</span>
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
          {user.email}
        </span>
        <button
          onClick={logout}
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300"
          title="退出登录"
        >
          <i className="fa-solid fa-sign-out-alt"></i>
          <span className="hidden sm:inline ml-1">退出</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => navigate('/auth')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300"
      >
        <i className="fa-solid fa-sign-in-alt mr-1"></i>
        登录
      </button>
      
      {/* 保留模态框作为备选，可以通过右键或其他方式访问 */}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAuthSuccess={() => setShowModal(false)}
      />
    </>
  )
}