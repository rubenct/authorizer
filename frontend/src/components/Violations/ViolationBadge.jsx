export function ViolationBadge({ type }) {
  const getLabel = () => {
    const labels = {
      'account-already-initialized': 'Account Already Initialized',
      'account-not-initialized': 'Account Not Initialized',
      'card-not-active': 'Card Not Active',
      'insufficient-limit': 'Insufficient Limit',
      'high-frequency-small-interval': 'High Frequency',
      'doubled-transaction': 'Doubled Transaction',
      'invalid-json': 'Invalid JSON',
    };
    return labels[type] || type;
  };

  return (
    <span className="inline-flex items-center px-3 py-1 bg-error/20 text-error text-sm rounded-lg">
      {getLabel()}
    </span>
  );
}