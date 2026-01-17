import React, { useEffect, useState, useRef } from 'react';
import { Smartphone, MapPin, Globe, Clock, Zap } from 'lucide-react';
import { AnalyticsService, LiveScan } from '../../services/analyticsService';

export const RealTimeFeed: React.FC = () => {
    const [scans, setScans] = useState<LiveScan[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Subscribe to live events
        const subscription = AnalyticsService.subscribeToScans((newScan) => {
            setScans(prev => [newScan, ...prev].slice(0, 50)); // Keep last 50
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Zap className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />
                    Live Pulse
                </h3>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                    Connected
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800" ref={scrollRef}>
                {scans.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                            <Globe className="w-6 h-6" />
                        </div>
                        <p className="text-sm">Waiting for live scans...</p>
                    </div>
                ) : (
                    scans.map((scan) => (
                        <div key={scan.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                                <Smartphone size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                    <span className="text-pink-400">Someone</span> scanned
                                    <span className="text-white font-bold mx-1">{scan.qr_code.name}</span>
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={12} /> {scan.city}, {scan.country}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(scan.scanned_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-300">
                                    {scan.device_model}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
