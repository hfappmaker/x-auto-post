export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <h1>X Auto Post Bot</h1>
      <p>Vercel Cronで定期的にツイートを自動投稿します。</p>
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>このアプリはAPI Routeのみを使用しています。</p>
        <p>エンドポイント: <code>/api/post</code></p>
      </div>
    </div>
  );
}
