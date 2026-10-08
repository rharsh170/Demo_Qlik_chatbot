// KPI definitions, mirroring the client's KPI sheet (rows 2-29).
import { ROWS, GROSS_FIELD_CODES, fxRates } from './mockData.js';

export const CCY_META = {
  INR: { symbol: '₹', unit: 'Cr', label: '₹ Cr' },
  USD: { symbol: '$', unit: 'M', label: '$ M' },
};

// Row -> multiplier into the display currency (INR crore or USD million)
const conv = (row, ccy) => (ccy === 'USD' ? row.fxUSD : row.fxINR / 10);

// Row-level KPI building blocks (local currency millions)
export const rowGross = (r) => (GROSS_FIELD_CODES.includes(r.company) ? r.grossField : r.netField); // row 2
export const rowNet = (r) => r.netField - r.otherDeductions; // row 3
export const rowCogs = (r) => r.cogsTraded + r.cogsCosting; // row 5

const isActualLE = (r) => r.scenario === 'Actual' || r.scenario === 'LE';

export function filterRows(filters, extra = {}) {
  const { from, to, scenario = 'actual', ...dims } = { ...filters, ...extra };
  const fromStart = from ? new Date(from.getFullYear(), from.getMonth(), 1) : null;
  return ROWS.filter((r) => {
    if (scenario === 'actual' && !isActualLE(r)) return false;
    if (scenario === 'budget' && r.scenario !== 'Budget') return false;
    if (fromStart && r.date < fromStart) return false;
    if (to && r.date > to) return false;
    for (const k of ['company', 'sbu', 'therapy', 'pg', 'brand', 'dosage']) {
      if (dims[k] && dims[k].length && !dims[k].includes(r[k])) return false;
    }
    return true;
  });
}

export function aggregate(rows, ccy = 'INR') {
  let gross = 0, net = 0, cogs = 0, volume = 0, deductions = 0, tradeDisc = 0;
  for (const r of rows) {
    const f = conv(r, ccy);
    gross += rowGross(r) * f;
    net += rowNet(r) * f;
    cogs += rowCogs(r) * f;
    deductions += r.otherDeductions * f;
    tradeDisc += (rowGross(r) - r.netField) * f;
    volume += r.volume;
  }
  const margin = net - cogs; // row 6
  const toUnit = ccy === 'INR' ? 10 : 1; // crore -> INR millions
  return {
    gross, net, cogs, volume, deductions, tradeDisc, margin,
    marginPct: net ? (margin / net) * 100 : 0, // row 7
    asp: volume ? (net * toUnit) / volume : 0, // row 11: per unit in INR / USD
  };
}

export function groupAgg(rows, key, ccy = 'INR') {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return [...map.entries()].map(([name, rs]) => ({ name, ...aggregate(rs, ccy) }));
}

// rows 8-10, 12: rank any dimension by Net Sales or Margin %
export function topN(rows, dim, by = 'net', n = 5, ccy = 'INR') {
  return groupAgg(rows, dim, ccy)
    .sort((a, b) => b[by] - a[by])
    .slice(0, n)
    .map((x, i) => ({ ...x, rank: i + 1 }));
}

export function monthlySeries(rows, ccy = 'INR') {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.m)) map.set(r.m, { m: r.m, date: r.date, rows: [] });
    map.get(r.m).rows.push(r);
  }
  return [...map.values()].sort((a, b) => a.m - b.m).map((x) => ({ m: x.m, date: x.date, ...aggregate(x.rows, ccy) }));
}

// rows 17-21: What-If simulation on a base aggregate (display currency)
export function whatIf(base, { dVolume = 0, dPrice = 0, discount = 0, dCogs = 0 }) {
  const adjVolume = base.volume * (1 + dVolume / 100);
  const adjSales = adjVolume * ((base.net / base.volume) * (1 + dPrice / 100) * (1 - discount / 100));
  const adjCogs = adjVolume * ((base.cogs / base.volume) * (1 + dCogs / 100));
  const adjMargin = adjSales - adjCogs;
  return {
    adjVolume, adjSales, adjCogs, adjMargin,
    adjMarginPct: adjSales ? ((adjSales - adjCogs) / adjSales) * 100 : 0,
  };
}

// rows 22-23: Variance between two period selections
export function variance(filters, p1, p2, ccy = 'INR') {
  const a = aggregate(filterRows(filters, { from: p1.from, to: p1.to }), ccy);
  const b = aggregate(filterRows(filters, { from: p2.from, to: p2.to }), ccy);
  return { a, b, salesVariance: a.net - b.net, marginVariance: a.margin - b.margin };
}

// rows 24-29: Net Sales / COGS / Margin in INR and USD
export function inBothCurrencies(rows) {
  return { inr: aggregate(rows, 'INR'), usd: aggregate(rows, 'USD') };
}

// Price / volume / FX decomposition of the change in Net Sales between two row sets (per brand)
export function pvm(curRows, prevRows, ccy = 'INR') {
  const byBrand = (rows) => {
    const m = new Map();
    for (const r of rows) {
      const x = m.get(r.brand) || { sbu: r.sbu, therapy: r.therapy, pg: r.pg, vol: 0, loc: 0, conv: 0 };
      x.vol += r.volume;
      x.loc += rowNet(r);
      x.conv += rowNet(r) * conv(r, ccy);
      m.set(r.brand, x);
    }
    return m;
  };
  const c = byBrand(curRows), p = byBrand(prevRows);
  const out = [];
  for (const brand of new Set([...c.keys(), ...p.keys()])) {
    const x1 = c.get(brand) || { vol: 0, loc: 0, conv: 0 }, x0 = p.get(brand) || { vol: 0, loc: 0, conv: 0 };
    const meta = c.get(brand) || p.get(brand);
    if (!x0.vol || !x1.vol) {
      out.push({ brand, sbu: meta.sbu, therapy: meta.therapy, pg: meta.pg, volume: x1.conv - x0.conv, price: 0, fx: 0 });
      continue;
    }
    const P0 = x0.loc / x0.vol, P1 = x1.loc / x1.vol;
    const fx0 = x0.conv / x0.loc, fx1 = x1.conv / x1.loc;
    out.push({
      brand, sbu: meta.sbu, therapy: meta.therapy, pg: meta.pg,
      volume: (x1.vol - x0.vol) * P0 * fx0,
      price: x1.vol * (P1 - P0) * fx0,
      fx: x1.loc * (fx1 - fx0),
    });
  }
  return out;
}

export const currentRates = (m) => fxRates(m);

// ---------- formatting ----------
export function fmtMoney(v, ccy = 'INR', dp) {
  const meta = CCY_META[ccy];
  const abs = Math.abs(v);
  const d = dp ?? (abs >= 100 ? 0 : abs >= 10 ? 1 : 2);
  const s = abs.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${v < 0 ? '-' : ''}${meta.symbol}${s} ${meta.unit}`;
}
export const fmtNum = (v, dp = 1) => v.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const fmtPct = (v, dp = 1) => `${v.toFixed(dp)}%`;
export const fmtDelta = (v, dp = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(dp)}%`;
export const pctChange = (cur, prev) => (prev ? ((cur - prev) / Math.abs(prev)) * 100 : 0);
