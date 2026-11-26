import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUser, findUserByEmail, setSession, uid } from '../utils/storage';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', income: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email || form.password.length < 4) {
      setError('Fill in every field. Password needs at least 4 characters.');
      return;
    }
    if (findUserByEmail(email)) {
      setError('An account with that email already exists.');
      return;
    }
    const user = addUser({
      id: uid('usr'), name, email, password: form.password, role: 'user',
      monthlyIncome: Number(form.income) || 0, savingsGoal: 0,
      createdAt: new Date().toISOString(),
    });
    setSession(user.id);
    navigate('/dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" style={{ display: 'inline-block', marginBottom: 18, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>&larr; Back to home</Link>
        <div className="auth-mark">Budget Planner</div>
        <h1>Create your account</h1>
        <p className="auth-sub">Set up a personal ledger for income, expenses, and goals.</p>

        {error && <div className="error-msg show">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="regName">Full name</label>
            <input type="text" id="regName" required placeholder="Asha Rao" value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="regEmail">Email</label>
            <input type="email" id="regEmail" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label htmlFor="regPassword">Password</label>
            <input type="password" id="regPassword" required placeholder="At least 4 characters" value={form.password} onChange={set('password')} />
          </div>
          <div className="field">
            <label htmlFor="regIncome">Average monthly income (optional)</label>
            <input type="number" id="regIncome" min="0" placeholder="e.g. 40000" value={form.income} onChange={set('income')} />
          </div>
          <button type="submit" className="btn block">Create account</button>
        </form>

        <p className="form-note">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
