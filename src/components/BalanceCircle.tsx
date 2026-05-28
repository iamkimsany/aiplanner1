interface BalanceCircleProps {
  label: string;
  percent: number;
  color: string;
  bg: string;
}

/** Life balance circular indicator — design.md spec */
export default function BalanceCircle({ label, percent, color, bg }: BalanceCircleProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '52px',
          height: '52px',
          backgroundColor: bg,
          color,
          fontSize: '11px',
          fontWeight: 500,
          border: `1.5px solid ${color}`,
        }}
      >
        {Math.round(percent)}%
      </div>
      <span
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
