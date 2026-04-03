import { Clock } from 'lucide-react';

export function TimeWindowViz({ transactions }) {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

  const recentTransactions = transactions.filter(
    t => new Date(t.time) >= twoMinutesAgo
  );

  const slots = [
    { index: 0, label: '1st' },
    { index: 1, label: '2nd' },
    { index: 2, label: '3rd' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-warning" />
        <h3 className="text-lg font-semibold text-text-primary">Time Window (2 min)</h3>
      </div>

      <div className="relative">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-text-muted">Now</span>
          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
            <div className="flex h-full">
              {slots.map((slot) => (
                <div
                  key={slot.index}
                  className={`flex-1 border-r border-border last:border-r-0 ${
                    recentTransactions.length > slot.index
                      ? 'bg-warning/50'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-text-muted">-2min</span>
        </div>

        <div className="flex justify-between text-xs text-text-muted">
          <span>{recentTransactions.length}/3 transactions</span>
          <span>
            {recentTransactions.length >= 3 ? '⚠️ At risk' : '✅ Available'}
          </span>
        </div>
      </div>
    </div>
  );
}