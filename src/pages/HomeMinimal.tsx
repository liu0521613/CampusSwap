import React from 'react'

export default function HomeMinimal() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#2563eb',
          marginBottom: '20px'
        }}>
          校园二手交易平台 (极简版)
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#374151', marginBottom: '16px' }}>
            这是极简版本，用于测试基本功能。
          </p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="/test" 
              style={{ 
                backgroundColor: '#2563eb', 
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              基本测试
            </a>
            
            <a 
              href="/" 
              style={{ 
                backgroundColor: '#6b7280', 
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none'
              }}
            >
              完整版
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}