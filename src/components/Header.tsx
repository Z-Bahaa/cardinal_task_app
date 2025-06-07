import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            component="img"
            src="/cardinal-white.svg"
            alt="Cardinal Logo"
            sx={{
              height: 30,
              width: 'auto',
              ml: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              ml: 0.25, // 2px equivalent
              display: 'flex',
              alignItems: 'center',
              mb: -0.5, // -3 units (equivalent to -24px)
              fontSize: '1.2rem', // h6 (1.25rem) + 1px
            }}
          >
            Cardinal
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 