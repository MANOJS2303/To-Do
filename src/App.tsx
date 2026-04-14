import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton,
  Chip, Fab, LinearProgress, Menu, MenuItem, Tooltip, Button,
} from '@mui/material';
import {
  Search, Add, Settings, Category, Sort,
  WavingHand, Close, CheckCircle, AccountCircle,
} from '@mui/icons-material';
import { useStore } from './store';
import { getTheme } from './utils/themes';
import { Task } from './types';
import { parseSharedTask } from './utils/taskUtils';
import { SplashScreen } from './components/SplashScreen';
import { AddTaskDialog } from './components/AddTaskDialog';
import { TaskCard } from './components/TaskCard';
import { ShareDialog } from './components/ShareDialog';
import { SettingsDrawer } from './components/SettingsDrawer';
import { CategoriesDialog } from './components/CategoriesDialog';

type SortMode = 'created' | 'deadline' | 'priority' | 'name';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '👋' };
  if (h < 17) return { text: 'Good afternoon', emoji: '☀️' };
  return { text: 'Good evening', emoji: '🌙' };
}

const MOTIVATIONAL = [
  'Embrace the power of productivity!',
  'One task at a time. You\'ve got this!',
  'Progress, not perfection.',
  'Every checked task is a win!',
  'Stay focused, stay amazing.',
];

export default function App() {
  const { tasks, categories, themeMode, themeName, showSplash, importTasks } = useStore();
  const theme = getTheme(themeName, themeMode);

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [shareTask, setShareTask] = useState<Task | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('created');
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
  const [progressDismissed, setProgressDismissed] = useState(false);
  const [sharedImport, setSharedImport] = useState<Task | null>(null);

  const greeting = getGreeting();
  const motivational = useMemo(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)], []);

  // Handle shared task link
  useEffect(() => {
    const shared = parseSharedTask(window.location.search);
    if (shared) {
      setSharedImport(shared);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory) list = list.filter((t) => t.categoryId === activeCategory);

    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      switch (sortMode) {
        case 'deadline': return (a.deadline || 'z').localeCompare(b.deadline || 'z');
        case 'priority': {
          const p = { high: 0, medium: 1, low: 2 };
          return p[a.priority] - p[b.priority];
        }
        case 'name': return a.title.localeCompare(b.title);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [tasks, search, activeCategory, sortMode]);

  const categoriesWithCount = useMemo(() =>
    categories.filter((c) => tasks.some((t) => t.categoryId === c.id))
      .map((c) => ({ ...c, count: tasks.filter((t) => t.categoryId === c.id).length })),
    [categories, tasks]
  );

  return (
    <>
      {/* Dynamic CSS vars + fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: ${theme.background}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 3px; }
      `}</style>

      {showSplash && <SplashScreen />}

      <Box sx={{ minHeight: '100vh', background: theme.background, color: theme.text }}>
        {/* Header */}
        <Box sx={{
          px: { xs: 2, sm: 3 }, pt: 3, pb: 1,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <Box>
            <Typography variant="h5" sx={{
              color: theme.text, fontWeight: 800, fontFamily: '"Syne", sans-serif',
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <span>{greeting.emoji}</span> {greeting.text}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mt: 0.25, fontStyle: 'italic' }}>
              {motivational}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Categories">
              <IconButton onClick={() => setCategoriesOpen(true)} sx={{ color: theme.textSecondary }}>
                <Category />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: theme.textSecondary }}>
                <Settings />
              </IconButton>
            </Tooltip>
            <IconButton sx={{ color: theme.textSecondary }}><AccountCircle /></IconButton>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
          {/* Progress card */}
          {total > 0 && !progressDismissed && (
            <Box sx={{
              borderRadius: 3, p: 2,
              background: themeMode === 'dark'
                ? `linear-gradient(135deg, ${theme.surface}, ${theme.primary}11)`
                : `linear-gradient(135deg, ${theme.surface}, ${theme.primary}08)`,
              border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {/* Circular progress */}
              <Box sx={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke={theme.border} strokeWidth="4" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke={theme.primary} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - percent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <Typography variant="caption" sx={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: theme.primary, fontWeight: 700, fontSize: 11,
                }}>
                  {percent}%
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: theme.text, fontWeight: 600 }}>
                  {percent === 100 ? '🎉 All tasks done! Amazing!' : `You've completed ${completed} out of ${total} tasks.`}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                  {percent === 0 ? 'No tasks completed yet. Keep going!' : percent === 100 ? 'Take a moment to celebrate!' : "You're halfway there! Keep it up!"}
                </Typography>
                <LinearProgress variant="determinate" value={percent} sx={{
                  mt: 1, height: 4, borderRadius: 2,
                  background: theme.border,
                  '& .MuiLinearProgress-bar': { background: theme.primary, borderRadius: 2 },
                }} />
              </Box>
              <IconButton size="small" onClick={() => setProgressDismissed(true)} sx={{ color: theme.textSecondary }}>
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          )}

          {/* Search + Sort */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField
              fullWidth placeholder="Search for task..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: theme.textSecondary }} /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} sx={{ color: theme.textSecondary }}>
                      <Close sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: theme.text, background: theme.surface,
                  borderRadius: 3, '& fieldset': { borderColor: theme.border },
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary },
                }
              }}
            />
            <Button
              startIcon={<Sort />}
              onClick={(e) => setSortAnchor(e.currentTarget)}
              sx={{
                background: theme.surface, color: theme.textSecondary,
                border: `1px solid ${theme.border}`, borderRadius: 3,
                textTransform: 'none', whiteSpace: 'nowrap', px: 2,
                '&:hover': { background: theme.border },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Sort by<br />
                <strong style={{ color: theme.text, fontSize: 11 }}>
                  {sortMode.charAt(0).toUpperCase() + sortMode.slice(1)}
                </strong>
              </Box>
            </Button>
            <Menu
              anchorEl={sortAnchor} open={!!sortAnchor} onClose={() => setSortAnchor(null)}
              PaperProps={{ sx: { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 2 } }}
            >
              {(['created', 'deadline', 'priority', 'name'] as SortMode[]).map((s) => (
                <MenuItem key={s} onClick={() => { setSortMode(s); setSortAnchor(null); }}
                  sx={{ color: sortMode === s ? theme.primary : theme.text, fontWeight: sortMode === s ? 700 : 400 }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Category filters */}
          {categoriesWithCount.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {categoriesWithCount.map((c) => (
                <Chip
                  key={c.id}
                  label={`${c.emoji} ${c.name} (${c.count})`}
                  onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                  sx={{
                    background: activeCategory === c.id ? c.color : c.color + '22',
                    color: activeCategory === c.id ? '#fff' : c.color,
                    border: `1px solid ${c.color}44`,
                    fontWeight: 600, flexShrink: 0, cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Tasks */}
          {filtered.length === 0 ? (
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', py: 10, gap: 1.5,
            }}>
              {search || activeCategory ? (
                <>
                  <Search sx={{ fontSize: 48, color: theme.border }} />
                  <Typography sx={{ color: theme.textSecondary }}>No tasks match your filters</Typography>
                  <Button onClick={() => { setSearch(''); setActiveCategory(null); }}
                    sx={{ color: theme.primary, textTransform: 'none' }}>Clear filters</Button>
                </>
              ) : (
                <>
                  <WavingHand sx={{ fontSize: 48, color: theme.border }} />
                  <Typography variant="h6" sx={{ color: theme.text, fontWeight: 700 }}>
                    You don't have any tasks yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    Click on the <strong>+</strong> button to add one
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filtered.map((task) => (
                <TaskCard
                  key={task.id} task={task}
                  onEdit={(t) => { setEditTask(t); setAddOpen(true); }}
                  onShare={(t) => setShareTask(t)}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* FAB */}
        <Fab
          onClick={() => { setEditTask(null); setAddOpen(true); }}
          sx={{
            position: 'fixed', bottom: 28, right: 28,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            color: '#fff', width: 60, height: 60,
            boxShadow: `0 4px 24px ${theme.primary}66`,
            '&:hover': { opacity: 0.9 },
          }}
        >
          <Add sx={{ fontSize: 28 }} />
        </Fab>

        {/* Shared task import banner */}
        {sharedImport && (
          <Box sx={{
            position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
            background: theme.surface, borderRadius: 3, p: 2,
            border: `1px solid ${theme.primary}44`,
            boxShadow: `0 8px 32px ${theme.primary}33`,
            display: 'flex', alignItems: 'center', gap: 2, minWidth: 300,
            zIndex: 1000,
          }}>
            <CheckCircle sx={{ color: theme.primary }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: theme.text, fontWeight: 600 }}>
                Shared task received!
              </Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                "{sharedImport.title}"
              </Typography>
            </Box>
            <Button size="small" onClick={() => { importTasks([sharedImport]); setSharedImport(null); }}
              sx={{ background: theme.primary, color: '#fff', borderRadius: 2, textTransform: 'none' }}>
              Import
            </Button>
            <IconButton size="small" onClick={() => setSharedImport(null)} sx={{ color: theme.textSecondary }}>
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      <AddTaskDialog open={addOpen} onClose={() => { setAddOpen(false); setEditTask(null); }} editTask={editTask} />
      <ShareDialog task={shareTask} onClose={() => setShareTask(null)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CategoriesDialog open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
}
