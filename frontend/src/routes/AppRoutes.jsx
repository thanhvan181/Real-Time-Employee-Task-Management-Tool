import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '../features/SignInPage';
import ManageEmployee from '../features/ManageEmployee';
import MessagePage from '../components/ChatMessage';

function getRole() {
  const phone = localStorage.getItem('phone');
  const email = sessionStorage.getItem('email') || localStorage.getItem('email');
  if (phone) return 'admin';
  if (email) return 'user';
  return null;
}

function AdminRoute({ children }) {
  const role = getRole();
  if (role === 'admin') return children;
  if (role === 'user') return <Navigate to="/messages" replace />;
  return <Navigate to="/" replace />;
}

function UserRoute({ children }) {
  const role = getRole();
  if (role === 'user') return children;
  if (role === 'admin') return <Navigate to="/manage" replace />;
  return <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignInPage />} />
      <Route path="/manage" element={<AdminRoute><ManageEmployee /></AdminRoute>} />
      <Route path="/messages" element={<UserRoute><MessagePage /></UserRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
