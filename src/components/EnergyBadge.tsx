import { EnergyLevel } from '@/lib/types';

const MAP: Record<EnergyLevel, { label: string; cls: string; icon: string }> = {
  low:    { label: '낮음', cls: 'bg-blue-100 text-blue-700',   icon: '🔋' },
  medium: { label: '보통', cls: 'bg-yellow-100 text-yellow-700', icon: '⚡' },
  high:   { label: '높음', cls: 'bg-orange-100 text-orange-700', icon: '🔥' },
};

export default function EnergyBadge({ energyLevel }: { energyLevel: EnergyLevel }) {
  const { label, cls, icon } = MAP[energyLevel];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
}
