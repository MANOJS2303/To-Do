import { Task } from '../types';

export function exportTasksAsJSON(tasks: Task[]) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksAsCSV(tasks: Task[]) {
  const header = ['ID', 'Title', 'Description', 'Deadline', 'Priority', 'Completed', 'Pinned', 'Color', 'Created'];
  const rows = tasks.map((t) => [
    t.id, t.title, t.description || '',
    t.deadline || '', t.priority,
    t.completed ? 'yes' : 'no',
    t.pinned ? 'yes' : 'no',
    t.color, t.createdAt,
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importTasksFromFile(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) resolve(data as Task[]);
        else reject(new Error('Invalid format'));
      } catch {
        reject(new Error('Could not parse file'));
      }
    };
    reader.readAsText(file);
  });
}

export function generateShareLink(task: Task): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(task)));
  return `${window.location.origin}${window.location.pathname}?task=${encoded}`;
}

export function parseSharedTask(search: string): Task | null {
  try {
    const params = new URLSearchParams(search);
    const encoded = params.get('task');
    if (!encoded) return null;
    return JSON.parse(decodeURIComponent(atob(encoded))) as Task;
  } catch {
    return null;
  }
}

export function formatDeadline(deadline: string): { text: string; urgent: boolean; overdue: boolean } {
  const d = new Date(deadline);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true, overdue: true };
  if (days === 0) return { text: 'Due today', urgent: true, overdue: false };
  if (days === 1) return { text: 'Due tomorrow', urgent: true, overdue: false };
  if (days <= 3) return { text: `in ${days} days`, urgent: true, overdue: false };
  return { text: `in ${days} days`, urgent: false, overdue: false };
}
