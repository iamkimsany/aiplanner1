'use client';

import { useState } from 'react';
import { useAppData } from '@/lib/useAppData';
import { FixedTask, GoalTask, Difficulty, EnergyLevel, DayOfWeek } from '@/lib/types';
import DifficultyBadge from '@/components/DifficultyBadge';
import EnergyBadge from '@/components/EnergyBadge';

const DAY_LABELS: { day: DayOfWeek; label: string }[] = [
  { day: 0, label: '일' },
  { day: 1, label: '월' },
  { day: 2, label: '화' },
  { day: 3, label: '수' },
  { day: 4, label: '목' },
  { day: 5, label: '금' },
  { day: 6, label: '토' },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function TasksPage() {
  const { data, update, loaded } = useAppData();
  const [tab, setTab] = useState<'fixed' | 'goal'>('fixed');

  // Fixed task form state
  const [fixedName, setFixedName] = useState('');
  const [fixedStart, setFixedStart] = useState('09:00');
  const [fixedEnd, setFixedEnd] = useState('10:00');
  const [fixedDays, setFixedDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);

  // Goal task form state
  const [goalName, setGoalName] = useState('');
  const [goalDifficulty, setGoalDifficulty] = useState<Difficulty>('middle');
  const [goalEnergyLevel, setGoalEnergyLevel] = useState<EnergyLevel>('medium');
  const [goalMinutes, setGoalMinutes] = useState('30');

  function addFixedTask() {
    if (!fixedName.trim()) return;
    const task: FixedTask = {
      id: genId(),
      name: fixedName.trim(),
      startTime: fixedStart,
      endTime: fixedEnd,
      days: fixedDays,
    };
    update({ ...data, fixedTasks: [...data.fixedTasks, task] });
    setFixedName('');
  }

  function deleteFixedTask(id: string) {
    update({ ...data, fixedTasks: data.fixedTasks.filter((t) => t.id !== id) });
  }

  function addGoalTask() {
    if (!goalName.trim()) return;
    const task: GoalTask = {
      id: genId(),
      name: goalName.trim(),
      difficulty: goalDifficulty,
      energyLevel: goalEnergyLevel,
      estimatedMinutes: parseInt(goalMinutes) || 0,
      createdAt: new Date().toISOString(),
    };
    update({ ...data, goalTasks: [...data.goalTasks, task] });
    setGoalName('');
    setGoalMinutes('30');
    setGoalEnergyLevel('medium');
  }

  function deleteGoalTask(id: string) {
    update({ ...data, goalTasks: data.goalTasks.filter((t) => t.id !== id) });
  }

  function toggleDay(day: DayOfWeek) {
    setFixedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">할 일 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {(['fixed', 'goal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'fixed' ? '고정 일정' : '목표 할 일'}
          </button>
        ))}
      </div>

      {tab === 'fixed' && (
        <div className="space-y-4">
          {/* Add fixed task form */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-700">새 고정 일정 추가</h2>
            <div>
              <label className="text-xs text-gray-500 font-medium">일정 이름</label>
              <input
                type="text"
                value={fixedName}
                onChange={(e) => setFixedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFixedTask()}
                placeholder="예: 수업, 알바, 헬스"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium">시작 시간</label>
                <input
                  type="time"
                  value={fixedStart}
                  onChange={(e) => setFixedStart(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium">종료 시간</label>
                <input
                  type="time"
                  value={fixedEnd}
                  onChange={(e) => setFixedEnd(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-2">요일 선택</label>
              <div className="flex gap-2">
                {DAY_LABELS.map(({ day, label }) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                      fixedDays.includes(day)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={addFixedTask}
              disabled={!fixedName.trim()}
              className="w-full bg-indigo-600 text-white py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              추가하기
            </button>
          </div>

          {/* Fixed task list */}
          <div className="space-y-2">
            {data.fixedTasks.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">아직 고정 일정이 없어요.</p>
            ) : (
              data.fixedTasks
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{task.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.startTime} – {task.endTime} &middot;{' '}
                        {task.days.map((d) => DAY_LABELS.find((l) => l.day === d)?.label).join(' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFixedTask(task.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {tab === 'goal' && (
        <div className="space-y-4">
          {/* Add goal task form */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-700">새 목표 할 일 추가</h2>
            <div>
              <label className="text-xs text-gray-500 font-medium">할 일 이름</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoalTask()}
                placeholder="예: 운동 30분, 영어 단어 외우기"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-2">난이도</label>
              <div className="flex gap-2">
                {(
                  [
                    { val: 'easy', label: '쉬움', cls: 'bg-emerald-50 border-emerald-300 text-emerald-700', activeCls: 'bg-emerald-500 text-white border-emerald-500' },
                    { val: 'middle', label: '보통', cls: 'bg-amber-50 border-amber-300 text-amber-700', activeCls: 'bg-amber-500 text-white border-amber-500' },
                    { val: 'hard', label: '어려움', cls: 'bg-red-50 border-red-300 text-red-700', activeCls: 'bg-red-500 text-white border-red-500' },
                  ] as const
                ).map(({ val, label, cls, activeCls }) => (
                  <button
                    key={val}
                    onClick={() => setGoalDifficulty(val)}
                    className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                      goalDifficulty === val ? activeCls : cls
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-2">에너지 레벨</label>
              <div className="flex gap-2">
                {(
                  [
                    { val: 'low',    label: '🔋 낮음', cls: 'bg-blue-50 border-blue-300 text-blue-700',     activeCls: 'bg-blue-500 text-white border-blue-500' },
                    { val: 'medium', label: '⚡ 보통', cls: 'bg-yellow-50 border-yellow-300 text-yellow-700', activeCls: 'bg-yellow-500 text-white border-yellow-500' },
                    { val: 'high',   label: '🔥 높음', cls: 'bg-orange-50 border-orange-300 text-orange-700', activeCls: 'bg-orange-500 text-white border-orange-500' },
                  ] as const
                ).map(({ val, label, cls, activeCls }) => (
                  <button
                    key={val}
                    onClick={() => setGoalEnergyLevel(val)}
                    className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                      goalEnergyLevel === val ? activeCls : cls
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">예상 소요 시간 (분)</label>
              <input
                type="number"
                value={goalMinutes}
                onChange={(e) => setGoalMinutes(e.target.value)}
                min="1"
                max="480"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              onClick={addGoalTask}
              disabled={!goalName.trim()}
              className="w-full bg-indigo-600 text-white py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              추가하기
            </button>
          </div>

          {/* Goal task list */}
          <div className="space-y-2">
            {data.goalTasks.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">아직 목표 할 일이 없어요.</p>
            ) : (
              data.goalTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{task.name}</p>
                    {task.estimatedMinutes > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">예상 {task.estimatedMinutes}분</p>
                    )}
                  </div>
                  <EnergyBadge energyLevel={task.energyLevel} />
                  <DifficultyBadge difficulty={task.difficulty} />
                  <button
                    onClick={() => deleteGoalTask(task.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
