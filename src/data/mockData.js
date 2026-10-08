// Seeded synthetic data for the demo. All figures are illustrative, not Lupin results.
// Values are stored in LOCAL currency millions; conversion to INR / USD is applied per row (fxINR / fxUSD).

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const GROSS_FIELD_CODES = ['LP01', 'LP04', 'LP05', 'LG01', 'LG02', 'LS01'];
export const MONTHS_COUNT = 30; // Apr-2024 .. Sep-2026
export const LE_MONTH_INDEX = 29; // Sep-2026 is the Latest Estimate month; earlier months are Actuals

export function monthDate(i) {
  return new Date(2024, 3 + i, 1);
}
export function fyLabel(d) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY${String(y).slice(2)}-${String(y + 1).slice(2)}`;
}
export function monthLabel(d) {
  return `${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
}

// price0 = local currency per unit, base = monthly net sales (local currency millions) at month 0
const BRANDS = [
  { brand: 'Rosuvas', therapy: 'Cardiology', pg: 'Statins', dosage: 'Tablet', sbu: 'India Formulations', company: 'LP01', ccy: 'INR', base: 1260, price0: 14, vol: 0.0032, price: 0.0012, margin: 0.74, mfg: true },
  { brand: 'Ivabrad', therapy: 'Cardiology', pg: 'Heart Failure', dosage: 'Tablet', sbu: 'India Formulations', company: 'LP01', ccy: 'INR', base: 900, price0: 22, vol: 0.003, price: 0.0015, margin: 0.71, mfg: false },
  { brand: 'Gluconorm', therapy: 'Diabetology', pg: 'Oral Antidiabetics', dosage: 'Tablet', sbu: 'India Formulations', company: 'LP04', ccy: 'INR', base: 1140, price0: 9, vol: 0.0042, price: 0.001, margin: 0.69, mfg: true },
  { brand: 'Huminsulin', therapy: 'Diabetology', pg: 'Insulins', dosage: 'Injection', sbu: 'India Formulations', company: 'LP04', ccy: 'INR', base: 720, price0: 165, vol: 0.003, price: 0.0008, margin: 0.64, mfg: true },
  { brand: 'Pantocid-L', therapy: 'Gastro', pg: 'PPIs', dosage: 'Capsule', sbu: 'India Formulations', company: 'LP01', ccy: 'INR', base: 780, price0: 11, vol: 0.0035, price: 0.001, margin: 0.66, mfg: false },
  { brand: 'Combihale', therapy: 'Respiratory', pg: 'Inhalers', dosage: 'Inhaler', sbu: 'India Formulations', company: 'LP04', ccy: 'INR', base: 630, price0: 210, vol: 0.004, price: 0.0005, margin: 0.68, mfg: false },
  { brand: 'Cefixime API', therapy: 'Anti-infectives', pg: 'Cephalosporins', dosage: 'Bulk (API)', sbu: 'API', company: 'LP05', ccy: 'INR', base: 960, price0: 38, vol: 0.001, price: -0.0008, margin: 0.42, mfg: true },
  { brand: 'Suprax', therapy: 'Anti-infectives', pg: 'Cephalosporins', dosage: 'Oral Suspension', sbu: 'US Generics', company: 'LG01', ccy: 'USD', base: 17, price0: 6.4, vol: -0.008, price: -0.003, margin: 0.55, mfg: true },
  { brand: 'Tiotrop HFA', therapy: 'Respiratory', pg: 'Inhalers', dosage: 'Inhaler', sbu: 'US Generics', company: 'LG01', ccy: 'USD', base: 23, price0: 62, vol: 0.0015, price: -0.016, margin: 0.58, mfg: true },
  { brand: 'Albuterol HFA', therapy: 'Respiratory', pg: 'Inhalers', dosage: 'Inhaler', sbu: 'US Generics', company: 'LG02', ccy: 'USD', base: 28, price0: 24, vol: 0.001, price: -0.015, margin: 0.52, mfg: true },
  { brand: 'Metformin ER', therapy: 'Diabetology', pg: 'Oral Antidiabetics', dosage: 'Tablet', sbu: 'US Generics', company: 'LG02', ccy: 'USD', base: 20, price0: 0.42, vol: 0.0005, price: -0.007, margin: 0.47, mfg: false },
  { brand: 'Methylphenidate ER', therapy: 'CNS', pg: 'Stimulants', dosage: 'Tablet', sbu: 'US Generics', company: 'LG01', ccy: 'USD', base: 15, price0: 1.9, vol: -0.004, price: -0.004, margin: 0.5, mfg: true },
  { brand: 'Ramipril EU', therapy: 'Cardiology', pg: 'ACE Inhibitors', dosage: 'Capsule', sbu: 'Europe', company: 'LS01', ccy: 'EUR', base: 9, price0: 0.18, vol: 0.0012, price: 0.0003, margin: 0.46, mfg: false },
  { brand: 'Pantoprazole EU', therapy: 'Gastro', pg: 'PPIs', dosage: 'Tablet', sbu: 'Europe', company: 'LS01', ccy: 'EUR', base: 7.5, price0: 0.14, vol: 0.001, price: 0.0002, margin: 0.44, mfg: false },
  { brand: 'Sertraline ZA', therapy: 'CNS', pg: 'SSRIs', dosage: 'Tablet', sbu: 'Emerging Markets', company: 'LZ01', ccy: 'ZAR', base: 150, price0: 4.6, vol: 0.0025, price: 0.003, margin: 0.52, mfg: false },
  { brand: 'Amoxiclav BR', therapy: 'Anti-infectives', pg: 'Penicillins', dosage: 'Oral Suspension', sbu: 'Emerging Markets', company: 'LB01', ccy: 'BRL', base: 42, price0: 11.5, vol: 0.002, price: 0.0025, margin: 0.5, mfg: true },
];

function fxToINR(ccy, m) {
  switch (ccy) {
    case 'INR': return 1;
    case 'USD': return 83.2 + 0.03 * m;
    case 'EUR': return 90.5 + 0.9 * Math.sin(m / 4.5) + 0.02 * m;
    case 'ZAR': return 4.58 - 0.026 * m;
    case 'BRL': return 15.3 - 0.06 * m;
    default: return 1;
  }
}
export const FX_CCYS = ['INR', 'USD', 'EUR', 'ZAR', 'BRL'];
export function fxRates(m) {
  const usdinr = fxToINR('USD', m);
  return FX_CCYS.map((c) => ({ ccy: c, toINR: fxToINR(c, m), toUSD: fxToINR(c, m) / usdinr }));
}

function build() {
  const rnd = mulberry32(20260930);
  const rows = [];
  for (const b of BRANDS) {
    const costPerUnit0 = b.price0 * (1 - b.margin);
    const costTrend = b.sbu === 'US Generics' ? 0.0012 : 0.0016;
    const volume0 = b.base / b.price0; // millions of units
    const isGrossCode = GROSS_FIELD_CODES.includes(b.company);
    for (let m = 0; m < MONTHS_COUNT; m++) {
      const d = monthDate(m);
      const season = 1 + 0.012 * Math.sin(((m + 1) / 12) * 2 * Math.PI);
      const fxI = fxToINR(b.ccy, m);
      const fxU = fxI / fxToINR('USD', m);
      for (const isBudget of [false, true]) {
        const volume = isBudget
          ? volume0 * Math.pow(1 + Math.max(b.vol, 0) * 0.9 + 0.0006, m) * season
          : volume0 * Math.pow(1 + b.vol, m) * season * (0.985 + rnd() * 0.03);
        const price = isBudget
          ? b.price0 * Math.pow(1 + (b.price > 0 ? b.price : b.price * 0.45), m)
          : b.price0 * Math.pow(1 + b.price, m) * (0.995 + rnd() * 0.01);
        const unitCost = costPerUnit0 * Math.pow(1 + costTrend, m) * (isBudget ? 1 : 0.995 + rnd() * 0.01);
        const net = volume * price;
        const cogs = volume * unitCost;
        const netField = net / 0.97;
        rows.push({
          date: d,
          m,
          fy: fyLabel(d),
          scenario: isBudget ? 'Budget' : m === LE_MONTH_INDEX ? 'LE' : 'Actual',
          brand: b.brand,
          therapy: b.therapy,
          pg: b.pg,
          dosage: b.dosage,
          sbu: b.sbu,
          company: b.company,
          ccy: b.ccy,
          volume,
          grossField: isGrossCode ? net / 0.88 : netField,
          netField,
          otherDeductions: netField - net,
          cogsTraded: b.mfg ? 0 : cogs,
          cogsCosting: b.mfg ? cogs : 0, // 3- and 4-series codes: central costing team files
          fxINR: fxI,
          fxUSD: fxU,
        });
      }
    }
  }
  return rows;
}

export const ROWS = build();

const uniq = (k) => [...new Set(BRANDS.map((b) => b[k]))];
export const DIMENSION_OPTIONS = {
  company: uniq('company'),
  sbu: uniq('sbu'),
  therapy: uniq('therapy'),
  pg: uniq('pg'),
  brand: uniq('brand'),
  dosage: uniq('dosage'),
};
export const DIMENSION_LABELS = {
  company: 'Company Code',
  sbu: 'SBU',
  therapy: 'Therapy Area',
  pg: 'Product Group',
  brand: 'Brand',
  dosage: 'Dosage Form',
};
