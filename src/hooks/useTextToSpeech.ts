import { useCallback, useState } from 'react';
import { Task } from '../types';

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const speak = useCallback((task: Task) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const text = [
      `Task: ${task.title}.`,
      task.description ? `Description: ${task.description}.` : '',
      task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}.` : '',
      `Status: ${task.completed ? 'Completed' : 'Pending'}.`,
      `Priority: ${task.priority}.`,
    ].filter(Boolean).join(' ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => { setSpeaking(true); setCurrentId(task.id); };
    utterance.onend = () => { setSpeaking(false); setCurrentId(null); };
    utterance.onerror = () => { setSpeaking(false); setCurrentId(null); };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setCurrentId(null);
  }, []);

  return { speak, stop, speaking, currentId };
}
