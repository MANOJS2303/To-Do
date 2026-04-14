import { useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Menu, MenuItem,
  Tooltip, Checkbox,
} from '@mui/material';
import {
  MoreVert, PushPin, VolumeUp, Share, Edit, Delete,
  ContentCopy, CheckCircle, Circle, AlarmOn,
} from '@mui/icons-material';
import { Task } from '../types';
import { useStore } from '../store';
import { getTheme } from '../utils/themes';
import { generateShareLink, formatDeadline } from '../utils/taskUtils';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onShare: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onShare }: Props) {
  const { themeMode, themeName, categories, toggleTask, togglePin, deleteTask, addTask } = useStore();
  const theme = getTheme(themeName, themeMode);
  const { speak, stop, speaking, currentId } = useTextToSpeech();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const category = categories.find((c) => c.id === task.categoryId);
  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const isReading = speaking && currentId === task.id;

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteTask(task.id);
      setMenuAnchor(null);
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 2000);
    }
  };

  const handleDuplicate = () => {
    addTask({
      title: task.title + ' (copy)',
      description: task.description,
      deadline: task.deadline,
      categoryId: task.categoryId,
      color: task.color,
      priority: task.priority,
      completed: false,
      pinned: false,
    });
    setMenuAnchor(null);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generateShareLink(task));
    setMenuAnchor(null);
  };

  return (
    <Box sx={{
      position: 'relative', borderRadius: 3, overflow: 'hidden',
      background: task.completed
        ? `${task.color}18`
        : themeMode === 'dark'
          ? `linear-gradient(135deg, ${task.color}22, ${task.color}08)`
          : `linear-gradient(135deg, ${task.color}12, ${task.color}04)`,
      border: `1px solid ${task.completed ? task.color + '33' : task.color + '44'}`,
      boxShadow: task.pinned ? `0 0 0 2px ${task.color}, 0 4px 20px ${task.color}33` : 'none',
      transition: 'all 0.2s',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 24px ${task.color}22, ${task.pinned ? `0 0 0 2px ${task.color}` : ''}`,
      },
    }}>
      {/* Left accent bar */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, background: task.color,
        opacity: task.completed ? 0.4 : 1,
      }} />

      <Box sx={{ p: 2, pl: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        {/* Checkbox */}
        <Box
          onClick={() => toggleTask(task.id)}
          sx={{ mt: 0.25, cursor: 'pointer', color: task.color, flexShrink: 0 }}
        >
          {task.completed
            ? <CheckCircle sx={{ fontSize: 22 }} />
            : <Circle sx={{ fontSize: 22, opacity: 0.4 }} />
          }
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: theme.text, fontWeight: 600, wordBreak: 'break-word',
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.6 : 1,
                lineHeight: 1.3,
              }}
            >
              {task.pinned && <PushPin sx={{ fontSize: 14, mr: 0.5, color: task.color, verticalAlign: 'middle' }} />}
              {task.title}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary, flexShrink: 0, mt: 0.3 }}>
              {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
          </Box>

          {task.description && (
            <Typography variant="body2" sx={{
              color: theme.textSecondary, mt: 0.5,
              opacity: task.completed ? 0.5 : 0.8,
              textDecoration: task.completed ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, alignItems: 'center' }}>
            {deadline && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AlarmOn sx={{
                  fontSize: 14,
                  color: deadline.overdue ? theme.error : deadline.urgent ? theme.warning : theme.textSecondary
                }} />
                <Typography variant="caption" sx={{
                  color: deadline.overdue ? theme.error : deadline.urgent ? theme.warning : theme.textSecondary,
                  fontWeight: deadline.urgent ? 600 : 400,
                }}>
                  {new Date(task.deadline!).toLocaleDateString()} • {deadline.text}
                </Typography>
              </Box>
            )}
            {category && (
              <Chip
                label={`${category.emoji} ${category.name}`}
                size="small"
                sx={{
                  background: category.color + '22',
                  color: category.color,
                  border: `1px solid ${category.color}44`,
                  height: 22, fontSize: 11, fontWeight: 600,
                }}
              />
            )}
            <Chip
              label={task.priority}
              size="small"
              sx={{
                background: task.priority === 'high' ? '#EF444422' : task.priority === 'medium' ? '#F59E0B22' : '#10B98122',
                color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981',
                height: 22, fontSize: 11, fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
          <Tooltip title={isReading ? 'Stop' : 'Read aloud'}>
            <IconButton size="small" onClick={() => isReading ? stop() : speak(task)}
              sx={{ color: isReading ? task.color : theme.textSecondary, p: 0.5 }}>
              <VolumeUp sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: theme.textSecondary, p: 0.5 }}>
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 2, minWidth: 180,
            boxShadow: `0 8px 32px ${theme.primary}22`,
          }
        }}
      >
        {[
          { icon: <CheckCircle />, label: task.completed ? 'Mark pending' : 'Mark done', action: () => { toggleTask(task.id); setMenuAnchor(null); } },
          { icon: <PushPin />, label: task.pinned ? 'Unpin' : 'Pin', action: () => { togglePin(task.id); setMenuAnchor(null); } },
          { icon: <Edit />, label: 'Edit', action: () => { onEdit(task); setMenuAnchor(null); } },
          { icon: <Share />, label: 'Share (QR)', action: () => { onShare(task); setMenuAnchor(null); } },
          { icon: <ContentCopy />, label: 'Copy link', action: copyLink },
          { icon: <ContentCopy />, label: 'Duplicate', action: handleDuplicate },
          { icon: <VolumeUp />, label: 'Read aloud', action: () => { speak(task); setMenuAnchor(null); } },
          {
            icon: <Delete />, label: deleteConfirm ? 'Confirm delete?' : 'Delete',
            action: handleDelete,
            color: theme.error,
          },
        ].map((item) => (
          <MenuItem
            key={item.label} onClick={item.action}
            sx={{
              color: item.color || theme.text, gap: 1.5, borderRadius: 1, mx: 0.5,
              '&:hover': { background: theme.border },
              '& .MuiSvgIcon-root': { fontSize: 18, color: item.color || theme.textSecondary },
            }}
          >
            {item.icon}
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
