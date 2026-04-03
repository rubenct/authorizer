export function validate(store, accountData) {
  if (store.getAccount() !== null) {
    return ['account-already-initialized'];
  }
  return [];
}