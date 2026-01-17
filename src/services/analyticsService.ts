import { supabase } from '../lib/supabase';

// Types for our analytics data
export interface DailyTrend {
    date: string;
    count: number;
}

export interface DeviceStat {
    device: string;
    count: number;
}

export interface LocationStat {
    city: string;
    country: string;
    count: number;
}

export interface HeatmapPoint {
    day_of_week: number;
    hour_of_day: number;
    count: number;
}

export interface LiveScan {
    id: string;
    country: string;
    city: string;
    device_vendor: string;
    device_model: string;
    scanned_at: string;
    qr_code: {
        name: string;
    };
}

export const AnalyticsService = {
    // Fetch aggregated trends via RPC
    async getDailyTrend(days = 30) {
        const { data, error } = await supabase.rpc('get_daily_scans_trend', { days_lookback: days });
        if (error) throw error;
        return data as DailyTrend[];
    },

    async getTopDevices() {
        const { data, error } = await supabase.rpc('get_top_devices');
        if (error) throw error;
        return data as DeviceStat[];
    },

    async getTopLocations() {
        const { data, error } = await supabase.rpc('get_top_locations');
        if (error) throw error;
        return data as LocationStat[];
    },

    async getHeatmapData() {
        const { data, error } = await supabase.rpc('get_heatmap_data');
        if (error) throw error;
        return data as HeatmapPoint[];
    },

    // Real-time feed subscription helper
    subscribeToScans(callback: (scan: LiveScan) => void) {
        return supabase
            .channel('public:qr_analytics')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'qr_analytics' },
                async (payload) => {
                    // Fetch the associated QR name for the notification
                    const { data: qr } = await supabase
                        .from('qr_codes')
                        .select('name')
                        .eq('id', payload.new.qr_code_id)
                        .single();

                    const scan: LiveScan = {
                        id: payload.new.id,
                        country: payload.new.country || 'Unknown',
                        city: payload.new.city || 'Unknown Location',
                        device_vendor: payload.new.device_vendor || 'Unknown',
                        device_model: payload.new.device_model || 'Device',
                        scanned_at: payload.new.scanned_at,
                        qr_code: { name: qr?.name || 'QR Code' }
                    };
                    callback(scan);
                }
            )
            .subscribe();
    }
};
