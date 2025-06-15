import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Task, TaskList, Subtask } from '../types/task';
import { loadState, saveState } from '../utils/storage';

type Action =
  | { type: 'CREATE_LIST'; payload: { title: string; list: TaskList } }
  | { type: 'UPDATE_LIST'; payload: { id: string; title: string } }
  | { type: 'DELETE_LIST'; payload: { id: string } }
  | { type: 'CREATE_TASK'; payload: { listId: string; title: string; description?: string; dueDate?: string } }
  | { type: 'UPDATE_TASK'; payload: { id: string; title?: string; description?: string; dueDate?: string; completed?: boolean } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'CREATE_SUBTASK'; payload: { taskId: string; title: string; description?: string } }
  | { type: 'UPDATE_SUBTASK'; payload: { taskId: string; subtaskId: string; title?: string; description?: string; completed?: boolean } }
  | { type: 'DELETE_SUBTASK'; payload: { taskId: string; subtaskId: string } };

interface AppContextType {
  state: AppState;
  createList: (title: string) => TaskList;
  updateList: (id: string, title: string) => void;
  deleteList: (id: string) => void;
  createTask: (listId: string, title: string, description?: string, dueDate?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  createSubtask: (taskId: string, title: string, description?: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = loadState();

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'CREATE_LIST': {
      newState = {
        ...state,
        lists: [...state.lists, action.payload.list],
      };
      break;
    }

    case 'UPDATE_LIST': {
      newState = {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id
            ? { ...list, title: action.payload.title, updatedAt: new Date().toISOString() }
            : list
        ),
      };
      break;
    }

    case 'DELETE_LIST': {
      newState = {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload.id),
        tasks: state.tasks.filter(task => task.listId !== action.payload.id),
      };
      break;
    }

    case 'CREATE_TASK': {
      const newTask: Task = {
        id: uuidv4(),
        listId: action.payload.listId,
        title: action.payload.title,
        description: action.payload.description,
        dueDate: action.payload.dueDate,
        completed: false,
        subtasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newState = {
        ...state,
        tasks: [...state.tasks, newTask],
      };
      break;
    }

    case 'UPDATE_TASK': {
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? {
                ...task,
                ...action.payload,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };
      break;
    }

    case 'DELETE_TASK': {
      newState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload.id),
      };
      break;
    }

    case 'CREATE_SUBTASK': {
      const newSubtask: Subtask = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: [...task.subtasks, newSubtask],
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };
      break;
    }

    case 'UPDATE_SUBTASK': {
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === action.payload.subtaskId
                    ? {
                        ...subtask,
                        ...action.payload,
                        updatedAt: new Date().toISOString(),
                      }
                    : subtask
                ),
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };
      break;
    }

    case 'DELETE_SUBTASK': {
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter(subtask => subtask.id !== action.payload.subtaskId),
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
      };
      break;
    }

    default:
      return state;
  }

  saveState(newState);
  return newState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const createList = (title: string): TaskList => {
    const newList: TaskList = {
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_LIST', payload: { title, list: newList } });
    return newList;
  };

  const updateList = (id: string, title: string) => {
    dispatch({ type: 'UPDATE_LIST', payload: { id, title } });
  };

  const deleteList = (id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: { id } });
  };

  const createTask = (listId: string, title: string, description?: string, dueDate?: string) => {
    dispatch({ type: 'CREATE_TASK', payload: { listId, title, description, dueDate } });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, ...updates } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  };

  const createSubtask = (taskId: string, title: string, description?: string) => {
    dispatch({ type: 'CREATE_SUBTASK', payload: { taskId, title, description } });
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    dispatch({ type: 'UPDATE_SUBTASK', payload: { taskId, subtaskId, ...updates } });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { taskId, subtaskId } });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        createList,
        updateList,
        deleteList,
        createTask,
        updateTask,
        deleteTask,
        createSubtask,
        updateSubtask,
        deleteSubtask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 