export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  estimatedMinutes: number;
  elapsedMinutes: number;
  createdAt: string;
  completedAt?: string;
  color?: string;
  emoji?: string;
  order: number;
}
