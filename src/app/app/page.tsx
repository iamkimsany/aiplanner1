'use client';

import { useState, useMemo } from 'react';
import { useAppData } from '@/lib/useAppData';
import { getTodayString, getDailyRecord, computeDayProgress } from '@/lib/store';
import ProgressBar from '@/components/ProgressBar';
import DifficultyBadge from '@/components/DifficultyBadge';
import EnergyBadge from '@/components/EnergyBadge';
import FilterTabs, { FilterKey } from '@/features/tasks/components/FilterTabs';
import TaskRow from '@/components/TaskRow';
import { GoalTask } from '@/lib/types';
import Link from 'next/link';

const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES_KO = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

// P7 — 컴포넌트 밖으로 분리 (렌더마다 재생성 방지)
const DIFFICULTY_GROUPS = [
  { key: 'easy'   as const, label: '쉬운 일',  ring: 'ring-emerald-200', bg: 'bg-emerald-50' },
  { key: 'middle' as const, label: '보통',      ring: 'ring-amber-200',   bg: 'bg-amber-50'   },
  { key: 'hard'   as const, label: '어려운 일', ring: 'ring-red-200',     bg: 'bg-red-50'     },
];

// P9 — useMemo 대신 순수 함수로 분리
function getMotivationMsg(progress: number): string {
  if (progress === 0) return '오늘도 화이팅! 첫 걸음을 내딛어 보세요.';
  if (progress < 30) return '좋은 시작이에요! 계속 나아가 봐요.';
  if (progress < 60) return '절반 왔어요! 포기하지 마세요.';
  if (progress < 100) return '거의 다 왔어요! 조금만 더!';
  return '오늘 모든 할 일을 완료했어요! 정말 대단해요!';
}

export default function AppPage() {
  const { data, toggleFixedTask, toggleGoalTask, loaded } = useAppData();
  // P1 — FilterTabs 상태
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const today = getTodayString();

  const todayDate = useMemo(() => new Date(today + 'T00:00:00'), [today]);
  const dow = todayDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  const record = useMemo(() => getDailyRecord(data, today), [data, today]);
  const progress = useMemo(() => computeDayProgress(data, today), [data, today]);

  // P6 — useMemo로 감싸고 spread 정렬 (원본 배열 변경 방지)
  const fixedForToday = useMemo(
    () =>
      data.fixedTasks
        .filter((t) => t.days.includes(dow))
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [data.fixedTasks, dow]
  );

  const totalTasks = fixedForToday.length + data.goalTasks.length;
  const completedCount =
    record.completedFixedTaskIds.length + record.completedGoalTaskIds.length;

  // '전체' 뷰용 난이도별 그룹
  const goalsByDifficulty = useMemo(() => {
    const easy: GoalTask[] = [];
    const middle: GoalTask[] = [];
    const hard: GoalTask[] = [];
    for (const t of data.goalTasks) {
      if (t.difficulty === 'easy') easy.push(t);
      else if (t.difficulty === 'middle') middle.push(t);
      else hard.push(t);
    }
    return { easy, middle, hard };
  }, [data.goalTasks]);

  // P1 — 필터별 목표 할 일 (null = '전체' 그룹 뷰 사용)
  const filteredGoalTasks = useMemo(() => {
    if (activeFilter === 'all') return null;
    if (activeFilter === 'completed') {
      return data.goalTasks.filter((t) =>
        record.completedGoalTaskIds.includes(t.id)
      );
    }
    return data.goalTasks.filter((t) => t.difficulty === activeFilter);
  }, [activeFilter, data.goalTasks, record.completedGoalTaskIds]);

  // '완료' 탭용 — 오늘 완료된 고정 일정
  const completedFixed = useMemo(
    () => fixedForToday.filter((t) => record.completedFixedTaskIds.includes(t.id)),
    [fixedForToday, record.completedFixedTaskIds]
  );

  const motivationMsg = getMotivationMsg(progress);

  if (!loaded) {
    return <div className="text-center text-gray-400 mt-20">불러오는 중...</div>;
  }

  const hasNoTasks = fixedForToday.length === 0 && data.goalTasks.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm">
          {todayDate.getFullYear()}년 {MONTH_NAMES_KO[todayDate.getMonth()]}{' '}
          {todayDate.getDate()}일 ({DAY_NAMES_KO[dow]})
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5 tracking-tight">오늘의 할 일</h1>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
          <span>오늘 진행률</span>
          <span className="font-semibold text-gray-700">
            {completedCount} / {totalTasks} 완료
          </span>
        </div>
        <ProgressBar percent={progress} />
        <p className="text-sm text-gray-600 italic">{motivationMsg}</p>
      </div>

      {/* P1 — FilterTabs: 실제 동작하는 props 연결 */}
      <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

      {hasNoTasks ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-4">
          <p className="text-2xl">✦</p>
          <p className="text-gray-700 font-medium">오늘 시작할 작은 목표를 추가해 보세요.</p>
          <p className="text-sm text-gray-400">Start with one small step today.</p>
          <Link
            href="/tasks"
            className="inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors"
          >
            할 일 추가하기
          </Link>
        </div>
      ) : activeFilter === 'completed' ? (
        /* 완료 탭 — 고정 일정 + 목표 할 일 완료 항목 통합 표시 */
        <section className="space-y-2">
          <h2 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">
            오늘 완료
          </h2>
          {completedFixed.length === 0 && (filteredGoalTasks?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">아직 완료한 일이 없어요.</p>
          ) : (
            <>
              {completedFixed.map((task) => (
                <TaskRow
                  key={task.id}
                  name={task.name}
                  done={record.completedFixedTaskIds.includes(task.id)}
                  onToggle={() => toggleFixedTask(today, task.id)}
                  variant="fixed"
                  meta={`${task.startTime} – ${task.endTime}`}
                />
              ))}
              {(filteredGoalTasks ?? []).map((task) => (
                <TaskRow
                  key={task.id}
                  name={task.name}
                  done={record.completedGoalTaskIds.includes(task.id)}
                  onToggle={() => toggleGoalTask(today, task.id)}
                  meta={task.estimatedMinutes > 0 ? `예상 ${task.estimatedMinutes}분` : undefined}
                  trailing={
                    <>
                      <EnergyBadge energyLevel={task.energyLevel} />
                      <DifficultyBadge difficulty={task.difficulty} />
                    </>
                  }
                />
              ))}
            </>
          )}
        </section>
      ) : (
        <>
          {/* 고정 일정 — '전체' 탭일 때만 표시 */}
          {activeFilter === 'all' && fixedForToday.length > 0 && (
            <section>
              <h2 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                고정 일정
              </h2>
              <div className="space-y-2">
                {/* P2+P8 — TaskRow 컴포넌트 사용 (중복 제거, aria-label 포함) */}
                {fixedForToday.map((task) => (
                  <TaskRow
                    key={task.id}
                    name={task.name}
                    done={record.completedFixedTaskIds.includes(task.id)}
                    onToggle={() => toggleFixedTask(today, task.id)}
                    variant="fixed"
                    meta={`${task.startTime} – ${task.endTime}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 목표 할 일 */}
          {data.goalTasks.length > 0 && (
            <section>
              <h2 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                목표 할 일
              </h2>

              {filteredGoalTasks !== null ? (
                /* 난이도 필터 — 단일 난이도 평면 목록 */
                filteredGoalTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    이 난이도의 할 일이 없어요.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredGoalTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        name={task.name}
                        done={record.completedGoalTaskIds.includes(task.id)}
                        onToggle={() => toggleGoalTask(today, task.id)}
                        meta={
                          task.estimatedMinutes > 0
                            ? `예상 ${task.estimatedMinutes}분`
                            : undefined
                        }
                        trailing={
                          <>
                            <EnergyBadge energyLevel={task.energyLevel} />
                            <DifficultyBadge difficulty={task.difficulty} />
                          </>
                        }
                      />
                    ))}
                  </div>
                )
              ) : (
                /* '전체' 탭 — 난이도별 그룹 뷰 */
                <div className="space-y-4">
                  {DIFFICULTY_GROUPS.filter(
                    ({ key }) => goalsByDifficulty[key].length > 0
                  ).map(({ key, label, ring, bg }) => (
                    <div key={key} className={`rounded-xl ring-1 ${ring} ${bg} p-3 space-y-2`}>
                      <p className="text-xs font-semibold text-gray-500 px-1">{label}</p>
                      {goalsByDifficulty[key].map((task) => (
                        <TaskRow
                          key={task.id}
                          name={task.name}
                          done={record.completedGoalTaskIds.includes(task.id)}
                          onToggle={() => toggleGoalTask(today, task.id)}
                          meta={
                            task.estimatedMinutes > 0
                              ? `예상 ${task.estimatedMinutes}분`
                              : undefined
                          }
                          trailing={
                            <>
                              <EnergyBadge energyLevel={task.energyLevel} />
                              <DifficultyBadge difficulty={task.difficulty} />
                            </>
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
