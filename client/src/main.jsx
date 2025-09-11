import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import PractitionerDashboard from './pages/PractitionerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function AppRoutes(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><RoleRouter /></RequireAuth>} />
    </Routes>
  );
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRouter(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <div>No user</div>;
  if (user.role === 'patient') return <PatientDashboard />;
  if (user.role === 'practitioner') return <PractitionerDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <div>Role not supported</div>;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
