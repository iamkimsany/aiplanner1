interface NavigationDotsProps {
  total: number;
  current: number; // 0-indexed
}

export default function NavigationDots({ total, current }: NavigationDotsProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? '18px' : '6px',
            height: '6px',
            borderRadius: i === current ? '3px' : '50%',
            background:
              i === current
                ? 'var(--color-text)'
                : 'var(--color-border-medium)',
            transition: 'width 0.2s ease, background 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}
