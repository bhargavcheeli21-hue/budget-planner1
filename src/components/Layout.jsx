import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession, currentUser } from '../utils/storage';

const USER_LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/goals', label: 'Goals & summary' },
];
const ADMIN_LINKS = [{ to: '/admin', label: 'Overview & management' }];

export default function Layout({ children }) {
  const user = currentUser();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  const logout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="rail-mark">Budget Planner</div>
        <div className="rail-sub">{isAdmin ? 'Admin module' : 'User module'}</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="rail-user">
          <div className="name">{user?.name || '—'}</div>
          <div className="role">{isAdmin ? 'Administrator' : 'Account holder'}</div>
          <button className="btn switch small block" onClick={logout}>Switch Account</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
