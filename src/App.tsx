import { CssBaseline, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { useApp } from './context/AppContext';
import { TaskLists } from './components/TaskLists';
import { TaskView } from './components/TaskView';
import { Header } from './components/Header';
import { useState, useEffect } from 'react';

export function App() {
  const { state, createList, createTask, createSubtask, updateTask } = useApp();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    // Initialize list selection or create default list
    if (state.lists.length === 0) {
      // Create default list
      createList('My Tasks');
    } else if (!selectedListId) {
      // If there are lists but none selected, select the first one
      setSelectedListId(state.lists[0].id);
    }
  }, [state.lists, selectedListId, createList]);

  // Create example tasks after the default list is created
  useEffect(() => {
    if (state.lists.length === 1 && state.lists[0].title === 'My Tasks' && state.tasks.length === 0) {
      const defaultListId = state.lists[0].id;
      
      // Create basic task
      createTask(defaultListId, 'Basic Task', 'This is a basic task.');
      
      // Create layered task with subtasks
      createTask(
        defaultListId,
        'Layered Task',
        'This is a layered task with subtasks. If you mark it as completed, it will mark all its subtasks as completed.'
      );

      // Create completed task
      createTask(
        defaultListId,
        'Completed Task',
        'This task has been completed'
      );
    }
  }, [state.lists, state.tasks, createTask]);

  // Mark the completed task as completed after it's created
  useEffect(() => {
    if (state.tasks.length === 3) { // We have all three tasks
      const completedTask = state.tasks.find(task => 
        task.title === 'Completed Task' && 
        !task.completed
      );
      if (completedTask) {
        updateTask(completedTask.id, { completed: true });
      }
    }
  }, [state.tasks, updateTask]);

  // Create subtasks after the layered task is created
  useEffect(() => {
    const layeredTask = state.tasks.find(task => 
      task.title === 'Layered Task' && 
      task.subtasks.length === 0
    );
    
    if (layeredTask) {
      createSubtask(layeredTask.id, 'Subtask 1', '');
      createSubtask(
        layeredTask.id,
        'Subtask with Description',
        'This is a subtask that has a description to show how subtasks can have additional details.'
      );
    }
  }, [state.tasks, createSubtask]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header onMenuClick={toggleSidebar} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            mt: '64px',
            flex: 1,
            position: 'relative',
          }}
        >
          {/* Overlay for mobile */}
          {isMobile && isSidebarOpen && (
            <Box
              onClick={handleOverlayClick}
              sx={{
                position: 'fixed',
                top: '64px',
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                transition: theme => theme.transitions.create('opacity', {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut,
                }),
              }}
            />
          )}

          <Box
            sx={{
              width: { 
                xs: isSidebarOpen ? 260 : 0,
                md: isSidebarOpen ? 260 : 0 
              },
              height: { 
                xs: isSidebarOpen ? 'calc(100vh - 64px)' : 0,
                md: isSidebarOpen ? 'calc(100vh - 64px)' : 0
              },
              position: { 
                xs: isSidebarOpen ? 'fixed' : 'relative',
                md: 'fixed' 
              },
              zIndex: { xs: isSidebarOpen ? 2 : 'auto', md: 'auto' },
              overflow: 'hidden',
              transition: theme => theme.transitions.create(['width', 'height'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                opacity: isSidebarOpen ? 1 : 0,
                transform: `translateX(${isSidebarOpen ? 0 : -20}px)`,
                transition: theme => theme.transitions.create(['opacity', 'transform'], {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut,
                }),
                px: 3,
                py: 1,
                bgcolor: 'background.default',
                minWidth: { xs: isSidebarOpen ? '50%' : 0 },
              }}
            >
              <TaskLists
                selectedListId={selectedListId}
                onSelectList={(id) => {
                  setSelectedListId(id);
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              ml: { md: isSidebarOpen ? '260px' : 0 },
              minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' },
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              transition: theme => theme.transitions.create('margin-left', {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
              px: 2,
              position: { xs: 'relative', md: 'static' },
              zIndex: { xs: 0, md: 'auto' },
            }}
          >
            <Container maxWidth="lg" sx={{ py: 3, px: { xs: 0, sm: 2 } }}>
              <TaskView selectedListId={selectedListId} />
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
