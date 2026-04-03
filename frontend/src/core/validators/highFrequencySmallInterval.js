export function validate(store, transactionData) {
  const account = store.getAccount();
  if (account === null) {
    return [];
  }

  const currentTime = transactionData.time;
  if (!currentTime) {
    return [];
  }

  const twoMinutesAgo = new Date(currentTime.getTime() - 2 * 60 * 1000);

  const recentTransactions = store.getTransactions().filter(
    t => t.time >= twoMinutesAgo
  );

  if (recentTransactions.length >= 3) {
    return ['high-frequency-small-interval'];
  }
  return [];
}