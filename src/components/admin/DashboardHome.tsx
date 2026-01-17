import React from 'react';
import { DashboardStats } from './DashboardStats';
import { QRCodeManager } from '../QRCodeManager';

export const DashboardHome: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                    <p className="text-gray-500 mt-1">Welcome back to your dashboard</p>
                </div>
            </div>

            <DashboardStats />

            {/* Quick Actions / Recent QRs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent QR Codes</h3>
                <QRCodeManager />
            </div>
        </div>
    );
};

