'use client';

import { useMemo } from 'react';
import { AppData, FixedTask, GoalTask } from '@/lib/types';
import { computeDayProgress, getDailyRecord } from '@/lib/store';
import DifficultyBadge from '@/components/DifficultyBadge';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekDates(baseDate: Date): Date[] {
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - baseDate.getDay());
  sunday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMonthRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[6];
  const startLabel = `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일`;
  if (first.getMonth() === last.getMonth()) {
    return `${startLabel} ~ ${last.getDate()}일`;
  }
  return `${startLabel} ~ ${last.getMonth() + 1}월 ${last.getDate()}일`;
}

function progressBg(pct: number): string {
  if (pct === 0) return 'bg-gray-100';
  if (pct < 50) return 'bg-amber-50';
  if (pct < 100) return 'bg-emerald-50';
  return 'bg-emerald-100';
}

function progressDot(pct: number): string {
  if (pct === 0) return 'bg-gray-300';
  if (pct < 50) return 'bg-amber-400';
  if (pct < 100) return 'bg-emerald-400';
  return 'bg-emerald-500';
}

interface DayColumnProps {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
  progress: number;
  fixedTasks: FixedTask[];
  goalTasks: GoalTask[];
  completedFixedIds: string[];
  completedGoalIds: string[];
  onClick: () => void;
}

function DayColumn({
  date,
  isToday,
  isSelected,
  progress,
  fixedTasks,
  goalTasks,
  completedFixedIds,
  completedGoalIds,
  onClick,
}: DayColumnProps) {
  const dow = date.getDay();
  const dayNum = date.getDate();

  const sortedFixed = [...fixedTasks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  const dayLabelColor =
    dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-500';

  const dateLabelColor =
    dow === 0
      ? 'text-red-600'
      : dow === 6
      ? 'text-blue-600'
      : 'text-gray-900';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-all cursor-pointer w-full text-left ${progressBg(progress)} ${
        isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
      } ${isToday ? 'shadow-md' : 'shadow-sm'}`}
    >
      {/* Day label */}
      <span className={`text-[11px] font-semibold uppercase ${dayLabelColor}`}>
        {DAY_LABELS[dow]}
      </span>

      {/* Date number */}
      <span
        className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
          isToday
            ? 'bg-indigo-600 text-white'
            : dateLabelColor
        }`}
      >
        {dayNum}
      </span>

      {/* Progress dot */}
      <span
        className={`w-2 h-2 rounded-full ${progressDot(progress)}`}
        title={`${progress}% 완료`}
      />

      {/* Task chips */}
      <div className="w-full flex flex-col gap-0.5 mt-1 min-h-[2rem]">
        {sortedFixed.map((task) => {
          const done = completedFixedIds.includes(task.id);
          return (
            <span
              key={task.id}
              className={`block text-[10px] leading-tight px-1 py-0.5 rounded font-medium truncate ${
                done
                  ? 'bg-indigo-200 text-indigo-400 line-through'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
              title={`${task.name} (${task.startTime}–${task.endTime})`}
            >
              {task.startTime} {task.name}
            </span>
          );
        })}
        {goalTasks.map((task) => {
          const done = completedGoalIds.includes(task.id);
          return (
            <span
              key={task.id}
              className={`block text-[10px] leading-tight px-1 py-0.5 rounded font-medium truncate ${
                done
                  ? 'bg-gray-200 text-gray-400 line-through'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
              title={task.name}
            >
              {task.name}
            </span>
          );
        })}
        {sortedFixed.length === 0 && goalTasks.length === 0 && (
          <span className="text-[10px] text-gray-300 text-center mt-1">없음</span>
        )}
      </div>
    </button>
  );
}

// ─── Detail panel ────────────────────────────────────────────────────────────

interface DayDetailProps {
  dateStr: string;
  data: AppData;
  onToggleFixed: (date: string, taskId: string) => void;
  onToggleGoal: (date: string, taskId: string) => void;
}

function DayDetail({ dateStr, data, onToggleFixed, onToggleGoal }: DayDetailProps) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dow = new Date(dateStr + 'T00:00:00').getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const record = getDailyRecord(data, dateStr);
  const fixedForDay = data.fixedTasks
    .filter((t) => t.days.includes(dow))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const progress = computeDayProgress(data, dateStr);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">
          {year}년 {month}월 {day}일 ({DAY_LABELS[dow]})
        </h2>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            progress === 100
              ? 'bg-emerald-100 text-emerald-700'
              : progress > 0
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {progress}% 완료
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            progress >= 80
              ? 'bg-emerald-500'
              : progress >= 50
              ? 'bg-amber-400'
              : 'bg-indigo-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Fixed tasks */}
      {fixedForDay.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            고정 일정
          </p>
          <ul className="space-y-1.5">
            {fixedForDay.map((task) => {
              const done = record.completedFixedTaskIds.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    onClick={() => onToggleFixed(dateStr, task.id)}
                    className={`w-full flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                      done ? 'text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        done
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300 bg-white'
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
                    </span>
                    <span className={done ? 'line-through' : ''}>
                      {task.name}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {task.startTime}–{task.endTime}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Goal tasks */}
      {data.goalTasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            목표 할 일
          </p>
          <ul className="space-y-1.5">
            {data.goalTasks.map((task) => {
              const done = record.completedGoalTaskIds.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    onClick={() => onToggleGoal(dateStr, task.id)}
                    className={`w-full flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors text-left ${
                      done ? 'text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        done
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-gray-300 bg-white'
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
                    </span>
                    <span className={done ? 'line-through' : ''}>{task.name}</span>
                    <span className="ml-auto flex-shrink-0">
                      <DifficultyBadge difficulty={task.difficulty} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {fixedForDay.length === 0 && data.goalTasks.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">등록된 할 일이 없어요.</p>
      )}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface WeeklyCalendarViewProps {
  data: AppData;
  today: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onToggleFixed: (date: string, taskId: string) => void;
  onToggleGoal: (date: string, taskId: string) => void;
  /** ISO date string for any day in the target week. Defaults to today. */
  weekBase?: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function WeeklyCalendarView({
  data,
  today,
  selectedDate,
  onSelectDate,
  onToggleFixed,
  onToggleGoal,
  weekBase = new Date(),
  onPrevWeek,
  onNextWeek,
}: WeeklyCalendarViewProps) {
  const weekDates = useMemo(() => getWeekDates(weekBase), [weekBase]);
  const weekLabel = useMemo(() => formatMonthRange(weekDates), [weekDates]);

  return (
    <div className="space-y-4">
      {/* Week navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="이전 주"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="다음 주"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 7-column day grid */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => {
          const dateStr = toDateString(date);
          const dow = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
          const record = getDailyRecord(data, dateStr);
          const fixedForDay = data.fixedTasks.filter((t) => t.days.includes(dow));
          const progress = computeDayProgress(data, dateStr);

          return (
            <DayColumn
              key={dateStr}
              date={date}
              dateStr={dateStr}
              isToday={dateStr === today}
              isSelected={dateStr === selectedDate}
              progress={progress}
              fixedTasks={fixedForDay}
              goalTasks={data.goalTasks}
              completedFixedIds={record.completedFixedTaskIds}
              completedGoalIds={record.completedGoalTaskIds}
              onClick={() => onSelectDate(dateStr)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> 없음
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 진행 중
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 완료
        </span>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <DayDetail
          dateStr={selectedDate}
          data={data}
          onToggleFixed={onToggleFixed}
          onToggleGoal={onToggleGoal}
        />
      )}
    </div>
  );
}
