interface ProgressBarProps {
  percent: number;
  label?: string;
}

export default function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    clamped >= 80
      ? 'bg-emerald-500'
      : clamped >= 50
      ? 'bg-amber-400'
      : 'bg-indigo-400';

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-600">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
