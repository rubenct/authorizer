import { Account } from './models.js';
import { accountValidators } from './validators/index.js';

export function processAccount(store, accountData) {
  let violations = [];
  for (const validator of accountValidators) {
    const result = validator(store, accountData);
    violations = [...violations, ...result];
  }

  const newAccount = new Account(
    accountData['active-card'] ?? false,
    accountData['available-limit'] ?? 0
  );

  let resultAccount = null;
  if (violations.length === 0) {
    store.setAccount(newAccount);
    resultAccount = store.getAccount();
  } else {
    resultAccount = store.getAccount();
  }

  return [resultAccount, violations];
}