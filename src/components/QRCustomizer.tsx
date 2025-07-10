import React, { useState, useEffect } from 'react';
import { QRCustomization } from '../types';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Download, 
  RotateCcw,
  Upload,
  X
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCustomizerProps {
  qrUrl: string;
  initialCustomization?: QRCustomization;
  onSave: (customization: QRCustomization) => void;
  onClose: () => void;
}

export const QRCustomizer: React.FC<QRCustomizerProps> = ({ 
  qrUrl, 
  initialCustomization, 
  onSave, 
  onClose 
}) => {
  const [customization, setCustomization] = useState<QRCustomization>(
    initialCustomization || {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      size: 200,
      margin: 2
    }
  );
  
  const [showForegroundPicker, setShowForegroundPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [customization, logoDataUrl]);

  const generateQRCode = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate base QR code
      const qrCanvas = document.createElement('canvas');
      await QRCodeLib.toCanvas(qrCanvas, qrUrl, {
        width: customization.size,
        margin: customization.margin,
        color: {
          dark: customization.foregroundColor,
          light: customization.backgroundColor
        },
        errorCorrectionLevel: 'M'
      });

      canvas.width = customization.size;
      canvas.height = customization.size;

      // Draw QR code
      ctx.drawImage(qrCanvas, 0, 0);

      // Add logo if present
      if (logoDataUrl && customization.logoSize) {
        const logo = new Image();
        logo.onload = () => {
          const logoSize = customization.logoSize || 40;
          const x = (customization.size - logoSize) / 2;
          const y = (customization.size - logoSize) / 2;
          
          // Draw white background for logo
          ctx.fillStyle = customization.backgroundColor;
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
          
          // Draw logo
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          
          setQrDataUrl(canvas.toDataURL());
        };
        logo.src = logoDataUrl;
      } else {
        setQrDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoDataUrl(result);
        setCustomization(prev => ({ ...prev, logoSize: 40 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoDataUrl('');
    setCustomization(prev => ({ ...prev, logoSize: undefined }));
  };

  const resetToDefaults = () => {
    setCustomization({
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      size: 200,
      margin: 2
    });
    removeLogo();
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = 'custom-qr-code.png';
      link.href = qrDataUrl;
      link.click();
    }
  };

  const handleSave = () => {
    const finalCustomization = { ...customization };
    if (logoDataUrl) {
      finalCustomization.logoUrl = logoDataUrl;
    }
    onSave(finalCustomization);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Customize QR Code
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Preview</h4>
                <div className="flex justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="QR Code Preview" 
                      className="max-w-full h-auto"
                      style={{ width: Math.min(customization.size, 300) }}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">Generating...</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800">Customization Options</h4>
              
              {/* Colors */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foreground Color (QR Dots)
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowForegroundPicker(!showForegroundPicker)}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: customization.foregroundColor }}
                      />
                      <span className="font-mono text-sm">{customization.foregroundColor}</span>
                    </button>
                    {showForegroundPicker && (
                      <div className="absolute top-full left-0 mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                        <HexColorPicker
                          color={customization.foregroundColor}
                          onChange={(color) => setCustomization(prev => ({ ...prev, foregroundColor: color }))}
                        />
                        <button
                          onClick={() => setShowForegroundPicker(false)}
                          className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: customization.backgroundColor }}
                      />
                      <span className="font-mono text-sm">{customization.backgroundColor}</span>
                    </button>
                    {showBackgroundPicker && (
                      <div className="absolute top-full left-0 mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                        <HexColorPicker
                          color={customization.backgroundColor}
                          onChange={(color) => setCustomization(prev => ({ ...prev, backgroundColor: color }))}
                        />
                        <button
                          onClick={() => setShowBackgroundPicker(false)}
                          className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size: {customization.size}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="10"
                  value={customization.size}
                  onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100px</span>
                  <span>500px</span>
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin: {customization.margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={customization.margin}
                  onChange={(e) => setCustomization(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>8</span>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Center Logo (Optional)
                </label>
                {logoDataUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={logoDataUrl} alt="Logo" className="w-8 h-8 object-cover rounded" />
                      <span className="text-sm text-gray-600 flex-1">{logoFile?.name}</span>
                      <button
                        onClick={removeLogo}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {customization.logoSize}px
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        step="5"
                        value={customization.logoSize || 40}
                        onChange={(e) => setCustomization(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center justify-center space-x-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors"
                    >
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-gray-600">Upload logo image</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Save Customization
          </button>
        </div>
      </div>
    </div>
  );
};