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
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  logoUrl?: string;
  logoSize?: number;
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