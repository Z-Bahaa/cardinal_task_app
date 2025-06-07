import { ThemeProvider, CssBaseline, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { theme } from './theme';
import { AppProvider } from './context/AppContext';
import { TaskLists } from './components/TaskLists';
import { TaskView } from './components/TaskView';
import { Header } from './components/Header';
import { useState, useEffect } from 'react';

function App() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
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
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
