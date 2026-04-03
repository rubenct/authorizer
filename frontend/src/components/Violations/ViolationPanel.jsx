import { AlertTriangle } from 'lucide-react';
import { ViolationBadge } from './ViolationBadge.jsx';

export function ViolationPanel({ violations }) {
  if (!violations || violations.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-error/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-error" />
        <h3 className="text-lg font-semibold text-text-primary">Violations</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {violations.map((v) => (
          <ViolationBadge key={v} type={v} />
        ))}
      </div>
    </div>
  );
}