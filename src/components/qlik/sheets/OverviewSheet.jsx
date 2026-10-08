import { useMemo } from 'react';
import { aggregate, filterRows, fmtMoney, fmtNum, fmtPct, groupAgg, monthlySeries, pctChange, topN, CCY_META } from '../../../data/kpi.js';
import { monthLabel } from '../../../data/mockData.js';
import { BarBox, DataTable, LineBox, PieBox, WaterfallBox } from '../../Charts.jsx';
import ChartCard from '../ChartCard.jsx';
import KpiTile from '../KpiTile.jsx';

const prevYear = (d) => new Date(d.getFullYear() - 1, d.getMonth(), 1);

export default function OverviewSheet({ filters, ccy, onAsk }) {
  const m = (v) => fmtMoney(v, ccy);
  const unit = CCY_META[ccy].label;

  const d = useMemo(() => {
    const rows = filterRows(filters);
    const ly = filterRows(filters, { from: prevYear(filters.from), to: prevYear(filters.to), scenario: 'actual' });
    const actRows = filterRows(filters, { scenario: 'actual' });
    const budRows = filterRows(filters, { scenario: 'budget' });
    const cur = aggregate(rows, ccy), prev = aggregate(ly, ccy);
    const act = aggregate(actRows, ccy), bud = aggregate(budRows, ccy);
    const a = monthlySeries(actRows, ccy), b = monthlySeries(budRows, ccy);
    const trend = a.map((x) => ({ name: monthLabel(x.date), actual: Math.round(x.net), budget: Math.round(b.find((y) => y.m === x.m)?.net || 0) }));
    const sbu = groupAgg(rows, 'sbu', ccy).sort((x, y) => y.net - x.net).map((x) => ({ name: x.name, value: Math.round(x.net) }));
    const brands = topN(rows, 'brand', 'net', 5, ccy);
    return {
      cur, prev, act, bud, trend, sbu, brands,
      topTa: topN(rows, 'therapy', 'net', 1, ccy)[0],
      topPg: topN(rows, 'pg', 'net', 1, ccy)[0],
      topBrand: brands[0],
      bridge: [
        { name: 'Gross Sales', value: Math.round(cur.gross), total: true },
        { name: 'Trade discounts', value: -Math.round(cur.tradeDisc) },
        { name: 'Other deductions', value: -Math.round(cur.deductions) },
        { name: 'Net Sales', value: Math.round(cur.net), total: true },
      ],
    };
  }, [filters, ccy]);

  if (!d.cur.net) return <div className="card">No data for the current selections. Clear a selection to continue.</div>;
  const { cur, prev } = d;

  return (
    <>
      <div className="tiles">
        <KpiTile label="Gross Sales" value={m(cur.gross)} delta={pctChange(cur.gross, prev.gross)} formula="Gross sales field for company codes LP01, LP04, LP05, LG01, LG02, LS01; net sales field for all other codes" />
        <KpiTile label="Net Sales" value={m(cur.net)} delta={pctChange(cur.net, prev.net)} formula="Net sales field minus other deductions" />
        <KpiTile label="Sales Volume" value={`${fmtNum(cur.volume, 0)} M`} delta={pctChange(cur.volume, prev.volume)} formula="Gross sales volume" />
        <KpiTile label="ASP" value={`${ccy === 'INR' ? '₹' : '$'}${fmtNum(cur.asp, 2)}`} delta={pctChange(cur.asp, prev.asp)} sub="per unit" formula="Net Sales / Sales Volume" />
        <KpiTile label="COGS" value={m(cur.cogs)} delta={pctChange(cur.cogs, prev.cogs)} goodWhenUp={false} formula="COGS traded goods + costing-team COGS for 3 and 4 series codes" />
        <KpiTile label="Margin" value={m(cur.margin)} delta={pctChange(cur.margin, prev.margin)} formula="Net Sales − COGS" />
        <KpiTile label="Margin %" value={fmtPct(cur.marginPct)} delta={cur.marginPct - prev.marginPct} deltaLabel="pts vs LY" formula="(Net Sales − COGS) / Net Sales × 100" />
      </div>

      <div className="tiles">
        <KpiTile variant="alt" label="Actual/LE Sales" value={m(d.act.net)} sub={`${fmtPct((d.act.net / d.bud.net) * 100)} of budget`} />
        <KpiTile variant="alt" label="Budgeted Sales" value={m(d.bud.net)} sub="Scenario = Budget" />
        <KpiTile variant="alt" label="Actual/LE Margin" value={m(d.act.margin)} sub={`${fmtPct((d.act.margin / d.bud.margin) * 100)} of budget`} />
        <KpiTile variant="alt" label="Budgeted Margin" value={m(d.bud.margin)} sub="Scenario = Budget" />
        <KpiTile variant="hi" small label="Top Therapy Area" value={d.topTa.name} sub={m(d.topTa.net)} />
        <KpiTile variant="hi" small label="Top Product Group" value={d.topPg.name} sub={m(d.topPg.net)} />
        <KpiTile variant="hi" small label="Top Brand" value={d.topBrand.name} sub={m(d.topBrand.net)} />
      </div>

      <div className="grid-2">
        <ChartCard title="Net Sales: Actual/LE vs Budget" subtitle={`Monthly, ${unit}`} question="How are we tracking against budget this year?" onAsk={onAsk}>
          <LineBox data={d.trend} unit={unit} series={[{ key: 'actual', label: 'Actual / LE' }, { key: 'budget', label: 'Budget', dashed: true }]} fmt={(v) => v.toLocaleString('en-IN')} />
        </ChartCard>
        <ChartCard title="Net Sales by SBU" subtitle={`Share of total, ${unit}`} question="Why is our revenue lower than last year?" onAsk={onAsk}>
          <PieBox data={d.sbu} unit={unit} fmt={(v) => v.toLocaleString('en-IN')} />
        </ChartCard>
      </div>

      <div className="grid-2e">
        <ChartCard title="Gross to Net Sales bridge" subtitle={`Trade discounts and other deductions, ${unit}`} question="Give me a summary of key insights for the leadership team" onAsk={onAsk}>
          <WaterfallBox items={d.bridge} unit={unit} fmt={(v) => v.toLocaleString('en-IN')} />
        </ChartCard>
        <ChartCard title="Top 5 brands by Net Sales" subtitle="Net Sales, Margin and Margin %" question="What are the top 5 brands by margin %?" onAsk={onAsk}>
          <DataTable
            columns={[{ key: 'rank', label: '#' }, { key: 'name', label: 'Brand' }, { key: 'net', label: 'Net Sales', align: 'right' }, { key: 'margin', label: 'Margin', align: 'right' }, { key: 'mp', label: 'Margin %', align: 'right' }]}
            rows={d.brands.map((b) => ({ rank: <span className="rank">{b.rank}</span>, name: b.name, net: m(b.net), margin: m(b.margin), mp: fmtPct(b.marginPct) }))}
          />
        </ChartCard>
      </div>
    </>
  );
}
