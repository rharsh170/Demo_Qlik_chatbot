import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { aggregate, filterRows, fmtMoney, fmtNum, fmtPct, pctChange, whatIf, CCY_META } from '../../../data/kpi.js';
import { BarBox } from '../../Charts.jsx';
import ChartCard from '../ChartCard.jsx';
import KpiTile from '../KpiTile.jsx';

const LEVERS = [
  { key: 'dVolume', label: 'Change in volume %', min: -20, max: 20, step: 0.5 },
  { key: 'dPrice', label: 'Change in per unit price %', min: -15, max: 15, step: 0.5 },
  { key: 'discount', label: 'Discount %', min: 0, max: 15, step: 0.5 },
  { key: 'dCogs', label: 'Change in per unit COGS %', min: -15, max: 15, step: 0.5 },
];
const ZERO = { dVolume: 0, dPrice: 0, discount: 0, dCogs: 0 };

export default function WhatIfSheet({ filters, ccy, onAsk }) {
  const [lv, setLv] = useState({ dVolume: 5, dPrice: 2, discount: 3, dCogs: 1 });
  const unit = CCY_META[ccy].label;
  const m = (v) => fmtMoney(v, ccy);

  const { base, adj } = useMemo(() => {
    const base = aggregate(filterRows(filters, { scenario: 'actual' }), ccy);
    return { base, adj: whatIf(base, lv) };
  }, [filters, ccy, lv]);

  const chart = [
    { name: 'Net Sales', base: Math.round(base.net), adj: Math.round(adj.adjSales) },
    { name: 'COGS', base: Math.round(base.cogs), adj: Math.round(adj.adjCogs) },
    { name: 'Margin', base: Math.round(base.margin), adj: Math.round(adj.adjMargin) },
  ];

  return (
    <>
      <ChartCard title="What-If levers" subtitle="Move the sliders to simulate the impact on the current selection (Actual/LE)" question="What if volume increases by 5%, price by 2%, discount is 3% and COGS goes up by 1%?" onAsk={onAsk}
        actions={<button className="preset" onClick={() => setLv(ZERO)}><RotateCcw size={11} style={{ verticalAlign: -1 }} /> Reset</button>}>
        <div className="sliders">
          {LEVERS.map((l) => (
            <div className="slider" key={l.key}>
              <label htmlFor={l.key}>{l.label}<b>{lv[l.key] > 0 && l.key !== 'discount' ? '+' : ''}{lv[l.key].toFixed(1)}%</b></label>
              <input id={l.key} type="range" min={l.min} max={l.max} step={l.step} value={lv[l.key]} onChange={(e) => setLv({ ...lv, [l.key]: Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="tiles" style={{ marginTop: 14 }}>
        <KpiTile variant="hi" label="Adjusted Volume" value={`${fmtNum(adj.adjVolume, 0)} M`} delta={pctChange(adj.adjVolume, base.volume)} deltaLabel="vs base" sub={`base ${fmtNum(base.volume, 0)} M`} formula="Sales volume × (1 + Change in volume %)" />
        <KpiTile variant="hi" label="Adjusted Sales" value={m(adj.adjSales)} delta={pctChange(adj.adjSales, base.net)} deltaLabel="vs base" sub={`base ${m(base.net)}`} formula="Adjusted volume × ((Net sales / Sales Volume) × (1 + Change in per unit price %) × (1 − Discount%))" />
        <KpiTile variant="hi" label="Adjusted COGS" value={m(adj.adjCogs)} delta={pctChange(adj.adjCogs, base.cogs)} goodWhenUp={false} deltaLabel="vs base" sub={`base ${m(base.cogs)}`} formula="Adjusted volume × ((COGS / Sales Volume) × (1 + Change in per unit COGS %))" />
        <KpiTile variant="hi" label="Adjusted Margin" value={m(adj.adjMargin)} delta={pctChange(adj.adjMargin, base.margin)} deltaLabel="vs base" sub={`base ${m(base.margin)}`} formula="Adjusted sales − Adjusted COGS" />
        <KpiTile variant="hi" label="Adjusted Margin %" value={fmtPct(adj.adjMarginPct)} delta={adj.adjMarginPct - base.marginPct} deltaLabel="pts vs base" sub={`base ${fmtPct(base.marginPct)}`} formula="((Adjusted sales − Adjusted COGS) / Adjusted Sales) × 100" />
      </div>

      <div className="grid-2e">
        <ChartCard title="Base vs Adjusted" subtitle={unit}>
          <BarBox data={chart} series={[{ key: 'base', label: 'Base (Actual/LE)' }, { key: 'adj', label: 'Adjusted' }]} unit={unit} fmt={(v) => v.toLocaleString('en-IN')} />
        </ChartCard>
        <ChartCard title="How it is calculated" subtitle="Same definitions as the Qlik KPI sheet">
          <div className="formula">
            <p><b>Adjusted Volume</b> = <code>Sales Volume × (1 + Δ Volume %)</code></p>
            <p><b>Adjusted Sales</b> = <code>Adj. Volume × (Net Sales / Volume) × (1 + Δ Unit Price %) × (1 − Discount %)</code></p>
            <p><b>Adjusted COGS</b> = <code>Adj. Volume × (COGS / Volume) × (1 + Δ Unit COGS %)</code></p>
            <p><b>Adjusted Margin</b> = <code>Adjusted Sales − Adjusted COGS</code></p>
            <p><b>Adjusted Margin %</b> = <code>(Adj. Sales − Adj. COGS) / Adj. Sales × 100</code></p>
          </div>
        </ChartCard>
      </div>
    </>
  );
}
