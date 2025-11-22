import React from 'react'

export default function DebugInfo() {
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div>Debug Info:</div>
      <div>Window: {typeof window !== 'undefined' ? 'Client' : 'Server'}</div>
      <div>React: {React.version}</div>
      <div>Timestamp: {new Date().toISOString()}</div>
    </div>
  )
}