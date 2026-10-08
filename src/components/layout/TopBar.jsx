import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/lupin-mark.png';

export default function TopBar({ ccy, setCcy }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const initials = user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const signOut = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <header className="topbar">
      <img className="logo" src={logo} alt="Lupin" />
      <span className="sep" />
      <div>
        <div className="title">Insights Hub</div>
        <div className="crumb">Commercial Performance</div>
      </div>
      <span className="spacer" />
      <div className="seg" role="group" aria-label="Display currency">
        {['INR', 'USD'].map((c) => (
          <button key={c} className={ccy === c ? 'on' : ''} onClick={() => setCcy(c)}>{c}</button>
        ))}
      </div>
      <div className="user" ref={ref}>
        <button className="user-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span className="avatar">{initials}</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="menu">
            <div className="who"><b>{user.name}</b><span>{user.email}</span></div>
            <button onClick={signOut}><LogOut size={16} /> Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}
