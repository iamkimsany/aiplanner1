import { Difficulty } from '@/lib/types';

const MAP: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: '쉬움', cls: 'bg-emerald-100 text-emerald-700' },
  middle: { label: '보통', cls: 'bg-amber-100 text-amber-700' },
  hard: { label: '어려움', cls: 'bg-red-100 text-red-700' },
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, cls } = MAP[difficulty];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
