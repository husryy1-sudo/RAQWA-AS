import React from 'react';
import { QRAnalyticsSummary } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Monitor, 
  Calendar,
  Clock
} from 'lucide-react';

interface QRAnalyticsDashboardProps {
  summary: QRAnalyticsSummary;
  qrName: string;
}

const COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const QRAnalyticsDashboard: React.FC<QRAnalyticsDashboardProps> = ({ summary, qrName }) => {
  const formatLastScanTime = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Analytics for "{qrName}"</h3>
        <p className="text-gray-600">Comprehensive scan analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-pink-100 text-sm">Total Scans</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{summary.totalScans.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-pink-200 self-end sm:self-auto" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-blue-100 text-sm">Today</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{summary.todayScans}</p>
            </div>
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-200 self-end sm:self-auto" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-green-100 text-sm">This Week</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{summary.weekScans}</p>
            </div>
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-200 self-end sm:self-auto" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div>
              <p className="text-purple-100 text-sm">This Month</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{summary.monthScans}</p>
            </div>
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-200 self-end sm:self-auto" />
          </div>
        </div>
      </div>

      {/* Last Scan Info */}
      <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">Last scan:</span>
          <span className="text-sm font-medium text-gray-800">
            {formatLastScanTime(summary.lastScanTime)}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Scans Over Time */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Scans Over Time (30 Days)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={summary.scansByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="scans" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ec4899', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Top Countries
          </h4>
          {summary.topCountries.length > 0 ? (
            <div className="space-y-3">
              {summary.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-pink-600">#{index + 1}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full" 
                        style={{ width: `${(country.count / summary.totalScans) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{country.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No location data available</p>
          )}
        </div>

        {/* Device Types */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Device Types
          </h4>
          {summary.topDevices.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={summary.topDevices}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="device"
                >
                  {summary.topDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No device data available</p>
          )}
          {summary.topDevices.length > 0 && (
            <div className="mt-4 space-y-2">
              {summary.topDevices.map((device, index) => (
                <div key={device.device} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{device.device}</span>
                  <span className="text-sm font-medium text-gray-800">({device.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Browsers */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Top Browsers
          </h4>
          {summary.topBrowsers.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summary.topBrowsers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#666" />
                <YAxis 
                  type="category" 
                  dataKey="browser" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  width={50}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No browser data available</p>
          )}
        </div>
      </div>
    </div>
  );
};