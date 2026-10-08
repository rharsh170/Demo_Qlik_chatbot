import { DIMENSION_LABELS, DIMENSION_OPTIONS } from '../../data/mockData.js';
import MonthRange, { PRESETS } from './MonthRange.jsx';
import MultiSelect from './MultiSelect.jsx';

const same = (a, b) => a.getTime() === b.getTime();

export default function FilterPanel({ filters, setFilters, collapsed }) {
  const activePreset = PRESETS.find((p) => same(p.from, filters.from) && same(p.to, filters.to))?.id;
  return (
    <aside className={`filters ${collapsed ? 'collapsed' : ''}`} aria-label="Filters">
      <div className="filter-group">
        <h4>Calendar</h4>
        <div className="presets">
          {PRESETS.map((p) => (
            <button key={p.id} className={`preset ${activePreset === p.id ? 'on' : ''}`} onClick={() => setFilters({ ...filters, from: p.from, to: p.to })}>{p.label}</button>
          ))}
        </div>
        <MonthRange from={filters.from} to={filters.to} onChange={(r) => setFilters({ ...filters, ...r })} />
      </div>
      <div className="filter-group">
        <h4>Scenario</h4>
        <div className="seg light" style={{ display: 'flex' }}>
          {[['actual', 'Actual / LE'], ['budget', 'Budget']].map(([id, label]) => (
            <button key={id} style={{ flex: 1 }} className={filters.scenario === id ? 'on' : ''} onClick={() => setFilters({ ...filters, scenario: id })}>{label}</button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <h4>Dimensions</h4>
        {Object.keys(DIMENSION_OPTIONS).map((k) => (
          <MultiSelect key={k} label={DIMENSION_LABELS[k]} options={DIMENSION_OPTIONS[k]} value={filters[k]} onChange={(v) => setFilters({ ...filters, [k]: v })} />
        ))}
      </div>
    </aside>
  );
}
