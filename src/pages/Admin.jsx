import { useState } from 'react';
import Layout from '../components/Layout';
import PieChart from '../components/PieChart';
import {
  getUsers, getTransactions, getCategories, getUserTransactions, addCategory, deleteCategory,
  deleteUser, uid, monthKey, thisMonthKey, fmtMoney,
} from '../utils/storage';

const PALETTE = ['#1E2A38', '#3F6E52', '#B7893F', '#45566B', '#8A9AAC', '#B3492D', '#C9BFA5', '#6E4E9E'];

export default function Admin() {
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const [catName, setCatName] = useState('');
  const [catCap, setCatCap] = useState('');

  const users = getUsers().filter((u) => u.role === 'user');
  const categories = getCategories();
  const txMonth = getTransactions().filter((t) => monthKey(t.date) === thisMonthKey());

  const totalIncome = txMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    + users.reduce((s, u) => s + (Number(u.monthlyIncome) || 0), 0);
  const totalExpense = txMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const byCat = {};
  txMonth.filter((t) => t.type === 'expense').forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  });
  const slices = categories.map((c) => ({ name: c.name, value: byCat[c.name] || 0, color: c.color })).filter((s) => s.value > 0);

  const onAddCat = (e) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;
    addCategory({ id: uid('cat'), name, cap: Number(catCap) || 0, color: PALETTE[Math.floor(Math.random() * PALETTE.length)] });
    setCatName(''); setCatCap('');
    refresh();
  };

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>System overview</h1>
          <p>Everyone's spending, at a glance, plus account and category controls.</p>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-cell"><div className="label">Registered users</div><div className="value figure">{users.length}</div></div>
        <div className="summary-cell"><div className="label">Income (this month)</div><div className="value figure green">{fmtMoney(totalIncome)}</div></div>
        <div className="summary-cell"><div className="label">Expenses (this month)</div><div className="value figure rust">{fmtMoney(totalExpense)}</div></div>
        <div className="summary-cell"><div className="label">Net</div><div className="value figure gold">{fmtMoney(totalIncome - totalExpense)}</div></div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head"><h2>Spending by category — all users</h2></div>
          <PieChart slices={slices} />
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Categories</h2></div>
          <form className="inline-form" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: 18 }} onSubmit={onAddCat}>
            <div className="field">
              <label htmlFor="catName">Name</label>
              <input type="text" id="catName" required placeholder="e.g. Travel" value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="catCap">Monthly cap (₹)</label>
              <input type="number" id="catCap" min="0" placeholder="0 = no cap" value={catCap} onChange={(e) => setCatCap(e.target.value)} />
            </div>
            <button type="submit" className="btn">Add</button>
          </form>
          <table>
            <thead><tr><th>Category</th><th className="right">Cap</th><th></th></tr></thead>
            <tbody>
              {categories.length === 0 ? (
                <tr className="empty-row"><td colSpan="3">No categories yet.</td></tr>
              ) : categories.map((c) => (
                <tr key={c.id}>
                  <td><span className="cat-swatch" style={{ display: 'inline-block', marginRight: 8, background: c.color }} />{c.name}</td>
                  <td className="right figure">{c.cap ? fmtMoney(c.cap) : 'no cap'}</td>
                  <td className="actions">
                    <button onClick={() => { if (confirm('Delete this category?')) { deleteCategory(c.id); refresh(); } }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Users</h2></div>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th className="right">Total income</th><th className="right">Total expenses</th><th></th></tr></thead>
          <tbody>
            {users.length === 0 ? (
              <tr className="empty-row"><td colSpan="5">No registered users yet.</td></tr>
            ) : users.map((u) => {
              const tx = getUserTransactions(u.id);
              const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              const income = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) + (Number(u.monthlyIncome) || 0);
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="right figure">{fmtMoney(income)}</td>
                  <td className="right figure">{fmtMoney(expense)}</td>
                  <td className="actions">
                    <button onClick={() => { if (confirm('Remove this user and all of their transactions?')) { deleteUser(u.id); refresh(); } }}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
