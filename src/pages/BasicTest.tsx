export default function BasicTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>基本测试页面</h1>
      <p>如果你能看到这个页面，说明基本路由工作正常。</p>
      <button onClick={() => alert('按钮工作正常！')}>
        点击测试
      </button>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
          返回首页
        </a>
      </div>
    </div>
  )
}