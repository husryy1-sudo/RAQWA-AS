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
  customization?: QRCustomization | QRAdvancedCustomization;
  advancedCustomization?: QRAdvancedCustomization;
  templateId?: string;
  logoUrl?: string;
  logoSize?: number;
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

export interface QRAdvancedCustomization {
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  colors: {
    background: string;
    foreground: string;
    eyeColor: string;
    frameColor: string;
  };
  frame: QRFrameStyle;
  bodyShape: QRDotStyle;
  eyeFrameShape: QRDotStyle;
  eyeBallShape: QRDotStyle;
}

export interface QRFrameStyle {
  id: string;
  name: string;
  type: 'none' | 'square' | 'rounded' | 'circle';
}

export interface QRDotStyle {
  id: string;
  name: string;
  type: 'square' | 'circle' | 'rounded' | 'diamond';
}

export interface QRTemplate {
  id: string;
  name: string;
  preview: string;
  customization: QRAdvancedCustomization;
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