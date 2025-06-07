import {
  Box,
  Typography,
  IconButton,
  TextField,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import type { Task, Subtask } from '../types/task';

interface TaskViewProps {
  selectedListId: string | null;
}

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, dueDate: string | undefined) => void;
  initialValues?: {
    title: string;
    description: string;
    dueDate: string | undefined;
  };
}

function TaskDialog({ open, onClose, onSubmit, initialValues }: TaskDialogProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate || '');
  const [hasDueDate, setHasDueDate] = useState(!!initialValues?.dueDate);

  const handleSubmit = () => {
    onSubmit(title, description, hasDueDate ? dueDate : undefined);
    setTitle('');
    setDescription('');
    setDueDate('');
    setHasDueDate(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues ? 'Edit Task' : 'New Task'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={hasDueDate}
                onChange={(e) => setHasDueDate(e.target.checked)}
              />
            }
            label="Set due date"
          />
          {hasDueDate && (
            <TextField
              label="Due Date"
              type="datetime-local"
              fullWidth
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim()}
        >
          {initialValues ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TaskItem({ task, onUpdate, onDelete }: {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const { createSubtask, updateSubtask, deleteSubtask } = useApp();

  const handleCreateSubtask = (title: string, description: string) => {
    createSubtask(task.id, title, description);
    setIsSubtaskDialogOpen(false);
  };

  const handleUpdateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    updateSubtask(task.id, subtaskId, updates);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask(task.id, subtaskId);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completed}
            onChange={(e) => onUpdate({ completed: e.target.checked })}
          />
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <TaskDialog
                open={isEditing}
                onClose={() => setIsEditing(false)}
                onSubmit={(title, description, dueDate) => {
                  onUpdate({ title, description, dueDate });
                  setIsEditing(false);
                }}
                initialValues={{
                  title: task.title,
                  description: task.description || '',
                  dueDate: task.dueDate,
                }}
              />
            ) : (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {task.description}
                  </Typography>
                )}
                {task.dueDate && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Due: {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                  </Typography>
                )}
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={onDelete}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Collapse in={isExpanded}>
          <Box sx={{ mt: 2, pl: 4 }}>
            {task.subtasks.map((subtask) => (
              <Box
                key={subtask.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Checkbox
                  checked={subtask.completed}
                  onChange={(e) =>
                    handleUpdateSubtask(subtask.id, { completed: e.target.checked })
                  }
                />
                <Typography
                  sx={{
                    flex: 1,
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    color: subtask.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {subtask.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsSubtaskDialogOpen(true)}
              size="small"
            >
              Add Subtask
            </Button>
            <TaskDialog
              open={isSubtaskDialogOpen}
              onClose={() => setIsSubtaskDialogOpen(false)}
              onSubmit={handleCreateSubtask}
            />
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function TaskView({ selectedListId }: TaskViewProps) {
  const { state, createTask, updateTask, deleteTask } = useApp();
  const [isCreating, setIsCreating] = useState(false);

  const tasks = state.tasks.filter((task) => task.listId === selectedListId);
  const selectedList = state.lists.find((list) => list.id === selectedListId);

  if (!selectedListId) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a list or create a new one
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          {selectedList?.title}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setIsCreating(true)}
        >
          Add Task
        </Button>
      </Box>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={(updates) => updateTask(task.id, updates)}
          onDelete={() => deleteTask(task.id)}
        />
      ))}
      <TaskDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={(title, description, dueDate) => {
          createTask(selectedListId, title, description, dueDate);
          setIsCreating(false);
        }}
      />
    </Box>
  );
} 