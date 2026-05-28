'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationDots from '@/components/NavigationDots';
import BalanceCard from '@/components/BalanceCard';
import { loadState, calcBalance, balanceTip } from '@/lib/store';
import { Session } from '@/lib/types';

// ─── Balance config ───────────────────────────────────────────────────────────

const BALANCE_CONFIG = [
  { key: 'study',  label: 'Study',   bg: 'var(--color-study-bg)',  text: 'var(--color-study-text)',  bar: 'var(--color-study-bar)'  },
  { key: 'health', label: 'Health',  bg: 'var(--color-health-bg)', text: 'var(--color-health-text)', bar: 'var(--color-health-bar)' },
  { key: 'hobby',  label: 'Hobbies', bg: 'var(--color-hobby-bg)',  text: 'var(--color-hobby-text)',  bar: 'var(--color-hobby-bar)'  },
  { key: 'rest',   label: 'Rest',    bg: 'var(--color-rest-bg)',   text: 'var(--color-rest-text)',   bar: 'var(--color-rest-bar)'   },
] as const;

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function getWeekDays(today: Date): Date[] {
  const dow    = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_ABR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GOAL_DOTS = [
  '#7F77DD', // purple — deadline goals
  '#3B6D11', // green  — habit goals
  '#0F6E56', // teal
  '#993C1D', // coral
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const router = useRouter();
  const [balance,       setBalance]       = useState({ study: 0, health: 0, hobby: 0, rest: 0 });
  const [tip,           setTip]           = useState('');
  const [sessions,      setSessions]      = useState<Session[]>([]);
  const [goals,         setGoals]         = useState<{ id: string; title: string; type: string }[]>([]);
  const [selectedDate,  setSelectedDate]  = useState<string | null>(null);
  const [today,         setToday]         = useState(new Date());

  useEffect(() => {
    const state = loadState();
    const bal   = calcBalance(state.sessions, state.schedule);
    setBalance(bal);
    setTip(balanceTip(bal));
    setSessions(state.sessions);
    setGoals(state.goals.map((g) => ({ id: g.id, title: g.title, type: g.type })));
    setToday(new Date());
  }, []);

  const days     = getWeekDays(today);
  const todayStr = toDateStr(today);

  // Build dateStr → goalId[] map (from sessions)
  const activityMap = new Map<string, string[]>();
  for (const s of sessions) {
    const d = s.createdAt.slice(0, 10);
    if (!activityMap.has(d)) activityMap.set(d, []);
    const existing = activityMap.get(d)!;
    if (!existing.includes(s.goalId)) existing.push(s.goalId);
  }

  // Goal index map for dot color
  const goalIndexMap = new Map(goals.map((g, i) => [g.id, i]));

  // Week range label
  const weekStart = days[0];
  const weekEnd   = days[6];
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="screen flex-1 flex flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto">

        {/* Heading */}
        <div className="flex items-baseline justify-between">
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>This week</h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{weekLabel}</p>
        </div>

        {/* 2×2 balance grid */}
        <div className="grid grid-cols-2 gap-2">
          {BALANCE_CONFIG.map(({ key, label, bg, text, bar }) => (
            <BalanceCard
              key={key}
              label={label}
              percent={balance[key]}
              bg={bg}
              textColor={text}
              barColor={bar}
            />
          ))}
        </div>

        {/* AI tip card */}
        <div
          style={{
            background:   'var(--color-purple-light)',
            borderLeft:   '2px solid var(--color-purple-mid)',
            borderRadius: '0 10px 10px 0',
            padding:      '10px 12px',
          }}
        >
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-purple)', marginBottom: '4px' }}>
            AI tip
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-purple-dark)', lineHeight: 1.6 }}>{tip}</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-tertiary)' }}>
            Calendar
          </p>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* 7-column calendar */}
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dateStr     = toDateStr(day);
              const isToday     = dateStr === todayStr;
              const isPast      = dateStr < todayStr;
              const goalIds     = activityMap.get(dateStr) ?? [];
              const isSelected  = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-lg"
                  style={{
                    background: isSelected ? 'var(--color-purple-light)' : 'transparent',
                    border:     isSelected ? '1px solid var(--color-purple-mid)' : '1px solid transparent',
                  }}
                >
                  <p
                    style={{
                      fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    {DAY_ABR[i]}
                  </p>
                  <div
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isToday ? 'var(--color-purple)' : 'transparent',
                    }}
                  >
                    <p
                      style={{
                        fontSize:   '13px',
                        fontWeight: isToday ? 500 : 400,
                        color:      isToday ? '#fff' : isPast ? 'var(--color-text-tertiary)' : 'var(--color-text)',
                      }}
                    >
                      {day.getDate()}
                    </p>
                  </div>
                  {/* Activity dots */}
                  <div className="flex gap-0.5 flex-wrap justify-center" style={{ minHeight: '6px' }}>
                    {goalIds.slice(0, 3).map((gid) => {
                      const idx = goalIndexMap.get(gid) ?? 0;
                      const goal = goals.find((g) => g.id === gid);
                      const color = goal?.type === 'habit' ? '#3B6D11' : GOAL_DOTS[idx % GOAL_DOTS.length];
                      return (
                        <div
                          key={gid}
                          style={{ width: '4px', height: '4px', borderRadius: '50%', background: color }}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Day detail panel */}
          {selectedDate && (() => {
            const dayGoalIds = activityMap.get(selectedDate) ?? [];
            const daySessions = sessions.filter((s) => s.createdAt.slice(0, 10) === selectedDate);

            return (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text)' }}>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                {dayGoalIds.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>No activity.</p>
                ) : (
                  dayGoalIds.map((gid) => {
                    const g   = goals.find((g) => g.id === gid);
                    const idx = goalIndexMap.get(gid) ?? 0;
                    const color = g?.type === 'habit' ? '#3B6D11' : GOAL_DOTS[idx % GOAL_DOTS.length];
                    const count = daySessions.filter((s) => s.goalId === gid && s.result === 'done').length;
                    return (
                      <div key={gid} className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <p style={{ fontSize: '12px', color: 'var(--color-text)' }}>
                          {g?.title} — {count} task{count !== 1 ? 's' : ''} done
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}

          {/* Legend */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7F77DD' }} />
              <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>Deadline goals</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B6D11' }} />
              <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>Habits</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-5 pt-6">
        <button
          onClick={() => router.push('/')}
          className="w-full rounded-[10px] font-medium"
          style={{ padding: '13px', fontSize: '14px', background: 'var(--color-purple)', color: '#fff' }}
        >
          Start again →
        </button>
        <NavigationDots total={4} current={3} />
      </div>
    </div>
  );
}
