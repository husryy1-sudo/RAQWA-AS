import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';
import { QRRedirect } from './components/QRRedirect';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/info" element={<HomePage />} />
        <Route path="/qr/:shortCode" element={<QRRedirect />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/" element={<Navigate to="/info" replace />} />
        <Route path="*" element={<Navigate to="/info" replace />} />
      </Routes>
    </Router>
  );
}

const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AdminPanel /> : <AdminLogin />;
};

export default App;
