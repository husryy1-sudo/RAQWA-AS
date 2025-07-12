import React, { useState, useEffect } from 'react';
import { AdvancedQRCustomization, QRTemplate } from '../types/qr-templates';
import { QR_TEMPLATES } from '../data/qr-templates';
import { QR_PATTERNS } from '../data/qr-patterns';
import { QR_EYE_SHAPES } from '../data/qr-eye-shapes';
import { QR_FRAMES } from '../data/qr-frames';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Download, 
  RotateCcw,
  Upload,
  X,
  Grid3X3,
  Eye,
  Frame,
  Sparkles,
  Save
} from 'lucide-react';

interface AdvancedQRCustomizerProps {
  qrUrl: string;
  initialCustomization?: any;
  onSave: (customization: AdvancedQRCustomization) => void;
  onClose: () => void;
}

export const AdvancedQRCustomizer: React.FC<AdvancedQRCustomizerProps> = ({ 
  qrUrl, 
  initialCustomization, 
  onSave, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'pattern' | 'eyes' | 'frame' | 'colors' | 'logo'>('templates');
  const [customization, setCustomization] = useState<AdvancedQRCustomization>({
    pattern: QR_PATTERNS[0],
    eyeShape: QR_EYE_SHAPES[0],
    frame: QR_FRAMES[0],
    colors: {
      foreground: '#000000',
      background: '#FFFFFF',
      eyeColor: '#000000',
      frameColor: '#333333'
    },
    size: 300,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
  
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');

  useEffect(() => {
    generateAdvancedQRCode();
  }, [customization, logoDataUrl]);

  const generateAdvancedQRCode = async () => {
    try {
      // This is a simplified version - in a real implementation, you'd use a more advanced QR library
      // that supports custom patterns, eye shapes, and frames
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = customization.size;
      canvas.height = customization.size;

      // Fill background
      ctx.fillStyle = customization.colors.background;
      ctx.fillRect(0, 0, customization.size, customization.size);

      // For demo purposes, we'll create a basic QR-like pattern
      // In production, you'd integrate with a library like qr-code-styling
      const moduleSize = (customization.size - (customization.margin * 20)) / 25;
      const startX = customization.margin * 10;
      const startY = customization.margin * 10;

      // Draw pattern based on selected style
      ctx.fillStyle = customization.colors.foreground;
      
      // Create a basic QR pattern for demonstration
      for (let row = 0; row < 25; row++) {
        for (let col = 0; col < 25; col++) {
          // Skip eye areas
          if ((row < 7 && col < 7) || (row < 7 && col > 17) || (row > 17 && col < 7)) {
            continue;
          }
          
          // Random pattern for demo
          if (Math.random() > 0.5) {
            const x = startX + col * moduleSize;
            const y = startY + row * moduleSize;
            
            // Draw based on pattern type
            switch (customization.pattern.type) {
              case 'dots':
                ctx.beginPath();
                ctx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize/3, 0, 2 * Math.PI);
                ctx.fill();
                break;
              case 'rounded':
                ctx.fillRect(x, y, moduleSize, moduleSize);
                break;
              default:
                ctx.fillRect(x, y, moduleSize, moduleSize);
            }
          }
        }
      }

      // Draw eyes with custom shapes
      const eyeSize = moduleSize * 7;
      const eyePositions = [
        { x: startX, y: startY }, // Top-left
        { x: startX + 18 * moduleSize, y: startY }, // Top-right
        { x: startX, y: startY + 18 * moduleSize } // Bottom-left
      ];

      ctx.fillStyle = customization.colors.eyeColor;
      eyePositions.forEach(pos => {
        // Outer eye
        if (customization.eyeShape.outerShape === 'circle') {
          ctx.beginPath();
          ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, eyeSize/2, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = customization.colors.background;
          ctx.beginPath();
          ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, eyeSize/3, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(pos.x, pos.y, eyeSize, eyeSize);
          ctx.fillStyle = customization.colors.background;
          ctx.fillRect(pos.x + moduleSize, pos.y + moduleSize, eyeSize - 2*moduleSize, eyeSize - 2*moduleSize);
        }
        
        // Inner eye
        ctx.fillStyle = customization.colors.eyeColor;
        if (customization.eyeShape.innerShape === 'circle') {
          ctx.beginPath();
          ctx.arc(pos.x + eyeSize/2, pos.y + eyeSize/2, moduleSize * 1.5, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(pos.x + 2*moduleSize, pos.y + 2*moduleSize, 3*moduleSize, 3*moduleSize);
        }
      });

      // Add logo if present
      if (logoDataUrl && customization.logoSize) {
        const logo = new Image();
        logo.onload = () => {
          const logoSize = customization.logoSize || 40;
          const x = (customization.size - logoSize) / 2;
          const y = (customization.size - logoSize) / 2;
          
          // Draw logo background
          ctx.fillStyle = customization.colors.background;
          ctx.beginPath();
          ctx.arc(x + logoSize/2, y + logoSize/2, (logoSize/2) + 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          ctx.restore();
          
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

  const applyTemplate = (template: QRTemplate) => {
    setCustomization({
      ...customization,
      template,
      pattern: template.pattern,
      eyeShape: template.eyeShape,
      frame: template.frame,
      colors: template.colors
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoDataUrl(result);
        setCustomization(prev => ({ 
          ...prev, 
          logoSize: prev.logoSize || 60,
          logoUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = 'advanced-qr-code.png';
      link.href = qrDataUrl;
      link.click();
    }
  };

  const resetToDefaults = () => {
    setCustomization({
      pattern: QR_PATTERNS[0],
      eyeShape: QR_EYE_SHAPES[0],
      frame: QR_FRAMES[0],
      colors: {
        foreground: '#000000',
        background: '#FFFFFF',
        eyeColor: '#000000',
        frameColor: '#333333'
      },
      size: 300,
      margin: 2,
      errorCorrectionLevel: 'H'
    });
    setLogoDataUrl('');
    setLogoFile(null);
  };

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'pattern', label: 'Pattern', icon: Grid3X3 },
    { id: 'eyes', label: 'Eyes', icon: Eye },
    { id: 'frame', label: 'Frame', icon: Frame },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'logo', label: 'Logo', icon: Upload }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800">Advanced QR Code Designer</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            {/* Tab Navigation */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors text-xs ${
                        activeTab === tab.id
                          ? 'bg-pink-100 text-pink-600'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="mt-1">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Choose Template</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {QR_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          customization.template?.id === template.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <div className="w-12 h-12 bg-gray-300 rounded"></div>
                        </div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'pattern' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Data Pattern</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {QR_PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => setCustomization(prev => ({ ...prev, pattern }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          customization.pattern.id === pattern.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-12 bg-gray-100 rounded mb-2"></div>
                        <p className="font-medium text-sm">{pattern.name}</p>
                        <p className="text-xs text-gray-500">{pattern.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'eyes' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Eye Shape</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {QR_EYE_SHAPES.map((eyeShape) => (
                      <button
                        key={eyeShape.id}
                        onClick={() => setCustomization(prev => ({ ...prev, eyeShape }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          customization.eyeShape.id === eyeShape.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-12 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 100 100" className="text-gray-600">
                            <g dangerouslySetInnerHTML={{ __html: eyeShape.svg }} />
                          </svg>
                        </div>
                        <p className="font-medium text-sm">{eyeShape.name}</p>
                        <p className="text-xs text-gray-500">{eyeShape.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'frame' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Frame Style</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {QR_FRAMES.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setCustomization(prev => ({ ...prev, frame }))}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          customization.frame.id === frame.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {frame.svg && (
                              <svg width="24" height="24" viewBox="0 0 100 100" className="text-gray-600">
                                <g dangerouslySetInnerHTML={{ __html: frame.svg }} />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{frame.name}</p>
                            <p className="text-xs text-gray-500">{frame.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Color Scheme</h4>
                  
                  {/* Color Controls */}
                  <div className="space-y-3">
                    {[
                      { key: 'foreground', label: 'Foreground' },
                      { key: 'background', label: 'Background' },
                      { key: 'eyeColor', label: 'Eye Color' },
                      { key: 'frameColor', label: 'Frame Color' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                        <div className="relative">
                          <button
                            onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                            className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                          >
                            <div 
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: customization.colors[key as keyof typeof customization.colors] }}
                            />
                            <span className="font-mono text-sm">{customization.colors[key as keyof typeof customization.colors]}</span>
                          </button>
                          {showColorPicker === key && (
                            <div className="absolute top-full left-0 mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                              <HexColorPicker
                                color={customization.colors[key as keyof typeof customization.colors]}
                                onChange={(color) => setCustomization(prev => ({ 
                                  ...prev, 
                                  colors: { ...prev.colors, [key]: color }
                                }))}
                              />
                              <button
                                onClick={() => setShowColorPicker(null)}
                                className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'logo' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Center Logo</h4>
                  
                  {logoDataUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <img src={logoDataUrl} alt="Logo" className="w-12 h-12 object-cover rounded border border-gray-300" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-600 block">{logoFile?.name || 'Uploaded Logo'}</span>
                          <span className="text-xs text-gray-500">Size: {customization.logoSize || 60}px</span>
                        </div>
                        <button
                          onClick={() => {
                            setLogoDataUrl('');
                            setLogoFile(null);
                            setCustomization(prev => ({ ...prev, logoUrl: undefined, logoSize: undefined }));
                          }}
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Size: {customization.logoSize || 60}px
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="120"
                          step="5"
                          value={customization.logoSize || 60}
                          onChange={(e) => setCustomization(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Preview</h4>
                  <div className="flex justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code Preview" 
                        className="max-w-full h-auto shadow-lg rounded-lg"
                        style={{ width: Math.min(customization.size, 300) }}
                      />
                    ) : (
                      <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Generating...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Size Control */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size: {customization.size}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    step="50"
                    value={customization.size}
                    onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(customization)}
                className="flex items-center space-x-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Save size={16} />
                <span>Save Design</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};