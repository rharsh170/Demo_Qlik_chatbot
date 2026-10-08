import { X } from 'lucide-react';
import { DIMENSION_LABELS } from '../../data/mockData.js';
import { DEFAULT_FILTERS } from '../../pages/filterDefaults.js';

const fmt = (d) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

export default function SelectionsBar({ filters, setFilters }) {
  const dims = Object.keys(DIMENSION_LABELS).filter((k) => filters[k].length);
  const clearDim = (k) => setFilters({ ...filters, [k]: [] });
  const periodChanged = filters.from.getTime() !== DEFAULT_FILTERS.from.getTime() || filters.to.getTime() !== DEFAULT_FILTERS.to.getTime();
  return (
    <div className="selbar" aria-label="Current selections">
      <span className="lbl">Selections</span>
      <span className="chip alt">
        <span>Period: {fmt(filters.from)} – {fmt(filters.to)}</span>
        {periodChanged && <button onClick={() => setFilters({ ...filters, from: DEFAULT_FILTERS.from, to: DEFAULT_FILTERS.to })} aria-label="Reset period"><X size={11} /></button>}
      </span>
      {filters.scenario === 'budget' && (
        <span className="chip alt"><span>Scenario: Budget</span><button onClick={() => setFilters({ ...filters, scenario: 'actual' })} aria-label="Clear scenario"><X size={11} /></button></span>
      )}
      {dims.map((k) => (
        <span className="chip" key={k}>
          <span>{DIMENSION_LABELS[k]}: {filters[k].join(', ')}</span>
          <button onClick={() => clearDim(k)} aria-label={`Clear ${DIMENSION_LABELS[k]}`}><X size={11} /></button>
        </span>
      ))}
    </div>
  );
}
