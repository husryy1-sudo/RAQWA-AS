import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType
} from 'qr-code-styling';
import { QRCustomization } from '../types';
import { HexColorPicker } from 'react-colorful';
import {
  Palette,
  Download,
  RotateCcw,
  Upload,
  X,
  LayoutGrid,
  Shapes,
  Image as ImageIcon,
  Layers,
  Check
} from 'lucide-react';

interface QRCustomizerProps {
  qrUrl: string;
  initialCustomization?: QRCustomization;
  onSave: (customization: QRCustomization) => void;
  onClose: () => void;
  onUploadLogo?: (file: File) => Promise<string>;
}

const TABS = [
  { id: 'style', label: 'Style', icon: LayoutGrid },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'eyes', label: 'Eyes', icon: Shapes },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
];

export const QRCustomizer: React.FC<QRCustomizerProps> = ({
  qrUrl,
  initialCustomization,
  onSave,
  onClose,
  onUploadLogo
}) => {
  const [activeTab, setActiveTab] = useState('style');
  const qrCode = useRef<QRCodeStyling | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize QR Code instance safely
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 300,
        height: 300,
        type: 'canvas',
        data: qrUrl,
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 2
        }
      });
      qrCode.current.append(ref.current || undefined);
    }
  }, []);

  const [customization, setCustomization] = useState<QRCustomization>(
    initialCustomization || {
      size: 300,
      margin: 2,
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      dotsOptions: {
        type: 'square',
        color: '#000000'
      },
      backgroundOptions: {
        color: '#FFFFFF'
      },
      cornersSquareOptions: {
        type: 'square',
        color: '#000000'
      },
      cornersDotOptions: {
        type: 'square',
        color: '#000000'
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5
      }
    }
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);



  useEffect(() => {
    if (!qrCode.current) return;

    qrCode.current.update({
      data: qrUrl,
      width: customization.size,
      height: customization.size,
      margin: customization.margin,
      dotsOptions: customization.dotsOptions,
      cornersSquareOptions: customization.cornersSquareOptions,
      cornersDotOptions: customization.cornersDotOptions,
      backgroundOptions: customization.backgroundOptions,
      image: customization.logoUrl,
      imageOptions: customization.imageOptions
    });
  }, [customization, qrUrl]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadLogo) {
      try {
        setIsUploading(true);
        const url = await onUploadLogo(file);
        setLogoFile(file);
        setCustomization(prev => ({
          ...prev,
          logoUrl: url
        }));
      } catch (error) {
        console.error('Failed to upload logo:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const downloadQR = async (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
    if (!qrCode.current) return;
    await qrCode.current.download({
      name: `qr-code`,
      extension: format
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden">

        {/* Left Sidebar - Tabs */}
        <div className="w-full md:w-20 bg-gray-50 border-r border-gray-200 flex flex-row md:flex-col items-center justify-between md:justify-start p-2 md:py-6 gap-2">
          <div className="flex flex-row md:flex-col gap-2 w-full">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all w-full text-xs font-medium ${activeTab === tab.id
                  ? 'bg-pink-100 text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-6 h-6 mb-1" />
                {tab.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="md:mt-auto p-3 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Middle - Configuration */}
        <div className="flex-1 p-6 overflow-y-auto bg-white min-w-[320px]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{TABS.find(t => t.id === activeTab)?.label} Settings</h2>
            <p className="text-gray-500 text-sm">Customize your QR code appearance</p>
          </div>

          {activeTab === 'style' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Dots Pattern</label>
                <div className="grid grid-cols-3 gap-3">
                  {['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCustomization(prev => ({
                        ...prev,
                        dotsOptions: { ...prev.dotsOptions, type: type as any }
                      }))}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition-all ${customization.dotsOptions.type === type ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                        }`}
                    >
                      <div className={`w-8 h-8 bg-gray-800 ${type === 'dots' ? 'rounded-full' :
                        type === 'rounded' ? 'rounded-md' :
                          type === 'extra-rounded' ? 'rounded-lg' : ''
                        }`} />
                      <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Size & Margin</label>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Size</span>
                      <span>{customization.size}px</span>
                    </div>
                    <input
                      type="range" min="200" max="1000" step="50"
                      value={customization.size}
                      onChange={(e) => setCustomization(prev => ({ ...prev, size: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Margin</span>
                      <span>{customization.margin}px</span>
                    </div>
                    <input
                      type="range" min="0" max="50" step="1"
                      value={customization.margin}
                      onChange={(e) => setCustomization(prev => ({ ...prev, margin: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Dots Color</label>
                <HexColorPicker
                  color={customization.dotsOptions.color}
                  onChange={(color) => setCustomization(prev => ({
                    ...prev,
                    dotsOptions: { ...prev.dotsOptions, color },
                    foregroundColor: color
                  }))}
                  style={{ width: '100%', height: '150px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Background Color</label>
                <HexColorPicker
                  color={customization.backgroundOptions.color}
                  onChange={(color) => setCustomization(prev => ({
                    ...prev,
                    backgroundOptions: { ...prev.backgroundOptions, color },
                    backgroundColor: color
                  }))}
                  style={{ width: '100%', height: '150px' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'eyes' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Corner Shape</label>
                <div className="grid grid-cols-3 gap-3">
                  {['square', 'dot', 'extra-rounded'].map(type => (
                    <button
                      key={type}
                      onClick={() => setCustomization(prev => ({
                        ...prev,
                        cornersSquareOptions: { ...prev.cornersSquareOptions, type: type as any }
                      }))}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition-all ${customization.cornersSquareOptions.type === type ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                        }`}
                    >
                      <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Eye Color</label>
                <HexColorPicker
                  color={customization.cornersSquareOptions.color}
                  onChange={(color) => setCustomization(prev => ({
                    ...prev,
                    cornersSquareOptions: { ...prev.cornersSquareOptions, color },
                    cornersDotOptions: { ...prev.cornersDotOptions, color }
                  }))}
                  style={{ width: '100%', height: '120px' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
                {customization.logoUrl ? (
                  <div className="relative inline-block">
                    <img src={customization.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded-lg shadow-sm" />
                    <button
                      onClick={() => setCustomization(prev => ({ ...prev, logoUrl: undefined }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Upload Logo</p>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload-input" />
                    <label htmlFor="logo-upload-input" className="mt-4 inline-block px-4 py-2 bg-pink-500 text-white rounded-lg cursor-pointer hover:bg-pink-600 transition-colors">
                      Choose File
                    </label>
                  </>
                )}
              </div>

              {customization.logoUrl && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Size</label>
                    <input
                      type="range" min="0.1" max="0.5" step="0.05"
                      value={customization.imageOptions.imageSize}
                      onChange={(e) => setCustomization(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, imageSize: Number(e.target.value) } }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hide-dots"
                      checked={customization.imageOptions.hideBackgroundDots}
                      onChange={(e) => setCustomization(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, hideBackgroundDots: e.target.checked } }))}
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <label htmlFor="hide-dots" className="text-sm text-gray-700">Hide dots behind logo</label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Preview */}
        <div className="w-full md:w-[400px] bg-gray-100 p-8 flex flex-col items-center justify-center border-l border-gray-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
            <div ref={ref} className="qr-code-container" />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            <button onClick={() => downloadQR('png')} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
              <Download size={16} /> PNG
            </button>
            <button onClick={() => downloadQR('svg')} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
              <Download size={16} /> SVG
            </button>
            <button onClick={() => downloadQR('pdf')} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
              <Download size={16} /> PDF
            </button>
            <button onClick={() => downloadQR('jpeg')} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
              <Download size={16} /> JPEG
            </button>
          </div>

          <div className="mt-8 flex gap-3 w-full max-w-xs">
            <button onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSave(customization)}
              className="flex-[2] py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Check size={18} /> Save Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
