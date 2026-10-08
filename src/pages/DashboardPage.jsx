import { useCallback, useState } from 'react';
import { Sparkles } from 'lucide-react';
import TopBar from '../components/layout/TopBar.jsx';
import QlikEmbedFrame from '../components/qlik/QlikEmbedFrame.jsx';
import ChatPanel from '../components/chat/ChatPanel.jsx';
import { DEFAULT_FILTERS } from './filterDefaults.js';

// Selection history (back / forward / clear), like Qlik's selection toolbar.
function useFilterHistory() {
  const [state, setState] = useState({ stack: [DEFAULT_FILTERS], i: 0 });
  const filters = state.stack[state.i];
  const setFilters = useCallback((f) => setState((s) => ({ stack: [...s.stack.slice(0, s.i + 1), f].slice(-30), i: Math.min(s.i + 1, 29) })), []);
  const history = {
    canUndo: state.i > 0,
    canRedo: state.i < state.stack.length - 1,
    undo: () => setState((s) => ({ ...s, i: Math.max(0, s.i - 1) })),
    redo: () => setState((s) => ({ ...s, i: Math.min(s.stack.length - 1, s.i + 1) })),
    clear: () => setFilters(DEFAULT_FILTERS),
  };
  return { filters, setFilters, history };
}

export default function DashboardPage() {
  const { filters, setFilters, history } = useFilterHistory();
  const [ccy, setCcy] = useState('INR');
  const [chatOpen, setChatOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [ask, setAsk] = useState(null); // { text, nonce }

  const onAsk = useCallback((text) => {
    setChatOpen(true);
    setAsk({ text, nonce: Date.now() });
  }, []);

  return (
    <div className="app-shell">
      <TopBar ccy={ccy} setCcy={setCcy} />
      <div className="workspace">
        <main className="main-area">
          <QlikEmbedFrame mode="mock" filters={filters} setFilters={setFilters} ccy={ccy} history={history} onAsk={onAsk} />
        </main>

        <aside className={`chat-dock ${chatOpen ? 'open' : ''} ${maximized ? 'max' : ''}`} aria-hidden={!chatOpen}>
          <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} maximized={maximized} onToggleMax={() => setMaximized((m) => !m)} ask={ask} />
        </aside>

        {!chatOpen && (
          <>
            <span className="launcher-label">Ask Lupin AI about these reports</span>
            <button className="launcher" onClick={() => setChatOpen(true)} aria-label="Open Lupin AI assistant" title="Open Lupin AI assistant">
              <Sparkles size={26} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
