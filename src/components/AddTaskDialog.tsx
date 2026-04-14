import { useState, useRef } from 'react';
import {
  Dialog, DialogContent, Box, Typography, TextField,
  Button, MenuItem, Select, FormControl, InputLabel, Chip,
  IconButton, Tooltip,
} from '@mui/material';
import { Close, EmojiEmotions, AccessAlarm } from '@mui/icons-material';
import { useStore } from '../store';
import { getTheme, TASK_COLORS } from '../utils/themes';
import { Task, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };

const EMOJI_SUGGESTIONS = ['🎯', '🚀', '💡', '📝', '🔥', '⚡', '🌟', '✅', '🎨', '📊', '🛠️', '🎵', '🏋️', '📚', '🌈'];

export function AddTaskDialog({ open, onClose, editTask }: Props) {
  const { themeMode, themeName, categories, addTask, updateTask } = useStore();
  const theme = getTheme(themeName, themeMode);

  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [deadline, setDeadline] = useState(editTask?.deadline?.split('T')[0] || '');
  const [categoryId, setCategoryId] = useState(editTask?.categoryId || '');
  const [color, setColor] = useState(editTask?.color || theme.primary);
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium');
  const [showEmoji, setShowEmoji] = useState(false);
  const [titleError, setTitleError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!title.trim()) { setTitleError('Task name is required'); return; }
    setTitleError('');

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      categoryId: categoryId || undefined,
      color, priority,
      completed: editTask?.completed || false,
      pinned: editTask?.pinned || false,
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
    } else {
      addTask(taskData);
    }
    handleClose();
  };

  const handleClose = () => {
    setTitle(''); setDescription(''); setDeadline('');
    setCategoryId(''); setColor(theme.primary); setPriority('medium');
    setTitleError(''); setShowEmoji(false);
    onClose();
  };

  const insertEmoji = (emoji: string) => {
    setTitle((t) => t + emoji);
    setShowEmoji(false);
    titleRef.current?.focus();
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      color: theme.text,
      borderRadius: 3,
      background: theme.background,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.primary },
      '&.Mui-focused fieldset': { borderColor: theme.primary },
    },
    '& .MuiInputLabel-root': { color: theme.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.primary },
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{
      sx: {
        background: theme.surface, borderRadius: 4,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 24px 64px ${theme.primary}22`,
      }
    }}>
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{
          background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}11)`,
          p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
            </Box>
            <Typography variant="h6" sx={{ color: theme.text, fontWeight: 700 }}>
              {editTask ? 'Edit Task' : 'Add New Task'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: theme.textSecondary }}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Title */}
          <Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                inputRef={titleRef}
                fullWidth label="Task Name *"
                value={title} onChange={(e) => setTitle(e.target.value)}
                error={!!titleError} helperText={titleError}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                sx={inputSx}
              />
              <Tooltip title="Emoji suggestions">
                <IconButton
                  onClick={() => setShowEmoji(!showEmoji)}
                  sx={{ color: showEmoji ? theme.primary : theme.textSecondary, alignSelf: 'flex-start', mt: 1 }}
                >
                  <EmojiEmotions />
                </IconButton>
              </Tooltip>
            </Box>
            {showEmoji && (
              <Box sx={{
                mt: 1, p: 1.5, borderRadius: 2, background: theme.background,
                border: `1px solid ${theme.border}`, display: 'flex', flexWrap: 'wrap', gap: 1,
              }}>
                {EMOJI_SUGGESTIONS.map((e) => (
                  <Box key={e}
                    onClick={() => insertEmoji(e)}
                    sx={{
                      fontSize: 22, cursor: 'pointer', p: 0.5, borderRadius: 1,
                      '&:hover': { background: theme.border },
                      transition: 'all 0.15s',
                    }}
                  >{e}</Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Description */}
          <TextField
            fullWidth multiline rows={3}
            label="Task Description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={inputSx}
          />

          {/* Deadline */}
          <TextField
            fullWidth label="Task Deadline" type="date"
            value={deadline} onChange={(e) => setDeadline(e.target.value)}
            InputProps={{ startAdornment: <AccessAlarm sx={{ mr: 1, color: theme.textSecondary }} /> }}
            InputLabelProps={{ shrink: true }}
            sx={inputSx}
          />

          {/* Category */}
          <FormControl fullWidth sx={inputSx}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              label="Category"
              MenuProps={{ PaperProps: { sx: { background: theme.surface, color: theme.text } } }}
            >
              <MenuItem value="">None</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority */}
          <Box>
            <Typography variant="caption" sx={{ color: theme.textSecondary, mb: 1, display: 'block' }}>
              Priority
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {PRIORITIES.map((p) => (
                <Chip
                  key={p} label={p.charAt(0).toUpperCase() + p.slice(1)}
                  onClick={() => setPriority(p)}
                  sx={{
                    textTransform: 'capitalize',
                    background: priority === p ? PRIORITY_COLORS[p] : theme.background,
                    color: priority === p ? '#fff' : theme.textSecondary,
                    border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : theme.border}`,
                    fontWeight: priority === p ? 700 : 400,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Color picker */}
          <Box>
            <Typography variant="caption" sx={{ color: theme.textSecondary, mb: 1, display: 'block' }}>
              Task Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {TASK_COLORS.map((c) => (
                <Box
                  key={c} onClick={() => setColor(c)}
                  sx={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    border: color === c ? `3px solid ${theme.text}` : '3px solid transparent',
                    transition: 'all 0.15s', transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Submit */}
          <Button
            fullWidth variant="contained" onClick={handleSubmit}
            sx={{
              mt: 1, py: 1.5, borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: '#fff', fontWeight: 700, fontSize: 16,
              textTransform: 'none', letterSpacing: '-0.01em',
              boxShadow: `0 4px 20px ${theme.primary}44`,
              '&:hover': { opacity: 0.9, boxShadow: `0 6px 28px ${theme.primary}66` },
            }}
          >
            {editTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
