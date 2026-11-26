import { Link } from 'react-router-dom';

const FEATURES = [
  ['📊', 'Visual spending breakdown', 'A category-by-category pie chart shows exactly where your money went this month.'],
  ['🎯', 'Savings goals', 'Set a monthly target and track real-time progress as income and expenses come in.'],
  ['🔔', 'Overspend alerts', 'Get a clear warning the moment a category — or your whole budget — goes over.'],
  ['🛠️', 'Admin controls', 'Admins manage categories, spending caps, and every registered user from one dashboard.'],
];

export default function Home() {
  return (
    <div className="home-shell">
      <div className="home-nav">
        <div className="mark">Budget Planner</div>
        <div className="actions">
          <Link to="/login" className="btn ghost small">Sign in</Link>
          <Link to="/register" className="btn switch small">Create account</Link>
        </div>
      </div>

      <div className="home-hero">
        <h1>Know where every rupee goes.</h1>
        <p>Track income and expenses, set savings goals, and catch overspending before it happens — a simple ledger for your everyday finances.</p>
        <div className="home-cta">
          <Link to="/register" className="btn">Get started — it's free</Link>
          <Link to="/login" className="btn ghost">I already have an account</Link>
        </div>
      </div>

      <div className="home-features">
        {FEATURES.map(([icon, title, text]) => (
          <div className="feature-card" key={title}>
            <div className="icon">{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <div className="home-footer">Demo admin login — admin@budget.com / admin123</div>
    </div>
  );
}
