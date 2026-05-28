interface ProgressBarProps {
  /** 0–100 */
  percent: number;
  label?: string;
}

/** Thin 8px progress bar — design.md spec */
export default function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: '8px', background: 'var(--color-bg-secondary)' }}
      >
        <div
          className="h-full rounded-full progress-fill"
          style={{ width: `${clamped}%`, background: 'var(--color-text)' }}
        />
      </div>
    </div>
  );
}
