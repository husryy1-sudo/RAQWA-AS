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
  advancedCustomization?: AdvancedQRCustomization;
  logoUrl?: string;
  logoSize?: number;
  templateId?: string;
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

export interface AdvancedQRCustomization {
  size: number;
  margin: number;
  colors: {
    background: string;
    foreground: string;
    eyeColor: string;
    frameColor: string;
  };
  bodyShape: {
    id: string;
    name: string;
    type: string;
  };
  eyeFrameShape: {
    id: string;
    name: string;
    type: string;
  };
  eyeBallShape: {
    id: string;
    name: string;
    type: string;
  };
  frame: {
    id: string;
    name: string;
    type: 'none' | 'square' | 'rounded' | 'circle';
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  customization: AdvancedQRCustomization;
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