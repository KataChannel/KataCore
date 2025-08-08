export default function FastTestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ color: 'green' }}>✅ Fast Loading Test</h1>
      <p>This page should load instantly without external dependencies.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
