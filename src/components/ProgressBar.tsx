interface ProgressBarProps {
  percent: number; // 0–100
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      style={{
        height: '3px',
        background: 'var(--color-border)',
        borderRadius: '100px',
        overflow: 'hidden',
      }}
    >
      <div
        className="progress-fill"
        style={{
          height: '100%',
          width: `${clamped}%`,
          background: 'var(--color-purple)',
          borderRadius: '100px',
        }}
      />
    </div>
  );
}
