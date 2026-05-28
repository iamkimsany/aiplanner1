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

const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function schedulePillLabel(block: ScheduleBlock): string {
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const weekdays = [1, 2, 3, 4, 5];
  const sorted = [...block.days].sort((a, b) => a - b);
  const isAllDays = allDays.every((d) => sorted.includes(d));
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
  const [goalText, setGoalText] = useState('');
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(DEFAULT_SCHEDULE);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const state = loadState();
    setSchedule(state.schedule);
    if (state.goal) setGoalText(state.goal.title);
  }, []);

  function toggleNewDay(d: number) {
    setNewDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function addBlock() {
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

  function removeBlock(id: string) {
    const next = schedule.filter((b) => b.id !== id);
    setSchedule(next);
    saveState({ ...loadState(), schedule: next });
  }

  async function handleSubmit() {
    if (!goalText.trim()) {
      setError('Please enter a goal.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Calculate free hours from schedule
    const windows = getFreeWindows(schedule, new Date());
    const freeHours = windows.reduce((sum, w) => {
      const [sh, sm] = w.start.split(':').map(Number);
      const [eh, em] = w.end.split(':').map(Number);
      return sum + (eh * 60 + em - (sh * 60 + sm)) / 60;
    }, 0);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalText.trim(), freeHours: Math.round(freeHours) }),
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
        title: goalText.trim(),
        tasksEasy: makeTasks(data.easy ?? [], 'easy'),
        tasksMedium: makeTasks(data.medium ?? [], 'medium'),
        tasksHard: makeTasks(data.hard ?? [], 'hard'),
        progress: 0,
        total: (data.easy?.length ?? 0) + (data.medium?.length ?? 0) + (data.hard?.length ?? 0),
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const state = loadState();
      saveState({
        ...state,
        goal,
        schedule,
        sessions: [],
        currentEnergy: null,
        currentTaskId: null,
        lastResult: null,
        simplifiedText: null,
      });

      router.push('/energy');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="screen flex-1 flex flex-col items-center justify-center space-y-3">
        <p className="text-[22px] font-medium" style={{ color: 'var(--color-text)' }}>
          Building your plan...
        </p>
        <p className="text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
          Analyzing your goal and free time
        </p>
        <div className="mt-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--color-text)',
                opacity: 0.3,
                animation: `fadeIn 0.6s ease ${i * 0.2}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    );
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
            Enter any goal — big or small
          </p>
        </div>

        {/* Goal input */}
        <div>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. write my term paper"
            className="w-full bg-transparent outline-none"
            style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'var(--color-text)',
              borderBottom: '1px solid var(--color-border-medium)',
              paddingBottom: '10px',
            }}
          />
          {error && (
            <p className="mt-2 text-[13px]" style={{ color: 'var(--color-rest)' }}>
              {error}
            </p>
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
                  onClick={() => removeBlock(block.id)}
                  className="leading-none"
                  style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}
                  aria-label={`Remove ${block.title}`}
                >
                  ×
                </button>
              </div>
            ))}

            {/* + Add button */}
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
                onClick={addBlock}
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
        <button
          onClick={handleSubmit}
          className="w-full py-[14px] rounded-[10px] text-[15px] font-medium transition-colors"
          style={{ background: 'var(--color-text)', color: '#fff' }}
        >
          AI builds your plan →
        </button>

        <NavigationDots total={4} current={0} />
      </div>
    </div>
  );
}
