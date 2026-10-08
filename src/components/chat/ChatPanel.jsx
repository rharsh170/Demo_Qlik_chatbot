import { useCallback, useEffect, useRef, useState } from 'react';
import { History, Maximize2, Minimize2, PanelRightClose, Plus, Send, Sparkles } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../../data/chatResponses.js';
import ChatMessage, { BotAvatar } from './ChatMessage.jsx';
import { useChatSessions } from './useChatSessions.js';

const when = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function ChatPanel({ open, onClose, maximized, onToggleMax, ask }) {
  const { sessions, current, typing, send, newChat, open: openSession } = useChatSessions();
  const [text, setText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bodyRef = useRef(null);
  const lastAsk = useRef(null);

  const scroll = useCallback(() => {
    requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
  }, []);
  useEffect(scroll, [current.messages.length, typing, scroll]);

  // "Ask AI" buttons on chart cards send their question here
  useEffect(() => {
    if (ask && ask.nonce !== lastAsk.current) {
      lastAsk.current = ask.nonce;
      setShowHistory(false);
      send(ask.text);
    }
  }, [ask, send]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || typing) return;
    send(text);
    setText('');
  };
  const sendChip = (q) => { setShowHistory(false); send(q); };

  return (
    <div className="dock-inner">
      <section className="chat" aria-label="Lupin AI assistant">
        <header className="chat-head">
          <div className="bot"><Sparkles size={18} /></div>
          <div className="t"><b>Lupin AI Assistant</b><small>Ask about any report on this page</small></div>
          <button className="icon-btn" onClick={() => { newChat(); setShowHistory(false); }} title="New chat" aria-label="New chat"><Plus size={18} /></button>
          <button className={`icon-btn`} onClick={() => setShowHistory((s) => !s)} title="Chat history (last 2 sessions)" aria-label="Chat history"><History size={18} /></button>
          <button className="icon-btn" onClick={onToggleMax} title={maximized ? 'Restore size' : 'Expand panel'} aria-label={maximized ? 'Restore size' : 'Expand panel'}>{maximized ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
          <button className="icon-btn" onClick={onClose} title="Collapse assistant" aria-label="Collapse assistant"><PanelRightClose size={18} /></button>
        </header>

        {showHistory && (
          <div className="history">
            <h4>Recent chats</h4>
            <p className="note">The last {2} chat sessions are kept.</p>
            {[...sessions].reverse().map((s) => (
              <button key={s.id} className={`hist-item ${s.id === current.id ? 'on' : ''}`} onClick={() => { openSession(s.id); setShowHistory(false); }}>
                <b>{s.title}</b>
                <span>{when(s.ts)} · {Math.ceil(s.messages.length / 2)} question{s.messages.length > 2 ? 's' : ''}</span>
              </button>
            ))}
            {sessions.length === 0 && <p className="note">No previous chats yet.</p>}
          </div>
        )}

        <div className="chat-body" ref={bodyRef}>
          {current.messages.length === 0 && (
            <div className="welcome">
              <div className="orb"><Sparkles size={26} /></div>
              <h3>How can I help?</h3>
              <p>Ask a question in plain English, for example why revenue is down or which brands are driving margin.</p>
              <div className="chips">
                {SUGGESTED_QUESTIONS.slice(0, 5).map((q) => <button key={q} className="qchip" onClick={() => sendChip(q)}>{q}</button>)}
              </div>
            </div>
          )}
          {current.messages.map((m) => <ChatMessage key={m.id} msg={m} onChip={sendChip} onGrow={scroll} />)}
          {typing && (
            <div className="msg"><BotAvatar /><div className="bot-card"><div className="typing" aria-label="Assistant is typing"><i /><i /><i /></div></div></div>
          )}
        </div>

        <form className="chat-foot" onSubmit={submit}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about revenue, margin, brands, budget…" aria-label="Message" disabled={!open} />
          <button className="send" type="submit" disabled={!text.trim() || typing} aria-label="Send"><Send size={18} /></button>
        </form>
      </section>
    </div>
  );
}
