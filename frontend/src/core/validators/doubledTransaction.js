export function validate(store, transactionData) {
  const account = store.getAccount();
  if (account === null) {
    return [];
  }

  const currentTime = transactionData.time;
  if (!currentTime) {
    return [];
  }

  const currentMerchant = transactionData.merchant || '';
  const currentAmount = transactionData.amount || 0;

  const twoMinutesAgo = new Date(currentTime.getTime() - 2 * 60 * 1000);

  for (const t of store.getTransactions()) {
    if (t.time >= twoMinutesAgo) {
      if (t.merchant === currentMerchant && t.amount === currentAmount) {
        return ['doubled-transaction'];
      }
    }
  }
  return [];
}