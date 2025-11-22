import React, { useState, useEffect } from 'react';

export default function HomeSimple() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    try {
      setMessage('页面加载成功！这是一个简化版本。');
    } catch (error) {
      setMessage(`错误: ${error}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          校园二手交易平台 (简化版)
        </h1>
        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-700">{message}</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              返回完整版
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}