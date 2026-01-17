import React, { useMemo } from 'react';
import { LocationStat } from '../../services/analyticsService';

interface GeospatialMapProps {
    data: LocationStat[];
}

// Simple SVG World Map visualization
// Ideally we would use react-simple-maps or leaflet, but to keep it lightweight and "never seen before" custom look:
export const GeospatialMap: React.FC<GeospatialMapProps> = ({ data }) => {
    // Mock coordinates for major cities (in a real app, backend would provide lat/lng)
    const cityCoordinates: Record<string, { x: number; y: number }> = {
        'Riyadh': { x: 56, y: 44 },
        'Jeddah': { x: 54, y: 45 },
        'Dubai': { x: 58, y: 43 },
        'London': { x: 49, y: 28 },
        'New York': { x: 29, y: 32 },
        'Cairo': { x: 52, y: 42 },
        'Mumbai': { x: 65, y: 48 },
        'Tokyo': { x: 85, y: 36 },
        // Add default fallbacks for unknown cities
    };

    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            coords: cityCoordinates[item.city] || { x: 50 + (Math.random() * 20 - 10), y: 40 + (Math.random() * 20 - 10) }
        }));
    }, [data]);

    return (
        <div className="relative w-full h-[400px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* World Map Outline (Stylized SVG) */}
            <svg className="absolute inset-0 w-full h-full text-slate-700/50 fill-current" viewBox="0 0 100 60">
                <path d="M20 10 C 20 5, 30 5, 30 10 L 40 15 L 45 10 L 50 15 L 50 25 L 40 35 L 30 30 L 25 35 L 20 25 Z" />
                {/* Note: This is a placeholder abstract shape. A full world map path would be huge. 
            For a premium look without deps, we use a nice background image or abstract representation. */}
                <text x="50" y="30" fontSize="5" textAnchor="middle" fill="currentColor" opacity="0.3">WORLD MAP VISUALIZATION</text>
            </svg>

            {/* City Markers */}
            {processedData.map((city, i) => (
                <div
                    key={i}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/marker cursor-pointer"
                    style={{
                        left: `${city.coords.x}%`,
                        top: `${city.coords.y}%`,
                        animationDelay: `${i * 0.2}s`
                    }}
                >
                    {/* Pulse Effect */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-3 h-3 bg-pink-500 rounded-full border-2 border-white shadow-lg"></div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover/marker:opacity-100 transition-opacity bg-white text-slate-900 text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap font-bold pointer-events-none z-10">
                        {city.city}: {city.count} scans
                    </div>
                </div>
            ))}

            {/* Overlay Details */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-600">
                <p className="text-slate-400 text-xs uppercase tracking-wider">Active Regions</p>
                <div className="text-white font-mono text-lg">{data.length} Cities</div>
            </div>
        </div>
    );
};
