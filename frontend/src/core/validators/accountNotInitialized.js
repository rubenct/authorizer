export function validate(store, transactionData) {
  if (store.getAccount() === null) {
    return ['account-not-initialized'];
  }
  return [];
}