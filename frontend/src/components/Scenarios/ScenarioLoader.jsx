import { PlayCircle } from 'lucide-react';

export function ScenarioLoader({ scenarios, onLoad }) {
  const handleChange = (e) => {
    const scenarioId = e.target.value;
    if (scenarioId) {
      onLoad(scenarioId);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <PlayCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Load Scenario</h3>
      </div>

      <select
        onChange={handleChange}
        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
        defaultValue=""
      >
        <option value="" disabled>Select a scenario...</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}