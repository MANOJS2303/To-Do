import { useState, useRef } from 'react';
import {
  Drawer, Box, Typography, IconButton, Switch, Button,
  Divider, Chip, TextField, CircularProgress, Alert,
} from '@mui/material';
import {
  Close, DarkMode, LightMode, FileDownload, FileUpload,
  DeleteForever, Wifi, WifiOff, ContentCopy,
} from '@mui/icons-material';
import { useStore } from '../store';
import { getTheme, THEMES } from '../utils/themes';
import { ThemeName } from '../types';
import { exportTasksAsJSON, exportTasksAsCSV, importTasksFromFile } from '../utils/taskUtils';
import { useWebRTC } from '../hooks/useWebRTC';

interface Props { open: boolean; onClose: () => void; }

const THEME_NAMES: { name: ThemeName; label: string; emoji: string }[] = [
  { name: 'violet', label: 'Violet', emoji: '💜' },
  { name: 'ocean', label: 'Ocean', emoji: '🌊' },
  { name: 'sunset', label: 'Sunset', emoji: '🌅' },
  { name: 'forest', label: 'Forest', emoji: '🌿' },
  { name: 'rose', label: 'Rose', emoji: '🌹' },
  { name: 'midnight', label: 'Midnight', emoji: '🌑' },
];

export function SettingsDrawer({ open, onClose }: Props) {
  const { themeMode, themeName, tasks, setThemeMode, setThemeName, importTasks, purgeTasks } = useStore();
  const theme = getTheme(themeName, themeMode);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  // RTC
  const { status, offer, syncCount, createOffer, acceptOffer, acceptAnswer, disconnect } = useWebRTC();
  const [rtcStep, setRtcStep] = useState<'idle' | 'offering' | 'answering'>('idle');
  const [remoteInput, setRemoteInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [rtcMsg, setRtcMsg] = useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(''); setImportSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importTasksFromFile(file);
      importTasks(imported);
      setImportSuccess(`Imported ${imported.length} tasks!`);
    } catch {
      setImportError('Failed to import. Use a valid TaskFlow JSON export.');
    }
    e.target.value = '';
  };

  const handleCreateOffer = async () => {
    setRtcStep('offering');
    await createOffer();
    setRtcMsg('Share this code with the peer. Then paste their answer below.');
  };

  const handleAcceptOffer = async () => {
    if (!remoteInput.trim()) return;
    try {
      const answer = await acceptOffer(remoteInput.trim());
      setAnswerInput(answer);
      setRtcStep('answering');
      setRtcMsg('Copy this answer code and send it back to the initiator.');
    } catch { setRtcMsg('Invalid offer code.'); }
  };

  const handleAcceptAnswer = async () => {
    if (!answerInput.trim()) return;
    try {
      await acceptAnswer(answerInput.trim());
      setRtcMsg('Connecting...');
    } catch { setRtcMsg('Invalid answer code.'); }
  };

  const sectionTitle = (t: string) => (
    <Typography variant="overline" sx={{ color: theme.primary, fontWeight: 700, letterSpacing: 1 }}>
      {t}
    </Typography>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{
      sx: { width: 360, background: theme.surface, borderLeft: `1px solid ${theme.border}` }
    }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: theme.text, fontWeight: 700 }}>Settings</Typography>
        <IconButton onClick={onClose} sx={{ color: theme.textSecondary }}><Close /></IconButton>
      </Box>

      <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>

        {/* Appearance */}
        <Box>
          {sectionTitle('Appearance')}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {themeMode === 'dark' ? <DarkMode sx={{ color: theme.primary }} /> : <LightMode sx={{ color: theme.primary }} />}
              <Typography sx={{ color: theme.text }}>Dark Mode</Typography>
            </Box>
            <Switch
              checked={themeMode === 'dark'}
              onChange={(e) => setThemeMode(e.target.checked ? 'dark' : 'light')}
              sx={{ '& .MuiSwitch-thumb': { background: theme.primary } }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: theme.textSecondary, mt: 2, mb: 1 }}>Color Theme</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {THEME_NAMES.map((t) => (
              <Chip
                key={t.name}
                label={`${t.emoji} ${t.label}`}
                onClick={() => setThemeName(t.name)}
                sx={{
                  background: themeName === t.name ? THEMES[t.name].dark.primary + '33' : theme.background,
                  color: themeName === t.name ? THEMES[t.name].dark.primary : theme.textSecondary,
                  border: `1px solid ${themeName === t.name ? THEMES[t.name].dark.primary : theme.border}`,
                  fontWeight: themeName === t.name ? 700 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: theme.border }} />

        {/* Import / Export */}
        <Box>
          {sectionTitle('Import / Export')}
          {importError && <Alert severity="error" sx={{ mt: 1 }}>{importError}</Alert>}
          {importSuccess && <Alert severity="success" sx={{ mt: 1 }}>{importSuccess}</Alert>}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Button
              startIcon={<FileDownload />} size="small"
              onClick={() => exportTasksAsJSON(tasks)}
              sx={{ color: theme.primary, border: `1px solid ${theme.primary}44`, borderRadius: 2, textTransform: 'none' }}
            >
              Export JSON
            </Button>
            <Button
              startIcon={<FileDownload />} size="small"
              onClick={() => exportTasksAsCSV(tasks)}
              sx={{ color: theme.primary, border: `1px solid ${theme.primary}44`, borderRadius: 2, textTransform: 'none' }}
            >
              Export CSV
            </Button>
            <Button
              startIcon={<FileUpload />} size="small"
              onClick={() => fileRef.current?.click()}
              sx={{ color: theme.secondary, border: `1px solid ${theme.secondary}44`, borderRadius: 2, textTransform: 'none' }}
            >
              Import JSON
            </Button>
            <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
          </Box>
        </Box>

        <Divider sx={{ borderColor: theme.border }} />

        {/* P2P Sync */}
        <Box>
          {sectionTitle('P2P Sync (WebRTC)')}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1.5 }}>
            {status === 'connected'
              ? <Wifi sx={{ color: theme.success, fontSize: 18 }} />
              : status === 'connecting'
                ? <CircularProgress size={16} sx={{ color: theme.warning }} />
                : <WifiOff sx={{ color: theme.textSecondary, fontSize: 18 }} />
            }
            <Typography variant="body2" sx={{
              color: status === 'connected' ? theme.success : status === 'connecting' ? theme.warning : theme.textSecondary
            }}>
              {status === 'connected' ? `Connected • ${syncCount} tasks synced` : status === 'connecting' ? 'Connecting...' : 'Not connected'}
            </Typography>
          </Box>

          {rtcMsg && (
            <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block', mb: 1 }}>
              {rtcMsg}
            </Typography>
          )}

          {status === 'idle' && rtcStep === 'idle' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={handleCreateOffer}
                sx={{ flex: 1, background: theme.primary + '22', color: theme.primary, borderRadius: 2, textTransform: 'none' }}>
                Start Sync (Host)
              </Button>
              <Button size="small" onClick={() => setRtcStep('answering')}
                sx={{ flex: 1, background: theme.secondary + '22', color: theme.secondary, borderRadius: 2, textTransform: 'none' }}>
                Join Sync (Peer)
              </Button>
            </Box>
          )}

          {rtcStep === 'offering' && offer && (
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField fullWidth label="Your Offer Code" value={offer} InputProps={{ readOnly: true }}
                  size="small" multiline rows={2}
                  sx={{ '& .MuiOutlinedInput-root': { color: theme.textSecondary, background: theme.background, borderRadius: 2, '& fieldset': { borderColor: theme.border } }, '& .MuiInputLabel-root': { color: theme.textSecondary } }}
                />
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(offer)}
                  sx={{ position: 'absolute', top: 8, right: 8, color: theme.primary }}>
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <TextField fullWidth label="Peer's Answer Code" value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)} size="small" multiline rows={2}
                sx={{ '& .MuiOutlinedInput-root': { color: theme.text, background: theme.background, borderRadius: 2, '& fieldset': { borderColor: theme.border } }, '& .MuiInputLabel-root': { color: theme.textSecondary } }}
              />
              <Button onClick={handleAcceptAnswer} size="small"
                sx={{ background: theme.primary, color: '#fff', borderRadius: 2, textTransform: 'none' }}>
                Connect
              </Button>
            </Box>
          )}

          {rtcStep === 'answering' && (
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField fullWidth label="Host's Offer Code" value={remoteInput}
                onChange={(e) => setRemoteInput(e.target.value)} size="small" multiline rows={2}
                sx={{ '& .MuiOutlinedInput-root': { color: theme.text, background: theme.background, borderRadius: 2, '& fieldset': { borderColor: theme.border } }, '& .MuiInputLabel-root': { color: theme.textSecondary } }}
              />
              {answerInput && (
                <Box sx={{ position: 'relative' }}>
                  <TextField fullWidth label="Your Answer Code" value={answerInput} InputProps={{ readOnly: true }}
                    size="small" multiline rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { color: theme.textSecondary, background: theme.background, borderRadius: 2, '& fieldset': { borderColor: theme.border } }, '& .MuiInputLabel-root': { color: theme.textSecondary } }}
                  />
                  <IconButton size="small" onClick={() => navigator.clipboard.writeText(answerInput)}
                    sx={{ position: 'absolute', top: 8, right: 8, color: theme.primary }}>
                    <ContentCopy sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )}
              <Button onClick={handleAcceptOffer} size="small"
                sx={{ background: theme.secondary, color: '#fff', borderRadius: 2, textTransform: 'none' }}>
                Generate Answer
              </Button>
            </Box>
          )}

          {status !== 'idle' && (
            <Button size="small" onClick={disconnect} sx={{ mt: 1, color: theme.error, textTransform: 'none' }}>
              Disconnect
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: theme.border }} />

        {/* Danger zone */}
        <Box>
          {sectionTitle('Danger Zone')}
          <Button
            startIcon={<DeleteForever />} variant="outlined" fullWidth
            onClick={() => { if (window.confirm('Delete ALL tasks? This cannot be undone.')) purgeTasks(); }}
            sx={{ mt: 1.5, color: theme.error, borderColor: theme.error + '44', borderRadius: 2, textTransform: 'none' }}
          >
            Purge All Tasks
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: theme.textSecondary }}>
            TaskFlow v1.0.0 • Built with React + Vite
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
