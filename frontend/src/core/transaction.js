import { Transaction } from './models.js';
import { transactionValidators } from './validators/index.js';

export function processTransaction(store, transactionData) {
  let violations = [];
  for (const validator of transactionValidators) {
    const result = validator(store, transactionData);
    violations = [...violations, ...result];
  }

  let accountDict = {};
  if (violations.length === 0) {
    const tx = new Transaction(
      transactionData.merchant,
      transactionData.amount,
      transactionData.time
    );
    store.addTransaction(tx);

    const account = store.getAccount();
    if (account) {
      account.availableLimit -= transactionData.amount;
    }
  }

  const account = store.getAccount();
  if (account) {
    accountDict = {
      'active-card': account.activeCard,
      'available-limit': account.availableLimit,
    };
  }

  return [accountDict, violations];
}