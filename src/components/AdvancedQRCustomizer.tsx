import React, { useState, useEffect, useRef } from 'react';
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
import QRCodeStyling from 'qr-code-styling';

interface AdvancedQRCustomizerProps {
  qrUrl: string;
  initialCustomization?: AdvancedQRCustomization;
  logoUrl?: string;
  logoSize?: number;
  onSave: (customization: AdvancedQRCustomization, logoUrl?: string, logoSize?: number) => void;
  onClose: () => void;
}

// Body Shape Options (Dot Patterns) - 22 options like in your image
const BODY_SHAPE_OPTIONS = [
  { id: 'square', name: 'Square', type: 'square' },
  { id: 'dot', name: 'Dot', type: 'dot' },
  { id: 'rounded', name: 'Rounded', type: 'rounded' },
  { id: 'extra-rounded', name: 'Extra Rounded', type: 'extra-rounded' },
  { id: 'classy', name: 'Classy', type: 'classy' },
  { id: 'classy-rounded', name: 'Classy Rounded', type: 'classy-rounded' },
  { id: 'diamond', name: 'Diamond', type: 'diamond' },
  { id: 'star', name: 'Star', type: 'star' },
  { id: 'mosaic', name: 'Mosaic', type: 'mosaic' },
  { id: 'circle', name: 'Circle', type: 'circle' },
  { id: 'heart', name: 'Heart', type: 'heart' },
  { id: 'plus', name: 'Plus', type: 'plus' },
  { id: 'cross', name: 'Cross', type: 'cross' },
  { id: 'triangle', name: 'Triangle', type: 'triangle' },
  { id: 'hexagon', name: 'Hexagon', type: 'hexagon' },
  { id: 'vertical', name: 'Vertical', type: 'vertical' },
  { id: 'horizontal', name: 'Horizontal', type: 'horizontal' },
  { id: 'leaf', name: 'Leaf', type: 'leaf' },
  { id: 'flower', name: 'Flower', type: 'flower' },
  { id: 'wave', name: 'Wave', type: 'wave' },
  { id: 'zigzag', name: 'Zigzag', type: 'zigzag' },
  { id: 'gradient', name: 'Gradient', type: 'gradient' }
];

// Eye Frame Shape Options (Outer Eye) - 15 options
const EYE_FRAME_SHAPE_OPTIONS = [
  { id: 'square', name: 'Square', type: 'square' },
  { id: 'circle', name: 'Circle', type: 'circle' },
  { id: 'rounded', name: 'Rounded', type: 'rounded' },
  { id: 'extra-rounded', name: 'Extra Rounded', type: 'extra-rounded' },
  { id: 'leaf', name: 'Leaf', type: 'leaf' },
  { id: 'pointed', name: 'Pointed', type: 'pointed' },
  { id: 'star', name: 'Star', type: 'star' },
  { id: 'diamond', name: 'Diamond', type: 'diamond' },
  { id: 'flower', name: 'Flower', type: 'flower' },
  { id: 'heart', name: 'Heart', type: 'heart' },
  { id: 'shield', name: 'Shield', type: 'shield' },
  { id: 'hexagon', name: 'Hexagon', type: 'hexagon' },
  { id: 'octagon', name: 'Octagon', type: 'octagon' },
  { id: 'cross', name: 'Cross', type: 'cross' },
  { id: 'plus', name: 'Plus', type: 'plus' }
];

// Eye Ball Shape Options (Inner Eye) - 18 options
const EYE_BALL_SHAPE_OPTIONS = [
  { id: 'square', name: 'Square', type: 'square' },
  { id: 'circle', name: 'Circle', type: 'circle' },
  { id: 'rounded', name: 'Rounded', type: 'rounded' },
  { id: 'extra-rounded', name: 'Extra Rounded', type: 'extra-rounded' },
  { id: 'diamond', name: 'Diamond', type: 'diamond' },
  { id: 'star', name: 'Star', type: 'star' },
  { id: 'heart', name: 'Heart', type: 'heart' },
  { id: 'flower', name: 'Flower', type: 'flower' },
  { id: 'leaf', name: 'Leaf', type: 'leaf' },
  { id: 'cross', name: 'Cross', type: 'cross' },
  { id: 'plus', name: 'Plus', type: 'plus' },
  { id: 'triangle', name: 'Triangle', type: 'triangle' },
  { id: 'hexagon', name: 'Hexagon', type: 'hexagon' },
  { id: 'octagon', name: 'Octagon', type: 'octagon' },
  { id: 'vertical', name: 'Vertical', type: 'vertical' },
  { id: 'horizontal', name: 'Horizontal', type: 'horizontal' },
  { id: 'mosaic', name: 'Mosaic', type: 'mosaic' },
  { id: 'gradient', name: 'Gradient', type: 'gradient' }
];

const FRAME_OPTIONS = [
  { id: 'none', name: 'No Frame', type: 'none' },
  { id: 'square', name: 'Square Frame', type: 'square' },
  { id: 'rounded', name: 'Rounded Frame', type: 'rounded' },
  { id: 'circle', name: 'Circle Frame', type: 'circle' }
];

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
        foreground: '#2563eb',
        eyeColor: '#1f2937',
        frameColor: '#6b7280'
      },
      bodyShape: { id: 'rounded', name: 'Rounded', type: 'rounded' },
      eyeFrameShape: { id: 'rounded', name: 'Rounded', type: 'rounded' },
      eyeBallShape: { id: 'circle', name: 'Circle', type: 'circle' },
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
      bodyShape: { id: 'square', name: 'Square', type: 'square' },
      eyeFrameShape: { id: 'square', name: 'Square', type: 'square' },
      eyeBallShape: { id: 'square', name: 'Square', type: 'square' },
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
      bodyShape: { id: 'circle', name: 'Circle', type: 'circle' },
      eyeFrameShape: { id: 'circle', name: 'Circle', type: 'circle' },
      eyeBallShape: { id: 'heart', name: 'Heart', type: 'heart' },
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
      bodyShape: { id: 'diamond', name: 'Diamond', type: 'diamond' },
      eyeFrameShape: { id: 'extra-rounded', name: 'Extra Rounded', type: 'extra-rounded' },
      eyeBallShape: { id: 'diamond', name: 'Diamond', type: 'diamond' },
      frame: { id: 'square', name: 'Square Frame', type: 'square' },
      errorCorrectionLevel: 'H'
    }
  }
];

export const AdvancedQRCustomizer: React.FC<AdvancedQRCustomizerProps> = ({ 
  qrUrl, 
  initialCustomization, 
  logoUrl: initialLogoUrl,
  logoSize: initialLogoSize,
  onSave, 
  onClose 
}) => {
  // Create a complete default customization object
  const defaultCustomization = QR_TEMPLATES[1].customization;
  
  // Deep merge function to safely merge customization objects
  const mergeCustomization = (initial?: AdvancedQRCustomization): AdvancedQRCustomization => {
    if (!initial) return defaultCustomization;
    
    return {
      size: initial.size || defaultCustomization.size,
      margin: initial.margin || defaultCustomization.margin,
      colors: {
        background: initial.colors?.background || defaultCustomization.colors.background,
        foreground: initial.colors?.foreground || defaultCustomization.colors.foreground,
        eyeColor: initial.colors?.eyeColor || defaultCustomization.colors.eyeColor,
        frameColor: initial.colors?.frameColor || defaultCustomization.colors.frameColor
      },
      bodyShape: initial.bodyShape || defaultCustomization.bodyShape,
      eyeFrameShape: initial.eyeFrameShape || defaultCustomization.eyeFrameShape,
      eyeBallShape: initial.eyeBallShape || defaultCustomization.eyeBallShape,
      frame: initial.frame || defaultCustomization.frame,
      errorCorrectionLevel: initial.errorCorrectionLevel || defaultCustomization.errorCorrectionLevel
    };
  };

  const [customization, setCustomization] = useState<AdvancedQRCustomization>(
    mergeCustomization(initialCustomization)
  );
  
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>(initialLogoUrl || '');
  const [logoSize, setLogoSize] = useState<number>(initialLogoSize || 40);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    generateAdvancedQRCode();
  }, [customization, logoDataUrl, logoSize]);

  const generateAdvancedQRCode = async () => {
    try {
      if (!qrCodeRef.current) return;

      // Create QR code with advanced styling
      const qrCode = new QRCodeStyling({
        width: customization.size,
        height: customization.size,
        type: "canvas",
        data: qrUrl,
        margin: customization.margin,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: customization.errorCorrectionLevel
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: logoSize / customization.size,
          margin: 5,
          crossOrigin: "anonymous"
        },
        dotsOptions: {
          color: customization.colors.foreground,
          type: customization.bodyShape.type as any
        },
        backgroundOptions: {
          color: customization.colors.background
        },
        cornersSquareOptions: {
          color: customization.colors.eyeColor,
          type: customization.eyeFrameShape.type as any
        },
        cornersDotOptions: {
          color: customization.colors.eyeColor,
          type: customization.eyeBallShape.type as any
        }
      });

      // Add logo if present
      if (logoDataUrl) {
        qrCode.update({
          image: logoDataUrl
        });
      }

      // Clear previous QR code
      if (qrCodeRef.current) {
        qrCodeRef.current.innerHTML = '';
      }

      // Append new QR code
      qrCode.append(qrCodeRef.current);
      qrCodeInstance.current = qrCode;

      // Generate data URL for download
      const canvas = qrCodeRef.current?.querySelector('canvas');
      if (canvas) {
        setQrDataUrl(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Failed to generate advanced QR code:', error);
    }
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

  const downloadQRCode = async () => {
    if (qrCodeInstance.current) {
      try {
        await qrCodeInstance.current.download({
          name: "custom-qr-code",
          extension: "png"
        });
      } catch (error) {
        console.error('Failed to download QR code:', error);
      }
    }
  };

  const handleSave = () => {
    const finalCustomization = { ...customization };
    onSave(finalCustomization, logoDataUrl || undefined, logoSize);
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
                  <div ref={qrCodeRef} className="flex justify-center items-center" />
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

            {/* Templates and Logo */}
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
              <h4 className="text-lg font-semibold text-gray-800">Style Options</h4>
              
              {/* Colors */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-700">Colors</h5>
                <ColorPicker colorKey="background" label="Background Color" />
                <ColorPicker colorKey="foreground" label="Foreground Color" />
                <ColorPicker colorKey="eyeColor" label="Eye Color" />
                <ColorPicker colorKey="frameColor" label="Frame Color" />
              </div>

              {/* Body Shape (Dot Pattern) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  Dot Pattern Style
                </label>
                <select
                  value={customization.bodyShape.id}
                  onChange={(e) => {
                    if (!e || !e.target) return;
                    const bodyShape = BODY_SHAPE_OPTIONS.find(p => p.id === e.target.value);
                    if (bodyShape) {
                      setCustomization(prev => ({ ...prev, bodyShape }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {BODY_SHAPE_OPTIONS.map(bodyShape => (
                    <option key={bodyShape.id} value={bodyShape.id}>
                      {bodyShape.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eye Frame Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  Eye Frame Style (Outer)
                </label>
                <select
                  value={customization.eyeFrameShape.id}
                  onChange={(e) => {
                    if (!e || !e.target) return;
                    const eyeFrameShape = EYE_FRAME_SHAPE_OPTIONS.find(e => e.id === e.target.value);
                    if (eyeFrameShape) {
                      setCustomization(prev => ({ ...prev, eyeFrameShape }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {EYE_FRAME_SHAPE_OPTIONS.map(eyeFrameShape => (
                    <option key={eyeFrameShape.id} value={eyeFrameShape.id}>
                      {eyeFrameShape.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eye Ball Shape */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Circle className="w-4 h-4 mr-1" />
                  Eye Ball Style (Inner)
                </label>
                <select
                  value={customization.eyeBallShape.id}
                  onChange={(e) => {
                    if (!e || !e.target) return;
                    const eyeBallShape = EYE_BALL_SHAPE_OPTIONS.find(e => e.id === e.target.value);
                    if (eyeBallShape) {
                      setCustomization(prev => ({ ...prev, eyeBallShape }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {EYE_BALL_SHAPE_OPTIONS.map(eyeBallShape => (
                    <option key={eyeBallShape.id} value={eyeBallShape.id}>
                      {eyeBallShape.name}
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
                    if (!e || !e.target) return;
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
                  onChange={(e) => {
                    if (!e || !e.target) return;
                    setCustomization(prev => ({ 
                      ...prev, 
                      errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'
                    }));
                  }}
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