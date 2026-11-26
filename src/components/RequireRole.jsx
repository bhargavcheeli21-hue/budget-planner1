import { Navigate } from 'react-router-dom';
import { currentUser } from '../utils/storage';

export default function RequireRole({ role, children }) {
  const user = currentUser();
  if (!user || user.role !== role) return <Navigate to="/login" replace />;
  return children;
}
