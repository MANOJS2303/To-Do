import { Dialog, DialogContent, Box, Typography, IconButton, Button, TextField } from '@mui/material';
import { Close, ContentCopy, Check } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Task } from '../types';
import { useStore } from '../store';
import { getTheme } from '../utils/themes';
import { generateShareLink } from '../utils/taskUtils';

interface Props {
  task: Task | null;
  onClose: () => void;
}

export function ShareDialog({ task, onClose }: Props) {
  const { themeMode, themeName } = useStore();
  const theme = getTheme(themeName, themeMode);
  const [copied, setCopied] = useState(false);

  if (!task) return null;
  const link = generateShareLink(task);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!task} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
      sx: {
        background: theme.surface, borderRadius: 4,
        border: `1px solid ${theme.border}`,
      }
    }}>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" sx={{ color: theme.text, fontWeight: 700 }}>Share Task</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.textSecondary }}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
          Share "<strong style={{ color: theme.text }}>{task.title}</strong>" via QR code or link
        </Typography>

        {/* QR Code */}
        <Box sx={{
          display: 'flex', justifyContent: 'center',
          p: 3, background: '#fff', borderRadius: 3, mb: 2.5,
        }}>
          <QRCodeSVG value={link} size={180} fgColor="#1a1a2e" />
        </Box>

        {/* Link */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth value={link} size="small" InputProps={{ readOnly: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: theme.textSecondary, fontSize: 12,
                background: theme.background, borderRadius: 2,
                '& fieldset': { borderColor: theme.border },
              }
            }}
          />
          <Button
            variant="contained" onClick={copy} size="small"
            sx={{
              background: copied ? theme.success : theme.primary,
              borderRadius: 2, minWidth: 44, px: 1,
              '&:hover': { background: copied ? theme.success : theme.secondary },
            }}
          >
            {copied ? <Check sx={{ fontSize: 18 }} /> : <ContentCopy sx={{ fontSize: 18 }} />}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
