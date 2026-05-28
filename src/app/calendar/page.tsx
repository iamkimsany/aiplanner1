'use client';

import { useState, useMemo } from 'react';
import { useAppData } from '@/lib/useAppData';
import { computeDayProgress, getTodayString } from '@/lib/store';
import ProgressBar from '@/components/ProgressBar';
import WeeklyCalendarView from '@/features/calendar/components/WeeklyCalendarView';

const MONTH_NAMES_KO = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];
const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function progressColor(pct: number): string {
  if (pct === 0) return 'bg-gray-100 text-gray-400';
  if (pct < 50) return 'bg-amber-50 text-amber-700';
  if (pct < 100) return 'bg-emerald-100 text-emerald-700';
  return 'bg-emerald-500 text-white';
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { data, toggleFixedTask, toggleGoalTask, loaded } = useAppData();
  const today = getTodayString();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [weekAnchor, setWeekAnchor] = useState(today);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(today);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const selectedProgress = selected ? computeDayProgress(data, selected) : 0;
  const selectedRecord = selected ? data.dailyRecords[selected] : null;
  const selectedDow = selected ? new Date(selected + 'T00:00:00').getDay() as 0|1|2|3|4|5|6 : null;
  const selectedFixed = selectedDow !== null
    ? data.fixedTasks.filter(t => t.days.includes(selectedDow))
    : [];

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Page header with view toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">달력</h1>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* Weekly view */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <WeeklyCalendarView
            data={data}
            today={today}
            anchorDate={weekAnchor}
            onToggleFixed={toggleFixedTask}
            onToggleGoal={toggleGoalTask}
            onPrevWeek={() => setWeekAnchor((d) => addDays(d, -7))}
            onNextWeek={() => setWeekAnchor((d) => addDays(d, 7))}
          />
        </div>
      )}

      {/* Monthly view (existing) */}
      {viewMode === 'month' && (<>

      {/* Month navigation */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold text-gray-800">
            {viewYear}년 {MONTH_NAMES_KO[viewMonth]}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_HEADERS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-xs font-semibold py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateStr = formatDate(viewYear, viewMonth, day);
            const pct = computeDayProgress(data, dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selected;
            const col = idx % 7;

            return (
              <button
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-offset-1'
                    : ''
                } ${progressColor(pct)} ${
                  col === 0 ? 'text-red-500' : col === 6 ? 'text-blue-500' : ''
                } ${pct === 0 ? (col === 0 ? 'text-red-300' : col === 6 ? 'text-blue-300' : '') : ''}`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
                )}
                {pct > 0 && pct < 100 && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 justify-center text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 inline-block" /> 없음
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" /> 진행 중
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> 완료
          </span>
        </div>
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              {(() => { const [y, m, d] = selected.split('-'); return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`; })()}
            </h2>
            <span className="text-sm text-gray-500">{selectedProgress}% 완료</span>
          </div>
          <ProgressBar percent={selectedProgress} />

          {selectedFixed.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">고정 일정</p>
              <div className="space-y-1">
                {selectedFixed.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(task => {
                  const done = selectedRecord?.completedFixedTaskIds.includes(task.id) ?? false;
                  return (
                    <div key={task.id} className={`flex items-center gap-2 text-sm py-1 ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                        {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      {task.name} ({task.startTime}–{task.endTime})
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.goalTasks.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">목표 할 일</p>
              <div className="space-y-1">
                {data.goalTasks.map(task => {
                  const done = selectedRecord?.completedGoalTaskIds.includes(task.id) ?? false;
                  return (
                    <div key={task.id} className={`flex items-center gap-2 text-sm py-1 ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                        {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      {task.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedFixed.length === 0 && data.goalTasks.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">등록된 할 일이 없어요.</p>
          )}
        </div>
      )}
      </>)}
    </div>
  );
}
