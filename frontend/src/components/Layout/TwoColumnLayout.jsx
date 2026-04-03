export function TwoColumnLayout({ left, right }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">{left}</div>
      <div className="space-y-6">{right}</div>
    </div>
  );
}