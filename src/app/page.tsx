'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import {
  loadState,
  saveState,
  DEFAULT_SCHEDULE,
  getFreeWindows,
  genId,
} from '@/lib/store';
import { ScheduleBlock, Goal, Task } from '@/lib/types';

const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GOAL_COLORS = [
  'var(--color-study)',
  'var(--color-health)',
  'var(--color-hobby)',
  'var(--color-rest)',
];

function schedulePillLabel(block: ScheduleBlock): string {
  const allDays  = [0, 1, 2, 3, 4, 5, 6];
  const weekdays = [1, 2, 3, 4, 5];
  const sorted   = [...block.days].sort((a, b) => a - b);
  const isAllDays  = allDays.every((d) => sorted.includes(d));
  const isWeekdays = weekdays.every((d) => sorted.includes(d)) && sorted.length === 5;

  const daysLabel = isAllDays
    ? 'Daily'
    : isWeekdays
    ? 'Weekdays'
    : sorted.map((d) => DAY_LABELS[d].slice(0, 3)).join('/');

  return `${block.title} ${block.startTime}–${block.endTime} · ${daysLabel}`;
}

export default function GoalPage() {
  const router = useRouter();
  const [inputText, setInputText]   = useState('');
  const [goals, setGoals]           = useState<Goal[]>([]);
  const [schedule, setSchedule]     = useState<ScheduleBlock[]>(DEFAULT_SCHEDULE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newDays, setNewDays]       = useState<number[]>([1, 2, 3, 4, 5]);
  const [newStart, setNewStart]     = useState('09:00');
  const [newEnd, setNewEnd]         = useState('10:00');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const state = loadState();
    setSchedule(state.schedule);
    setGoals(state.goals);
  }, []);

  function toggleNewDay(d: number) {
    setNewDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function addScheduleBlock() {
    if (!newTitle.trim()) return;
    const block: ScheduleBlock = {
      id: genId(),
      title: newTitle.trim(),
      days: newDays,
      startTime: newStart,
      endTime: newEnd,
    };
    const next = [...schedule, block];
    setSchedule(next);
    saveState({ ...loadState(), schedule: next });
    setNewTitle('');
    setNewDays([1, 2, 3, 4, 5]);
    setNewStart('09:00');
    setNewEnd('10:00');
    setShowAddForm(false);
  }

  function removeScheduleBlock(id: string) {
    const next = schedule.filter((b) => b.id !== id);
    setSchedule(next);
    saveState({ ...loadState(), schedule: next });
  }

  function removeGoal(id: string) {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveState({ ...loadState(), goals: next });
  }

  async function handleAddGoal() {
    if (!inputText.trim()) {
      setError('Please enter a goal.');
      return;
    }
    setError('');
    setIsAddingGoal(true);

    const windows  = getFreeWindows(schedule, new Date());
    const freeHours = windows.reduce((sum, w) => {
      const [sh, sm] = w.start.split(':').map(Number);
      const [eh, em] = w.end.split(':').map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
    }, 0);

    try {
      const res  = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: inputText.trim(), freeHours: Math.round(freeHours) }),
      });
      const data = await res.json();

      const goalId = genId();
      const makeTasks = (texts: string[], difficulty: 'easy' | 'medium' | 'hard'): Task[] =>
        texts.map((text, i) => ({
          id: genId(),
          goalId,
          text,
          difficulty,
          isDone: false,
          order: i,
        }));

      const goal: Goal = {
        id: goalId,
        title: inputText.trim(),
        tasksEasy:   makeTasks(data.easy   ?? [], 'easy'),
        tasksMedium: makeTasks(data.medium ?? [], 'medium'),
        tasksHard:   makeTasks(data.hard   ?? [], 'hard'),
        progress: 0,
        total: (data.easy?.length ?? 0) + (data.medium?.length ?? 0) + (data.hard?.length ?? 0),
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const next = [...goals, goal];
      setGoals(next);
      saveState({ ...loadState(), goals: next, schedule });
      setInputText('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsAddingGoal(false);
    }
  }

  function handleContinue() {
    saveState({
      ...loadState(),
      goals,
      schedule,
      sessions: [],
      currentEnergy: null,
      currentGoalId: null,
      currentTaskId: null,
      lastResult: null,
      simplifiedText: null,
    });
    router.push('/energy');
  }

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-8">
        {/* Heading */}
        <div className="space-y-2">
          <h1
            className="font-medium leading-[1.3]"
            style={{ fontSize: '22px', color: 'var(--color-text)' }}
          >
            What do you want to<br />accomplish this week?
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Add one or more goals — big or small
          </p>
        </div>

        {/* Goal input row */}
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !isAddingGoal && handleAddGoal()}
              placeholder="e.g. write my term paper"
              className="flex-1 bg-transparent outline-none"
              style={{
                fontSize: '17px',
                fontWeight: 500,
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-border-medium)',
                paddingBottom: '10px',
              }}
            />
            <button
              onClick={handleAddGoal}
              disabled={isAddingGoal}
              className="shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium"
              style={{
                background: 'var(--color-text)',
                color: '#fff',
                opacity: isAddingGoal ? 0.5 : 1,
                marginBottom: '2px',
              }}
            >
              {isAddingGoal ? '...' : '+ Add'}
            </button>
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--color-rest)' }}>{error}</p>
          )}

          {/* Goal pills */}
          {goals.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {goals.map((g, i) => (
                <div
                  key={g.id}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: `1px solid ${GOAL_COLORS[i % GOAL_COLORS.length]}`,
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    maxWidth: '100%',
                  }}
                >
                  <span
                    style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: GOAL_COLORS[i % GOAL_COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span className="truncate" style={{ maxWidth: '180px' }}>{g.title}</span>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="leading-none"
                    style={{ color: 'var(--color-text-tertiary)', fontSize: '15px', marginLeft: '2px' }}
                    aria-label={`Remove ${g.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule blocks */}
        <div className="space-y-3">
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Fixed schedule
          </p>

          <div className="flex flex-wrap gap-2">
            {schedule.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '0.5px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{schedulePillLabel(block)}</span>
                <button
                  onClick={() => removeScheduleBlock(block.id)}
                  className="leading-none"
                  style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}
                  aria-label={`Remove ${block.title}`}
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="rounded-full px-3 py-1.5"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-tertiary)',
                border: '1px dashed var(--color-border-medium)',
              }}
            >
              + Add
            </button>
          </div>

          {/* Inline add form */}
          {showAddForm && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ border: '1px solid var(--color-border-medium)', background: 'var(--color-bg-secondary)' }}
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. School, Gym, Work"
                className="w-full bg-transparent outline-none"
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border)',
                  paddingBottom: '6px',
                }}
              />
              <div className="flex gap-1.5">
                {DAY_SHORT.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleNewDay(i)}
                    className="w-8 h-8 rounded-full text-[12px] font-medium transition-colors"
                    style={{
                      background: newDays.includes(i) ? 'var(--color-text)' : 'var(--color-bg)',
                      color: newDays.includes(i) ? '#fff' : 'var(--color-text-secondary)',
                      border: '0.5px solid var(--color-border-medium)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px]"
                  style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                />
                <span style={{ color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>–</span>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[13px]"
                  style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                />
              </div>
              <button
                onClick={addScheduleBlock}
                className="w-full py-2 rounded-lg text-[13px] font-medium"
                style={{ background: 'var(--color-text)', color: '#fff' }}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-6 pt-8">
        {goals.length > 0 && (
          <button
            onClick={handleContinue}
            className="w-full py-[14px] rounded-[10px] text-[15px] font-medium"
            style={{ background: 'var(--color-text)', color: '#fff' }}
          >
            Continue →
          </button>
        )}

        <NavigationDots total={4} current={0} />
      </div>
    </div>
  );
}
