export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  description: string;
  updatedAt: string;
}

export interface QRCode {
  id: string;
  name: string;
  shortCode: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  customization?: QRCustomization;
}

export interface QRAnalytics {
  id: string;
  qrCodeId: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  operatingSystem?: string;
  userAgent?: string;
  browser?: string;
  scannedAt: string;
}

export interface QRCustomization {
  // Core
  size: number;
  margin: number;

  // Colors & Background
  backgroundColor: string;
  foregroundColor: string; // Helper for simple color
  dotsOptions: {
    type: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
    color: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };
  backgroundOptions: {
    color: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };

  // Corners (Eyes)
  cornersSquareOptions: {
    type: 'dot' | 'square' | 'extra-rounded';
    color: string;
  };
  cornersDotOptions: {
    type: 'dot' | 'square';
    color: string;
  };

  // Logo
  logoUrl?: string; // Stored in DB
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    crossOrigin?: string;
  };
}

export interface QRAnalyticsSummary {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
  scansByDate: Array<{ date: string; scans: number }>;
  lastScanTime?: string;
}
