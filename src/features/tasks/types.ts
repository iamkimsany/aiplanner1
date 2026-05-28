// Spec-aligned Task type (tech-design.md §7)
export type TaskDifficulty = 'easy' | 'middle' | 'hard';

export type TaskStatus = 'todo' | 'done';

export type Task = {
  id: string;
  title: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  createdAt: string;
  dueDate?: string;
};
