import React, { useState, useEffect } from 'react';
import { QRCustomization, QRAdvancedCustomization, QRTemplate } from '../types';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Download, 
  RotateCcw,
  Upload,
  X,
  ChevronDown,
  Settings
} from 'lucide-react';
import { QR_TEMPLATES, QR_FRAME_STYLES, QR_DOT_STYLES, getDefaultAdvancedCustomization } from '../utils/qrTemplates';
import { AdvancedQRGenerator } from '../utils/qrGenerator';

interface QRCustomizerProps {
  qrUrl: string;
  initialCustomization?: QRAdvancedCustomization;
  onSave: (customization: QRAdvancedCustomization) => void;
  onClose: () => void;
}

export const QRCustomizer: React.FC<QRCustomizerProps> = ({ 
  qrUrl, 
  initialCustomization, 
  onSave, 
  onClose 
}) => {
  // Convert old customization format to new format if needed
  const convertToAdvancedCustomization = (oldCustomization: any): QRAdvancedCustomization => {
    if (oldCustomization && oldCustomization.colors) {
      // Already in new format
      return oldCustomization;
    }
    
    // Convert old format or create default
    const defaultCustomization = getDefaultAdvancedCustomization();
    
    if (oldCustomization) {
      return {
        ...defaultCustomization,
        size: oldCustomization.size || defaultCustomization.size,
        margin: oldCustomization.margin || defaultCustomization.margin,
        colors: {
          ...defaultCustomization.colors,
          background: oldCustomization.backgroundColor || defaultCustomization.colors.background,
          foreground: oldCustomization.foregroundColor || defaultCustomization.colors.foreground,
        },
        logoUrl: oldCustomization.logoUrl,
      };
    }
    
    return defaultCustomization;
  };

  const [customization, setCustomization] = useState<QRAdvancedCustomization>(
    convertToAdvancedCustomization(initialCustomization)
  );
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [customization]);

  const generateQRCode = async () => {
    try {
      const generator = new AdvancedQRGenerator(qrUrl, customization);
      const dataUrl = await generator.generate();
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleTemplateSelect = (template: QRTemplate) => {
    setSelectedTemplate(template.id);
    setCustomization(template.customization);
    setShowTemplateSelector(false);
  };

  const handleColorChange = (colorType: string, color: string) => {
    setCustomization(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  const handleStyleChange = (styleType: 'frame' | 'bodyShape' | 'eyeFrameShape' | 'eyeBallShape', styleId: string) => {
    const styles = styleType === 'frame' ? QR_FRAME_STYLES : QR_DOT_STYLES;
    const selectedStyle = styles.find(style => style.id === styleId);
    
    if (selectedStyle) {
      setCustomization(prev => ({
        ...prev,
        [styleType]: selectedStyle
      }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
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
          logoUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoDataUrl('');
    setCustomization(prev => ({
      ...prev,
      logoUrl: undefined
    }));
  };

  const resetToDefaults = () => {
    setCustomization(getDefaultAdvancedCustomization());
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
    onSave(customization);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Customization Options
              </h4>
              
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a Template
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={QR_TEMPLATES.find(t => t.id === selectedTemplate)?.preview} 
                        alt="Template" 
                        className="w-8 h-8 rounded border border-gray-300"
                      />
                      <span>{QR_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${showTemplateSelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showTemplateSelector && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2 p-3">
                        {QR_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedTemplate === template.id
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img 
                              src={template.preview} 
                              alt={template.name}
                              className="w-full h-16 object-cover rounded mb-2"
                            />
                            <span className="text-sm font-medium">{template.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Controls */}
              <div>
                <h5 className="text-base font-semibold text-gray-800 mb-3">Colors</h5>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customization.colors).map(([colorType, color]) => (
                    <div key={colorType}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {colorType.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setActiveColorPicker(activeColorPicker === colorType ? null : colorType)}
                          className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <div 
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-mono text-sm">{color}</span>
                        </button>
                        {activeColorPicker === colorType && (
                          <div className="absolute top-full left-0 mt-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                            <HexColorPicker
                              color={color}
                              onChange={(newColor) => handleColorChange(colorType, newColor)}
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
                  ))}
                </div>
              </div>

              {/* Frame Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Style
                </label>
                <select
                  value={customization.frame.id}
                  onChange={(e) => handleStyleChange('frame', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {QR_FRAME_STYLES.map(style => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dot Patterns */}
              <div>
                <h5 className="text-base font-semibold text-gray-800 mb-3">Dot Patterns</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Body Style
                    </label>
                    <select
                      value={customization.bodyShape.id}
                      onChange={(e) => handleStyleChange('bodyShape', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {QR_DOT_STYLES.map(style => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outer Eye Style
                    </label>
                    <select
                      value={customization.eyeFrameShape.id}
                      onChange={(e) => handleStyleChange('eyeFrameShape', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {QR_DOT_STYLES.map(style => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Inner Eye Style
                    </label>
                    <select
                      value={customization.eyeBallShape.id}
                      onChange={(e) => handleStyleChange('eyeBallShape', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {QR_DOT_STYLES.map(style => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                    max="600"
                    step="20"
                    value={customization.size}
                    onChange={(e) => setCustomization(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>200px</span>
                    <span>600px</span>
                  </div>
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>8</span>
                  </div>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Center Logo (Optional) - Max 5MB
                </label>
                {logoDataUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={logoDataUrl} alt="Logo" className="w-12 h-12 object-cover rounded border border-gray-300" />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600 block truncate">{logoFile?.name || 'Uploaded Logo'}</span>
                        <span className="text-xs text-gray-500">Logo will be centered</span>
                      </div>
                      <button
                        onClick={removeLogo}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
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