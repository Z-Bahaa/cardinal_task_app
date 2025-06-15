import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Collapse,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskDialog } from './TaskView';

interface TaskListsProps {
  selectedListIds?: string[];
  onSelectLists: (listIds: string[]) => void;
}

export function TaskLists({ selectedListIds = [], onSelectLists }: TaskListsProps) {
  const { state, createList, createTask } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isListsExpanded, setIsListsExpanded] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');

  const handleListSelection = (listId: string) => {
    const newSelection = selectedListIds.includes(listId)
      ? selectedListIds.filter(id => id !== listId)
      : [...selectedListIds, listId];
    onSelectLists(newSelection);
  };

  const handleCreateList = () => {
    if (newListTitle.trim()) {
      const newList = createList(newListTitle.trim());
      onSelectLists([...selectedListIds, newList.id]);
      setNewListTitle('');
      setIsCreating(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon sx={{ fontSize: '1.5rem' }} />}
        onClick={() => setIsCreatingTask(true)}
        sx={{ 
          mt: 2,
          mb: 3.5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          textAlign: 'left',
          pl: 1.75,
          pr: 4,
          py: 0.8,
          fontSize: '1.05rem',
          '& .MuiButton-startIcon': {
            marginRight: 1,
            marginTop: '-1.5px',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem'
            }
          },
          minWidth: 'auto',
          borderRadius: 1.5
        }}
      >
        Create
      </Button>

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
        onClick={() => setIsListsExpanded(!isListsExpanded)}
      >
        <Typography variant="h6" sx={{ flex: 1 }}>
          Lists
        </Typography>
        <IconButton size="small">
          {isListsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      <Collapse in={isListsExpanded}>
        <List sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE/Edge
        }}>
          {state.lists.map((list) => {
            const activeTaskCount = state.tasks.filter(task => 
              task.listId === list.id && !task.completed
            ).length;

            return (
              <ListItem
                key={list.id}
                disablePadding
                sx={{ mb: 0.375 }}
                secondaryAction={
                  activeTaskCount > 0 && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        px: 0.25
                      }}
                    >
                      {activeTaskCount}
                    </Typography>
                  )
                }
              >
                <ListItemButton
                  onClick={() => handleListSelection(list.id)}
                  sx={{
                    borderRadius: 1,
                    py: 0.375,
                    px: 1,
                    pl: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedListIds.includes(list.id)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    sx={{ 
                      p: 0.5,
                      mr: 0.5
                    }}
                  />
                  <ListItemText 
                    primary={list.title}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: '0.875rem',
                        color: 'text.primary'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>

      <Button
        onClick={() => setIsCreating(true)}
        sx={{
          mt: 1,
          ml: -1,
          borderRadius: 1,
          py: 0.75,
          px: 1,
          pl: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          textTransform: 'none',
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <AddIcon 
          sx={{ 
            fontSize: '1.4rem',
            mr: 0.75,
            opacity: 0.7
          }} 
        />
        <Typography
          sx={{
            fontSize: '0.95rem',
            mt: "-0.5px",
            color: 'text.primary'
          }}
        >
          Create new list
        </Typography>
      </Button>

      {/* Create List Dialog */}
      <Dialog 
        open={isCreating} 
        onClose={() => {
          setIsCreating(false);
          setNewListTitle('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create New List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="List Name"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newListTitle.trim()) {
                handleCreateList();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewListTitle('');
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsCreating(false);
              setNewListTitle('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList}
            variant="contained"
            disabled={!newListTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <TaskDialog
        open={isCreatingTask}
        onClose={() => setIsCreatingTask(false)}
        onSubmit={(listId: string, title: string, description: string) => {
          createTask(listId, title, description);
          setIsCreatingTask(false);
        }}
        initialListId={selectedListIds[0] || undefined}
      />
    </Box>
  );
} 