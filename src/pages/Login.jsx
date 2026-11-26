import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { findUserByEmail, setSession } from '../utils/storage';

export default function Login() {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = findUserByEmail(email.trim());
    if (!user || user.password !== password) {
      setError("That email or password doesn't match our records.");
      return;
    }
    if (user.role !== role) {
      setError('This account is not registered as ' + role + '. Switch tabs and try again.');
      return;
    }
    setSession(user.id);
    navigate(role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>&larr; Back to home</Link>
        <div className="auth-mark">Budget Planner</div>
        <h1>Sign in</h1>
        <p className="auth-sub">Keep your income, spending, and savings goals in one ledger.</p>

        <div className="tabs">
          <button type="button" className={role === 'user' ? 'active' : ''} onClick={() => setRole('user')}>User</button>
          <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
        </div>

        {error && <div className="error-msg show">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="loginEmail">Email</label>
            <input type="email" id="loginEmail" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="loginPassword">Password</label>
            <input type="password" id="loginPassword" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn block">Sign in</button>
        </form>

        <p className="form-note">New here? <Link to="/register">Create a user account</Link></p>

        <div className="hint-box">
          Demo admin login — email <strong>admin@budget.com</strong>, password <strong>admin123</strong>.
        </div>
      </div>
    </div>
  );
}
