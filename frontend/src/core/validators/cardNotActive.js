export function validate(store, transactionData) {
  const account = store.getAccount();
  if (account === null) {
    return [];
  }
  if (!account.activeCard) {
    return ['card-not-active'];
  }
  return [];
}