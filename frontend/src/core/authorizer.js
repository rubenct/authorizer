import * as account from './account.js';
import * as transaction from './transaction.js';

export function processOperation(store, operation) {
  if (operation.account) {
    const [accountResult, violations] = account.processAccount(store, operation.account);
    const accountDict = accountResult
      ? { 'active-card': accountResult.activeCard, 'available-limit': accountResult.availableLimit }
      : {};
    return [accountDict, violations];
  }

  if (operation.transaction) {
    return transaction.processTransaction(store, operation.transaction);
  }

  return [{}, []];
}