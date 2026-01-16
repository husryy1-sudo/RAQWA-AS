import React from 'react';
import { QrCode, Share2, BarChart2, TrendingUp } from 'lucide-react';

export const DashboardStats: React.FC = () => {
    const stats = [
        {
            label: 'Total QR Codes',
            value: '12',
            change: '+2.5%',
            isPositive: true,
            icon: QrCode,
            color: 'bg-blue-500'
        },
        {
            label: 'Active Links',
            value: '8',
            change: '+12%',
            isPositive: true,
            icon: Share2,
            color: 'bg-green-500'
        },
        {
            label: 'Total Scans',
            value: '1,234',
            change: '+18.2%',
            isPositive: true,
            icon: BarChart2,
            color: 'bg-purple-500'
        },
        {
            label: 'Engagement Rate',
            value: '24%',
            change: '-1.2%',
            isPositive: false,
            icon: TrendingUp,
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                            <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {stat.change}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">from last month</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
