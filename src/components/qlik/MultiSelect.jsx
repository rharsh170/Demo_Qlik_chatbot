import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MultiSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const text = value.length === 0 ? `All ${label}` : value.length === 1 ? value[0] : `${value.length} selected`;

  return (
    <div className="ms" ref={ref}>
      <button type="button" className={`ms-btn ${value.length ? 'has' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={label}>
        <span>{text}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="ms-list">
          {options.map((o) => (
            <label key={o}>
              <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
