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

    useEffect(() => {
        const loadData = async () => {
            try {
                const [trendData, deviceData, locationData] = await Promise.all([
                    AnalyticsService.getDailyTrend(),
                    AnalyticsService.getTopDevices(),
                    AnalyticsService.getTopLocations()
                ]);

                setTrends(trendData);
                setDevices(deviceData);
                setLocations(locationData);
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Analytics Intelligence</h2>
                    <p className="text-gray-500">Real-time insights across your QR ecosystem</p>
                </div>
                <div className="flex gap-2">
                    <select className="px-4 py-2 border rounded-lg bg-white text-sm">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>Today</option>
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


