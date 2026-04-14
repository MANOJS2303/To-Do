import { useState } from 'react';
import {
  Dialog, DialogContent, Box, Typography, IconButton,
  TextField, Button, Chip,
} from '@mui/material';
import { Close, Add, Delete } from '@mui/icons-material';
import { useStore } from '../store';
import { getTheme, TASK_COLORS } from '../utils/themes';

const EMOJI_LIST = ['🏢', '🌟', '💻', '💪', '🛒', '🎯', '📚', '🎨', '🚀', '🏋️', '🍔', '✈️', '💊', '🎵', '🌿', '📊'];

interface Props { open: boolean; onClose: () => void; }

export function CategoriesDialog({ open, onClose }: Props) {
  const { themeMode, themeName, categories, addCategory, deleteCategory } = useStore();
  const theme = getTheme(themeName, themeMode);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!name.trim()) { setError('Name required'); return; }
    addCategory({ name: name.trim(), emoji, color });
    setName(''); setError('');
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: theme.text, background: theme.background, borderRadius: 2,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.primary },
      '&.Mui-focused fieldset': { borderColor: theme.primary },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { background: theme.surface, borderRadius: 4, border: `1px solid ${theme.border}` }
    }}>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography variant="h6" sx={{ color: theme.text, fontWeight: 700 }}>Categories</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: theme.textSecondary }}><Close /></IconButton>
        </Box>

        {/* Existing */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={`${c.emoji} ${c.name}`}
              onDelete={() => deleteCategory(c.id)}
              deleteIcon={<Delete sx={{ fontSize: 16 }} />}
              sx={{
                background: c.color + '22', color: c.color,
                border: `1px solid ${c.color}44`,
                '& .MuiChip-deleteIcon': { color: c.color },
              }}
            />
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ color: theme.text, mb: 1.5, fontWeight: 600 }}>
          Add Category
        </Typography>

        {/* Emoji picker */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {EMOJI_LIST.map((e) => (
            <Box key={e} onClick={() => setEmoji(e)} sx={{
              fontSize: 20, cursor: 'pointer', p: 0.5, borderRadius: 1,
              background: emoji === e ? theme.primary + '33' : 'transparent',
              border: `1px solid ${emoji === e ? theme.primary : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              {e}
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
          <TextField
            fullWidth label="Category name" value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error} helperText={error} sx={inputSx}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {TASK_COLORS.slice(0, 6).map((c) => (
              <Box key={c} onClick={() => setColor(c)} sx={{
                width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                border: color === c ? `2px solid ${theme.text}` : '2px solid transparent',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s',
              }} />
            ))}
          </Box>
        </Box>

        <Button
          fullWidth startIcon={<Add />} onClick={handleAdd}
          sx={{
            background: theme.primary + '22', color: theme.primary,
            border: `1px solid ${theme.primary}44`, borderRadius: 2,
            textTransform: 'none', fontWeight: 600,
          }}
        >
          Add Category
        </Button>
      </DialogContent>
    </Dialog>
  );
}
