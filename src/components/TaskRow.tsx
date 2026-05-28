'use client';

import React from 'react';

interface TaskRowProps {
  name: string;
  done: boolean;
  onToggle: () => void;
  /** 'fixed' = p-4 rounded-xl, 'goal' = p-3 rounded-lg (default) */
  variant?: 'fixed' | 'goal';
  /** 보조 텍스트 (시간, 예상 소요 시간 등) */
  meta?: React.ReactNode;
  /** 오른쪽 배지 영역 (DifficultyBadge, EnergyBadge 등) */
  trailing?: React.ReactNode;
}

export default function TaskRow({
  name,
  done,
  onToggle,
  variant = 'goal',
  meta,
  trailing,
}: TaskRowProps) {
  const isFixed = variant === 'fixed';

  return (
    <button
      onClick={onToggle}
      aria-label={`${done ? '완료 취소' : '완료'}: ${name}`}
      className={`w-full flex items-center gap-3 border transition-all text-left ${
        isFixed ? 'p-4 rounded-xl' : 'p-3 rounded-lg'
      } ${
        done
          ? 'bg-gray-50 border-gray-100 opacity-60'
          : isFixed
          ? 'bg-white border-gray-200 hover:border-indigo-300'
          : 'bg-white border-white hover:border-gray-200'
      }`}
    >
      {/* 원형 체크박스 */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
        }`}
      >
        {done && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-gray-800 ${isFixed ? '' : 'text-sm'} ${
            done ? 'line-through text-gray-400' : ''
          }`}
        >
          {name}
        </p>
        {meta && <div className="text-xs text-gray-400 mt-0.5">{meta}</div>}
      </div>

      {/* 오른쪽 배지 */}
      {trailing}
    </button>
  );
}
