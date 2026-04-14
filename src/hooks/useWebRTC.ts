import { useRef, useState, useCallback } from 'react';
import { useStore } from '../store';
import { Task, RTCMessage } from '../types';

export function useWebRTC() {
  const { tasks, importTasks } = useStore();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [offer, setOffer] = useState<string>('');
  const [syncCount, setSyncCount] = useState(0);

  const createOffer = useCallback(async () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    const dc = pc.createDataChannel('tasks');
    dcRef.current = dc;

    dc.onopen = () => setStatus('connected');
    dc.onclose = () => setStatus('idle');
    dc.onmessage = (e) => {
      try {
        const msg: RTCMessage = JSON.parse(e.data);
        if (msg.type === 'sync-response') {
          const incoming = msg.payload as Task[];
          importTasks(incoming);
          setSyncCount((c) => c + incoming.length);
        }
      } catch {}
    };

    const offerSdp = await pc.createOffer();
    await pc.setLocalDescription(offerSdp);

    await new Promise<void>((res) => {
      pc.onicecandidate = (e) => {
        if (!e.candidate) res();
      };
    });

    const encoded = btoa(JSON.stringify(pc.localDescription));
    setOffer(encoded);
    setStatus('connecting');
    return encoded;
  }, [importTasks]);

  const acceptOffer = useCallback(async (encodedOffer: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    pc.ondatachannel = (e) => {
      const dc = e.channel;
      dcRef.current = dc;
      dc.onopen = () => {
        setStatus('connected');
        const msg: RTCMessage = { type: 'sync-response', payload: tasks };
        dc.send(JSON.stringify(msg));
      };
      dc.onmessage = (ev) => {
        try {
          const msg: RTCMessage = JSON.parse(ev.data);
          if (msg.type === 'sync-request') {
            const reply: RTCMessage = { type: 'sync-response', payload: tasks };
            dc.send(JSON.stringify(reply));
          }
        } catch {}
      };
    };

    const offerDesc = JSON.parse(atob(encodedOffer));
    await pc.setRemoteDescription(offerDesc);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await new Promise<void>((res) => {
      pc.onicecandidate = (e) => {
        if (!e.candidate) res();
      };
    });

    const encoded = btoa(JSON.stringify(pc.localDescription));
    setStatus('connecting');
    return encoded;
  }, [tasks]);

  const acceptAnswer = useCallback(async (encodedAnswer: string) => {
    if (!pcRef.current) return;
    const answerDesc = JSON.parse(atob(encodedAnswer));
    await pcRef.current.setRemoteDescription(answerDesc);
  }, []);

  const sendTasks = useCallback(() => {
    if (dcRef.current?.readyState === 'open') {
      const msg: RTCMessage = { type: 'sync-response', payload: tasks };
      dcRef.current.send(JSON.stringify(msg));
    }
  }, [tasks]);

  const disconnect = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    setStatus('idle');
    setOffer('');
  }, []);

  return { status, offer, syncCount, createOffer, acceptOffer, acceptAnswer, sendTasks, disconnect };
}
