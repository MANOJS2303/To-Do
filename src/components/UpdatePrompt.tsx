import { useState, useEffect } from 'react';
import { Box, Button, Typography, Slide } from '@mui/material';
import { SystemUpdateAlt, Close } from '@mui/icons-material';
import { useStore } from '../store';
import { getTheme } from '../utils/themes';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const { themeMode, themeName } = useStore();
  const theme = getTheme(themeName, themeMode);
  const [dismissed, setDismissed] = useState(false);

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) { console.log('SW registered', r); },
    onRegisterError(e) { console.error('SW error', e); },
  });

  if (!needRefresh || dismissed) return null;

  return (
    <Slide direction="up" in={needRefresh && !dismissed}>
      <Box sx={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9000, minWidth: 320,
        background: theme.surface,
        border: `1px solid ${theme.primary}44`,
        borderRadius: 3, p: 2,
        boxShadow: `0 8px 32px ${theme.primary}33`,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <SystemUpdateAlt sx={{ color: theme.primary, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: theme.text, fontWeight: 600 }}>
            New version available!
          </Typography>
          <Typography variant="caption" sx={{ color: theme.textSecondary }}>
            Refresh to get the latest improvements
          </Typography>
        </Box>
        <Button
          size="small" variant="contained"
          onClick={() => updateServiceWorker(true)}
          sx={{
            background: theme.primary, color: '#fff',
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            '&:hover': { background: theme.secondary },
          }}
        >
          Update
        </Button>
        <Close
          sx={{ color: theme.textSecondary, cursor: 'pointer', fontSize: 18 }}
          onClick={() => setDismissed(true)}
        />
      </Box>
    </Slide>
  );
}
