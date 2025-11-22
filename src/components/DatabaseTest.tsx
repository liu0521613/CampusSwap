import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getItems } from '@/lib/database'

export default function DatabaseTest() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // 测试基本连接
      const { data, error } = await supabase.from('items').select('count').limit(1)
      
      if (error) {
        throw error
      }
      
      setStatus('connected')
      
      // 尝试获取一些数据
      try {
        const items = await getItems()
        setItems(items)
      } catch (err) {
        console.log('获取数据失败，但连接正常:', err)
      }
    } catch (err: any) {
      setStatus('error')
      setError(err.message)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '✅ 数据库连接成功'
      case 'error': return '❌ 数据库连接失败'
      default: return '🔄 正在连接数据库...'
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">数据库连接状态</h3>
      <div className={`font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      
      {status === 'error' && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          {error}
        </div>
      )}
      
      {status === 'connected' && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            连接 URL: https://alsgwxqelsnwhlbtjjxf.supabase.co
          </p>
          {items.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              发现 {items.length} 条商品数据
            </p>
          )}
          <button 
            onClick={testConnection}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            重新测试
          </button>
        </div>
      )}
    </div>
  )
}