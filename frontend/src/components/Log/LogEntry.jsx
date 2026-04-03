import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export function LogEntry({ entry }) {
  const isApproved = entry.violations.length === 0;
  const isAccount = !!entry.operation.account;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  const getOperationDetails = () => {
    if (isAccount) {
      const acc = entry.operation.account;
      return `Create Account: ${acc['active-card'] ? 'Active' : 'Inactive'}, $${acc['available-limit']}`;
    }
    const tx = entry.operation.transaction;
    return `${tx.merchant} - $${tx.amount}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-3 bg-background rounded-lg border ${
        isApproved ? 'border-success/30' : 'border-error/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-error" />
          )}
          <span className="text-sm text-text-primary">{getOperationDetails()}</span>
        </div>
        <span className="text-xs text-text-muted font-mono">
          {formatTime(entry.timestamp)}
        </span>
      </div>
      {entry.account && entry.account['available-limit'] !== undefined && (
        <div className="mt-2 text-sm font-mono text-text-muted">
          Balance: ${entry.account['available-limit'].toLocaleString()}
        </div>
      )}
      {entry.violations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {entry.violations.map((v) => (
            <span
              key={v}
              className="text-xs px-2 py-0.5 bg-error/20 text-error rounded"
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}