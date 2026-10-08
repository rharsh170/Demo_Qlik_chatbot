import { useMemo, useState } from 'react';
import { filterRows, fmtMoney, fmtPct, groupAgg, pctChange, pvm, variance, CCY_META } from '../../../data/kpi.js';
import { BarBox, DataTable, WaterfallBox } from '../../Charts.jsx';
import ChartCard from '../ChartCard.jsx';
import KpiTile from '../KpiTile.jsx';
import MonthRange from '../MonthRange.jsx';

export default function VarianceSheet({ filters, ccy, onAsk }) {
  const [p1, setP1] = useState({ from: new Date(2026, 6, 1), to: new Date(2026, 8, 1) }); // Q2
  const [p2, setP2] = useState({ from: new Date(2026, 3, 1), to: new Date(2026, 5, 1) }); // Q1
  const unit = CCY_META[ccy].label;
  const m = (v) => fmtMoney(v, ccy);

  const d = useMemo(() => {
    const v = variance(filters, p1, p2, ccy);
    const r1 = filterRows(filters, p1), r2 = filterRows(filters, p2);
    const parts = pvm(r1, r2, ccy);
    const sum = (k) => parts.reduce((s, x) => s + x[k], 0);
    const by = (key) => {
      const a = groupAgg(r1, key, ccy), b = groupAgg(r2, key, ccy);
      return a.map((x) => {
        const y = b.find((z) => z.name === x.name) || { net: 0, margin: 0 };
        return { name: x.name, p1: x.net, p2: y.net, sv: x.net - y.net, mv: x.margin - y.margin };
      }).sort((p, q) => p.sv - q.sv);
    };
    return {
      v, bySbu: by('sbu'), byTa: by('therapy'),
      bridge: [
        { name: 'Period 2', value: Math.round(v.b.net), total: true },
        { name: 'Volume', value: Math.round(sum('volume')) },
        { name: 'Price / mix', value: Math.round(sum('price')) },
        { name: 'Currency', value: Math.round(sum('fx')) },
        { name: 'Period 1', value: Math.round(v.a.net), total: true },
      ],
    };
  }, [filters, p1, p2, ccy]);

  const { v } = d;
  return (
    <>
      <div className="toolbar">
        <div style={{ minWidth: 250 }}>
          <b style={{ fontSize: 12, color: 'var(--lupin-green-dark)' }}>Period Selection 1</b>
          <MonthRange from={p1.from} to={p1.to} onChange={setP1} />
        </div>
        <div style={{ minWidth: 250 }}>
          <b style={{ fontSize: 12, color: 'var(--lupin-cyan)' }}>Period Selection 2</b>
          <MonthRange from={p2.from} to={p2.to} onChange={setP2} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 260 }}>Variance = Period 1 − Period 2, respecting the dimension filters on the left. Defaults: Q2 (Jul–Sep) vs Q1 (Apr–Jun) FY26-27.</span>
      </div>

      <div className="tiles">
        <KpiTile label="Net Sales (Period 1)" value={m(v.a.net)} />
        <KpiTile variant="alt" label="Net Sales (Period 2)" value={m(v.b.net)} />
        <KpiTile variant="hi" label="Sales Variance" value={m(v.salesVariance)} delta={pctChange(v.a.net, v.b.net)} deltaLabel="vs Period 2" formula="Net Sales (Period 1) − Net Sales (Period 2)" />
        <KpiTile variant="hi" label="Margin Variance" value={m(v.marginVariance)} delta={pctChange(v.a.margin, v.b.margin)} deltaLabel="vs Period 2" formula="Margin (Period 1) − Margin (Period 2)" />
        <KpiTile label="Margin % (P1 vs P2)" value={fmtPct(v.a.marginPct)} sub={`vs ${fmtPct(v.b.marginPct)}`} />
      </div>

      <div className="grid-2e">
        <ChartCard title="Net Sales bridge: Period 2 to Period 1" subtitle={`Volume, price/mix and currency effects, ${unit}`} question="Which product groups are driving the sales variance between Q1 and Q2?" onAsk={onAsk}>
          <WaterfallBox items={d.bridge} unit={unit} fmt={(x) => x.toLocaleString('en-IN')} />
        </ChartCard>
        <ChartCard title="Sales variance by Therapy Area" subtitle={`Period 1 − Period 2, ${unit}`} question="Which product groups are driving the sales variance between Q1 and Q2?" onAsk={onAsk}>
          <BarBox data={d.byTa.map((x) => ({ name: x.name, value: Math.round(x.sv) }))} horizontal signColors series={[{ key: 'value', label: 'Sales variance' }]} unit={unit} fmt={(x) => x.toLocaleString('en-IN')} height={240} />
        </ChartCard>
      </div>

      <ChartCard title="Variance by SBU" subtitle="Net Sales and Margin, Period 1 vs Period 2">
        <DataTable
          columns={[{ key: 'name', label: 'SBU' }, { key: 'p1', label: 'Net Sales P1', align: 'right' }, { key: 'p2', label: 'Net Sales P2', align: 'right' }, { key: 'sv', label: 'Sales Variance', align: 'right' }, { key: 'mv', label: 'Margin Variance', align: 'right' }]}
          rows={d.bySbu.map((x) => ({ name: x.name, p1: m(x.p1), p2: m(x.p2), sv: <span className={`delta ${x.sv >= 0 ? 'pos' : 'neg'}`}>{m(x.sv)}</span>, mv: <span className={`delta ${x.mv >= 0 ? 'pos' : 'neg'}`}>{m(x.mv)}</span> }))}
        />
      </ChartCard>
    </>
  );
}
