import { useState } from 'react';
import Layout from '../components/Layout';
import {
  currentUser, getUserTransactions, updateUser, monthKey, thisMonthKey, fmtMoney, monthLabel,
} from '../utils/storage';

export default function Goals() {
  const [user, setUser] = useState(currentUser());
  const [goal, setGoal] = useState(user.savingsGoal || '');
  const [income, setIncome] = useState(user.monthlyIncome || '');
  const [savedMsg, setSavedMsg] = useState(false);

  const tx = getUserTransactions(user.id);
  const mKey = thisMonthKey();
  const txMonth = tx.filter((t) => monthKey(t.date) === mKey);
  const extraIncome = txMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = txMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = (Number(user.monthlyIncome) || 0) + extraIncome;
  const saved = totalIncome - expense;
  const goalNum = Number(user.savingsGoal) || 0;
  const pct = goalNum > 0 ? Math.max(0, Math.min(100, Math.round((saved / goalNum) * 100))) : 0;

  const months = Array.from(new Set([...tx.map((t) => monthKey(t.date)), mKey])).sort().reverse().slice(0, 6);

  const onSubmit = (e) => {
    e.preventDefault();
    const updated = updateUser(user.id, { savingsGoal: Number(goal) || 0, monthlyIncome: Number(income) || 0 });
    if (updated) setUser(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Goals &amp; monthly summary</h1>
          <p>Set a savings target and see how each month closed out.</p>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>This month's savings</h2></div>
          <p className="muted" style={{ margin: '0 0 4px' }}>Saved so far</p>
          <h1 className="figure">{fmtMoney(saved)}</h1>
          <p className="muted" style={{ margin: '2px 0 0' }}>Goal: {goalNum ? fmtMoney(goalNum) : 'not set'}</p>
          <div className="progress-track">
            <div className={'progress-fill' + (saved < 0 ? ' over' : '')} style={{ width: pct + '%' }} />
          </div>
          <p className="muted" style={{ margin: 0 }}>
            {goalNum > 0 ? pct + "% of this month's goal" : 'Set a monthly goal below to track progress.'}
          </p>

          <form onSubmit={onSubmit} style={{ marginTop: 22 }}>
            <div className="field">
              <label htmlFor="incomeInput">Average monthly income (₹)</label>
              <input type="number" id="incomeInput" min="0" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="goalInput">Monthly savings goal (₹)</label>
              <input type="number" id="goalInput" min="0" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <button type="submit" className="btn">Save goal</button>
            {savedMsg && <span className="muted" style={{ marginLeft: 10 }}>Saved.</span>}
          </form>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Monthly summary</h2></div>
          <table>
            <thead><tr><th>Month</th><th className="right">Income</th><th className="right">Expenses</th><th className="right">Net</th></tr></thead>
            <tbody>
              {months.map((m) => {
                const rows = tx.filter((t) => monthKey(t.date) === m);
                const inc = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
                  + (m === mKey ? (Number(user.monthlyIncome) || 0) : 0);
                const exp = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                const net = inc - exp;
                return (
                  <tr key={m}>
                    <td>{monthLabel(m)}</td>
                    <td className="right figure">{fmtMoney(inc)}</td>
                    <td className="right figure">{fmtMoney(exp)}</td>
                    <td className={'right figure ' + (net >= 0 ? 'amt-income' : 'amt-expense')}>{fmtMoney(net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
