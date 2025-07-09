import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

const AdminRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <AdminPanel /> : <AdminLogin />;
};

export default App;