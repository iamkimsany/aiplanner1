interface BalanceCardProps {
  label: string;
  percent: number;
  bg: string;
  textColor: string;
  barColor: string;
}

export default function BalanceCard({ label, percent, bg, textColor, barColor }: BalanceCardProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      style={{
        background:   bg,
        borderRadius: '10px',
        padding:      '9px',
        textAlign:    'center',
        flex:         1,
      }}
    >
      <p style={{ fontSize: '22px', fontWeight: 600, color: textColor, lineHeight: 1 }}>
        {clamped}%
      </p>
      <p
        style={{
          fontSize:      '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color:         textColor,
          opacity:       0.7,
          marginTop:     '3px',
        }}
      >
        {label}
      </p>
      <div
        style={{
          height:       '3px',
          background:   'rgba(0,0,0,0.1)',
          borderRadius: '100px',
          marginTop:    '6px',
          overflow:     'hidden',
        }}
      >
        <div
          className="progress-fill"
          style={{ height: '100%', width: `${clamped}%`, background: barColor, borderRadius: '100px' }}
        />
      </div>
    </div>
  );
}
