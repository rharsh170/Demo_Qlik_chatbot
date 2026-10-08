import { useState } from 'react';
import { ChevronsLeft, ChevronsRight, FilterX, Redo2, Undo2 } from 'lucide-react';
import FilterPanel from './FilterPanel.jsx';
import SelectionsBar from './SelectionsBar.jsx';
import OverviewSheet from './sheets/OverviewSheet.jsx';
import TopNSheet from './sheets/TopNSheet.jsx';
import VarianceSheet from './sheets/VarianceSheet.jsx';
import WhatIfSheet from './sheets/WhatIfSheet.jsx';
import CurrencySheet from './sheets/CurrencySheet.jsx';

export const SHEETS = [
  { id: 'overview', label: 'Executive Overview', Comp: OverviewSheet },
  { id: 'topn', label: 'Top N Rankings', Comp: TopNSheet },
  { id: 'variance', label: 'Period Comparison', Comp: VarianceSheet },
  { id: 'whatif', label: 'What-If Simulator', Comp: WhatIfSheet },
  { id: 'currency', label: 'Currency View', Comp: CurrencySheet },
];

/**
 * Demo stand-in for an embedded Qlik Sense app.
 *
 * mode="mock": renders static, Qlik-styled sheets (this demo).
 * mode="live": render the client's real Qlik app, e.g. with @qlik/embed-react:
 *   <QlikEmbed ui="analytics/sheet" appId={APP_ID} sheetId={sheet.qlikSheetId} />
 * wrapped in <QlikEmbedConfig> with the tenant host + auth. The surrounding tabs / chatbot stay unchanged.
 */
export default function QlikEmbedFrame({ mode = 'mock', filters, setFilters, ccy, history, onAsk }) {
  const [sheetId, setSheetId] = useState('overview');
  const [panel, setPanel] = useState(true);
  const Sheet = SHEETS.find((s) => s.id === sheetId).Comp;

  if (mode === 'live') {
    return <div className="qlik"><div className="sheet">Live Qlik embed is configured in production.</div></div>;
  }

  return (
    <div className="qlik">
      <div className="qlik-head">
        <button className="icon-btn" onClick={() => setPanel((p) => !p)} aria-label={panel ? 'Hide filters' : 'Show filters'} title={panel ? 'Hide filters' : 'Show filters'}>
          {panel ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>
        <div className="qlik-logo">Q</div>
        <div className="app">Lupin Commercial Performance<small>Qlik Sense app · Sales &amp; Margin analytics</small></div>
        <span style={{ flex: 1 }} />
        <span className="badge">Illustrative data</span>
        <button className="icon-btn" onClick={history.undo} disabled={!history.canUndo} title="Step back in selections" aria-label="Step back"><Undo2 size={16} /></button>
        <button className="icon-btn" onClick={history.redo} disabled={!history.canRedo} title="Step forward in selections" aria-label="Step forward"><Redo2 size={16} /></button>
        <button className="icon-btn" onClick={history.clear} title="Clear all selections" aria-label="Clear all selections"><FilterX size={16} /></button>
      </div>
      <div className="tabs" role="tablist">
        {SHEETS.map((s) => (
          <button key={s.id} role="tab" aria-selected={sheetId === s.id} className={`tab ${sheetId === s.id ? 'on' : ''}`} onClick={() => setSheetId(s.id)}>{s.label}</button>
        ))}
      </div>
      <SelectionsBar filters={filters} setFilters={setFilters} />
      <div className="qlik-body">
        <FilterPanel filters={filters} setFilters={setFilters} collapsed={!panel} />
        <div className="sheet">
          <Sheet filters={filters} ccy={ccy} onAsk={onAsk} />
        </div>
      </div>
      <div className="qlik-foot"><span>Powered by Qlik Sense</span><span>Values in {ccy === 'INR' ? '₹ crore' : '$ million'} · Indian fiscal year (Apr–Mar)</span></div>
    </div>
  );
}
