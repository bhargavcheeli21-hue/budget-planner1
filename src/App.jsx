import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Admin from './pages/Admin';
import RequireRole from './components/RequireRole';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<RequireRole role="user"><Dashboard /></RequireRole>} />
      <Route path="/transactions" element={<RequireRole role="user"><Transactions /></RequireRole>} />
      <Route path="/goals" element={<RequireRole role="user"><Goals /></RequireRole>} />
      <Route path="/admin" element={<RequireRole role="admin"><Admin /></RequireRole>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
