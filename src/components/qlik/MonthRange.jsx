import * as RDP from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// react-datepicker ships CommonJS; unwrap the default export whichever way the bundler exposes it
const DatePicker = RDP.default?.default ?? RDP.default ?? RDP.DatePicker;

const MIN = new Date(2024, 3, 1);
const MAX = new Date(2026, 8, 1);

// Month-granular calendar range picker (Qlik-style "calendar filter").
export default function MonthRange({ from, to, onChange, fromLabel = 'From', toLabel = 'To' }) {
  return (
    <div className="dp-row">
      <div>
        <label>{fromLabel}</label>
        <DatePicker selected={from} onChange={(d) => d && onChange({ from: d, to: d > to ? d : to })} dateFormat="MMM yyyy" showMonthYearPicker minDate={MIN} maxDate={MAX} className="dp-input" popperPlacement="bottom-start" />
      </div>
      <div>
        <label>{toLabel}</label>
        <DatePicker selected={to} onChange={(d) => d && onChange({ from: d < from ? d : from, to: d })} dateFormat="MMM yyyy" showMonthYearPicker minDate={MIN} maxDate={MAX} className="dp-input" popperPlacement="bottom-end" />
      </div>
    </div>
  );
}

export const PRESETS = [
  { id: 'mtd', label: 'MTD', from: new Date(2026, 8, 1), to: new Date(2026, 8, 1) },
  { id: 'qtd', label: 'QTD', from: new Date(2026, 6, 1), to: new Date(2026, 8, 1) },
  { id: 'ytd', label: 'YTD', from: new Date(2026, 3, 1), to: new Date(2026, 8, 1) },
  { id: 'lfy', label: 'Last FY', from: new Date(2025, 3, 1), to: new Date(2026, 2, 1) },
  { id: 'all', label: 'All', from: MIN, to: MAX },
];
