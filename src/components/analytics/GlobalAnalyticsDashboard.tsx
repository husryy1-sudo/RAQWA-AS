import React, { useEffect, useState } from 'react';
import { AnalyticsService, DailyTrend, DeviceStat, LocationStat } from '../../services/analyticsService';
import { DailyTrendChart, DevicePieChart } from './AnalyticsCharts';
import { RealTimeFeed } from './RealTimeFeed';
import { GeospatialMap } from './GeospatialMap';
import { Smartphone, Activity, Globe } from 'lucide-react';

export const GlobalAnalyticsDashboard: React.FC = () => {
    const [trends, setTrends] = useState<DailyTrend[]>([]);
    const [devices, setDevices] = useState<DeviceStat[]>([]);
    const [locations, setLocations] = useState<LocationStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Dynamic Mock Data generator based on range
    const getMockTrends = (days: number) => {
        return Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            scans: Math.floor(Math.random() * 50) + 10 + (Math.floor(Math.random() * 20))
        }));
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // In a real scenario, we would pass dateRange to the service
                const [trendData, deviceData, locationData] = await Promise.all([
                    AnalyticsService.getDailyTrend(), // Service would accept limit/range
                    AnalyticsService.getTopDevices(),
                    AnalyticsService.getTopLocations()
                ]);

                if (trendData && trendData.length > 0) {
                    setTrends(trendData);
                    setDevices(deviceData);
                    setLocations(locationData);
                    setIsDemoMode(false);
                } else {
                    throw new Error("No data available");
                }
            } catch (error) {
                console.log('Using Mock Data (Demo Mode)');
                setIsDemoMode(true);

                // Generate mock data based on selection
                const days = dateRange === '30d' ? 30 : dateRange === 'today' ? 1 : 7;
                setTrends(getMockTrends(days));

                setDevices([
                    { device: 'iPhone', count: Math.floor(Math.random() * 100) + 50 },
                    { device: 'Android', count: Math.floor(Math.random() * 100) + 40 },
                    { device: 'Windows', count: Math.floor(Math.random() * 50) + 10 },
                    { device: 'Mac', count: Math.floor(Math.random() * 30) + 5 },
                    { device: 'Other', count: Math.floor(Math.random() * 20) }
                ]);

                setLocations([
                    { city: 'Riyadh', country: 'Saudi Arabia', count: Math.floor(Math.random() * 200) + 50 },
                    { city: 'Dubai', country: 'UAE', count: Math.floor(Math.random() * 150) + 40 },
                    { city: 'Cairo', country: 'Egypt', count: Math.floor(Math.random() * 100) + 30 },
                    { city: 'London', country: 'UK', count: Math.floor(Math.random() * 80) + 20 },
                    { city: 'New York', country: 'USA', count: Math.floor(Math.random() * 60) + 10 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dateRange]); // Reload when dateRange changes

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isDemoMode && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Activity className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-bold">Demo Mode Active:</span> You are viewing simulated data.
                                To see real analytics, please execute the provided SQL scripts in your Supabase dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Analytics Intelligence</h2>
                    <p className="text-gray-500">Real-time insights across your QR ecosystem</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                        <option value="30d">Last 30 Days</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="today">Today</option>
                    </select>
                </div>
            </div>

            {/* Top Row: Map & Realtime */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map - Takes 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe className="text-indigo-500" size={20} />
                        Global Activity Heatmap
                    </h3>
                    <GeospatialMap data={locations} />
                </div>

                {/* Feed - Takes 1 col */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Activity className="text-green-500" size={20} />
                        Live Pulse
                    </h3>
                    <RealTimeFeed />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-pink-500" size={20} />
                        <h3 className="font-bold text-gray-800">Growth Velocity</h3>
                    </div>
                    <DailyTrendChart data={trends} />
                </div>

                {/* Device Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Smartphone className="text-purple-500" size={20} />
                        <h3 className="font-bold text-gray-800">Device Fingerprint</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <DevicePieChart data={devices} />
                        </div>
                        <div className="w-1/3 flex flex-col justify-center gap-2">
                            {devices.slice(0, 5).map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'][i] || '#ccc' }}></span>
                                    <span className="text-gray-600 truncate">{d.device}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
