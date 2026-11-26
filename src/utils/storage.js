/* =========================================================
   Budget Planner — storage.js
   A tiny localStorage "database" shared by every page.
   Keys:
     bp_users        -> array of user records
     bp_categories   -> array of category records
     bp_transactions -> array of transaction records
     bp_session      -> { userId } of the signed-in account
========================================================= */

export const DB_KEYS = {
  users: 'bp_users',
  categories: 'bp_categories',
  transactions: 'bp_transactions',
  session: 'bp_session'
};

export function uid(prefix){
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function readJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    console.error('Storage read failed for', key, e);
    return fallback;
  }
}

export function writeJSON(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }catch(e){
    console.error('Storage write failed for', key, e);
    return false;
  }
}

/* ---------- seed data on first run ---------- */
/* Ships with two example accounts so every screen has real
   numbers to look at: Priya (healthy budget) and Rahul
   (an overspending example), plus 3 months of transactions each. */

export function monthsBackDate(monthsBack, day){
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0');
  return y + '-' + m + '-' + String(day).padStart(2, '0');
}

export function seedData(){
  if(localStorage.getItem('bp_seeded_v2')) return; // already seeded, don't overwrite user edits
  writeJSON('bp_seeded_v2', true);

  const categories = [
    { id: uid('cat'), name: 'Housing',       cap: 15000, color: '#1E2A38' },
    { id: uid('cat'), name: 'Food',          cap: 8000,  color: '#3F6E52' },
    { id: uid('cat'), name: 'Transport',     cap: 4000,  color: '#B7893F' },
    { id: uid('cat'), name: 'Utilities',     cap: 3500,  color: '#45566B' },
    { id: uid('cat'), name: 'Health',        cap: 3000,  color: '#8A9AAC' },
    { id: uid('cat'), name: 'Entertainment', cap: 2500,  color: '#B3492D' },
    { id: uid('cat'), name: 'Other',         cap: 0,     color: '#C9BFA5' }
  ];
  writeJSON(DB_KEYS.categories, categories);

  const admin = {
    id: uid('usr'), name: 'Admin', email: 'admin@budget.com', password: 'admin123',
    role: 'admin', savingsGoal: 0, createdAt: new Date().toISOString()
  };
  const priya = {
    id: uid('usr'), name: 'Priya Sharma', email: 'priya@example.com', password: 'demo1234',
    role: 'user', monthlyIncome: 45000, savingsGoal: 8000, createdAt: new Date().toISOString()
  };
  const rahul = {
    id: uid('usr'), name: 'Rahul Verma', email: 'rahul@example.com', password: 'demo1234',
    role: 'user', monthlyIncome: 35000, savingsGoal: 5000, createdAt: new Date().toISOString()
  };
  writeJSON(DB_KEYS.users, [admin, priya, rahul]);

  const tx = [];
  function add(userId, type, category, amount, monthsBack, day, note){
    tx.push({ id: uid('tx'), userId, type, category, amount, date: monthsBackDate(monthsBack, day), note: note || '' });
  }

  // Priya — stays under her category caps and her savings goal, most months.
  [2, 1, 0].forEach(function(mb){
    add(priya.id, 'expense', 'Housing', 15000, mb, 2, 'Rent');
    add(priya.id, 'expense', 'Food', 5200 + mb * 150, mb, 6, 'Groceries');
    add(priya.id, 'expense', 'Transport', 2600, mb, 9, 'Metro pass');
    add(priya.id, 'expense', 'Utilities', 2900, mb, 11, 'Electricity + wifi');
    add(priya.id, 'expense', 'Entertainment', 1400, mb, 15, 'Movies, subscriptions');
    add(priya.id, 'expense', 'Health', 900, mb, 18, 'Pharmacy');
  });
  add(priya.id, 'income', 'Other', 6000, 1, 20, 'Freelance design work');

  // Rahul — over his Food, Transport and Entertainment caps this month,
  // and total expenses have crept past his income (the overspend alert).
  add(rahul.id, 'expense', 'Housing', 15000, 2, 3, 'Rent');
  add(rahul.id, 'expense', 'Food', 7200, 2, 8, 'Groceries + eating out');
  add(rahul.id, 'expense', 'Transport', 3600, 2, 10, 'Fuel + cab rides');
  add(rahul.id, 'expense', 'Utilities', 3100, 2, 12, 'Electricity + phone');
  add(rahul.id, 'expense', 'Entertainment', 2100, 2, 16, 'Streaming, outings');

  add(rahul.id, 'expense', 'Housing', 15000, 1, 3, 'Rent');
  add(rahul.id, 'expense', 'Food', 8400, 1, 7, 'Groceries + eating out');
  add(rahul.id, 'expense', 'Transport', 4300, 1, 9, 'Fuel + cab rides');
  add(rahul.id, 'expense', 'Utilities', 3400, 1, 12, 'Electricity + phone');
  add(rahul.id, 'expense', 'Entertainment', 2600, 1, 17, 'Streaming, concert');

  add(rahul.id, 'expense', 'Housing', 15000, 0, 3, 'Rent');
  add(rahul.id, 'expense', 'Food', 9500, 0, 6, 'Groceries + eating out');
  add(rahul.id, 'expense', 'Transport', 4500, 0, 8, 'Fuel + cab rides');
  add(rahul.id, 'expense', 'Utilities', 3600, 0, 10, 'Electricity + phone');
  add(rahul.id, 'expense', 'Entertainment', 3200, 0, 14, 'Streaming, weekend trip');
  add(rahul.id, 'expense', 'Health', 2000, 0, 16, 'Dental checkup');

  writeJSON(DB_KEYS.transactions, tx);
}

/* ---------- users ---------- */

export function getUsers(){ return readJSON(DB_KEYS.users, []); }
export function saveUsers(list){ return writeJSON(DB_KEYS.users, list); }

export function findUserByEmail(email){
  return getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
}
export function findUserById(id){
  return getUsers().find(u => u.id === id);
}
export function addUser(user){
  const list = getUsers();
  list.push(user);
  saveUsers(list);
  return user;
}
export function updateUser(id, patch){
  const list = getUsers();
  const idx = list.findIndex(u => u.id === id);
  if(idx === -1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  saveUsers(list);
  return list[idx];
}
export function deleteUser(id){
  saveUsers(getUsers().filter(u => u.id !== id));
  saveTransactions(getTransactions().filter(t => t.userId !== id));
}

/* ---------- categories ---------- */

export function getCategories(){ return readJSON(DB_KEYS.categories, []); }
export function saveCategories(list){ return writeJSON(DB_KEYS.categories, list); }
export function addCategory(cat){
  const list = getCategories();
  list.push(cat);
  saveCategories(list);
  return cat;
}
export function deleteCategory(id){
  saveCategories(getCategories().filter(c => c.id !== id));
}

/* ---------- transactions ---------- */

export function getTransactions(){ return readJSON(DB_KEYS.transactions, []); }
export function saveTransactions(list){ return writeJSON(DB_KEYS.transactions, list); }
export function getUserTransactions(userId){
  return getTransactions().filter(t => t.userId === userId);
}
export function addTransaction(tx){
  const list = getTransactions();
  list.push(tx);
  saveTransactions(list);
  return tx;
}
export function updateTransaction(id, patch){
  const list = getTransactions();
  const idx = list.findIndex(t => t.id === id);
  if(idx === -1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  saveTransactions(list);
  return list[idx];
}
export function deleteTransaction(id){
  saveTransactions(getTransactions().filter(t => t.id !== id));
}

/* ---------- session ---------- */

export function getSession(){ return readJSON(DB_KEYS.session, null); }
export function setSession(userId){ writeJSON(DB_KEYS.session, { userId }); }
export function clearSession(){ localStorage.removeItem(DB_KEYS.session); }
export function currentUser(){
  const s = getSession();
  return s ? findUserById(s.userId) : null;
}

/* ---------- helpers ---------- */

export function fmtMoney(n){
  const num = Number(n) || 0;
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
export function monthKey(dateStr){ return String(dateStr).slice(0, 7); } // yyyy-mm
export function thisMonthKey(){ return new Date().toISOString().slice(0, 7); }

seedData();

export function monthLabel(mKey){
  const [y, m] = mKey.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
export function monthLabelShort(mKey){
  const [y, m] = mKey.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
