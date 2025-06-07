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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface TaskListsProps {
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
}

export function TaskLists({ selectedListId, onSelectList }: TaskListsProps) {
  const { state, createList, updateList, deleteList } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateList = () => {
    if (newListTitle.trim()) {
      createList(newListTitle.trim());
      setNewListTitle('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (listId: string, currentTitle: string) => {
    setEditingListId(listId);
    setEditingTitle(currentTitle);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editingTitle.trim() && editingListId) {
      updateList(editingListId, editingTitle.trim());
      setEditingListId(null);
      setEditingTitle('');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditingTitle('');
    setIsEditing(false);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Lists
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsCreating(true)}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {state.lists.map((list) => (
          <ListItem
            key={list.id}
            disablePadding
            sx={{ mb: 0.75 }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleStartEdit(list.id, list.title)}
                  sx={{ 
                    padding: '3px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.1rem'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => deleteList(list.id)}
                  sx={{ 
                    padding: '3px',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.1rem'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton
              selected={selectedListId === list.id}
              onClick={() => onSelectList(list.id)}
              sx={{
                borderRadius: 1,
                py: 0.75,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemText primary={list.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

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

      {/* Edit List Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={handleCancelEdit}
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
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                handleCancelEdit();
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editingTitle.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 