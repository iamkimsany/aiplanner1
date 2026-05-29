'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import { loadState, saveState, DEFAULT_SCHEDULE, getFreeWindows, genId } from '@/lib/store';
import { ScheduleBlock, Goal, Task, GoalType } from '@/lib/types';

// ─── Schedule helpers ─────────────────────────────────────────────────────────

const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function schedulePillLabel(b: ScheduleBlock): string {
  const sorted   = [...b.days].sort((a, c) => a - c);
  const isAll    = [0,1,2,3,4,5,6].every((d) => sorted.includes(d));
  const isWeek   = [1,2,3,4,5].every((d) => sorted.includes(d)) && sorted.length === 5;
  const daysStr  = isAll ? 'Daily' : isWeek ? 'Weekdays' : sorted.map((d) => DAY_LABELS[d].slice(0,3)).join('/');
  return `${b.title} ${b.startTime}–${b.endTime} · ${daysStr}`;
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function BuildingOverlay() {
  return (
    <div className="screen flex-1 flex flex-col items-center justify-center gap-4">
      <p style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
        Building your plan…
      </p>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Analysing your goals and free time
      </p>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: 'var(--color-purple)', opacity: 0.3,
              animation: `fadeIn 0.6s ease ${i * 0.2}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalPage() {
  const router = useRouter();

  // Goals state
  const [goals, setGoals]           = useState<Goal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalInput, setGoalInput]   = useState('');
  const [goalType, setGoalType]     = useState<GoalType>('deadline'); // 'deadline' | 'nodeadline'
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalUrl, setGoalUrl]       = useState('');

  // Schedule state
  const [schedule, setSchedule]     = useState<ScheduleBlock[]>(DEFAULT_SCHEDULE);
  const [showSchedForm, setShowSchedForm] = useState(false);
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDays, setSchedDays]   = useState<number[]>([1, 2, 3, 4, 5]);
  const [schedStart, setSchedStart] = useState('09:00');
  const [schedEnd, setSchedEnd]     = useState('10:00');

  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const s = loadState();
    setSchedule(s.schedule);
    setGoals(s.goals);
  }, []);

  // ── Goal form ───────────────────────────────────────────────────────────────

  function addGoal() {
    if (!goalInput.trim()) return;
    const draft: Goal = {
      id:         genId(),
      title:      goalInput.trim(),
      type:       goalType,
      deadline:   goalType === 'deadline' && goalDeadline ? goalDeadline : undefined,
      materialUrl: goalType === 'deadline' && goalUrl.trim() ? goalUrl.trim() : undefined,
      tasksEasy:   [],
      tasksMedium: [],
      tasksHard:   [],
      progress: 0, total: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      checkedAt: null,
    };
    const next = [...goals, draft];
    setGoals(next);
    saveState({ ...loadState(), goals: next });
    setGoalInput(''); setGoalDeadline(''); setGoalUrl('');
    setGoalType('deadline'); setShowGoalForm(false);
  }

  function removeGoal(id: string) {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveState({ ...loadState(), goals: next });
  }

  // ── Schedule form ───────────────────────────────────────────────────────────

  function toggleDay(d: number) {
    setSchedDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  }

  function addScheduleBlock() {
    if (!schedTitle.trim()) return;
    const block: ScheduleBlock = {
      id: genId(), title: schedTitle.trim(),
      days: schedDays, startTime: schedStart, endTime: schedEnd,
    };
    const next = [...schedule, block];
    setSchedule(next);
    saveState({ ...loadState(), schedule: next });
    setSchedTitle(''); setSchedDays([1,2,3,4,5]);
    setSchedStart('09:00'); setSchedEnd('10:00'); setShowSchedForm(false);
  }

  function removeScheduleBlock(id: string) {
    const next = schedule.filter((b) => b.id !== id);
    setSchedule(next);
    saveState({ ...loadState(), schedule: next });
  }

  // ── Build plan ──────────────────────────────────────────────────────────────

  async function handleBuildPlan() {
    if (goals.length === 0) { setError('Add at least one goal first.'); return; }
    setError('');
    setIsBuilding(true);

    const windows  = getFreeWindows(schedule, new Date());
    const freeHours = Math.round(
      windows.reduce((sum, w) => {
        const [sh, sm] = w.start.split(':').map(Number);
        const [eh, em] = w.end.split(':').map(Number);
        return sum + (eh * 60 + em - sh * 60 - sm) / 60;
      }, 0)
    );

    try {
      const updatedGoals: Goal[] = [];

      for (const goal of goals) {
        // No-deadline goals are one-tap checkboxes — skip AI entirely
        if (goal.type === 'nodeadline') {
          console.log(`Goal: "${goal.title}" [no-deadline] — skipping AI`);
          updatedGoals.push({ ...goal, tasksEasy: [], tasksMedium: [], tasksHard: [], total: 0, checkedAt: null });
          continue;
        }

        const res  = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // energy not chosen yet — default to 'medium' so the prompt is still useful
          body: JSON.stringify({ goal: goal.title, energy: 'medium', freeHours }),
        });
        const data = await res.json();

        const makeTasks = (
          items: { text: string; simplified: [string, string] }[],
          difficulty: 'easy' | 'medium' | 'hard'
        ): Task[] =>
          (items ?? []).map((item, i) => {
            console.log(`Goal: ${goal.title} → Task [${difficulty}]: ${item.text}`);
            const task: Task = {
              id: genId(), goalId: goal.id,
              text: item.text,
              simplifiedVersions: item.simplified ?? [],
              difficulty, isDone: false, order: i,
            };
            // Verify goal assignment before saving
            if (task.goalId !== goal.id) {
              console.error(`❌ goalId mismatch! task.goalId=${task.goalId} goal.id=${goal.id}`);
            }
            return task;
          });

        const builtGoal: Goal = {
          ...goal,
          tasksEasy:   makeTasks(data.easy   ?? [], 'easy'),
          tasksMedium: makeTasks(data.medium ?? [], 'medium'),
          tasksHard:   makeTasks(data.hard   ?? [], 'hard'),
          total: (data.easy?.length ?? 0) + (data.medium?.length ?? 0) + (data.hard?.length ?? 0),
        };
        console.log(`✓ Goal "${builtGoal.title}" (id=${builtGoal.id}) — ${builtGoal.total} tasks saved`);
        updatedGoals.push(builtGoal);
      }

      saveState({
        ...loadState(),
        goals:         updatedGoals,
        schedule,
        sessions:      [],
        focusSessions: [],
        todayTasks:    [],
        currentEnergy: null,
        lastResult:    null,
        activeFocus:   null,
        lastFocusDone: null,
        aiSummary:     null,
      });
      router.push('/energy');
    } catch {
      setError('Something went wrong. Please try again.');
      setIsBuilding(false);
    }
  }

  if (isBuilding) return <BuildingOverlay />;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto">

        {/* Heading */}
        <div className="space-y-1">
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.3 }}>
            What do you want to<br />accomplish?
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Add goals and your fixed schedule
          </p>
        </div>

        {/* Goal cards */}
        <div className="space-y-2">
          {goals.map((g) => (
            <div
              key={g.id}
              style={{
                borderLeft:   '2px solid var(--color-purple)',
                borderRadius: '0 8px 8px 0',
                background:   'var(--color-bg-secondary)',
                padding:      '8px 10px',
                display:      'flex',
                alignItems:   'flex-start',
                justifyContent: 'space-between',
                gap:          '8px',
              }}
            >
              <div className="min-w-0">
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                  {g.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {g.type === 'nodeadline'
                    ? 'No deadline · quick task'
                    : [
                        g.deadline ? `Due ${new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : null,
                        g.materialUrl ? `· ${new URL(g.materialUrl).hostname}` : null,
                      ].filter(Boolean).join(' ') || 'Deadline goal'}
                </p>
              </div>
              <button
                onClick={() => removeGoal(g.id)}
                style={{ color: 'var(--color-text-tertiary)', fontSize: '16px', flexShrink: 0, lineHeight: 1 }}
                aria-label={`Remove ${g.title}`}
              >
                ×
              </button>
            </div>
          ))}

          {/* Add goal toggle */}
          {!showGoalForm ? (
            <button
              onClick={() => setShowGoalForm(true)}
              style={{
                fontSize: '13px', color: 'var(--color-purple)',
                border: '1px dashed var(--color-purple-mid)',
                borderRadius: '8px', padding: '8px 12px', width: '100%', textAlign: 'left',
              }}
            >
              + Add goal
            </button>
          ) : (
            <div
              className="space-y-3 rounded-xl p-4"
              style={{ border: '1px solid var(--color-border-medium)', background: 'var(--color-bg-secondary)' }}
            >
              <input
                autoFocus
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                placeholder="e.g. Pass algorithms exam"
                className="w-full bg-transparent outline-none"
                style={{ fontSize: '14px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}
              />

              {/* Type toggle */}
              <div className="flex gap-2">
                {(['deadline', 'nodeadline'] as GoalType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGoalType(t)}
                    style={{
                      fontSize: '12px', fontWeight: 500,
                      padding: '5px 12px', borderRadius: '20px',
                      background: goalType === t ? 'var(--color-purple)' : 'transparent',
                      color: goalType === t ? '#fff' : 'var(--color-text-secondary)',
                      border: goalType === t ? 'none' : '0.5px solid var(--color-border-medium)',
                    }}
                  >
                    {t === 'deadline' ? 'Deadline' : 'No deadline'}
                  </button>
                ))}
              </div>

              {/* Deadline extras — hidden for no-deadline goals */}
              {goalType === 'deadline' && (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13px]"
                    style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                  />
                  <input
                    type="url"
                    value={goalUrl}
                    onChange={(e) => setGoalUrl(e.target.value)}
                    placeholder="Study material URL (optional)"
                    className="w-full bg-transparent outline-none text-[13px]"
                    style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={addGoal}
                  className="flex-1 py-2 rounded-lg text-[13px] font-medium"
                  style={{ background: 'var(--color-purple)', color: '#fff' }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowGoalForm(false); setGoalInput(''); }}
                  className="px-4 py-2 rounded-lg text-[13px]"
                  style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-medium)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-tertiary)' }}>
            Fixed schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {schedule.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'var(--color-bg-secondary)', border: '0.5px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}
              >
                <span>{schedulePillLabel(b)}</span>
                <button
                  onClick={() => removeScheduleBlock(b.id)}
                  style={{ color: 'var(--color-text-tertiary)', fontSize: '14px', lineHeight: 1 }}
                  aria-label={`Remove ${b.title}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowSchedForm((v) => !v)}
              className="rounded-full px-3 py-1.5"
              style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', border: '1px dashed var(--color-border-medium)' }}
            >
              + add
            </button>
          </div>

          {showSchedForm && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ border: '1px solid var(--color-border-medium)', background: 'var(--color-bg-secondary)' }}
            >
              <input
                type="text" value={schedTitle}
                onChange={(e) => setSchedTitle(e.target.value)}
                placeholder="e.g. School, Gym, Work"
                className="w-full bg-transparent outline-none"
                style={{ fontSize: '13px', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}
              />
              <div className="flex gap-1.5">
                {DAY_SHORT.map((d, i) => (
                  <button
                    key={i} onClick={() => toggleDay(i)}
                    className="w-8 h-8 rounded-full text-[11px] font-medium"
                    style={{
                      background: schedDays.includes(i) ? 'var(--color-purple)' : 'var(--color-bg)',
                      color:      schedDays.includes(i) ? '#fff' : 'var(--color-text-secondary)',
                      border:     '0.5px solid var(--color-border-medium)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input type="time" value={schedStart} onChange={(e) => setSchedStart(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[12px]"
                  style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                />
                <span style={{ color: 'var(--color-text-tertiary)' }}>–</span>
                <input type="time" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[12px]"
                  style={{ color: 'var(--color-text)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px' }}
                />
              </div>
              <button
                onClick={addScheduleBlock}
                className="w-full py-2 rounded-lg text-[13px] font-medium"
                style={{ background: 'var(--color-purple)', color: '#fff' }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: 'var(--color-danger-text)' }}>{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="space-y-5 pt-6">
        <button
          onClick={handleBuildPlan}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          AI builds your plan →
        </button>
        <NavigationDots total={4} current={0} />
      </div>
    </div>
  );
}
