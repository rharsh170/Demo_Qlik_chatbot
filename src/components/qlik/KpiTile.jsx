import { Info, TrendingDown, TrendingUp } from 'lucide-react';

// KPI tile. `delta` is a % change (number); `goodWhenUp` flips the colour for cost-like KPIs.
export default function KpiTile({ label, value, sub, delta, deltaLabel = 'vs LY', goodWhenUp = true, formula, variant, small }) {
  const good = delta == null ? null : goodWhenUp ? delta >= 0 : delta <= 0;
  return (
    <div className={`tile ${variant || ''}`}>
      <div className="k">
        {label}
        {formula && <Info size={12} title={formula} aria-label={formula} />}
      </div>
      <div className={`v ${small ? 'sm' : ''}`}>{value}</div>
      <div className="s">
        {delta != null && (
          <span className={`delta ${good ? 'pos' : 'neg'}`}>
            {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
          </span>
        )}
        {delta != null && <span>{deltaLabel}</span>}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
