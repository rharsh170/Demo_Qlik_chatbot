import { Sparkles } from 'lucide-react';

export default function ChartCard({ title, subtitle, question, onAsk, children, className = '', actions }) {
  return (
    <section className={`card ${className}`}>
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {actions}
          {question && (
            <button className="ask" onClick={() => onAsk?.(question)} title={`Ask AI: ${question}`}>
              <Sparkles size={13} /> Ask AI
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
