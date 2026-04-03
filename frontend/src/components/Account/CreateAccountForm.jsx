import { useState } from 'react';
import { UserPlus } from 'lucide-react';

export function CreateAccountForm({ onSubmit, disabled }) {
  const [activeCard, setActiveCard] = useState(true);
  const [limit, setLimit] = useState(100);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(activeCard, limit);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Create Account</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-2">Available Limit</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10) || 0)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary font-mono focus:outline-none focus:border-primary"
            min="0"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="activeCard"
            checked={activeCard}
            onChange={(e) => setActiveCard(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
          />
          <label htmlFor="activeCard" className="text-text-primary">Active Card</label>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Account
        </button>
      </div>
    </form>
  );
}