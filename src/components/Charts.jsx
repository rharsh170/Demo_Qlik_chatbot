import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from 'recharts';

// Categorical palette (validated for lightness band, chroma and colour-blind separation).
export const PALETTE = ['#069C3C', '#0A87A0', '#D4880A', '#7B5BE0', '#DB4F4F', '#7C8B93'];
export const POS = '#069C3C';
export const NEG = '#DB4F4F';
const GRID = '#E6ECE8';
const AXIS = '#6B7C85';

const defaultFmt = (v) => (typeof v === 'number' ? v.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : v);
const colorOf = (s, i) => s.color || PALETTE[i % PALETTE.length];

function Tip({ active, payload, label, unit, fmt = defaultFmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <b>{label ?? payload[0].payload?.name}</b>
      {payload.map((p) => (
        <div key={p.dataKey + p.name}>
          <span><i style={{ background: p.color || p.fill }} />{p.name}</span>
          <span>{fmt(p.value)}{unit ? ` ${unit}` : ""}</span>
        </div>
      ))}
    </div>
  );
}

function LegendRow({ series }) {
  if (series.length < 2) return null;
  return (
    <div className="legend">
      {series.map((s, i) => (
        <span key={s.key}><i style={{ background: colorOf(s, i) }} />{s.label}</span>
      ))}
    </div>
  );
}

const tick = { fontSize: 11, fill: AXIS };

// Category tick that wraps long names onto up to two lines instead of overlapping neighbours
function WrapTick({ x, y, payload }) {
  const words = String(payload.value).split(' ');
  const mid = Math.ceil(words.length / 2);
  const lines = words.length > 1 ? [words.slice(0, mid).join(' '), words.slice(mid).join(' ')] : [words[0]];
  return (
    <text x={x} y={y + 12} textAnchor="middle" fontSize={11} fill={AXIS}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i ? 12 : 0}>{l}</tspan>)}
    </text>
  );
}

export function BarBox({ data, xKey = 'name', series, horizontal = false, unit, height = 260, signColors = false, fmt = defaultFmt, stacked = false, labelWidth = 118 }) {
  return (
    <div>
      <LegendRow series={series} />
      <ResponsiveContainer width="100%" height={horizontal ? Math.max(height, data.length * 34 + 30) : height}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, bottom: 4, left: horizontal ? 0 : -8 }} barGap={2}>
          <CartesianGrid stroke={GRID} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={tick} tickFormatter={fmt} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={xKey} tick={tick} width={labelWidth} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={<WrapTick />} height={40} axisLine={{ stroke: GRID }} tickLine={false} interval={0} />
              <YAxis tick={tick} tickFormatter={fmt} axisLine={false} tickLine={false} width={52} />
            </>
          )}
          <Tooltip content={<Tip unit={unit} fmt={fmt} />} cursor={{ fill: 'rgba(6,156,60,0.07)' }} />
          {signColors && <ReferenceLine {...(horizontal ? { x: 0 } : { y: 0 })} stroke={AXIS} />}
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={colorOf(s, i)} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={horizontal ? 20 : 34} stackId={stacked ? 'a' : undefined}>
              {signColors && data.map((d, k) => <Cell key={k} fill={d[s.key] >= 0 ? POS : NEG} />)}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineBox({ data, xKey = 'name', series, unit, height = 260, fmt = defaultFmt }) {
  return (
    <div>
      <LegendRow series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} tick={tick} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={14} />
          <YAxis tick={tick} tickFormatter={fmt} axisLine={false} tickLine={false} width={56} domain={['auto', 'auto']} />
          <Tooltip content={<Tip unit={unit} fmt={fmt} />} />
          {series.map((s, i) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={colorOf(s, i)} strokeWidth={2.25} strokeDasharray={s.dashed ? '5 4' : undefined} dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: colorOf(s, i) }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieBox({ data, unit = '', height = 220, fmt = defaultFmt, stack = false }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className={`donut-wrap ${stack ? "stack" : ""}`}>
      <div style={{ width: height, height, flex: 'none', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="92%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<Tip unit={unit} fmt={fmt} />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', textAlign: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#033943' }}>{fmt(total)}</div>
            <div style={{ fontSize: 11, color: AXIS }}>{unit} total</div>
          </div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={d.name}>
            <b style={{ fontWeight: 600 }}><i style={{ background: PALETTE[i % PALETTE.length] }} />{d.name}</b>
            <span>{((d.value / total) * 100).toFixed(1)}% · {fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// items: [{ name, value, total?: true }] where non-total values are deltas stacked on a running sum
export function WaterfallBox({ items, unit, height = 260, fmt = defaultFmt }) {
  let run = 0;
  const data = items.map((it) => {
    if (it.total) {
      run = it.value;
      return { name: it.name, base: 0, up: it.value, down: 0, kind: 'total', raw: it.value };
    }
    const start = run;
    run += it.value;
    return { name: it.name, base: Math.min(start, run), up: it.value >= 0 ? it.value : 0, down: it.value < 0 ? -it.value : 0, kind: 'delta', raw: it.value };
  });
  const min = Math.min(...data.map((d) => (d.kind === 'total' ? d.up : d.base)));
  const lo = Math.floor((min * 0.96) / 10) * 10;
  const Wtip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return <div className="chart-tip"><b>{d.name}</b><div><span>{d.kind === 'total' ? 'Value' : 'Change'}</span><span>{fmt(d.raw)} {unit}</span></div></div>;
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={<WrapTick />} height={40} axisLine={{ stroke: GRID }} tickLine={false} interval={0} />
        <YAxis tick={tick} tickFormatter={fmt} axisLine={false} tickLine={false} width={56} domain={[lo, 'auto']} allowDataOverflow />
        <Tooltip content={<Wtip />} cursor={{ fill: 'rgba(6,156,60,0.07)' }} />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="up" stackId="w" maxBarSize={44}>
          {data.map((d, i) => <Cell key={i} fill={d.kind === 'total' ? '#0A87A0' : POS} />)}
        </Bar>
        <Bar dataKey="down" stackId="w" fill={NEG} maxBarSize={44} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Generic table used inside dashboard sheets and chatbot replies
export function DataTable({ columns, rows }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>{columns.map((c) => <th key={c.key} className={c.align === 'right' ? 'r' : ''}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key} className={c.align === 'right' ? 'r' : ''}>{r[c.key]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Legend };
