'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, DailyRecord } from './types';
import { loadData, saveData, getDailyRecord } from './store';
import { MOCK_DATA } from '@/features/tasks/mock-data';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => ({
    fixedTasks: [],
    goalTasks: [],
    dailyRecords: {},
  }));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadData();
    const isEmpty = stored.fixedTasks.length === 0 && stored.goalTasks.length === 0;
    setData(isEmpty ? MOCK_DATA : stored);
    setLoaded(true);
  }, []);

  const update = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  const toggleFixedTask = useCallback(
    (date: string, taskId: string) => {
      const record: DailyRecord = getDailyRecord(data, date);
      const ids = record.completedFixedTaskIds.includes(taskId)
        ? record.completedFixedTaskIds.filter((id) => id !== taskId)
        : [...record.completedFixedTaskIds, taskId];
      const next: AppData = {
        ...data,
        dailyRecords: {
          ...data.dailyRecords,
          [date]: { ...record, completedFixedTaskIds: ids },
        },
      };
      update(next);
    },
    [data, update]
  );

  const toggleGoalTask = useCallback(
    (date: string, taskId: string) => {
      const record: DailyRecord = getDailyRecord(data, date);
      const ids = record.completedGoalTaskIds.includes(taskId)
        ? record.completedGoalTaskIds.filter((id) => id !== taskId)
        : [...record.completedGoalTaskIds, taskId];
      const next: AppData = {
        ...data,
        dailyRecords: {
          ...data.dailyRecords,
          [date]: { ...record, completedGoalTaskIds: ids },
        },
      };
      update(next);
    },
    [data, update]
  );

  return { data, update, toggleFixedTask, toggleGoalTask, loaded };
}
