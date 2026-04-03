import { useState } from 'react';

function TestApp() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, background: '#0a0e1a', color: '#f9fafb', minHeight: '100vh' }}>
      <h1>React Works!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default TestApp;