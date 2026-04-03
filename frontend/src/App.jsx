import { useState } from 'react';
import { useAuthorizer } from './hooks/useAuthorizer.js';

const scenarios = [
  { id: 'happy', name: 'Happy Path', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'BK', amount:20, time:new Date() }}]},
  { id: 'insufficient', name: 'Insufficient Limit', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'Vivara', amount:150, time:new Date() }}]},
  { id: 'high', name: 'High Frequency', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'A', amount:10, time:new Date(Date.now()-1000) }}, { transaction:{ merchant:'B', amount:10, time:new Date(Date.now()-500) }}, { transaction:{ merchant:'C', amount:10, time:new Date() }}, { transaction:{ merchant:'D', amount:10, time:new Date() }}]},
];

const cardStyle = { background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 12, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };

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
    <div style={{ minHeight: '100vh', background: '#e5e7eb', color: '#111827', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://www.rcarino.com/" style={{ textDecoration: 'none', padding: '8px 14px', background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#4b5563', fontWeight: 600, fontSize: 14 }}>🏠 Home</a>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937' }}>Authorizer Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#4b5563', fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            GitHub
          </a>
          {viewMode === 'high-level' && (
            <button 
              onMouseEnter={() => setShowHelp(true)} 
              onMouseLeave={() => setShowHelp(false)}
              style={{ padding: '8px 14px', background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, color: '#4b5563', fontWeight: 600, fontSize: 16, cursor: 'help' }}
            >
              ?
            </button>
          )}
          {showHelp && viewMode === 'high-level' && (
            <div style={{ position: 'absolute', top: 40, right: 0, width: 240, background: '#fff', border: '2px solid #d1d5db', borderRadius: 10, padding: 12, boxShadow: '0 4px 8px rgba(0,0,0,0.15)', zIndex: 100 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>📖 Validation Rules</h4>
              <ul style={{ fontSize: 12, lineHeight: 1.6, color: '#4b5563', paddingLeft: 12 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>💳 Account</h2>
            {!account ? <p style={{ color: '#6b7280', fontSize: 16 }}>No account initialized</p> : <p style={{ fontSize: 36, fontWeight: 'bold', color: balanceColor }}>${account?.availableLimit}</p>}
          </div>

          {violations.length > 0 && (
            <div style={{ ...cardStyle, borderColor: '#f87171', background: '#fef2f2' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#dc2626' }}>⚠️ Violations</h3>
              {violations.map(v => <span key={v} style={{ color: '#dc2626', fontSize: 16, fontWeight: 500 }}>{v} </span>)}
            </div>
          )}

          {viewMode === 'initial' && (
            <>
              <div style={{ ...cardStyle, background: '#dbeafe', borderColor: '#93c5fd', padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1e40af' }}>📖 How to Use</h3>
                <ul style={{ color: '#1e3a8a', fontSize: 12, lineHeight: 1.6, paddingLeft: 16, marginBottom: 8 }}>
                  <li>Click <strong>"Create Account"</strong> to start</li>
                  <li>Authorize transactions by entering merchant & amount</li>
                  <li>Use <strong>Scenarios</strong> to test specific cases</li>
                  <li>Use <strong>Raw JSON</strong> for direct input</li>
                </ul>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#1e40af' }}>Raw JSON:</h4>
                <div style={{ background: '#1e3a8a', padding: 8, borderRadius: 6 }}>
                  <p style={{ color: '#93c5fd', fontSize: 11, fontFamily: 'monospace' }}>{'{"account": {"active-card": true, "available-limit": 100}}'}</p>
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>📝 Raw JSON</h3>
                <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='{"account": {"active-card": true, "available-limit": 100}}' style={{ width: '100%', height: 60, background: '#fff', border: '2px solid #d1d5db', borderRadius: 8, color: '#111827', fontFamily: 'monospace', fontSize: 13 }} />
                <button type="button" onClick={handleJsonInitial} style={{ marginTop: 8, width: '100%', padding: 10, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>▶ Run</button>
              </div>

              <button type="button" onClick={handleCreate} style={{ padding: 14, background: '#10b981', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16 }}>Create Account</button>
            </>
          )}

          {viewMode === 'high-level' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>💸 New Transaction</h3>
                <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Merchant name" style={{ width: '100%', padding: 10, marginBottom: 8, background: '#fff', border: '2px solid #d1d5db', borderRadius: 8, color: '#111827', fontSize: 14 }} />
                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" style={{ width: '100%', padding: 10, marginBottom: 8, background: '#fff', border: '2px solid #d1d5db', borderRadius: 8, color: '#111827', fontSize: 14 }} />
                <button type="button" onClick={handleTx} style={{ width: '100%', padding: 10, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Authorize</button>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>🎯 Scenarios</h3>
                <select 
                  onChange={e => { 
                    const s = scenarios.find(x => x.id === e.target.value); 
                    if (s) loadScenario(s.ops); 
                    e.target.value = '';
                  }} 
                  style={{ width: '100%', padding: 10, background: '#fff', border: '2px solid #d1d5db', borderRadius: 8, color: '#111827', fontSize: 14 }}
                >
                  <option value="">Select a scenario...</option>
                  {scenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>📋 Transaction Log</h3>
          {log.length === 0 ? <p style={{ color: '#6b7280', fontSize: 14 }}>No operations yet</p> : log.map(l => (
            <div key={l.id} style={{ padding: 10, background: '#fff', borderRadius: 8, marginBottom: 8, borderLeft: l.violations.length ? '4px solid #dc2626' : '4px solid #10b981', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{l.operation.account ? '✅ Account created' : `💰 ${l.operation.transaction?.merchant} - $${l.operation.transaction?.amount}`}</span>
              {l.violations.length > 0 && <span style={{ color: '#dc2626', display: 'block', fontSize: 12, marginTop: 4 }}>{l.violations.join(', ')}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
