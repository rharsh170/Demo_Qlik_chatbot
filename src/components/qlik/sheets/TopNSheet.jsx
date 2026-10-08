import { useMemo, useState } from 'react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, LabelList } from 'recharts';
import { filterRows, fmtMoney, fmtNum, fmtPct, topN, CCY_META } from '../../../data/kpi.js';
import { BarBox, DataTable, PALETTE } from '../../Charts.jsx';
import ChartCard from '../ChartCard.jsx';

const DIMS = [['therapy', 'Therapy Area'], ['pg', 'Product Group'], ['brand', 'Brand'], ['dosage', 'Dosage Form']];

export default function TopNSheet({ filters, ccy, onAsk }) {
  const [dim, setDim] = useState('brand');
  const [n, setN] = useState(5);
  const [by, setBy] = useState('net');
  const unit = CCY_META[ccy].label;
  const m = (v) => fmtMoney(v, ccy);

  const list = useMemo(() => topN(filterRows(filters), dim, by, n, ccy), [filters, dim, by, n, ccy]);
  const dimLabel = DIMS.find((d) => d[0] === dim)[1];
  const byLabel = by === 'net' ? `Net Sales (${unit})` : 'Margin %';
  const bar = list.map((x) => ({ name: x.name, value: by === 'net' ? Math.round(x.net) : Number(x.marginPct.toFixed(1)) }));
  const scatter = list.map((x) => ({ name: x.name, x: Math.round(x.net), y: Number(x.marginPct.toFixed(1)) }));

  return (
    <>
      <div className="toolbar">
        <label>Dimension
          <select value={dim} onChange={(e) => setDim(e.target.value)}>{DIMS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        <label>Top N
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>{[3, 5, 8, 10].map((v) => <option key={v}>{v}</option>)}</select>
        </label>
        <label>Rank by
          <span className="seg light">
            <button className={by === 'net' ? 'on' : ''} onClick={() => setBy('net')}>Net Sales</button>
            <button className={by === 'marginPct' ? 'on' : ''} onClick={() => setBy('marginPct')}>Margin %</button>
          </span>
        </label>
      </div>

      <div className="grid-2e">
        <ChartCard title={`Top ${n} ${dimLabel} by ${by === 'net' ? 'Net Sales' : 'Margin %'}`} subtitle={byLabel} question={dim === 'brand' ? 'What are the top 5 brands by margin %?' : 'Show me net sales share by therapy area for FY25-26'} onAsk={onAsk}>
          <BarBox data={bar} horizontal series={[{ key: 'value', label: byLabel }]} unit={by === 'net' ? unit : '%'} fmt={(v) => v.toLocaleString('en-IN')} height={Math.max(220, n * 36)} labelWidth={130} />
        </ChartCard>
        <ChartCard title="Sales vs profitability" subtitle={`Net Sales (${unit}) against Margin %, top ${n}`}>
          <ResponsiveContainer width="100%" height={Math.max(260, n * 36)}>
            <ScatterChart margin={{ top: 16, right: 40, bottom: 20, left: 0 }}>
              <CartesianGrid stroke="#E6ECE8" />
              <XAxis type="number" dataKey="x" name="Net Sales" tick={{ fontSize: 11, fill: '#6B7C85' }} tickFormatter={(v) => v.toLocaleString('en-IN')} label={{ value: `Net Sales (${unit})`, position: 'insideBottom', offset: -10, fontSize: 11, fill: '#6B7C85' }} />
              <YAxis type="number" dataKey="y" name="Margin %" unit="%" tick={{ fontSize: 11, fill: '#6B7C85' }} domain={['auto', 'auto']} />
              <ZAxis range={[90, 90]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => active && payload?.length ? (
                <div className="chart-tip"><b>{payload[0].payload.name}</b><div><span>Net Sales</span><span>{payload[0].payload.x.toLocaleString('en-IN')} {unit}</span></div><div><span>Margin %</span><span>{payload[0].payload.y}%</span></div></div>
              ) : null} />
              <Scatter data={scatter} fill={PALETTE[0]} stroke="#fff">
                <LabelList dataKey="name" position="top" style={{ fontSize: 10.5, fill: '#424242' }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title={`${dimLabel} ranking`} subtitle="Net Sales, Margin, Margin % and ASP">
        <DataTable
          columns={[{ key: 'rank', label: '#' }, { key: 'name', label: dimLabel }, { key: 'net', label: 'Net Sales', align: 'right' }, { key: 'margin', label: 'Margin', align: 'right' }, { key: 'mp', label: 'Margin %', align: 'right' }, { key: 'asp', label: 'ASP', align: 'right' }]}
          rows={list.map((x) => ({ rank: <span className="rank">{x.rank}</span>, name: x.name, net: m(x.net), margin: m(x.margin), mp: fmtPct(x.marginPct), asp: `${ccy === 'INR' ? '₹' : '$'}${fmtNum(x.asp, 2)}` }))}
        />
      </ChartCard>
    </>
  );
}
