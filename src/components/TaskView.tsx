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
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  ListAlt as ListAltIcon,
  MoreVert as MoreVertIcon,
  AssignmentOutlined as AssignmentOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
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

  // Update selectedListId when initialListId changes
  useEffect(() => {
    if (initialListId) {
      setSelectedListId(initialListId);
    }
  }, [initialListId]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTitle(initialValues?.title || '');
      setDescription(initialValues?.description || '');
      setSelectedListId(initialListId || state.lists[0]?.id || '');
    }
  }, [open, initialValues, initialListId, state.lists]);

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
  onSelectLists: (listIds: string[]) => void;
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
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
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

  return (
    <Card 
      sx={{ 
        mb: 2,
        bgcolor: 'background.default',
        boxShadow: 'none',
        cursor: isEditing ? 'default' : 'pointer',
        '&:hover': {
          bgcolor: isEditing ? 'background.default' : 'action.hover'
        },
        pointerEvents: isEditing ? 'none' : 'auto',
        position: 'relative'
      }}
      onClick={() => !isEditing && setIsExpanded(!isExpanded)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={task.completed}
            onChange={(e) => {
              e.stopPropagation();
              handleTaskCompletion(e.target.checked);
            }}
            disabled={isEditing}
          />
          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <TaskDialog
                open={isEditing}
                onClose={() => setIsEditing(false)}
                onSubmit={(listId, title, description) => {
                  onUpdate({ 
                    title, 
                    description,
                    listId // Include the listId in the update
                  });
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
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchorEl(e.currentTarget);
              }}
              disabled={isEditing}
            >
              <MoreVertIcon />
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
                onClick={(e) => e.stopPropagation()} // Prevent task expansion when interacting with subtasks
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
                <Box sx={{ display: 'flex', gap: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleStartEditSubtask(subtask)}
                    sx={{ 
                      padding: '4px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    sx={{ 
                      padding: '4px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
            {!task.completed && (
              <Button
                startIcon={<AddIcon />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent task expansion when clicking add subtask
                  setIsSubtaskDialogOpen(true);
                }}
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

        {/* Task Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem 
            onClick={() => {
              setIsEditing(true);
              setMenuAnchorEl(null);
            }}
          >
            <EditIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Edit Task
          </MenuItem>
          <MenuItem 
            onClick={() => {
              if (task.subtasks.length > 0) {
                setIsDeleteDialogOpen(true);
              } else {
                onDelete();
              }
              setMenuAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'error.main' }} />
            Delete Task
          </MenuItem>
        </Menu>
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

type SortOption = 'oldest' | 'newest' | 'az' | 'za';

export function TaskView({ selectedListIds, onSelectLists }: TaskViewProps) {
  const { state, createTask, updateTask, deleteTask, updateList, deleteList } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuListId, setActiveMenuListId] = useState<string | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const getSortedTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
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
          bgcolor: {
            xs: 'background.paper',
            sm: 'background.paper',
            md: 'transparent',
            lg: 'transparent',
          },
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
        const sortedTasks = getSortedTasks(tasks);
        const incompleteTasks = sortedTasks.filter(task => !task.completed);
        const completedTasks = sortedTasks.filter(task => task.completed);

        return (
          <Box 
            key={listId}
            sx={{ 
              flex: 1,
              minWidth: {
                xs: '100%',  // Remove max-width on small screens
                sm: '80%',  // Remove max-width on small-medium screens
                md: '45vw',   // 75% width on medium screens
                lg: '30vw'   // Keep original max-width for large screens
              },
              maxWidth: {
                xs: '100%',  // Remove max-width on small screens
                sm: '100%',  // Remove max-width on small-medium screens
                md: '60vw',   // 75% width on medium screens
                lg: '45vw'   // Keep original max-width for large screens
              },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 2,
              px: 3,
              pt: 3,
              pb: 1,
              height: 'fit-content',
              maxHeight: 'calc(100vh - 120px)',
              overflow: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '& *': {
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" sx={{ flex: 1 }}>
                {selectedList?.title}
              </Typography>
              <IconButton
                sx={{mr: -1}}
                size="small"
                onClick={(e) => {
                  setMenuAnchorEl(e.currentTarget);
                  setActiveMenuListId(listId);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl) && activeMenuListId === listId}
              onClose={() => {
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sort by
                </Typography>
              </Box>
              <MenuItem onClick={() => {
                setSortOption('oldest');
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
              sx={{ pl: 3 }}
              >
                Oldest First
              </MenuItem>
              <MenuItem onClick={() => {
                setSortOption('newest');
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
              sx={{ pl: 3 }}
              >
                Newest First
              </MenuItem>
              <MenuItem onClick={() => {
                setSortOption('az');
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
              sx={{ pl: 3 }}
              >
                A-Z
              </MenuItem>
              <MenuItem onClick={() => {
                setSortOption('za');
                setMenuAnchorEl(null);
                setActiveMenuListId(null);
              }}
              sx={{ pl: 3 }}
              >
                Z-A
              </MenuItem>
              <Divider />
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

            <Button
              startIcon={<AddCircleOutlineIcon sx={{ color: 'primary.main' }} />}
              variant="text"
              onClick={() => {
                setIsCreating(true);
                setActiveMenuListId(listId);
              }}
              sx={{ 
                justifyContent: 'flex-start',
                textAlign: 'left',
                pl: -2,
                ml: -1.5,
                mr: -1,
                mb: 2,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              Add Task
            </Button>

            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '& *': {
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }
            }}>
              {tasks.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: '15vh',
                    mb: '14vh',
                    gap: 2,
                    opacity: 0.7
                  }}
                >
                  <AssignmentOutlinedIcon 
                    sx={{ 
                      fontSize: '4rem',
                      color: 'text.secondary'
                    }} 
                  />
                  <Typography variant="h6" color="text.secondary">
                    No tasks yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Add your to-dos and to-donts
                  </Typography>
                </Box>
              ) : incompleteTasks.length === 0 && completedTasks.length > 0 ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: '15vh',
                      mb: 4,
                      gap: 2,
                      opacity: 0.7
                    }}
                  >
                    <CheckCircleOutlineIcon 
                      sx={{ 
                        fontSize: '4rem',
                        color: 'success.main'
                      }} 
                    />
                    <Typography variant="h6" color="text.secondary">
                      All tasks are complete
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Nice work!
                    </Typography>
                  </Box>

                  {/* Completed Tasks Section */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Completed ({completedTasks.length})
                    </Typography>
                    <IconButton size="small">
                      {showCompleted ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
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
              ) : (
                <>
                  {/* Active Tasks Section - Always visible */}
                  {incompleteTasks.length > 0 && (
                    <>
                      {incompleteTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={(updates) => updateTask(task.id, updates)}
                          onDelete={() => deleteTask(task.id)}
                        />
                      ))}
                    </>
                  )}
                </>
              )}

              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mt: 2,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Completed ({completedTasks.length})
                    </Typography>
                    <IconButton size="small">
                      {showCompleted ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
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
            </Box>

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
                      // First deselect the list
                      onSelectLists(selectedListIds.filter(id => id !== activeMenuListId));
                      // Then delete it
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
        onClose={() => {
          setIsCreating(false);
          setActiveMenuListId(null);
        }}
        onSubmit={(listId, title, description) => {
          createTask(listId, title, description);
          setIsCreating(false);
          setActiveMenuListId(null);
        }}
        initialListId={activeMenuListId || selectedListIds[0]}
      />
    </Box>
  );
} 