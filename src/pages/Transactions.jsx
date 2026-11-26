import { useState } from 'react';
import Layout from '../components/Layout';
import {
  currentUser, getCategories, getTransactions, getUserTransactions, addTransaction,
  updateTransaction, deleteTransaction, uid, monthKey, fmtMoney, monthLabelShort,
} from '../utils/storage';

const today = () => new Date().toISOString().slice(0, 10);

export default function Transactions() {
  const user = currentUser();
  const categories = getCategories();
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  const emptyForm = { type: 'expense', category: categories[0]?.name || '', amount: '', date: today(), note: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', month: '' });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  const all = getUserTransactions(user.id);
  const months = Array.from(new Set(all.map((t) => monthKey(t.date)))).sort().reverse();

  let rows = all;
  if (filters.type) rows = rows.filter((t) => t.type === filters.type);
  if (filters.category) rows = rows.filter((t) => t.category === filters.category);
  if (filters.month) rows = rows.filter((t) => monthKey(t.date) === filters.month);
  rows = rows.slice().sort((a, b) => b.date.localeCompare(a.date));

  const reset = () => { setEditingId(null); setForm(emptyForm); };

  const onSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0 || !form.date) { alert('Enter a valid amount and date.'); return; }
    const data = { type: form.type, category: form.category, amount, date: form.date, note: form.note.trim() };
    if (editingId) updateTransaction(editingId, data);
    else addTransaction({ id: uid('tx'), userId: user.id, ...data });
    reset();
    refresh();
  };

  const startEdit = (id) => {
    const tx = getTransactions().find((t) => t.id === id);
    if (!tx) return;
    setEditingId(id);
    setForm({ type: tx.type, category: tx.category, amount: tx.amount, date: tx.date, note: tx.note || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = (id) => {
    if (confirm('Delete this transaction?')) { deleteTransaction(id); refresh(); }
  };

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1>Transactions</h1>
          <p>Log income and expenses, then filter to find anything.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>{editingId ? 'Edit transaction' : 'Add a transaction'}</h2></div>
        <form className="inline-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="txType">Type</label>
            <select id="txType" value={form.type} onChange={set('type')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="txCategory">Category</label>
            <select id="txCategory" value={form.category} onChange={set('category')}>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="txAmount">Amount (₹)</label>
            <input type="number" id="txAmount" min="1" required value={form.amount} onChange={set('amount')} />
          </div>
          <div className="field">
            <label htmlFor="txDate">Date</label>
            <input type="date" id="txDate" required value={form.date} onChange={set('date')} />
          </div>
          <div className="field">
            <label htmlFor="txNote">Note</label>
            <input type="text" id="txNote" placeholder="Optional" value={form.note} onChange={set('note')} />
          </div>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn">{editingId ? 'Save changes' : 'Add entry'}</button>
            {editingId && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>History</h2></div>
        <div className="filters">
          <select value={filters.type} onChange={setF('type')}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={setF('category')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={filters.month} onChange={setF('month')}>
            <option value="">All months</option>
            {months.map((m) => <option key={m} value={m}>{monthLabelShort(m)}</option>)}
          </select>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th className="right">Amount</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="empty-row"><td colSpan="6">No transactions match these filters.</td></tr>
            ) : rows.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td className="chip">{t.type}</td>
                <td>{t.category}</td>
                <td>{t.note || '—'}</td>
                <td className={(t.type === 'income' ? 'amt-income' : 'amt-expense') + ' right figure'}>
                  {t.type === 'income' ? '+ ' : '– '}{fmtMoney(t.amount)}
                </td>
                <td className="actions">
                  <button onClick={() => startEdit(t.id)}>Edit</button>
                  <button onClick={() => onDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
