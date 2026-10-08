// Scripted chatbot answers. Every number is computed from the same mock data / KPI functions
// that power the dashboard, so chatbot answers always agree with the charts.
import {
  filterRows, aggregate, groupAgg, topN, monthlySeries, whatIf, variance,
  fmtMoney, fmtPct, fmtNum, fmtDelta, pctChange, pvm,
} from './kpi.js';
import { monthLabel } from './mockData.js';

const d = (y, m) => new Date(y, m, 1);
export const THIS = { from: d(2026, 3), to: d(2026, 8) }; // Apr-Sep 2026 (FY26-27 YTD)
export const LY = { from: d(2025, 3), to: d(2025, 8) }; // Apr-Sep 2025
export const FY2526 = { from: d(2025, 3), to: d(2026, 2) };
export const Q1 = { from: d(2026, 3), to: d(2026, 5) }; // Apr-Jun 2026
export const Q2 = { from: d(2026, 6), to: d(2026, 8) }; // Jul-Sep 2026

const inr = (v, dp) => fmtMoney(v, 'INR', dp);
const r0 = (v) => Math.round(v);

export const SUGGESTED_QUESTIONS = [
  'Why is our revenue lower than last year?',
  'Show me net sales share by therapy area for FY25-26',
  'Compare margin by SBU for this year vs last year',
  'What are the top 5 brands by margin %?',
  'How are we tracking against budget this year?',
  'What if volume increases by 5%, price by 2%, discount is 3% and COGS goes up by 1%?',
  'Which product groups are driving the sales variance between Q1 and Q2?',
  'Why has ASP dropped for inhalers?',
  'Show net sales, COGS and margin for US Generics in INR and USD',
  'Give me a summary of key insights for the leadership team',
];

const sum = (arr, k) => arr.reduce((s, x) => s + x[k], 0);
const worst = (arr, k) => [...arr].sort((a, b) => a[k] - b[k])[0];

// ---------- answer builders ----------
function qRevenue() {
  const cur = aggregate(filterRows({}, THIS)), prev = aggregate(filterRows({}, LY));
  const diff = cur.net - prev.net;
  const items = pvm(filterRows({}, THIS), filterRows({}, LY));
  const us = items.filter((x) => x.sbu === 'US Generics');
  const india = items.filter((x) => x.sbu === 'India Formulations');
  const usPrice = sum(us, 'price'), usVol = sum(us, 'volume'), fx = sum(items, 'fx');
  const indiaGrowth = sum(india, 'volume') + sum(india, 'price');
  const rest = diff - usPrice - usVol - fx - indiaGrowth;
  const wp = worst(us, 'price'), wv = worst(us, 'volume');
  const topIndia = [...india].sort((a, b) => b.volume + b.price - (a.volume + a.price))[0];
  const fxNote = fx < 0 ? 'weaker ZAR and BRL against the rupee more than offset a stronger USD' : 'a weaker rupee lifted reported sales';
  return [
    { type: 'text', text: `Net sales for Apr–Sep FY26-27 are ${inr(cur.net)}, ${diff < 0 ? "down" : "up"} ${Math.abs(pctChange(cur.net, prev.net)).toFixed(1)}% (${inr(Math.abs(diff), 0)}) versus the same period last year (${inr(prev.net)}). Margin % slipped from ${fmtPct(prev.marginPct)} to ${fmtPct(cur.marginPct)}. Here is what moved the number:` },
    {
      type: 'insights',
      items: [
        { title: 'US inhaler & generics price erosion', value: inr(usPrice, 0), tone: 'neg', detail: `Price resets in US Generics, led by ${wp.brand} (${inr(wp.price, 0)}).` },
        { title: 'Lower US volumes', value: inr(usVol, 0), tone: usVol < 0 ? 'neg' : 'pos', detail: `${wv.brand} is the largest drag (${inr(wv.volume, 0)}); Suprax and Methylphenidate ER are losing share.` },
        { title: 'Currency translation', value: inr(fx, 0), tone: fx < 0 ? 'neg' : 'pos', detail: `Net effect after local-currency translation: ${fxNote}.` },
        { title: 'India Formulations growth', value: `+${inr(indiaGrowth, 0).replace('₹', '₹')}`, tone: 'pos', detail: `Cardiology and Diabetology volume gains, led by ${topIndia.brand}. Europe, Emerging Markets and API contribute ${rest >= 0 ? "+" : ""}${inr(rest, 0)}.` },
      ],
    },
    { type: 'callout', title: 'Suggested action', text: 'Review the US respiratory pricing plan and accelerate India Cardio/Diabetes launches to close the gap to budget. Hedge ZAR/BRL exposure for the second half.' },
    { type: 'chips', items: ['Compare margin by SBU for this year vs last year', 'How are we tracking against budget this year?'] },
  ];
}

function qTherapyShare() {
  const rows = filterRows({}, FY2526);
  const data = groupAgg(rows, 'therapy').sort((a, b) => b.net - a.net).map((x) => ({ name: x.name, value: r0(x.net) }));
  const total = sum(data, 'value');
  const top = data[0], second = data[1];
  return [
    { type: 'text', text: `FY25-26 net sales totalled ${inr(total)}. ${top.name} is the largest therapy area at ${fmtPct((top.value / total) * 100)} of net sales, followed by ${second.name} (${fmtPct((second.value / total) * 100)}).` },
    { type: 'pie', title: 'Net sales share by therapy area, FY25-26', unit: '₹ Cr', data },
    { type: 'chips', items: ['What are the top 5 brands by margin %?', 'Which product groups are driving the sales variance between Q1 and Q2?'] },
  ];
}

function qMarginSbu() {
  const cur = groupAgg(filterRows({}, THIS), 'sbu'), prev = groupAgg(filterRows({}, LY), 'sbu');
  const data = cur.map((c) => {
    const p = prev.find((x) => x.name === c.name);
    return { name: c.name, cur: r0(c.margin), ly: r0(p.margin), chg: pctChange(c.margin, p.margin) };
  });
  const worstS = [...data].sort((a, b) => a.chg - b.chg)[0], best = [...data].sort((a, b) => b.chg - a.chg)[0];
  const tot = aggregate(filterRows({}, THIS)), totP = aggregate(filterRows({}, LY));
  return [
    { type: 'text', text: `Total margin is ${inr(tot.margin)} for Apr–Sep FY26-27, ${fmtDelta(pctChange(tot.margin, totP.margin))} versus last year. ${worstS.name} is the weakest (${fmtDelta(worstS.chg)}), while ${best.name} grew the most (${fmtDelta(best.chg)}).` },
    { type: 'bar', title: 'Margin by SBU: Apr–Sep FY26-27 vs Apr–Sep FY25-26', unit: '₹ Cr', xKey: 'name', series: [{ key: 'cur', label: 'FY26-27 (Apr–Sep)' }, { key: 'ly', label: 'FY25-26 (Apr–Sep)' }], data },
    { type: 'chips', items: ['Why is our revenue lower than last year?'] },
  ];
}

function qTopBrandsMargin() {
  const rows = filterRows({}, THIS);
  const byMargin = topN(rows, 'brand', 'marginPct', 5);
  const bySales = topN(rows, 'brand', 'net', 20);
  const data = byMargin.map((x) => ({ name: x.name, value: Number(x.marginPct.toFixed(1)) }));
  const tableRows = byMargin.map((x) => ({
    rank: x.rank, brand: x.name, mpct: fmtPct(x.marginPct), net: inr(x.net),
    salesRank: `#${bySales.findIndex((s) => s.name === x.name) + 1}`,
  }));
  return [
    { type: 'text', text: `${byMargin[0].name} leads on margin % (${fmtPct(byMargin[0].marginPct)}), followed by ${byMargin[1].name} and ${byMargin[2].name}. Most high-margin brands are India Formulations brands; note how their sales rank differs.` },
    { type: 'bar', title: 'Top 5 brands by Margin %, Apr–Sep FY26-27', unit: '%', xKey: 'name', horizontal: true, series: [{ key: 'value', label: 'Margin %' }], data },
    { type: 'table', title: 'Top 5 brands: rank by Margin % vs Net Sales', columns: [{ key: 'rank', label: '#' }, { key: 'brand', label: 'Brand' }, { key: 'mpct', label: 'Margin %', align: 'right' }, { key: 'net', label: 'Net Sales', align: 'right' }, { key: 'salesRank', label: 'Sales rank', align: 'right' }], rows: tableRows },
  ];
}

function qBudget() {
  const act = filterRows({}, THIS), bud = filterRows({ scenario: 'budget' }, THIS);
  const a = aggregate(act), b = aggregate(bud);
  const sa = monthlySeries(act), sb = monthlySeries(bud);
  const data = sa.map((x, i) => ({ name: monthLabel(x.date), actual: r0(x.net), budget: r0(sb[i].net) }));
  const missed = data.filter((x) => x.actual < x.budget).length;
  return [
    { type: 'text', text: `Actual/LE net sales of ${inr(a.net)} are ${fmtPct((a.net / b.net) * 100)} of budget (${inr(b.net)}); margin is at ${fmtPct((a.margin / b.margin) * 100)} of the budgeted ${inr(b.margin)}. Sales missed budget in ${missed} of ${data.length} months, and the gap is widening.` },
    {
      type: 'insights',
      items: [
        { title: 'Sales attainment', value: fmtPct((a.net / b.net) * 100), tone: a.net >= b.net ? 'pos' : 'neg', detail: `Actual/LE ${inr(a.net)} vs Budget ${inr(b.net)}` },
        { title: 'Margin attainment', value: fmtPct((a.margin / b.margin) * 100), tone: a.margin >= b.margin ? 'pos' : 'neg', detail: `Actual/LE ${inr(a.margin)} vs Budget ${inr(b.margin)}` },
      ],
    },
    { type: 'line', title: 'Monthly net sales: Actual/LE vs Budget, FY26-27', unit: '₹ Cr', xKey: 'name', series: [{ key: 'actual', label: 'Actual / LE' }, { key: 'budget', label: 'Budget', dashed: true }], data },
  ];
}

export function parseWhatIf(t) {
  const find = (re, def) => { const m = t.match(re); return m ? parseFloat(m[1]) : def; };
  return {
    dVolume: find(/volume[^0-9-]{0,25}(-?\d+(?:\.\d+)?)\s*%/i, 5),
    dPrice: find(/price[^0-9-]{0,25}(-?\d+(?:\.\d+)?)\s*%/i, 2),
    discount: find(/discount[^0-9-]{0,25}(-?\d+(?:\.\d+)?)\s*%/i, 3),
    dCogs: find(/cogs[^0-9-]{0,25}(-?\d+(?:\.\d+)?)\s*%/i, 1),
  };
}
function qWhatIf(text) {
  const p = parseWhatIf(text);
  const base = aggregate(filterRows({}, THIS));
  const w = whatIf(base, p);
  const row = (name, b, a, fmt) => ({ metric: name, base: fmt(b), adj: fmt(a), chg: fmtDelta(pctChange(a, b)) });
  return [
    { type: 'text', text: `Applying volume ${fmtDelta(p.dVolume)}, unit price ${fmtDelta(p.dPrice)}, discount ${fmtPct(p.discount)} and unit COGS ${fmtDelta(p.dCogs)} to Apr–Sep FY26-27: net sales move to ${inr(w.adjSales)} and margin to ${inr(w.adjMargin)} (${fmtPct(w.adjMarginPct)}).` },
    {
      type: 'table', title: 'What-if: Base vs Adjusted',
      columns: [{ key: 'metric', label: 'KPI' }, { key: 'base', label: 'Base', align: 'right' }, { key: 'adj', label: 'Adjusted', align: 'right' }, { key: 'chg', label: 'Change', align: 'right' }],
      rows: [
        row('Sales Volume (M units)', base.volume, w.adjVolume, (v) => fmtNum(v, 1)),
        row('Net Sales', base.net, w.adjSales, (v) => inr(v)),
        row('COGS', base.cogs, w.adjCogs, (v) => inr(v)),
        row('Margin', base.margin, w.adjMargin, (v) => inr(v)),
        { metric: 'Margin %', base: fmtPct(base.marginPct), adj: fmtPct(w.adjMarginPct), chg: `${(w.adjMarginPct - base.marginPct >= 0 ? '+' : '')}${(w.adjMarginPct - base.marginPct).toFixed(1)} pts` },
      ],
    },
    { type: 'callout', title: 'Try it live', text: 'Open the What-If Simulator sheet on the dashboard to move these levers with sliders.' },
  ];
}

function qVariance() {
  const v = variance({}, Q2, Q1);
  const rowsQ2 = groupAgg(filterRows({}, Q2), 'pg'), rowsQ1 = groupAgg(filterRows({}, Q1), 'pg');
  const data = rowsQ2
    .map((x) => ({ name: x.name, value: r0(x.net - (rowsQ1.find((y) => y.name === x.name)?.net || 0)) }))
    .sort((a, b) => a.value - b.value);
  const neg = data[0], pos = data[data.length - 1];
  return [
    { type: 'text', text: `Sales Variance (Q2 Jul–Sep minus Q1 Apr–Jun FY26-27) is ${inr(v.salesVariance, 0)}; Margin Variance is ${inr(v.marginVariance, 0)}. ${pos.value > 0 ? `${pos.name} adds the most (${inr(pos.value, 0)})` : `${pos.name} holds up best (${inr(pos.value, 0)})`}, while ${neg.name} is the biggest drag (${inr(neg.value, 0)}).` },
    { type: 'bar', title: 'Net sales variance by product group, Q2 vs Q1 FY26-27', unit: '₹ Cr', xKey: 'name', horizontal: true, signColors: true, series: [{ key: 'value', label: 'Variance' }], data },
  ];
}

function qAsp() {
  const rows = (extra) => filterRows({ dosage: ['Inhaler'], ...extra }, { from: d(2025, 3), to: d(2026, 8) });
  const all = monthlySeries(rows());
  const us = monthlySeries(rows({ sbu: ['US Generics'] }));
  const india = monthlySeries(rows({ sbu: ['India Formulations'] }));
  const data = all.map((x, i) => ({ name: monthLabel(x.date), all: r0(x.asp), us: r0(us[i].asp), india: r0(india[i].asp) }));
  const chg = pctChange(data[data.length - 1].all, data[0].all);
  const usChg = pctChange(data[data.length - 1].us, data[0].us);
  const inChg = pctChange(data[data.length - 1].india, data[0].india);
  return [
    { type: 'text', text: `Inhaler ASP has moved ${fmtDelta(chg)} since Apr 2025 (₹${fmtNum(data[0].all, 0)} → ₹${fmtNum(data[data.length - 1].all, 0)} per unit). The decline is almost entirely US Generics (${fmtDelta(usChg)}) from competitive price erosion on Tiotrop HFA and Albuterol HFA; India inhaler pricing is stable (${fmtDelta(inChg)}).` },
    { type: 'line', title: 'Inhaler ASP per unit, Apr 2025 – Sep 2026', unit: '₹', xKey: 'name', series: [{ key: 'all', label: 'All inhalers' }, { key: 'us', label: 'US Generics' }, { key: 'india', label: 'India Formulations' }], data },
    { type: 'callout', title: 'Insight', text: 'Mix also matters: as US volumes hold while price falls, the blended inhaler ASP drifts down even with no price change in India.' },
  ];
}

function qCurrency() {
  const rows = filterRows({ sbu: ['US Generics'] }, THIS);
  const i = aggregate(rows, 'INR'), u = aggregate(rows, 'USD');
  const avg = i.net / u.net * 10;
  const line = (n, a, b) => ({ metric: n, inr: inr(a), usd: fmtMoney(b, 'USD') });
  return [
    { type: 'text', text: `For US Generics (Apr–Sep FY26-27), net sales are ${inr(i.net)} / ${fmtMoney(u.net, 'USD')} at an average rate of ₹${avg.toFixed(2)} per USD.` },
    {
      type: 'table', title: 'US Generics: INR and USD view',
      columns: [{ key: 'metric', label: 'KPI' }, { key: 'inr', label: 'INR', align: 'right' }, { key: 'usd', label: 'USD', align: 'right' }],
      rows: [line('Net Sales', i.net, u.net), line('COGS', i.cogs, u.cogs), line('Margin', i.margin, u.margin), { metric: 'Margin %', inr: fmtPct(i.marginPct), usd: fmtPct(u.marginPct) }],
    },
  ];
}

function qSummary() {
  const cur = aggregate(filterRows({}, THIS)), prev = aggregate(filterRows({}, LY));
  const bud = aggregate(filterRows({ scenario: 'budget' }, THIS));
  const topTa = topN(filterRows({}, THIS), 'therapy', 'net', 1)[0];
  const topBrand = topN(filterRows({}, THIS), 'brand', 'net', 1)[0];
  const sbus = groupAgg(filterRows({}, THIS), 'sbu'), sbuP = groupAgg(filterRows({}, LY), 'sbu');
  const g = sbus.map((x) => ({ n: x.name, c: pctChange(x.net, sbuP.find((y) => y.name === x.name).net) })).sort((a, b) => b.c - a.c);
  return [
    { type: 'text', text: 'Executive summary: Apr–Sep FY26-27 (Actual/LE vs last year and budget)' },
    {
      type: 'insights',
      items: [
        { title: 'Highlights', value: `${g[0].n} ${fmtDelta(g[0].c)}`, tone: 'pos', detail: `${topTa.name} is the #1 therapy area (${inr(topTa.net)}); ${topBrand.name} is the #1 brand (${inr(topBrand.net)}).` },
        { title: 'Top-line', value: fmtDelta(pctChange(cur.net, prev.net)), tone: cur.net >= prev.net ? 'pos' : 'neg', detail: `Net sales ${inr(cur.net)}; ${fmtPct((cur.net / bud.net) * 100)} of budget.` },
        { title: 'Risk: margin', value: `${fmtPct(cur.marginPct)}`, tone: 'neg', detail: `Margin % is down ${(prev.marginPct - cur.marginPct).toFixed(1)} pts vs last year (${fmtPct(prev.marginPct)}) on US price erosion and input cost inflation.` },
        { title: 'Risk: US Generics', value: fmtDelta(g[g.length - 1].c), tone: 'neg', detail: `${g[g.length - 1].n} is the weakest SBU; respiratory pricing is the main driver.` },
      ],
    },
    { type: 'callout', title: 'Recommended actions', text: '1) Re-base US respiratory pricing and pursue differentiated launches.  2) Scale India Cardio/Diabetes where growth is strongest.  3) Hedge ZAR/BRL exposure and review COGS for 3/4-series products with the central costing team.' },
  ];
}

export const FALLBACK = [
  { type: 'text', text: 'I can answer questions about the reports on this dashboard. This demo understands questions like these:' },
  { type: 'chips', items: SUGGESTED_QUESTIONS.slice(0, 6) },
];

const RULES = [
  { id: 'whatif', test: (t) => /what[\s-]?if|simulat/.test(t), build: qWhatIf },
  { id: 'asp', test: (t) => /\basp\b|average selling price/.test(t), build: qAsp },
  { id: 'variance', test: (t) => /variance|q1.*q2|q2.*q1/.test(t), build: qVariance },
  { id: 'currency', test: (t) => /\binr\b|\busd\b|currency|dollar|rupee/.test(t), build: qCurrency },
  { id: 'topbrands', test: (t) => /top\s*\d*.*brand|brand.*margin/.test(t), build: qTopBrandsMargin },
  { id: 'marginsbu', test: (t) => /margin/.test(t) && /sbu|segment|business unit/.test(t), build: qMarginSbu },
  { id: 'therapy', test: (t) => /therapy|therapeutic/.test(t) && /share|split|breakdown|mix|pie|net sales|sales/.test(t), build: qTherapyShare },
  { id: 'budget', test: (t) => /budget|tracking|target/.test(t), build: qBudget },
  { id: 'summary', test: (t) => /summary|insights|leadership|highlights|overview/.test(t), build: qSummary },
  { id: 'revenue', test: (t) => /(why|reason|explain|driver)/.test(t) && /(revenue|sales)/.test(t), build: qRevenue },
];

export function answer(text) {
  const t = text.toLowerCase();
  const rule = RULES.find((r) => r.test(t));
  return rule ? rule.build(text) : FALLBACK;
}
