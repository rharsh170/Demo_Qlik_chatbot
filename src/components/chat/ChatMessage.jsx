import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BarBox, DataTable, LineBox, PieBox } from '../Charts.jsx';

const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : v);

// Reveals text word by word, then calls onDone
function Typed({ text, onDone }) {
  const words = text.split(' ');
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= words.length) { onDone?.(); return undefined; }
    const t = setTimeout(() => setN((x) => x + 1), 28);
    return () => clearTimeout(t);
  }, [n, words.length, onDone]);
  return <p>{words.slice(0, n).join(' ')}{n < words.length && <span className="cursor" />}</p>;
}

function Block({ b, onChip }) {
  switch (b.type) {
    case 'text': return <p>{b.text}</p>;
    case 'insights':
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          {b.items.map((it) => (
            <div key={it.title} className={`insight ${it.tone}`}>
              <b>{it.title}</b><span className="val">{it.value}</span>
              <small>{it.detail}</small>
            </div>
          ))}
        </div>
      );
    case 'callout': return <div className="callout"><b>{b.title}</b>{b.text}</div>;
    case 'chips':
      return <div className="chips">{b.items.map((c) => <button key={c} className="qchip" onClick={() => onChip(c)}>{c}</button>)}</div>;
    case 'pie':
      return <div><div className="mini-title">{b.title}</div><PieBox data={b.data} unit={b.unit} height={180} fmt={fmt} stack /></div>;
    case 'bar':
      return <div><div className="mini-title">{b.title}</div><BarBox data={b.data} xKey={b.xKey} series={b.series} horizontal={b.horizontal} signColors={b.signColors} unit={b.unit} height={210} fmt={fmt} labelWidth={b.horizontal ? 112 : undefined} /></div>;
    case 'line':
      return <div><div className="mini-title">{b.title}</div><LineBox data={b.data} xKey={b.xKey} series={b.series} unit={b.unit} height={210} fmt={fmt} /></div>;
    case 'table':
      return <div><div className="mini-title">{b.title}</div><DataTable columns={b.columns} rows={b.rows} /></div>;
    default: return null;
  }
}

export function BotAvatar() {
  return <div className="bot-ava"><Sparkles size={15} /></div>;
}

export default function ChatMessage({ msg, onChip, onGrow }) {
  const animate = msg.role === 'bot' && msg.animate;
  const first = msg.blocks?.[0];
  const typedFirst = animate && first?.type === 'text';
  const [ready, setReady] = useState(!typedFirst);

  useEffect(() => { onGrow?.(); }, [ready, onGrow]);

  if (msg.role === 'user') {
    return <div className="msg user"><div className="bubble-user">{msg.text}</div></div>;
  }
  return (
    <div className="msg">
      <BotAvatar />
      <div className="bot-card">
        {msg.blocks.map((b, i) => {
          if (i === 0 && typedFirst) return <Typed key={i} text={b.text} onDone={() => setReady(true)} />;
          if (i > 0 && !ready) return null;
          return <Block key={i} b={b} onChip={onChip} />;
        })}
      </div>
    </div>
  );
}
