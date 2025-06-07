import type { AppState, Task, TaskList } from '../types/task';

const STORAGE_KEY = 'cardinal-todo-app';

const defaultState: AppState = {
  lists: [],
  tasks: [],
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return defaultState;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state:', err);
    return defaultState;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

export const getTasksByList = (tasks: Task[], listId: string): Task[] => {
  return tasks.filter(task => task.listId === listId);
};

export const getTaskById = (tasks: Task[], taskId: string): Task | undefined => {
  return tasks.find(task => task.id === taskId);
};

export const getListById = (lists: TaskList[], listId: string): TaskList | undefined => {
  return lists.find(list => list.id === listId);
}; 