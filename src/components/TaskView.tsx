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
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, Subtask } from '../types/task';

export interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listId: string, title: string, description: string) => void;
  initialValues?: {
    title: string;
    description: string;
  };
  initialListId?: string;
}

export function TaskDialog({ open, onClose, onSubmit, initialValues, initialListId }: TaskDialogProps) {
  const { state } = useApp();
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [selectedListId, setSelectedListId] = useState(initialListId || state.lists[0]?.id || '');

  const handleSubmit = () => {
    onSubmit(selectedListId, title, description);
    setTitle('');
    setDescription('');
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
          <TextField
            select
            label="List"
            fullWidth
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            {state.lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || !selectedListId}
        >
          {initialValues ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface TaskViewProps {
  selectedListId: string | null;
}

interface SubtaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  initialValues?: {
    title: string;
    description: string;
  };
}

function SubtaskDialog({ open, onClose, onSubmit, initialValues }: SubtaskDialogProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');

  const handleSubmit = () => {
    onSubmit(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues ? 'Edit Subtask' : 'New Subtask'}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
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
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { createSubtask, updateSubtask, deleteSubtask } = useApp();

  const handleTaskCompletion = (completed: boolean) => {
    onUpdate({ completed });
    
    task.subtasks.forEach(subtask => {
      updateSubtask(task.id, subtask.id, { completed });
    });
  };

  const handleCreateSubtask = (title: string, description: string) => {
    createSubtask(task.id, title, description);
    setIsSubtaskDialogOpen(false);
  };

  const handleUpdateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    updateSubtask(task.id, subtaskId, updates);
    setEditingSubtask(null);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask(task.id, subtaskId);
  };

  const handleStartEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
  };

  const handleDeleteClick = () => {
    if (task.subtasks.length > 0) {
      setIsDeleteDialogOpen(true);
    } else {
      onDelete();
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completed}
            onChange={(e) => handleTaskCompletion(e.target.checked)}
          />
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <TaskDialog
                open={isEditing}
                onClose={() => setIsEditing(false)}
                onSubmit={(listId, title, description) => {
                  onUpdate({ title, description });
                  setIsEditing(false);
                }}
                initialValues={{
                  title: task.title,
                  description: task.description || '',
                }}
                initialListId={task.listId}
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
              onClick={handleDeleteClick}
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
                <Box sx={{ flex: 1 }}>
                  {editingSubtask?.id === subtask.id ? (
                    <SubtaskDialog
                      open={true}
                      onClose={() => setEditingSubtask(null)}
                      onSubmit={(title, description) => 
                        handleUpdateSubtask(subtask.id, { title, description })
                      }
                      initialValues={{
                        title: subtask.title,
                        description: subtask.description || '',
                      }}
                    />
                  ) : (
                    <>
                      <Typography
                        sx={{
                          textDecoration: subtask.completed ? 'line-through' : 'none',
                          color: subtask.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {subtask.title}
                      </Typography>
                      {subtask.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {subtask.description}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleStartEditSubtask(subtask)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            {!task.completed && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setIsSubtaskDialogOpen(true)}
                size="small"
              >
                Add Subtask
              </Button>
            )}
            <SubtaskDialog
              open={isSubtaskDialogOpen}
              onClose={() => setIsSubtaskDialogOpen(false)}
              onSubmit={handleCreateSubtask}
            />
          </Box>
        </Collapse>
      </CardContent>

      {/* Delete Task Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task with Subtasks</DialogTitle>
        <DialogContent>
          <Typography>
            This task has {task.subtasks.length} subtask{task.subtasks.length === 1 ? '' : 's'}. 
            Deleting it will also delete all its subtasks. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onDelete();
              setIsDeleteDialogOpen(false);
            }}
            variant="contained"
            color="error"
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export function TaskView({ selectedListId }: TaskViewProps) {
  const { state, createTask, updateTask, deleteTask } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const tasks = state.tasks.filter((task) => task.listId === selectedListId);
  const selectedList = state.lists.find((list) => list.id === selectedListId);

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const hasBothTypes = incompleteTasks.length > 0 && completedTasks.length > 0;

  const handleDeleteAllCompleted = () => {
    completedTasks.forEach(task => deleteTask(task.id));
    setIsDeleteAllDialogOpen(false);
  };

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

      {/* Active Tasks Section */}
      {incompleteTasks.length > 0 && (
        <>
          {hasBothTypes && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => setShowActive(!showActive)}
            >
              <Typography variant="h6" color="text.secondary">
                Active ({incompleteTasks.length})
              </Typography>
              <IconButton size="small">
                {showActive ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
          )}
          <Collapse in={!hasBothTypes || showActive}>
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={(updates) => updateTask(task.id, updates)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </Collapse>
        </>
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mt: 3, 
              mb: 2,
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                flex: 1,
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <Typography variant="h6" color="text.secondary">
                Completed ({completedTasks.length})
              </Typography>
              <IconButton size="small">
                {showCompleted ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Box>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setIsDeleteAllDialogOpen(true)}
              sx={{ 
                minWidth: '100px',
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
                height: '30px',
                py: 0.5,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              Delete All
            </Button>
          </Box>
          <Collapse in={showCompleted}>
            <Box sx={{ opacity: 0.7 }}>
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={(updates) => updateTask(task.id, updates)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </Box>
          </Collapse>
        </>
      )}

      <TaskDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={(listId, title, description) => {
          createTask(listId, title, description);
          setIsCreating(false);
        }}
        initialListId={selectedListId}
      />

      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={isDeleteAllDialogOpen}
        onClose={() => setIsDeleteAllDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete All Completed Tasks</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all {completedTasks.length} completed tasks? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteAllDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAllCompleted}
            variant="contained"
            color="error"
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 