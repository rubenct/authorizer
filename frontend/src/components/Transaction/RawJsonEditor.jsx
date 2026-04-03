import { useState } from 'react';
import { Code, Play } from 'lucide-react';

export function RawJsonEditor({ onSubmit }) {
  const [json, setJson] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (json.trim()) {
      onSubmit(json);
      setJson('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Raw JSON Mode</h3>
      </div>

      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-32 px-4 py-2 bg-background border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-primary resize-none"
        placeholder='{"transaction": {"merchant": "BK", "amount": 20, "time": "2019-02-13T10:00:00.000Z"}}'
      />

      <button
        type="submit"
        disabled={!json.trim()}
        className="mt-4 w-full py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Run
      </button>
    </form>
  );
}