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
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  ListAlt as ListAltIcon,
  MoreVert as MoreVertIcon,
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
  selectedListIds: string[];
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

export function TaskView({ selectedListIds }: TaskViewProps) {
  const { state, createTask, updateTask, deleteTask, updateList, deleteList } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showActive, setShowActive] = useState(true);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuListId, setActiveMenuListId] = useState<string | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, listId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuListId(listId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuListId(null);
  };

  const handleStartEditList = (listId: string, currentTitle: string) => {
    setEditingListId(listId);
    setEditingTitle(currentTitle);
    setIsEditingList(true);
    handleMenuClose();
  };

  const handleSaveEditList = () => {
    if (editingTitle.trim() && editingListId) {
      updateList(editingListId, editingTitle.trim());
      setEditingListId(null);
      setEditingTitle('');
      setIsEditingList(false);
    }
  };

  const handleCancelEditList = () => {
    setEditingListId(null);
    setEditingTitle('');
    setIsEditingList(false);
  };

  const handleDeleteList = (listId: string) => {
    const taskCount = state.tasks.filter(task => task.listId === listId).length;
    if (taskCount > 0) {
      // Show confirmation dialog
      setIsDeleteAllDialogOpen(true);
    } else {
      // Delete immediately if no tasks
      deleteList(listId);
    }
    handleMenuClose();
  };

  if (selectedListIds.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          mt: '24vh',
          gap: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 4
        }}
      >
        <ListAltIcon 
          sx={{ 
            fontSize: '4rem',
            color: 'text.secondary',
            opacity: 0.7
          }} 
        />
        <Typography variant="h6" color="text.secondary">
          Select a list or create a new one
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 3, 
      height: '100%',
      bgcolor: 'background.default',
      borderRadius: 2
    }}>
      {selectedListIds.map((listId) => {
        const tasks = state.tasks.filter((task) => task.listId === listId);
        const selectedList = state.lists.find((list) => list.id === listId);
        const incompleteTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);
        const hasBothTypes = incompleteTasks.length > 0 && completedTasks.length > 0;

        return (
          <Box 
            key={listId}
            sx={{ 
              flex: 1,
              minWidth: '30vw',
              maxWidth: '45vw',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Typography variant="h5" sx={{ flex: 1 }}>
                {selectedList?.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  setMenuAnchorEl(e.currentTarget);
                  setActiveMenuListId(listId);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setIsCreating(true)}
              sx={{ mb: 3 }}
            >
              Add Task
            </Button>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl) && activeMenuListId === listId}
              onClose={() => {
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
            >
              <MenuItem onClick={() => {
                setEditingListId(listId);
                setEditingTitle(selectedList?.title || '');
                setIsEditingList(true);
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}>
                <EditIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Rename List
              </MenuItem>
              <MenuItem onClick={() => {
                setIsDeletingList(true);
                setActiveMenuListId(listId);
                setMenuAnchorEl(null);
              }}>
                <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                Delete List
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={() => {
                  setIsDeleteAllDialogOpen(true);
                  setActiveMenuListId(null);
                  setMenuAnchorEl(null);
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'error.main' }} />
                Delete Completed Tasks
              </MenuItem>
            </Menu>

            {/* Edit List Dialog */}
            <Dialog 
              open={isEditingList} 
              onClose={() => {
                setIsEditingList(false);
                setEditingListId(null);
                setEditingTitle('');
              }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Edit List</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  fullWidth
                  label="List Name"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editingTitle.trim()) {
                      updateList(editingListId!, editingTitle.trim());
                      setIsEditingList(false);
                      setEditingListId(null);
                      setEditingTitle('');
                    } else if (e.key === 'Escape') {
                      setIsEditingList(false);
                      setEditingListId(null);
                      setEditingTitle('');
                    }
                  }}
                  sx={{ mt: 1 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setIsEditingList(false);
                  setEditingListId(null);
                  setEditingTitle('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (editingTitle.trim() && editingListId) {
                      updateList(editingListId, editingTitle.trim());
                      setIsEditingList(false);
                      setEditingListId(null);
                      setEditingTitle('');
                    }
                  }}
                  variant="contained"
                  disabled={!editingTitle.trim()}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

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

            {/* Delete List Confirmation Dialog */}
            <Dialog
              open={isDeletingList}
              onClose={() => {
                setIsDeletingList(false);
                setActiveMenuListId(null);
              }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Delete List</DialogTitle>
              <DialogContent>
                {activeMenuListId && (
                  <>
                    <Typography>
                      Are you sure you want to delete "{state.lists.find(l => l.id === activeMenuListId)?.title}"?
                    </Typography>
                    <Typography color="error" sx={{ mt: 1 }}>
                      This will permanently delete all tasks in this list.
                    </Typography>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setIsDeletingList(false);
                  setActiveMenuListId(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (activeMenuListId) {
                      deleteList(activeMenuListId);
                      setIsDeletingList(false);
                      setActiveMenuListId(null);
                    }
                  }}
                  variant="contained"
                  color="error"
                >
                  Delete List
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete All Tasks Confirmation Dialog */}
            <Dialog
              open={isDeleteAllDialogOpen && !isDeletingList}
              onClose={() => {
                setIsDeleteAllDialogOpen(false);
                setActiveMenuListId(null);
              }}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Delete All Completed Tasks</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete all completed tasks in the selected list? This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setIsDeleteAllDialogOpen(false);
                  setActiveMenuListId(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const currentListId = selectedListIds[0];
                    const tasksToDelete = state.tasks.filter(
                      task => task.listId === currentListId && task.completed
                    );
                    tasksToDelete.forEach(task => deleteTask(task.id));
                    setIsDeleteAllDialogOpen(false);
                    setActiveMenuListId(null);
                  }}
                  variant="contained"
                  color="error"
                >
                  Delete All
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      })}

      <TaskDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onSubmit={(listId, title, description) => {
          createTask(listId, title, description);
          setIsCreating(false);
        }}
        initialListId={selectedListIds[0]}
      />
    </Box>
  );
} 