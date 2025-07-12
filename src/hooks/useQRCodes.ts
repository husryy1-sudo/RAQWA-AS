import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QRCode, QRAnalytics, QRAnalyticsSummary, QRCustomization } from '../types';
import { AdvancedQRCustomization } from '../types/qr-templates';

export const useQRCodes = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        shortCode: item.short_code,
        destinationUrl: item.destination_url,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        customization: item.customization,
        advancedCustomization: item.advanced_customization,
        templateId: item.template_id
      }));
      
      setQRCodes(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addQRCode = async (qrCode: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const defaultCustomization = {
        foregroundColor: '#000000',
        backgroundColor: '#FFFFFF',
        size: 200,
        margin: 2,
        logoSize: 40
      };

      const { data, error } = await supabase
        .from('qr_codes')
        .insert([{
          name: qrCode.name,
          short_code: qrCode.shortCode,
          destination_url: qrCode.destinationUrl,
          is_active: qrCode.isActive,
          customization: defaultCustomization,
          logo_url: null,
          logo_size: 40
        }])
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        id: data.id,
        name: data.name,
        shortCode: data.short_code,
        destinationUrl: data.destination_url,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        customization: data.customization,
        advancedCustomization: data.advanced_customization,
        templateId: data.template_id
      };
      
      setQRCodes(prev => [transformedData, ...prev]);
      return transformedData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add QR code');
    }
  };

  const updateQRCode = async (id: string, updates: Partial<QRCode>) => {
    try {
      const dbUpdates: any = { ...updates };
      if ('shortCode' in updates) {
        dbUpdates.short_code = updates.shortCode;
        delete dbUpdates.shortCode;
      }
      if ('destinationUrl' in updates) {
        dbUpdates.destination_url = updates.destinationUrl;
        delete dbUpdates.destinationUrl;
      }
      if ('isActive' in updates) {
        dbUpdates.is_active = updates.isActive;
        delete dbUpdates.isActive;
      }
      
      const { data, error } = await supabase
        .from('qr_codes')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        id: data.id,
        name: data.name,
        shortCode: data.short_code,
        destinationUrl: data.destination_url,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        customization: data.customization,
        advancedCustomization: data.advanced_customization,
        templateId: data.template_id
      };
      
      setQRCodes(prev => prev.map(qr => qr.id === id ? transformedData : qr));
      return transformedData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update QR code');
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setQRCodes(prev => prev.filter(qr => qr.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete QR code');
    }
  };

  const getQRAnalytics = async (qrCodeId: string): Promise<QRAnalytics[]> => {
    try {
      const { data, error } = await supabase
        .from('qr_analytics')
        .select('*')
        .eq('qr_code_id', qrCodeId)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        qrCodeId: item.qr_code_id,
        ipAddress: item.ip_address,
        country: item.country,
        city: item.city,
        deviceType: item.device_type,
        operatingSystem: item.operating_system,
        userAgent: item.user_agent,
        browser: item.browser,
        scannedAt: item.scanned_at
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch analytics');
    }
  };

  const getQRAnalyticsSummary = async (qrCodeId: string): Promise<QRAnalyticsSummary> => {
    try {
      const { data, error } = await supabase
        .from('qr_analytics')
        .select('*')
        .eq('qr_code_id', qrCodeId);

      if (error) throw error;

      const analytics = data || [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate summary statistics
      const totalScans = analytics.length;
      const todayScans = analytics.filter(a => new Date(a.scanned_at) >= today).length;
      const weekScans = analytics.filter(a => new Date(a.scanned_at) >= weekAgo).length;
      const monthScans = analytics.filter(a => new Date(a.scanned_at) >= monthAgo).length;

      // Top countries
      const countryCount = analytics.reduce((acc, a) => {
        if (a.country) {
          acc[a.country] = (acc[a.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const topCountries = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top devices
      const deviceCount = analytics.reduce((acc, a) => {
        if (a.device_type) {
          acc[a.device_type] = (acc[a.device_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const topDevices = Object.entries(deviceCount)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top browsers
      const browserCount = analytics.reduce((acc, a) => {
        if (a.browser) {
          acc[a.browser] = (acc[a.browser] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      const topBrowsers = Object.entries(browserCount)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Scans by date (last 30 days)
      const scansByDate: Array<{ date: string; scans: number }> = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const scans = analytics.filter(a => 
          a.scanned_at.startsWith(dateStr)
        ).length;
        scansByDate.push({ 
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          scans 
        });
      }

      // Last scan time
      const lastScanTime = analytics.length > 0 
        ? analytics.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime())[0].scanned_at
        : undefined;

      return {
        totalScans,
        todayScans,
        weekScans,
        monthScans,
        topCountries,
        topDevices,
        topBrowsers,
        scansByDate,
        lastScanTime
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch analytics summary');
    }
  };

  const updateQRCustomization = async (id: string, customization: QRCustomization) => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .update({ customization })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        id: data.id,
        name: data.name,
        shortCode: data.short_code,
        destinationUrl: data.destination_url,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        customization: data.customization
      };
      
      setQRCodes(prev => prev.map(qr => qr.id === id ? transformedData : qr));
      return transformedData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update QR customization');
    }
  };

  const updateAdvancedQRCustomization = async (id: string, customization: AdvancedQRCustomization) => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .update({ 
          advanced_customization: customization,
          template_id: customization.template?.id || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData = {
        id: data.id,
        name: data.name,
        shortCode: data.short_code,
        destinationUrl: data.destination_url,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        customization: data.customization,
        advancedCustomization: data.advanced_customization,
        templateId: data.template_id
      };
      
      setQRCodes(prev => prev.map(qr => qr.id === id ? transformedData : qr));
      return transformedData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update advanced QR customization');
    }
  };

  const generateQRCodeImage = async (qr: QRCode, customization?: any): Promise<string> => {
    const qrUrl = `${window.location.origin}/qr/${qr.shortCode}`;
    const custom = customization || qr.customization || {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      size: 200,
      margin: 2
    };
    
    try {
      return await QRCodeLib.toDataURL(qrUrl, {
        width: custom.size || 200,
        margin: custom.margin || 2,
        color: {
          dark: custom.foregroundColor || '#000000',
          light: custom.backgroundColor || '#FFFFFF'
        },
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        rendererOpts: {
          quality: 0.92
        }
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  };

  const generateShortCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toLowerCase();
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  return {
    qrCodes,
    loading,
    error,
    addQRCode,
    updateQRCode,
    deleteQRCode,
    getQRAnalytics,
    getQRAnalyticsSummary,
    updateQRCustomization,
    updateAdvancedQRCustomization,
    generateShortCode,
    refetch: fetchQRCodes
  };
};