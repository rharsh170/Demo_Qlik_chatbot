import { useMemo } from 'react';
import { aggregate, filterRows, fmtMoney, fmtNum, groupAgg } from '../../../data/kpi.js';
import { fxRates } from '../../../data/mockData.js';
import { BarBox, DataTable } from '../../Charts.jsx';
import ChartCard from '../ChartCard.jsx';

const dateToM = (d) => (d.getFullYear() - 2024) * 12 + d.getMonth() - 3;

export default function CurrencySheet({ filters, onAsk }) {
  const d = useMemo(() => {
    const rows = filterRows(filters);
    const inr = groupAgg(rows, 'sbu', 'INR'), usd = groupAgg(rows, 'sbu', 'USD');
    const byCompany = groupAgg(rows, 'company', 'INR').map((x) => {
      const rs = rows.filter((r) => r.company === x.name);
      const u = aggregate(rs, 'USD');
      const local = rs.reduce((s, r) => s + r.netField - r.otherDeductions, 0);
      return { ...x, usd: u, local, ccy: rs[0].ccy, sbu: rs[0].sbu };
    });
    const mEnd = dateToM(filters.to), mStart = dateToM(filters.from);
    const rEnd = fxRates(mEnd), rStart = fxRates(mStart);
    const chart = (arr) => arr.map((x) => ({ name: x.name, net: Math.round(x.net), cogs: Math.round(x.cogs), margin: Math.round(x.margin) }));
    return { inrChart: chart(inr), usdChart: chart(usd), byCompany, rEnd, rStart, total: { inr: aggregate(rows, 'INR'), usd: aggregate(rows, 'USD') } };
  }, [filters]);

  const series = [{ key: 'net', label: 'Net Sales' }, { key: 'cogs', label: 'COGS' }, { key: 'margin', label: 'Margin' }];
  const fmt = (v) => v.toLocaleString('en-IN');

  return (
    <>
      <div className="grid-2e">
        <ChartCard title="Net Sales, COGS and Margin in INR" subtitle="₹ Cr, by SBU (Local currency → INR)" question="Show net sales, COGS and margin for US Generics in INR and USD" onAsk={onAsk}>
          <BarBox data={d.inrChart} series={series} unit="₹ Cr" fmt={fmt} />
        </ChartCard>
        <ChartCard title="Net Sales, COGS and Margin in USD" subtitle="$ M, by SBU (Local currency → USD)" question="Show net sales, COGS and margin for US Generics in INR and USD" onAsk={onAsk}>
          <BarBox data={d.usdChart} series={series} unit="$ M" fmt={fmt} />
        </ChartCard>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.8fr 1fr' }}>
        <ChartCard title="Company code view" subtitle="Local currency values converted with the monthly conversion rate">
          <DataTable
            columns={[
              { key: 'name', label: 'Company' }, { key: 'sbu', label: 'SBU' }, { key: 'ccy', label: 'Local ccy' }, { key: 'local', label: 'Net Sales (local M)', align: 'right' },
              { key: 'ni', label: 'Net Sales ₹', align: 'right' }, { key: 'nu', label: 'Net Sales $', align: 'right' },
              { key: 'ci', label: 'COGS ₹', align: 'right' }, { key: 'cu', label: 'COGS $', align: 'right' },
              { key: 'mi', label: 'Margin ₹', align: 'right' }, { key: 'mu', label: 'Margin $', align: 'right' },
            ]}
            rows={[
              ...d.byCompany.map((x) => ({
                name: x.name, sbu: x.sbu, ccy: x.ccy, local: fmtNum(x.local, 0),
                ni: fmtMoney(x.net, 'INR'), nu: fmtMoney(x.usd.net, 'USD'), ci: fmtMoney(x.cogs, 'INR'), cu: fmtMoney(x.usd.cogs, 'USD'), mi: fmtMoney(x.margin, 'INR'), mu: fmtMoney(x.usd.margin, 'USD'),
              })),
              { name: <b>Total</b>, sbu: '', ccy: '', local: '', ni: <b>{fmtMoney(d.total.inr.net, 'INR')}</b>, nu: <b>{fmtMoney(d.total.usd.net, 'USD')}</b>, ci: <b>{fmtMoney(d.total.inr.cogs, 'INR')}</b>, cu: <b>{fmtMoney(d.total.usd.cogs, 'USD')}</b>, mi: <b>{fmtMoney(d.total.inr.margin, 'INR')}</b>, mu: <b>{fmtMoney(d.total.usd.margin, 'USD')}</b> },
            ]}
          />
        </ChartCard>
        <ChartCard title="Conversion rates" subtitle="Period end vs period start">
          <DataTable
            columns={[{ key: 'c', label: 'Currency' }, { key: 'i', label: '→ INR', align: 'right' }, { key: 'u', label: '→ USD', align: 'right' }, { key: 'chg', label: 'vs start', align: 'right' }]}
            rows={d.rEnd.map((r, i) => {
              const chg = ((r.toINR / d.rStart[i].toINR - 1) * 100);
              return { c: r.ccy, i: r.toINR.toFixed(2), u: r.toUSD.toFixed(4), chg: <span className={`delta ${chg >= 0 ? 'pos' : 'neg'}`}>{chg >= 0 ? '+' : ''}{chg.toFixed(1)}%</span> };
            })}
          />
        </ChartCard>
      </div>
    </>
  );
}
