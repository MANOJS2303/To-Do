import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useStore } from '../store';
import { getTheme } from '../utils/themes';

export function SplashScreen() {
  const { themeMode, themeName, setShowSplash } = useStore();
  const theme = getTheme(themeName, themeMode);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => setShowSplash(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [setShowSplash]);

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: `radial-gradient(ellipse at center, ${theme.primary}22 0%, ${theme.background} 70%)`,
      backgroundColor: theme.background,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 2,
      transition: 'opacity 0.5s',
      opacity: phase === 3 ? 0 : 1,
    }}>
      {/* Animated rings */}
      {[140, 110, 80].map((size, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          width: size, height: size,
          borderRadius: '50%',
          border: `2px solid ${theme.primary}${['22', '44', '66'][i]}`,
          animation: `pulse-ring 2s ${i * 0.3}s infinite`,
          '@keyframes pulse-ring': {
            '0%': { transform: 'scale(1)', opacity: 0.8 },
            '100%': { transform: 'scale(2.5)', opacity: 0 },
          },
        }} />
      ))}

      <Box sx={{
        position: 'relative', zIndex: 1,
        width: 80, height: 80, borderRadius: '24px',
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px ${theme.primary}66`,
        transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <CheckCircle sx={{ color: '#fff', fontSize: 44 }} />
      </Box>

      <Box sx={{
        textAlign: 'center', zIndex: 1,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        <Typography variant="h4" sx={{
          color: theme.text, fontWeight: 800, letterSpacing: '-0.03em',
          fontFamily: '"Syne", sans-serif',
        }}>
          Task<span style={{ color: theme.primary }}>Flow</span>
        </Typography>
        <Typography variant="body2" sx={{ color: theme.textSecondary, mt: 0.5 }}>
          Your tasks, your flow.
        </Typography>
      </Box>

      {/* Bottom tagline */}
      <Box sx={{
        position: 'absolute', bottom: 40,
        opacity: phase >= 2 ? 0.5 : 0,
        transition: 'opacity 0.5s 0.3s',
      }}>
        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
          Fast • Offline-ready • P2P Sync
        </Typography>
      </Box>
    </Box>
  );
}
