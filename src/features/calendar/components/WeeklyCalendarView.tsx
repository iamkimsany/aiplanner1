'use client';

import { useMemo } from 'react';
import { AppData, FixedTask, GoalTask, DailyRecord } from '@/lib/types';
import { getDailyRecord, computeDayProgress } from '@/lib/store';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** Returns Sun–Sat week containing `anchorDate`, as "YYYY-MM-DD" strings. */
function getWeekDates(anchorDate: Date): string[] {
  const dow = anchorDate.getDay();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(anchorDate);
    d.setDate(anchorDate.getDate() - dow + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** "2026년 5월 25일 ~ 31일" or "~ 6월 1일" for month boundaries */
function formatWeekRange(dates: string[]): string {
  const first = new Date(dates[0] + 'T00:00:00');
  const last = new Date(dates[6] + 'T00:00:00');
  const startLabel = `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일`;
  if (first.getMonth() === last.getMonth()) {
    return `${startLabel} ~ ${last.getDate()}일`;
  }
  return `${startLabel} ~ ${last.getMonth() + 1}월 ${last.getDate()}일`;
}

function formatDateLabel(dateStr: string): { month: number; day: number; dow: number } {
  const d = new Date(dateStr + 'T00:00:00');
  return { month: d.getMonth() + 1, day: d.getDate(), dow: d.getDay() };
}

function progressColor(pct: number): string {
  if (pct === 0) return '';
  if (pct < 50) return 'bg-amber-50 ring-1 ring-amber-200';
  if (pct < 100) return 'bg-emerald-50 ring-1 ring-emerald-200';
  return 'bg-emerald-100 ring-1 ring-emerald-400';
}

// P5 — DayColumn: data: AppData 대신 필요한 값만 props로 받음
interface DayColumnProps {
  dateStr: string;
  isToday: boolean;
  fixedTasks: FixedTask[];  // 이 날에 해당하는 고정 일정 (부모에서 필터+정렬)
  goalTasks: GoalTask[];
  record: DailyRecord;      // 이 날의 완료 기록 (부모에서 조회)
  progress: number;         // 이 날의 진행률 (부모에서 계산)
  onToggleFixed: (date: string, taskId: string) => void;
  onToggleGoal: (date: string, taskId: string) => void;
}

function DayColumn({
  dateStr,
  isToday,
  fixedTasks,
  goalTasks,
  record,
  progress,
  onToggleFixed,
  onToggleGoal,
}: DayColumnProps) {
  const { month, day, dow } = formatDateLabel(dateStr);

  const isSunday = dow === 0;
  const isSaturday = dow === 6;

  return (
    <div
      className={`flex flex-col min-w-0 rounded-xl overflow-hidden border ${
        isToday ? 'border-indigo-300' : 'border-gray-100'
      }`}
    >
      {/* Day header */}
      <div
        className={`px-2 py-2 text-center ${
          isToday
            ? 'bg-indigo-600 text-white'
            : isSunday
            ? 'bg-red-50 text-red-500'
            : isSaturday
            ? 'bg-blue-50 text-blue-500'
            : 'bg-white text-gray-600'
        }`}
      >
        <p className={`text-xs font-semibold ${isToday ? 'text-indigo-100' : 'text-gray-400'}`}>
          {month}/{day}
        </p>
        <p className="text-sm font-bold leading-none">{DAY_LABELS[dow]}</p>
        {progress > 0 && (
          <div className="mt-1 flex justify-center">
            <span
              className={`inline-block w-5 h-1 rounded-full ${
                progress === 100
                  ? isToday
                    ? 'bg-indigo-200'
                    : 'bg-emerald-400'
                  : isToday
                  ? 'bg-indigo-300'
                  : 'bg-amber-400'
              }`}
            />
          </div>
        )}
      </div>

      {/* Tasks body */}
      <div className={`flex-1 p-1.5 space-y-1 ${progressColor(progress)} min-h-[80px]`}>
        {fixedTasks.length === 0 && goalTasks.length === 0 && (
          <p className="text-xs text-gray-300 text-center pt-3">-</p>
        )}

        {fixedTasks.map((task) => {
          const done = record.completedFixedTaskIds.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => onToggleFixed(dateStr, task.id)}
              aria-label={`${done ? '완료 취소' : '완료'}: ${task.name}`}
              className={`w-full text-left rounded-lg px-1.5 py-1 text-xs transition-all ${
                done
                  ? 'bg-gray-100 text-gray-400 line-through'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <span className="block font-medium truncate">{task.name}</span>
              <span className={`block text-[10px] ${done ? 'text-gray-300' : 'text-indigo-400'}`}>
                {task.startTime}–{task.endTime}
              </span>
            </button>
          );
        })}

        {goalTasks.map((task) => {
          const done = record.completedGoalTaskIds.includes(task.id);
          const diffColor =
            task.difficulty === 'easy'
              ? done
                ? 'bg-gray-100 text-gray-400'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              : task.difficulty === 'middle'
              ? done
                ? 'bg-gray-100 text-gray-400'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              : done
              ? 'bg-gray-100 text-gray-400'
              : 'bg-red-50 text-red-800 hover:bg-red-100';

          return (
            <button
              key={task.id}
              onClick={() => onToggleGoal(dateStr, task.id)}
              aria-label={`${done ? '완료 취소' : '완료'}: ${task.name}`}
              className={`w-full text-left rounded-lg px-1.5 py-1 text-xs transition-all ${diffColor} ${
                done ? 'line-through' : ''
              }`}
            >
              <span className="block font-medium truncate">{task.name}</span>
              {task.estimatedMinutes > 0 && (
                <span className={`block text-[10px] ${done ? 'text-gray-300' : 'opacity-60'}`}>
                  {task.estimatedMinutes}분
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface WeeklyCalendarViewProps {
  data: AppData;
  today: string;
  anchorDate?: string;
  onToggleFixed: (date: string, taskId: string) => void;
  onToggleGoal: (date: string, taskId: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function WeeklyCalendarView({
  data,
  today,
  anchorDate,
  onToggleFixed,
  onToggleGoal,
  onPrevWeek,
  onNextWeek,
}: WeeklyCalendarViewProps) {
  const weekDates = useMemo(
    () => getWeekDates(new Date((anchorDate ?? today) + 'T00:00:00')),
    [anchorDate, today]
  );

  const weekLabel = useMemo(() => formatWeekRange(weekDates), [weekDates]);
  const hasGoalTasks = data.goalTasks.length > 0;

  return (
    <div className="space-y-3">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="이전 주"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>

        <button
          onClick={onNextWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="다음 주"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Difficulty legend */}
      {hasGoalTasks && (
        <div className="flex gap-2 justify-end text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-200 inline-block" />쉬움
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-200 inline-block" />보통
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-200 inline-block" />어려움
          </span>
        </div>
      )}

      {/* P5 — 7-column grid: 부모에서 per-day 데이터 계산 후 DayColumn에 전달 */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((dateStr) => {
          const { dow } = formatDateLabel(dateStr);
          const record = getDailyRecord(data, dateStr);
          const progress = computeDayProgress(data, dateStr);
          const fixedForDay = data.fixedTasks
            .filter((t) => t.days.includes(dow as 0 | 1 | 2 | 3 | 4 | 5 | 6))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <DayColumn
              key={dateStr}
              dateStr={dateStr}
              isToday={dateStr === today}
              fixedTasks={fixedForDay}
              goalTasks={data.goalTasks}
              record={record}
              progress={progress}
              onToggleFixed={onToggleFixed}
              onToggleGoal={onToggleGoal}
            />
          );
        })}
      </div>

      {/* Progress legend */}
      <div className="flex gap-3 justify-end text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-gray-100 inline-block border border-gray-200" />없음
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-50 border border-amber-200 inline-block" />진행 중
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-100 border border-emerald-400 inline-block" />완료
        </span>
      </div>
    </div>
  );
}
