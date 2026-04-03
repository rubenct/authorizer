import { useState, useCallback } from 'react';

class Store {
  constructor() { this._account = null; this._transactions = []; }
  getAccount() { return this._account; }
  setAccount(a) { this._account = a; }
  getTransactions() { return this._transactions; }
  addTransaction(t) { this._transactions.push(t); }
}

const store = new Store();

function processAccount(accountData) {
  if (store.getAccount() !== null) return [store.getAccount(), ['account-already-initialized']];
  const newAccount = { activeCard: accountData['active-card'] ?? false, availableLimit: accountData['available-limit'] ?? 0 };
  store.setAccount(newAccount);
  return [newAccount, []];
}

function processTransaction(transactionData) {
  if (!store.getAccount()) return [{}, ['account-not-initialized']];
  const account = store.getAccount();
  const violations = [];
  if (!account.activeCard) violations.push('card-not-active');
  if (account.availableLimit < transactionData.amount) violations.push('insufficient-limit');
  const now = new Date();
  const recent = store.getTransactions().filter(t => new Date(t.time) >= new Date(now.getTime() - 2*60000));
  if (recent.length >= 3) violations.push('high-frequency-small-interval');
  for (const t of recent) { if (t.merchant === transactionData.merchant && t.amount === transactionData.amount) { violations.push('doubled-transaction'); break; }}
  const accountDict = { 'active-card': account.activeCard, 'available-limit': account.availableLimit };
  if (violations.length === 0) { account.availableLimit -= transactionData.amount; store.addTransaction({ ...transactionData, time: transactionData.time }); return [{ 'active-card': account.activeCard, 'available-limit': account.availableLimit }, []]; }
  return [accountDict, violations];
}

export function useAuthorizer() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [log, setLog] = useState([]);
  const [violations, setViolations] = useState([]);

  const process = useCallback((operation) => {
    let accountDict, newViolations;
    if (operation.account) [accountDict, newViolations] = processAccount(operation.account);
    else if (operation.transaction) [accountDict, newViolations] = processTransaction({ merchant: operation.transaction.merchant, amount: operation.transaction.amount, time: operation.transaction.time || new Date() });
    else { accountDict = {}; newViolations = []; }
    const currentAccount = store.getAccount();
    setAccount(currentAccount ? { ...currentAccount } : null);
    setTransactions([...store.getTransactions()]);
    setViolations(newViolations);
    setLog(prev => [{ id: Date.now(), operation, account: accountDict, violations: newViolations, timestamp: new Date() }, ...prev]);
    return { account: accountDict, violations: newViolations };
  }, []);

  const createAccount = useCallback((activeCard, availableLimit) => process({ account: { 'active-card': activeCard, 'available-limit': parseInt(availableLimit, 10) } }), [process]);
  const authorizeTransaction = useCallback((merchant, amount, time) => process({ transaction: { merchant, amount: parseInt(amount, 10), time: time || new Date() } }), [process]);
  const processJson = useCallback((jsonStr) => { try { const op = JSON.parse(jsonStr); if (op.transaction?.time) op.transaction.time = new Date(op.transaction.time); return process(op); } catch { return { account: {}, violations: ['invalid-json'] }; } }, [process]);
  const reset = useCallback(() => { store._account = null; store._transactions = []; setAccount(null); setTransactions([]); setLog([]); setViolations([]); }, []);

  const loadScenario = useCallback((ops) => {
    reset();
    ops.forEach(op => {
      if (op.account) process({ account: op.account });
      else if (op.transaction) process({ transaction: { merchant: op.transaction.merchant, amount: op.transaction.amount, time: op.transaction.time || new Date() } });
    });
  }, [process, reset]);

  return { account, transactions, log, violations, createAccount, authorizeTransaction, processJson, loadScenario, reset, process };
}