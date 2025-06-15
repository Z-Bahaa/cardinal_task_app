import { CssBaseline, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { useApp } from './context/AppContext';
import { TaskLists } from './components/TaskLists';
import { TaskView } from './components/TaskView';
import { Header } from './components/Header';
import { useState, useEffect } from 'react';

export function App() {
  const { state, createList, createTask, createSubtask, updateTask } = useApp();
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarTransitioning, setIsSidebarTransitioning] = useState(false);
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
    }
    // Remove the automatic selection of the first list
    // This allows users to deselect all lists if they want to
  }, [state.lists, createList]);

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

  const handleSidebarToggle = () => {
    setIsSidebarTransitioning(true);
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Listen for transition end to update visibility
  const handleTransitionEnd = () => {
    setIsSidebarTransitioning(false);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header 
          onMenuClick={handleSidebarToggle} 
          isSidebarOpen={isSidebarOpen}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            mt: '64px',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Overlay for mobile */}
          {isMobile && isSidebarOpen && (
            <Box
              onClick={() => setIsSidebarOpen(false)}
              sx={{
                position: 'fixed',
                top: '64px',
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1,
                transition: theme => theme.transitions.create('opacity', {
                  duration: theme.transitions.duration.shortest,
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
                xs: 'fixed',
                md: 'fixed' 
              },
              top: { xs: '64px', md: '64px' },
              left: 0,
              zIndex: { xs: 1200, md: 'auto' },
              overflow: 'hidden',
              transition: theme => theme.transitions.create(['width', 'height'], {
                duration: theme.transitions.duration.shortest,
                easing: theme.transitions.easing.easeInOut,
              }),
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: isSidebarOpen ? 'auto' : 'hidden',
                opacity: isSidebarOpen && !isSidebarTransitioning ? 1 : 0,
                transform: `translateX(${isSidebarOpen ? 0 : -20}px)`,
                transition: theme => theme.transitions.create(['opacity', 'transform'], {
                  duration: theme.transitions.duration.shortest,
                  easing: theme.transitions.easing.easeInOut,
                }),
                px: 2,
                py: 1,
                bgcolor: 'background.default',
                minWidth: { xs: isSidebarOpen ? '50%' : 0 },
                visibility: isSidebarOpen || isSidebarTransitioning ? 'visible' : 'hidden',
                boxShadow: { xs: isSidebarOpen ? 3 : 0, md: 0 },
              }}
            >
              <TaskLists
                selectedListIds={selectedListIds}
                onSelectLists={setSelectedListIds}
              />
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              ml: { xs: 1.5, md: isSidebarOpen ? '260px' : 0 },
              mr: { xs: 1.5, },
              minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' },
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              transition: theme => theme.transitions.create('margin-left', {
                duration: theme.transitions.duration.shortest,
                easing: theme.transitions.easing.easeInOut,
              }),
              px: 0,
              position: { xs: 'relative', md: 'static' },
              zIndex: { xs: 0, md: 'auto' },
            }}
          >
            <Container maxWidth="xl" sx={{ p: 0 }}>
              <TaskView 
                selectedListIds={selectedListIds} 
                onSelectLists={setSelectedListIds}
              />
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;
