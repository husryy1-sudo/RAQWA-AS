import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const QRRedirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('Invalid QR code');
        setLoading(false);
        return;
      }

      try {
        // Get QR code details
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('short_code', shortCode)
          .eq('is_active', true)
          .single();

        if (qrError || !qrCode) {
          setError('QR code not found or inactive');
          setLoading(false);
          return;
        }

        // Get user info for analytics
        const userAgent = navigator.userAgent;

        // Extract browser name
        const getBrowserName = (userAgent: string): string => {
          if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
          if (userAgent.includes('Firefox')) return 'Firefox';
          if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
          if (userAgent.includes('Edge')) return 'Edge';
          if (userAgent.includes('Opera')) return 'Opera';
          return 'Other';
        };

        // Better device type detection
        const getDeviceType = (userAgent: string): string => {
          if (/iPad/.test(userAgent)) return 'tablet';
          if (/iPhone|iPod/.test(userAgent)) return 'mobile';
          if (/Android/.test(userAgent)) {
            if (/Mobile/.test(userAgent)) return 'mobile';
            return 'tablet';
          }
          if (/Windows Phone/.test(userAgent)) return 'mobile';
          if (/BlackBerry|BB10/.test(userAgent)) return 'mobile';
          return 'desktop';
        };

        // Get IP and location (using a free service)
        let locationData = null;
        try {
          const locationResponse = await fetch('https://ipapi.co/json/');
          if (locationResponse.ok) {
            locationData = await locationResponse.json();
          }
        } catch (err) {
          console.warn('Could not fetch location data:', err);
        }

        // Extended device and browser detection
        const getDeviceDetails = () => {
          const ua = navigator.userAgent;
          let vendor = 'Unknown';
          let model = 'Unknown';

          if (/iPhone/.test(ua)) { vendor = 'Apple'; model = 'iPhone'; }
          else if (/iPad/.test(ua)) { vendor = 'Apple'; model = 'iPad'; }
          else if (/Samsung/.test(ua)) { vendor = 'Samsung'; model = 'Galaxy'; }
          else if (/Pixel/.test(ua)) { vendor = 'Google'; model = 'Pixel'; }
          else if (/Huawei/.test(ua)) { vendor = 'Huawei'; model = 'Device'; }

          return { vendor, model };
        };

        const { vendor, model } = getDeviceDetails();

        // Record extended analytics
        const analyticsData = {
          qr_code_id: qrCode.id,
          ip_address: locationData?.ip || null,
          country: locationData?.country_name || null,
          city: locationData?.city || null,
          device_type: getDeviceType(userAgent),
          operating_system: navigator.platform || 'Unknown',
          browser: getBrowserName(navigator.userAgent),
          user_agent: navigator.userAgent,
          // New fields
          referrer: document.referrer || 'Direct',
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          device_vendor: vendor,
          device_model: model,
          session_id: crypto.randomUUID() // Simple session tracking
        };

        // Insert analytics (don't wait for it to complete)
        supabase
          .from('qr_analytics')
          .insert([analyticsData])
          .then(({ error }) => {
            if (error) console.warn('Failed to record analytics:', error);
          });

        // Redirect to destination
        window.location.href = qrCode.destination_url;

      } catch (err) {
        console.error('Redirect error:', err);
        setError('An error occurred while processing the QR code');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">QR Code Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return null;
};
