import { useCallback, useEffect, useRef, useState } from 'react';
import { answer } from '../../data/chatResponses.js';

const KEY = 'lupin.chat.sessions.v1';
const MAX_SESSIONS = 2; // only the last two chat sessions are kept

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const blank = () => ({ id: uid(), title: 'New chat', ts: Date.now(), messages: [] });

function seedSession(question, ageMs) {
  return {
    id: uid(), title: question, ts: Date.now() - ageMs,
    messages: [
      { id: uid(), role: 'user', text: question },
      { id: uid(), role: 'bot', blocks: answer(question) },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw).slice(-MAX_SESSIONS);
  } catch { /* ignore */ }
  // First visit: pre-seed two earlier sessions so History has something to show in the demo.
  return [
    seedSession('Show me net sales share by therapy area for FY25-26', 26 * 3600 * 1000),
    seedSession('Why is our revenue lower than last year?', 3 * 3600 * 1000),
  ];
}

export function useChatSessions() {
  const [sessions, setSessions] = useState(load);
  const [current, setCurrent] = useState(blank);
  const [typing, setTyping] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(sessions)); } catch { /* ignore */ }
  }, [sessions]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const upsert = useCallback((s) => {
    setSessions((list) => {
      const exists = list.some((x) => x.id === s.id);
      const next = exists ? list.map((x) => (x.id === s.id ? s : x)) : [...list, s];
      return next.slice(-MAX_SESSIONS);
    });
  }, []);

  const send = useCallback((text) => {
    const q = text.trim();
    if (!q || typing) return;
    const userMsg = { id: uid(), role: 'user', text: q };
    const withUser = { ...current, title: current.messages.length ? current.title : q, ts: Date.now(), messages: [...current.messages, userMsg] };
    setCurrent(withUser);
    upsert(withUser);
    setTyping(true);
    timer.current = setTimeout(() => {
      const bot = { id: uid(), role: 'bot', blocks: answer(q), animate: true };
      const done = { ...withUser, messages: [...withUser.messages, bot] };
      setCurrent(done);
      upsert({ ...done, messages: done.messages.map((m) => ({ ...m, animate: false })) });
      setTyping(false);
    }, 1100);
  }, [current, typing, upsert]);

  const newChat = useCallback(() => { if (!typing) setCurrent(blank()); }, [typing]);
  const open = useCallback((id) => {
    const s = sessions.find((x) => x.id === id);
    if (s && !typing) setCurrent({ ...s, messages: s.messages.map((m) => ({ ...m, animate: false })) });
  }, [sessions, typing]);

  return { sessions, current, typing, send, newChat, open };
}
