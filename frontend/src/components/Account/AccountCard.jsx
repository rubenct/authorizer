import { CreditCard } from 'lucide-react';

export function AccountCard({ account, violations }) {
  const hasViolations = violations && violations.length > 0;
  
  const balanceColor = !account
    ? 'text-text-muted'
    : account.availableLimit > 300
    ? 'text-success'
    : account.availableLimit > 100
    ? 'text-warning'
    : 'text-error';

  return (
    <div className={`bg-surface border rounded-xl p-6 transition-all ${hasViolations ? 'animate-shake border-error' : 'border-border'}`}>
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Account</h2>
      </div>
      
      {!account ? (
        <p className="text-text-muted">No account initialized</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold font-mono ${balanceColor}`}>
              ${account['available-limit'].toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${account['active-card'] ? 'bg-success' : 'bg-error'}`}></span>
            <span className="text-text-muted">
              {account['active-card'] ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}