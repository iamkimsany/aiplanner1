import { AppData } from '@/lib/types';

export const MOCK_DATA: AppData = {
  fixedTasks: [
    {
      id: 'mock-fixed-1',
      name: '수업',
      startTime: '09:00',
      endTime: '12:00',
      days: [1, 2, 3, 4, 5],
    },
  ],
  goalTasks: [
    {
      id: 'mock-goal-1',
      name: '운동 30분',
      difficulty: 'easy',
      energyLevel: 'medium',
      estimatedMinutes: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-goal-2',
      name: '영어 단어 10개 외우기',
      difficulty: 'middle',
      energyLevel: 'low',
      estimatedMinutes: 20,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mock-goal-3',
      name: '과제 초안 작성',
      difficulty: 'hard',
      energyLevel: 'high',
      estimatedMinutes: 90,
      createdAt: new Date().toISOString(),
    },
  ],
  dailyRecords: {},
};
