'use client';

export type FilterKey = 'all' | 'easy' | 'middle' | 'hard' | 'completed';

const TABS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: '전체' },
  { key: 'easy',      label: '쉬움' },
  { key: 'middle',    label: '보통' },
  { key: 'hard',      label: '어려움' },
  { key: 'completed', label: '완료' },
];

interface FilterTabsProps {
  activeFilter: FilterKey;
  onChange: (key: FilterKey) => void;
}

export default function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeFilter === tab.key
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
