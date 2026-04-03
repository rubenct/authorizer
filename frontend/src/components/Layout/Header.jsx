import { CreditCard, RotateCcw, HelpCircle } from 'lucide-react';

export function Header({ onReset }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-text-primary">Authorizer Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-primary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </header>
  );
}