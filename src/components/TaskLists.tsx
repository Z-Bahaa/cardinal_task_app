import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
  };

  const handleSaveEdit = (listId: string) => {
    if (editingTitle.trim()) {
      updateList(listId, editingTitle.trim());
      setEditingListId(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingListId(null);
    setEditingTitle('');
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
            sx={{ mb: 1 }}
            secondaryAction={
              editingListId === list.id ? (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleSaveEdit(list.id)}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={handleCancelEdit}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleStartEdit(list.id, list.title)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => deleteList(list.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )
            }
          >
            {editingListId === list.id ? (
              <TextField
                fullWidth
                size="small"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(list.id);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              <ListItemButton
                selected={selectedListId === list.id}
                onClick={() => onSelectList(list.id)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemText primary={list.title} />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
      {isCreating && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="New list name"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateList();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewListTitle('');
              }
            }}
            autoFocus
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={handleCreateList}
                    disabled={!newListTitle.trim()}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setIsCreating(false);
                      setNewListTitle('');
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
} 