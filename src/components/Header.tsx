import { AppBar, Toolbar, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: 'background.default',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-start', px: 1 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: 'white',
            padding: 1,
            marginLeft: -1,
            '& .MuiSvgIcon-root': {
              fontSize: 24,
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transition: 'background-color 0.2s ease-in-out',
            },
            '& .MuiTouchRipple-root': {
              transform: 'scale(1.75)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
} 