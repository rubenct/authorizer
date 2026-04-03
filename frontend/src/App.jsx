import { useState, useEffect, useRef } from 'react';
import { useAuthorizer } from './hooks/useAuthorizer.js';

const scenarios = [
  { id: 'happy', name: '✅ Happy Path', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'BK', amount:20, time:new Date() }}]},
  { id: 'insufficient', name: '❌ Insufficient Limit', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'Vivara', amount:150, time:new Date() }}]},
  { id: 'high', name: '❌ High Frequency', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'A', amount:10, time:new Date(Date.now()-1000) }}, { transaction:{ merchant:'B', amount:10, time:new Date(Date.now()-500) }}, { transaction:{ merchant:'C', amount:10, time:new Date() }}, { transaction:{ merchant:'D', amount:10, time:new Date() }}]},
  { id: 'doubled', name: '❌ Doubled Transaction', ops: [{ account: {'active-card':true, 'available-limit':100 }}, { transaction:{ merchant:'BK', amount:20, time:new Date() }}, { transaction:{ merchant:'BK', amount:20, time:new Date(Date.now()+1000) }}]},
];

const cardStyle = { 
  background: 'var(--bg-surface)', 
  border: '1px solid var(--border-color)', 
  borderRadius: 12, 
  padding: 16, 
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)' 
};

const colors = {
  bgPrimary: '#0a0e1a',
  bgSurface: '#111827',
  border: '#1f2937',
  primary: '#3b82f6',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  textPrimary: '#f9fafb',
  textMuted: '#6b7280',
};

function TimeWindowViz({ transactions }) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 2 * 60000);
  const recentTxns = transactions.filter(t => new Date(t.time) >= windowStart);
  const atRisk = recentTxns.length >= 2;

  return (
    <div style={{ ...cardStyle, marginTop: 12 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>⏱️ Time Window (2 min)</h4>
      <div style={{ 
        height: 24, 
        background: 'var(--border-color)', 
        borderRadius: 6, 
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '30%',
          background: 'rgba(59, 130, 246, 0.2)',
          borderRight: '1px dashed var(--border-color)'
        }} />
        {recentTxns.map((t, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 25}%`,
            top: 4,
            width: 12,
            height: 16,
            background: colors.primary,
            borderRadius: 3
          }} />
        ))}
      </div>
      <p style={{ fontSize: 12, color: atRisk ? colors.warning : colors.textMuted, marginTop: 6 }}>
        {recentTxns.length}/3 transactions • {atRisk ? '⚠️ Next will trigger violation!' : '✅ Safe'}
      </p>
    </div>
  );
}

function App() {
  const { account, transactions, log, violations, createAccount, authorizeTransaction, reset, loadScenario, process } = useAuthorizer();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState('initial');
  const [shake, setShake] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (violations.length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [violations]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

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

  const balanceColor = !account 
    ? colors.textMuted 
    : account.availableLimit > 300 
      ? colors.success 
      : account.availableLimit > 100 
        ? colors.warning 
        : colors.error;

  const balancePercent = account ? (account.availableLimit / 100) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: colors.bgPrimary, color: colors.textPrimary, padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="https://www.rcarino.com/" style={{ textDecoration: 'none', padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: colors.textMuted, fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>🏠 Home</a>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>Authorizer</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: colors.textMuted, fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <svg height="14" viewBox="0 0 16 16" version="1.1" width="14" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            GitHub
          </a>
          {viewMode === 'high-level' && (
            <button 
              onMouseEnter={() => setShowHelp(true)} 
              onMouseLeave={() => setShowHelp(false)}
              style={{ padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: colors.textMuted, fontWeight: 600, fontSize: 13, cursor: 'help', transition: 'all 0.2s' }}
            >
              ?
            </button>
          )}
          {showHelp && viewMode === 'high-level' && (
            <div style={{ position: 'absolute', top: 40, right: 0, width: 220, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.4)', zIndex: 100 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: colors.textPrimary }}>📖 Rules</h4>
              <ul style={{ fontSize: 11, lineHeight: 1.6, color: colors.textMuted, paddingLeft: 12, margin: 0 }}>
                <li>account-already-initialized</li>
                <li>account-not-initialized</li>
                <li>card-not-active</li>
                <li>insufficient-limit</li>
                <li>high-frequency-small-interval</li>
                <li>doubled-transaction</li>
              </ul>
            </div>
          )}
          <button type="button" onClick={handleReset} style={{ padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: colors.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>↺ Reset</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: { base: '1fr', md: '1fr 1fr' }, gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ 
            ...cardStyle, 
            transform: shake ? 'translateX(-4px)' : 'none',
            transition: 'transform 0.1s'
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Available Limit</h2>
            {!account 
              ? <p style={{ color: colors.textMuted, fontSize: 16 }}>No account</p> 
              : <>
                <p style={{ fontSize: 36, fontWeight: 700, color: balanceColor, margin: '8px 0', fontFamily: 'JetBrains Mono, monospace' }}>${account.availableLimit}</p>
                <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(balancePercent, 100)}%`, 
                    height: '100%', 
                    background: balanceColor,
                    transition: 'width 0.3s ease, background 0.3s ease'
                  }} />
                </div>
              </>
            }
          </div>

          {violations.length > 0 && (
            <div style={{ ...cardStyle, borderColor: colors.error, background: 'rgba(239, 68, 68, 0.1)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.error, marginBottom: 8 }}>⚠️ Violations</h3>
              {violations.map(v => (
                <span key={v} style={{ color: colors.error, fontSize: 13, display: 'block' }}>• {v}</span>
              ))}
            </div>
          )}

          {viewMode === 'initial' && (
            <>
              <div style={{ ...cardStyle, borderColor: colors.primary, background: 'rgba(59, 130, 246, 0.1)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>📖 How to Use</h3>
                <ul style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
                  <li>Click <strong style={{ color: colors.success }}>Create Account</strong> to start</li>
                  <li>Authorize transactions</li>
                  <li>Use <strong>Scenarios</strong> to test</li>
                </ul>
              </div>

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.textPrimary }}>📝 Raw JSON</h3>
                <textarea 
                  value={jsonInput} 
                  onChange={e => setJsonInput(e.target.value)} 
                  placeholder='{"account": {"active-card": true, "available-limit": 100}}' 
                  style={{ 
                    width: '100%', 
                    height: 60, 
                    background: colors.bgPrimary, 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 6, 
                    color: colors.textPrimary, 
                    fontFamily: 'JetBrains Mono, monospace', 
                    fontSize: 12,
                    padding: 8,
                    resize: 'none'
                  }} 
                />
                <button 
                  type="button" 
                  onClick={handleJsonInitial} 
                  style={{ 
                    marginTop: 8, 
                    width: '100%', 
                    padding: 10, 
                    background: colors.primary, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 6, 
                    fontWeight: 600, 
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ▶ Run
                </button>
              </div>

              <button 
                type="button" 
                onClick={handleCreate} 
                style={{ 
                  padding: 14, 
                  background: colors.success, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8, 
                  fontWeight: 700, 
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Create Account
              </button>
            </>
          )}

          {viewMode === 'high-level' && (
            <>
              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.textPrimary }}>💸 New Transaction</h3>
                <input 
                  value={merchant} 
                  onChange={e => setMerchant(e.target.value)} 
                  placeholder="Merchant name" 
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    marginBottom: 8, 
                    background: colors.bgPrimary, 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 6, 
                    color: colors.textPrimary, 
                    fontSize: 13 
                  }} 
                />
                <input 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="Amount" 
                  type="number" 
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    marginBottom: 8, 
                    background: colors.bgPrimary, 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 6, 
                    color: colors.textPrimary, 
                    fontSize: 13 
                  }} 
                />
                <button 
                  type="button" 
                  onClick={handleTx} 
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    background: colors.primary, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 6, 
                    fontWeight: 600, 
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Authorize
                </button>
              </div>

              <TimeWindowViz transactions={transactions} />

              <div style={cardStyle}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: colors.textPrimary }}>🎯 Scenarios</h3>
                <select 
                  onChange={e => { 
                    const s = scenarios.find(x => x.id === e.target.value); 
                    if (s) loadScenario(s.ops); 
                    e.target.value = '';
                  }} 
                  style={{ 
                    width: '100%', 
                    padding: 10, 
                    background: colors.bgPrimary, 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 6, 
                    color: colors.textPrimary, 
                    fontSize: 13 
                  }}
                >
                  <option value="" style={{ color: colors.textMuted }}>Select...</option>
                  {scenarios.map(s => <option key={s.id} value={s.id} style={{ color: colors.textPrimary }}>{s.name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>📋 Transaction Log</h3>
          {log.length === 0 
            ? <p style={{ color: colors.textMuted, fontSize: 13 }}>No operations yet</p> 
            : <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {log.map(l => (
                  <div 
                    key={l.id} 
                    style={{ 
                      padding: 10, 
                      background: colors.bgPrimary, 
                      borderRadius: 6, 
                      marginBottom: 8, 
                      borderLeft: `3px solid ${l.violations.length ? colors.error : colors.success}`,
                      animation: 'slideIn 0.3s ease-out'
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                      {l.operation.account ? '✅ Account created' : `💰 ${l.operation.transaction?.merchant} - $${l.operation.transaction?.amount}`}
                    </span>
                    {l.violations.length > 0 && (
                      <span style={{ color: colors.error, display: 'block', fontSize: 11, marginTop: 4 }}>
                        {l.violations.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
