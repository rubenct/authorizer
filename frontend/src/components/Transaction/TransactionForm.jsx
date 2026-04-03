import { useState } from 'react';
import { Send } from 'lucide-react';

export function TransactionForm({ onSubmit, disabled }) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(merchant, parseInt(amount, 10), new Date(time));
    setMerchant('');
    setAmount('');
    setTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Send className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">New Transaction</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-2">Merchant</label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            placeholder="Burger King"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary font-mono focus:outline-none focus:border-primary"
            placeholder="100"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !merchant || !amount}
          className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Authorize
        </button>
      </div>
    </form>
  );
}