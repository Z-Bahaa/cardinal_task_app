export interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  lists: TaskList[];
  tasks: Task[];
} 