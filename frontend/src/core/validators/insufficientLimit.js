export function validate(store, transactionData) {
  const account = store.getAccount();
  if (account === null) {
    return [];
  }
  const amount = transactionData.amount || 0;
  if (account.availableLimit < amount) {
    return ['insufficient-limit'];
  }
  return [];
}