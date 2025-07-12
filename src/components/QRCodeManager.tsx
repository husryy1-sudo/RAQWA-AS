import React, { useState } from 'react';
import { useQRCodes } from '../hooks/useQRCodes';
import { QRCode, QRAnalytics, QRAnalyticsSummary } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  X,
  QrCode,
  BarChart3,
  ExternalLink,
  Copy,
  Download,
  Palette
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { QRAnalyticsDashboard } from './QRAnalyticsDashboard';
import { QRCustomizer } from './QRCustomizer';

export const QRCodeManager: React.FC = () => {
  const { qrCodes, addQRCode, updateQRCode, deleteQRCode, getQRAnalytics, getQRAnalyticsSummary, updateQRCustomization, generateShortCode } = useQRCodes();
  
  const [editingQR, setEditingQR] = useState<QRCode | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<QRAnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState<QRCode | null>(null);

  const [qrForm, setQRForm] = useState({
    name: '',
    shortCode: '',
    destinationUrl: '',
    isActive: true
  });

  const handleAddQR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addQRCode(qrForm);
      setQRForm({ name: '', shortCode: '', destinationUrl: '', isActive: true });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add QR code:', error);
    }
  };

  const handleUpdateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQR) return;
    
    try {
      await updateQRCode(editingQR.id, {
        name: editingQR.name,
        shortCode: editingQR.shortCode,
        destinationUrl: editingQR.destinationUrl,
        isActive: editingQR.isActive
      });
      setEditingQR(null);
    } catch (error) {
      console.error('Failed to update QR code:', error);
    }
  };

  const handleDeleteQR = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this QR code? This will also delete all associated analytics data.')) {
      try {
        await deleteQRCode(id);
      } catch (error) {
        console.error('Failed to delete QR code:', error);
      }
    }
  };

  const handleToggleActive = async (qr: QRCode) => {
    try {
      await updateQRCode(qr.id, { isActive: !qr.isActive });
    } catch (error) {
      console.error('Failed to toggle QR code status:', error);
    }
  };

  const handleShowAnalytics = async (qrCodeId: string) => {
    setLoadingAnalytics(true);
    try {
      const summary = await getQRAnalyticsSummary(qrCodeId);
      setAnalyticsSummary(summary);
      setShowAnalytics(qrCodeId);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateQRCodeImage = async (qr: QRCode, customization?: any): Promise<string> => {
    const qrUrl = `${window.location.origin}/qr/${qr.shortCode}`;
    const custom = customization || qr.customization || {
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      size: 200,
      margin: 2
    };
    
    try {
      return await QRCodeLib.toDataURL(qrUrl, {
        width: custom.size || 200,
        margin: custom.margin || 2,
        color: {
          dark: custom.foregroundColor || '#000000',
          light: custom.backgroundColor || '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  };

  const downloadQRCode = async (qr: QRCode) => {
    try {
      const dataUrl = await generateQRCodeImage(qr, qr.customization);
      const link = document.createElement('a');
      link.download = `qr-${qr.shortCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCustomizeQR = (qr: QRCode) => {
    setShowCustomizer(qr);
  };

  const handleSaveCustomization = async (qr: QRCode, customization: any) => {
    try {
      await updateQRCustomization(qr.id, customization);
      setShowCustomizer(null);
    } catch (error) {
      console.error('Failed to save customization:', error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-pink-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          QR Code Management
        </h2>
        <button
          onClick={() => {
            setQRForm({ ...qrForm, shortCode: generateShortCode() });
            setShowAddForm(true);
          }}
          className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Create QR Code</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Add QR Form */}
      {showAddForm && (
        <div className="bg-pink-50 rounded-xl p-4 md:p-6 mb-6 border border-pink-200">
          <form onSubmit={handleAddQR} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Name
                </label>
                <input
                  type="text"
                  value={qrForm.name}
                  onChange={(e) => setQRForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                  placeholder="e.g., Website Link"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrForm.shortCode}
                    onChange={(e) => setQRForm(prev => ({ ...prev, shortCode: e.target.value.toLowerCase() }))}
                    className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                    placeholder="abc123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQRForm(prev => ({ ...prev, shortCode: generateShortCode() }))}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination URL
              </label>
              <input
                type="url"
                value={qrForm.destinationUrl}
                onChange={(e) => setQRForm(prev => ({ ...prev, destinationUrl: e.target.value }))}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
              >
                <Save size={16} />
                <span>Create QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 md:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Codes List */}
      <div className="space-y-4">
        {qrCodes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No QR codes created yet.</p>
        ) : (
          qrCodes.map((qr) => (
            <div
              key={qr.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 lg:space-y-0"
            >
              {editingQR?.id === qr.id ? (
                <form onSubmit={handleUpdateQR} className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <input
                    type="text"
                    value={editingQR.name}
                    onChange={(e) => setEditingQR(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={editingQR.shortCode}
                    onChange={(e) => setEditingQR(prev => prev ? { ...prev, shortCode: e.target.value.toLowerCase() } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="url"
                    value={editingQR.destinationUrl}
                    onChange={(e) => setEditingQR(prev => prev ? { ...prev, destinationUrl: e.target.value } : null)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    required
                  />
                  <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-3">
                    <button
                      type="submit"
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Save size={14} />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingQR(null)}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800">{qr.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs md:text-sm text-gray-600">
                        <span>/qr/{qr.shortCode}</span>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/qr/${qr.shortCode}`)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors self-start sm:self-auto"
                          title="Copy QR URL"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{qr.destinationUrl}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      qr.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {qr.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 mt-3 lg:mt-0">
                    <button
                      onClick={() => handleCustomizeQR(qr)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Customize QR Code"
                    >
                      <Palette size={16} />
                    </button>
                    <button
                      onClick={() => downloadQRCode(qr)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Download QR Code"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleShowAnalytics(qr.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 size={16} />
                    </button>
                    <button
                      onClick={() => window.open(qr.destinationUrl, '_blank')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Visit URL"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(qr)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title={qr.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {qr.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => setEditingQR(qr)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteQR(qr.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAnalytics(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : analyticsSummary ? (
                <QRAnalyticsDashboard 
                  summary={analyticsSummary} 
                  qrName={qrCodes.find(qr => qr.id === showAnalytics)?.name || 'QR Code'}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">Failed to load analytics data.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Customizer Modal */}
      {showCustomizer && (
        <QRCustomizer
          qrUrl={`${window.location.origin}/qr/${showCustomizer.shortCode}`}
          initialCustomization={showCustomizer.customization}
          onSave={(customization) => handleSaveCustomization(showCustomizer, customization)}
          onClose={() => setShowCustomizer(null)}
        />
      )}
    </div>
  );
};