import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LayoutDashboard, MessageSquareText, ShieldCheck, Loader2 } from 'lucide-react';
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/lupin-mark.png';

export default function LoginPage() {
  const { user, login, loginSso } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setBusy('login');
    const res = await login(email, password, remember);
    setBusy(null);
    if (res.ok) navigate('/dashboard', { replace: true });
    else setError(res.error);
  };

  const sso = async () => {
    setBusy('sso');
    await loginSso();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="login">
      <section className="login-hero">
        <img src={logo} alt="Lupin" width="87" height="106" />
        <div>
          <h1>Lupin Insights Hub</h1>
          <p className="tag">Advancing Care for All</p>
          <ul className="login-points">
            <li><span className="dot"><LayoutDashboard size={16} /></span>Your Qlik dashboards, embedded exactly as they are</li>
            <li><span className="dot"><MessageSquareText size={16} /></span>Ask questions about any report in plain English</li>
            <li><span className="dot"><ShieldCheck size={16} /></span>Single sign-on and role-based access to your data</li>
          </ul>
        </div>
        <div className="login-foot">Demo environment. All figures shown are illustrative.</div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit} noValidate>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to Lupin Insights Hub</p>
          {error && <div className="err" role="alert">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className={`input ${error && !email ? 'invalid' : ''}`} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@lupin.com" />
          </div>
          <div className="field">
            <label htmlFor="pw">Password</label>
            <div className="input-wrap">
              <input id="pw" className={`input ${error && !password ? 'invalid' : ''}`} type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              <button type="button" className="icon-btn toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="row-between">
            <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />Remember me</label>
            <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={!!busy}>
            {busy === 'login' ? <><Loader2 size={16} className="spin" /> Signing in…</> : 'Sign in'}
          </button>
          <div className="divider">or</div>
          <button className="btn btn-ghost w-full" type="button" onClick={sso} disabled={!!busy}>
            {busy === 'sso' ? <><Loader2 size={16} className="spin" /> Redirecting…</> : 'Sign in with Lupin SSO'}
          </button>
          <div className="hint">
            Demo credentials<br />
            Email <code>{DEMO_EMAIL}</code> &nbsp; Password <code>{DEMO_PASSWORD}</code>
          </div>
        </form>
      </section>
    </div>
  );
}
