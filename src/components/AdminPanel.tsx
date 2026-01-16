import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardHome } from './admin/DashboardHome';
import { QRCodeManager } from './QRCodeManager';
import { SocialLinksPage } from './admin/SocialLinksPage';
import { SettingsPage } from './admin/SettingsPage';

export const AdminPanel: React.FC = () => {
  return (
    <AdminLayout title="Admin Dashboard">
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/qrcodes" element={<QRCodeManager />} />
        <Route path="/social" element={<SocialLinksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};
