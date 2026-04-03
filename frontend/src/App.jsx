import { useState } from 'react';
import { useAuthorizer } from './hooks/useAuthorizer.js';

const scenarios = [
  { id: 'happy', name: 'Happy Path', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'BK', amount:20, time:new Date() }}]},
  { id: 'insufficient', name: 'Insufficient Limit', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'Vivara', amount:150, time:new Date() }}]},
  { id: 'high', name: 'High Frequency', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'A', amount:10, time:new Date(Date.now()-1000) }}, { transaction:{ merchant:'B', amount:10, time:new Date(Date.now()-500) }}, { transaction:{ merchant:'C', amount:10, time:new Date() }}, { transaction:{ merchant:'D', amount:10, time:new Date() }}]},
];

const cardStyle = { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };

function App() {
  const { account, transactions, log, violations, createAccount, authorizeTransaction, reset, loadScenario, process } = useAuthorizer();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState('initial');

  const handleReset = () => {
    reset();
    setViewMode('initial');
  };
  
  const handleCreate = () => { 
    reset();
    createAccount(true, 100); 
    setViewMode('high-level');
  };
  
  const handleJsonInitial = () => { 
    if (jsonInput) { 
      try { 
        const op = JSON.parse(jsonInput); 
        if (op.transaction?.time) op.transaction.time = new Date(op.transaction.time);
        process(op); 
      } catch {} 
      setJsonInput(''); 
    }
  };

  const handleTx = () => { if (merchant && amount) { authorizeTransaction(merchant, parseInt(amount,10), new Date()); setMerchant(''); setAmount(''); }};

  const balanceColor = !account ? '#6b7280' : account.availableLimit > 300 ? '#059669' : account.availableLimit > 100 ? '#d97706' : '#dc2626';

  return (
    <div style={{ minHeight: '100vh', background: '#e5e7eb', color: '#111827', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#1f2937' }}>Authorizer Dashboard</h1>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          {viewMode === 'high-level' && (
            <button 
              onMouseEnter={() => setShowHelp(true)} 
              onMouseLeave={() => setShowHelp(false)}
              style={{ padding: '10px 16px', background: '#fff', border: '2px solid #d1d5db', borderRadius: 12, color: '#4b5563', fontWeight: 600, fontSize: 18, cursor: 'help' }}
            >
              ?
            </button>
          )}
          {showHelp && viewMode === 'high-level' && (
            <div style={{ position: 'absolute', top: 50, right: 0, width: 280, background: '#fff', border: '2px solid #d1d5db', borderRadius: 12, padding: 16, boxShadow: '0 8px 16px rgba(0,0,0,0.15)', zIndex: 100 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>📖 Validation Rules</h4>
              <ul style={{ fontSize: 13, lineHeight: 1.8, color: '#4b5563', paddingLeft: 16 }}>
                <li>🔴 <strong>account-already-initialized:</strong> Only one account allowed</li>
                <li>🔴 <strong>account-not-initialized:</strong> Account must exist first</li>
                <li>🔴 <strong>card-not-active:</strong> Card must be active</li>
                <li>🔴 <strong>insufficient-limit:</strong> Amount cannot exceed balance</li>
                <li>🔴 <strong>high-frequency-small-interval:</strong> Max 3 txns in 2 min</li>
                <li>🔴 <strong>doubled-transaction:</strong> No duplicate merchant+amount in 2 min</li>
              </ul>
            </div>
          )}
          <button type="button" onClick={handleReset} style={{ padding: '10px 20px', background: '#fff', border: '2px solid #d1d5db', borderRadius: 12, color: '#4b5563', fontWeight: 600 }}>Reset</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>💳 Account</h2>
            {!account ? <p style={{ color: '#6b7280', fontSize: 18 }}>No account initialized</p> : <p style={{ fontSize: 56, fontWeight: 'bold', color: balanceColor }}>${account?.availableLimit}</p>}
          </div>

          {violations.length > 0 && (
            <div style={{ ...cardStyle, borderColor: '#f87171', background: '#fef2f2' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#dc2626' }}>⚠️ Violations</h3>
              {violations.map(v => <span key={v} style={{ color: '#dc2626', fontSize: 16, fontWeight: 500 }}>{v} </span>)}
            </div>
          )}

          {viewMode === 'initial' && (
            <>
              <div style={{ ...cardStyle, background: '#dbeafe', borderColor: '#93c5fd' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1e40af' }}>📖 How to Use</h3>
                <ul style={{ color: '#1e3a8a', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
                  <li>Click <strong>"Create Account"</strong> to start</li>
                  <li>Authorize transactions by entering merchant & amount</li>
                  <li>Use <strong>Scenarios</strong> to test specific cases</li>
                  <li>Use <strong>Raw JSON</strong> for direct input</li>
                </ul>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8, color: '#1e40af' }}>Raw JSON Examples:</h4>
                <div style={{ background: '#1e3a8a', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ color: '#93c5fd', fontSize: 12, fontFamily: 'monospace', marginBottom: 8 }}>{'{"account": {"active-card": true, "available-limit": 100}}'}</p>
                  <p style={{ color: '#93c5fd', fontSize: 12, fontFamily: 'monospace' }}>{'{"transaction": {"merchant": "BK", "amount": 20, "time": "2024-01-01T10:00:00Z"}}'}</p>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 12, marginBottom: 8, color: '#1e40af' }}>Validation Rules:</h4>
                <ul style={{ color: '#1e3a8a', fontSize: 13, lineHeight: 1.6, paddingLeft: 20 }}>
                  <li>🔴 <strong>account-already-initialized:</strong> Only one account allowed</li>
                  <li>🔴 <strong>account-not-initialized:</strong> Account must exist first</li>
                  <li>🔴 <strong>card-not-active:</strong> Card must be active</li>
                  <li>🔴 <strong>insufficient-limit:</strong> Amount cannot exceed balance</li>
                  <li>🔴 <strong>high-frequency-small-interval:</strong> Max 3 txns in 2 min</li>
                  <li>🔴 <strong>doubled-transaction:</strong> No duplicate merchant+amount in 2 min</li>
                </ul>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>📝 Raw JSON</h3>
                <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='{"account": {"active-card": true, "available-limit": 100}}' style={{ width: '100%', height: 80, background: '#fff', border: '2px solid #d1d5db', borderRadius: 8, color: '#111827', fontFamily: 'monospace', fontSize: 14 }} />
                <button type="button" onClick={handleJsonInitial} style={{ marginTop: 12, width: '100%', padding: 14, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 16 }}>▶ Run</button>
              </div>

              <button type="button" onClick={handleCreate} style={{ padding: 18, background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 18 }}>Create Account</button>
            </>
          )}

          {viewMode === 'high-level' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>💸 New Transaction</h3>
                <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Merchant name" style={{ width: '100%', padding: 12, marginBottom: 10, background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#111827', fontSize: 16 }} />
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" style={{ width: '100%', padding: 12, marginBottom: 10, background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#111827', fontSize: 16 }} />
                <button type="button" onClick={handleTx} style={{ width: '100%', padding: 14, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 16 }}>Authorize</button>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1f2937' }}>🎯 Scenarios</h3>
                <select 
                  onChange={e => { 
                    const s = scenarios.find(x => x.id === e.target.value); 
                    if (s) loadScenario(s.ops); 
                    e.target.value = '';
                  }} 
                  style={{ width: '100%', padding: 12, background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#111827', fontSize: 16 }}
                >
                  <option value="">Select a scenario...</option>
                  {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>📋 Transaction Log</h3>
          {log.length === 0 ? <p style={{ color: '#6b7280', fontSize: 16 }}>No operations yet</p> : log.map(l => (
            <div key={l.id} style={{ padding: 16, background: '#fff', borderRadius: 10, marginBottom: 10, borderLeft: l.violations.length ? '5px solid #dc2626' : '5px solid #10b981', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{l.operation.account ? '✅ Account created' : `💰 ${l.operation.transaction?.merchant} - $${l.operation.transaction?.amount}`}</span>
              {l.violations.length > 0 && <span style={{ color: '#dc2626', display: 'block', fontSize: 14, marginTop: 4 }}>{l.violations.join(', ')}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
