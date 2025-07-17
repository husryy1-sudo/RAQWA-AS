import React, { useState, useEffect } from 'react';
import { AdvancedQRCustomization, QRTemplate } from '../types';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Download, 
  RotateCcw,
  Upload,
  X,
  Layers,
  Eye,
  Square,
  Circle
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface AdvancedQRCustomizerProps {
  qrUrl: string;
  initialCustomization?: AdvancedQRCustomization;
  logoUrl?: string;
  logoSize?: number;
  onSave: (customization: AdvancedQRCustomization, logoUrl?: string, logoSize?: number) => void;
  onClose: () => void;
}

const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design',
    customization: {
      size: 300,
      margin: 2,
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        eyeColor: '#2563eb',
        frameColor: '#1f2937'
      },
      pattern: { id: 'rounded-squares', name: 'Rounded Squares', type: 'rounded' },
      eyeShape: { id: 'rounded-circle', name: 'Rounded Outer, Circle Inner', outerShape: 'rounded', innerShape: 'circle' },
      frame: { id: 'rounded', name: 'Rounded Frame', type: 'rounded' },
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional black and white',
    customization: {
      size: 300,
      margin: 2,
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        eyeColor: '#000000',
        frameColor: '#333333'
      },
      pattern: { id: 'classic-squares', name: 'Classic Squares', type: 'squares' },
      eyeShape: { id: 'square-square', name: 'Square in Square', outerShape: 'square', innerShape: 'square' },
      frame: { id: 'none', name: 'No Frame', type: 'none' },
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant and eye-catching',
    customization: {
      size: 300,
      margin: 2,
      colors: {
        background: '#f0f9ff',
        foreground: '#ec4899',
        eyeColor: '#8b5cf6',
        frameColor: '#06b6d4'
      },
      pattern: { id: 'circles', name: 'Circles', type: 'circles' },
      eyeShape: { id: 'circle-circle', name: 'Circle in Circle', outerShape: 'circle', innerShape: 'circle' },
      frame: { id: 'circle', name: 'Circle Frame', type: 'circle' },
      errorCorrectionLevel: 'H'
    }
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and refined',
    customization: {
      size: 300,
      margin: 3,
      colors: {
        background: '#fafafa',
        foreground: '#1f2937',
        eyeColor: '#059669',
        frameColor: '#6b7280'
      },
      pattern: { id: 'diamonds', name: 'Diamonds', type: 'diamonds' },
      eyeShape: { id: 'rounded-rounded', name: 'Rounded in Rounded', outerShape: 'rounded', innerShape: 'rounded' },
      frame: { id: 'square', name: 'Square Frame', type: 'square' },
      errorCorrectionLevel: 'H'
    }
  }
];

const PATTERN_OPTIONS = [
  { id: 'classic-squares', name: 'Classic Squares', type: 'squares' as const },
  { id: 'rounded-squares', name: 'Rounded Squares', type: 'rounded' as const },
  { id: 'circles', name: 'Circles', type: 'circles' as const },
  { id: 'diamonds', name: 'Diamonds', type: 'diamonds' as const }
];

const EYE_SHAPE_OPTIONS = [
  { id: 'square-square', name: 'Square in Square', outerShape: 'square' as const, innerShape: 'square' as const },
  { id: 'circle-circle', name: 'Circle in Circle', outerShape: 'circle' as const, innerShape: 'circle' as const },
  { id: 'rounded-rounded', name: 'Rounded in Rounded', outerShape: 'rounded' as const, innerShape: 'rounded' as const },
  { id: 'square-circle', name: 'Square Outer, Circle Inner', outerShape: 'square' as const, innerShape: 'circle' as const },
  { id: 'circle-square', name: 'Circle Outer, Square Inner', outerShape: 'circle' as const, innerShape: 'square' as const },
  { id: 'rounded-circle', name: 'Rounded Outer, Circle Inner', outerShape: 'rounded' as const, innerShape: 'circle' as const }
];

const FRAME_OPTIONS = [
  { id: 'none', name: 'No Frame', type: 'none' as const },
  { id: 'square', name: 'Square Frame', type: 'square' as const },
  { id: 'rounded', name: 'Rounded Frame', type: 'rounded' as const },
  { id: 'circle', name: 'Circle Frame', type: 'circle' as const }
];

export const AdvancedQRCustomizer: React.FC<AdvancedQRCustomizerProps> = ({ 
  qrUrl, 
  initialCustomization, 
  logoUrl: initialLogoUrl,
  logoSize: initialLogoSize,
  onSave, 
  onClose 
}) => {
  const [customization, setCustomization] = useState<AdvancedQRCustomization>(
    initialCustomization || QR_TEMPLATES[1].customization
  );
  
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>(initialLogoUrl || '');
  const [logoSize, setLogoSize] = useState<number>(initialLogoSize || 40);

  useEffect(() => {
    generateAdvancedQRCode();
  }, [customization, logoDataUrl, logoSize]);

  const generateAdvancedQRCode = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate base QR code with advanced settings
      const qrCanvas = document.createElement('canvas');
      await QRCodeLib.toCanvas(qrCanvas, qrUrl, {
        width: customization.size,
        margin: customization.margin,
        color: {
          dark: customization.colors.foreground,
          light: customization.colors.background
        },
        errorCorrectionLevel: customization.errorCorrectionLevel,
        type: 'image/png',
        quality: 0.92,
        rendererOpts: {
          quality: 0.92
        }
      });

      const finalSize = customization.size + (customization.frame.type !== 'none' ? 40 : 0);
      canvas.width = finalSize;
      canvas.height = finalSize;

      // Draw background
      ctx.fillStyle = customization.colors.background;
      ctx.fillRect(0, 0, finalSize, finalSize);

      // Draw frame if enabled
      if (customization.frame.type !== 'none') {
        const frameOffset = 20;
        const frameSize = customization.size;
        
        ctx.strokeStyle = customization.colors.frameColor;
        ctx.lineWidth = 4;
        
        switch (customization.frame.type) {
          case 'square':
            ctx.strokeRect(frameOffset - 2, frameOffset - 2, frameSize + 4, frameSize + 4);
            break;
          case 'rounded':
            ctx.beginPath();
            const radius = 20;
            ctx.roundRect(frameOffset - 2, frameOffset - 2, frameSize + 4, frameSize + 4, radius);
            ctx.stroke();
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(finalSize / 2, finalSize / 2, (frameSize + 4) / 2, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        }
        
        // Draw QR code with frame offset
        ctx.drawImage(qrCanvas, frameOffset, frameOffset);
      } else {
        // Draw QR code without frame
        ctx.drawImage(qrCanvas, 0, 0);
      }

      // Apply pattern styling (this is a visual representation - actual QR generation would need a specialized library)
      applyPatternStyling(ctx, customization);

      // Add logo if present
      if (logoDataUrl && logoSize) {
        const logo = new Image();
        logo.onload = () => {
          const logoX = (finalSize - logoSize) / 2;
          const logoY = (finalSize - logoSize) / 2;
          
          // Draw logo background
          ctx.fillStyle = customization.colors.background;
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, (logoSize/2) + 8, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw logo border
          ctx.strokeStyle = customization.colors.foreground;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();
          
          setQrDataUrl(canvas.toDataURL());
        };
        logo.src = logoDataUrl;
      } else {
        setQrDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Failed to generate advanced QR code:', error);
    }
  };

  const applyPatternStyling = (ctx: CanvasRenderingContext2D, customization: AdvancedQRCustomization) => {
    // This is a simplified visual representation
    // In a real implementation, you'd need a specialized QR library that supports custom patterns
    
    // Apply eye color styling
    const eyePositions = [
      { x: 20, y: 20 }, // Top-left
      { x: customization.size - 60, y: 20 }, // Top-right
      { x: 20, y: customization.size - 60 } // Bottom-left
    ];

    eyePositions.forEach(pos => {
      ctx.fillStyle = customization.colors.eyeColor;
      
      switch (customization.eyeShape.outerShape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(pos.x + 20, pos.y + 20, 18, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case 'rounded':
          ctx.beginPath();
          ctx.roundRect(pos.x + 2, pos.y + 2, 36, 36, 8);
          ctx.fill();
          break;
        default: // square
          ctx.fillRect(pos.x + 2, pos.y + 2, 36, 36);
      }
    });
  };

  const applyTemplate = (template: QRTemplate) => {
    setCustomization(template.customization);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoDataUrl('');
    setLogoSize(40);
  };

  const resetToDefaults = () => {
    setCustomization(QR_TEMPLATES[1].customization);
    removeLogo();
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = 'advanced-qr-code.png';
      link.href = qrDataUrl;
      link.click();
    }
  };

  const handleSave = () => {
    onSave(customization, logoDataUrl || undefined, logoSize);
  };

  const ColorPicker = ({ colorKey, label }: { colorKey: keyof AdvancedQRCustomization['colors'], label: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setActiveColorPicker(activeColorPicker === colorKey ? null : colorKey)}
          className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <div 
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: customization.colors[colorKey] }}
          />
          <span className="font-mono text-sm">{customization.colors[colorKey]}</span>
        </button>
        {activeColorPicker === colorKey && (
          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <HexColorPicker
              color={customization.colors[colorKey]}
              onChange={(color) => setCustomization(prev => ({
                ...prev,
                colors: { ...prev.colors, [colorKey]: color }
              }))}
            />
            <button
              onClick={() => setActiveColorPicker(null)}
              className="mt-2 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Advanced QR Code Customizer
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                      style={{ width: Math.min(customization.size + (customization.frame.type !== 'none' ? 40 : 0), 300) }}
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

            {/* Templates */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Choose Template
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {QR_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left"
                    >
                      <h5 className="font-medium text-gray-800">{template.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Logo</h4>
                {logoDataUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={logoDataUrl} alt="Logo" className="w-12 h-12 object-cover rounded border border-gray-300" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block">{logoFile?.name || 'Uploaded Logo'}</span>
                        <span className="text-xs text-gray-500">Size: {logoSize}px</span>
                      </div>
                      <button
                        onClick={removeLogo}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {logoSize}px
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        step="5"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
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
            </div>

            {/* Advanced Options */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800">Advanced Options</h4>
              
              {/* Colors */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Colors</h5>
                <ColorPicker colorKey="background" label="Background Color" />
                <ColorPicker colorKey="foreground" label="Foreground Color" />
                <ColorPicker colorKey="eyeColor" label="Eye Color" />
                <ColorPicker colorKey="frameColor" label="Frame Color" />
              </div>

              {/* Pattern Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dot Pattern Style
                </label>
                <select
                  value={customization.pattern.id}
                  onChange={(e) => {
                    const pattern = PATTERN_OPTIONS.find(p => p.id === e.target.value);
                    if (pattern) {
                      setCustomization(prev => ({ ...prev, pattern }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {PATTERN_OPTIONS.map(pattern => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eye Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Eye Shape Style
                </label>
                <select
                  value={customization.eyeShape.id}
                  onChange={(e) => {
                    const eyeShape = EYE_SHAPE_OPTIONS.find(e => e.id === e.target.value);
                    if (eyeShape) {
                      setCustomization(prev => ({ ...prev, eyeShape }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {EYE_SHAPE_OPTIONS.map(eyeShape => (
                    <option key={eyeShape.id} value={eyeShape.id}>
                      {eyeShape.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frame Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  Frame Style
                </label>
                <select
                  value={customization.frame.id}
                  onChange={(e) => {
                    const frame = FRAME_OPTIONS.find(f => f.id === e.target.value);
                    if (frame) {
                      setCustomization(prev => ({ ...prev, frame }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {FRAME_OPTIONS.map(frame => (
                    <option key={frame.id} value={frame.id}>
                      {frame.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size and Margin */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size: {customization.size}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    step="10"
                    value={customization.size}
                    onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Error Correction Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Correction Level
                </label>
                <select
                  value={customization.errorCorrectionLevel}
                  onChange={(e) => setCustomization(prev => ({ 
                    ...prev, 
                    errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
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
            Save Advanced Customization
          </button>
        </div>
      </div>
    </div>
  );
};