import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { theme } from './theme';
import { AppProvider } from './context/AppContext';
import { TaskLists } from './components/TaskLists';
import { TaskView } from './components/TaskView';
import { Header } from './components/Header';
import { useState } from 'react';

function App() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header onMenuClick={toggleSidebar} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              mt: '64px', // Height of the header
              flex: 1,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: isSidebarOpen ? 260 : 0 },
                height: { xs: 'auto', md: 'calc(100vh - 64px)' },
                position: { md: 'fixed' },
                overflow: 'hidden',
                transition: theme => theme.transitions.create('width', {
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
                }}
              >
                <TaskLists
                  selectedListId={selectedListId}
                  onSelectList={setSelectedListId}
                />
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                ml: { md: isSidebarOpen ? '240px' : 0 },
                minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' },
                overflow: 'auto',
                transition: theme => theme.transitions.create('margin-left', {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut,
                }),
                px: 2,
              }}
            >
              <Container maxWidth="lg" sx={{ py: 3, px: { xs: 0, sm: 2 } }}>
                <TaskView selectedListId={selectedListId} />
              </Container>
            </Box>
          </Box>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
