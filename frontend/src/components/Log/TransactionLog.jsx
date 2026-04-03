import { motion, AnimatePresence } from 'framer-motion';
import { LogEntry } from './LogEntry.jsx';

export function TransactionLog({ log }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Transaction Log</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {log.length === 0 ? (
            <p className="text-text-muted text-sm">No operations yet</p>
          ) : (
            log.map((entry) => (
              <LogEntry key={entry.id} entry={entry} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}