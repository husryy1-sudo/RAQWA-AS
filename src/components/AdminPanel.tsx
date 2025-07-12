import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { useProfile } from '../hooks/useProfile';
import { SocialLink } from '../types';
import { 
  LogOut, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  X,
  Home,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSocialIcon } from '../utils/socialIcons.tsx';
import { QRCodeManager } from './QRCodeManager';

export const AdminPanel: React.FC = () => {
  const { logout } = useAuth();
  const { links, addLink, updateLink, deleteLink } = useSocialLinks();
  const { profile, updateProfile } = useProfile();
  
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: profile?.username || '',
    description: profile?.description || ''
  });

  const [linkForm, setLinkForm] = useState({
    name: '',
    url: '',
    icon: 'link',
    isVisible: true,
    order: links.length
  });

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLink(linkForm);
      setLinkForm({ name: '', url: '', icon: 'link', isVisible: true, order: links.length });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add link:', error);
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    
    try {
      await updateLink(editingLink.id, {
        name: editingLink.name,
        url: editingLink.url,
        icon: editingLink.icon,
        isVisible: editingLink.isVisible
      });
      setEditingLink(null);
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(id);
      } catch (error) {
        console.error('Failed to delete link:', error);
      }
    }
  };

  const handleToggleVisibility = async (link: SocialLink) => {
    try {
      await updateLink(link.id, { isVisible: !link.isVisible });
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        id: '1',
        username: profileForm.username,
        description: profileForm.description
      });
      setEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const socialIconOptions = [
    'instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok',
    'snapchat', 'whatsapp', 'telegram', 'discord', 'twitch', 'github',
    'behance', 'dribbble', 'pinterest', 'link'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 hover:bg-pink-50 rounded-lg transition-colors text-gray-600 hover:text-pink-500"
              >
                <Home className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Back to Site</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Profile Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-8 border border-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Settings
            </h2>
            <button
              onClick={() => {
                setEditingProfile(!editingProfile);
                setProfileForm({
                  username: profile?.username || '',
                  description: profile?.description || ''
                });
              }}
              className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
              {editingProfile ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            </button>
          </div>

          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                  rows={3}
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Save size={16} />
                <span>Save Profile</span>
              </button>
            </form>
          ) : (
            <div>
              <p className="text-gray-800 font-medium mb-2">{profile?.username || 'No username set'}</p>
              <p className="text-gray-600">{profile?.description || 'No description set'}</p>
            </div>
          )}
        </div>

        {/* Social Links Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-pink-100">
          {/* QR Code Management */}
          <QRCodeManager />
        </div>

        {/* Social Links Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mt-8 border border-pink-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Social Media Links</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Link</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {/* Add Link Form */}
          {showAddForm && (
            <div className="bg-pink-50 rounded-xl p-4 md:p-6 mb-6 border border-pink-200">
              <form onSubmit={handleAddLink} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={linkForm.name}
                      onChange={(e) => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                      placeholder="e.g., Instagram"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={linkForm.url}
                      onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    value={linkForm.icon}
                    onChange={(e) => setLinkForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                  >
                    {socialIconOptions.map(icon => (
                      <option key={icon} value={icon}>
                        {icon.charAt(0).toUpperCase() + icon.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm md:text-base"
                  >
                    <Save size={16} />
                    <span>Add Link</span>
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

          {/* Links List */}
          <div className="space-y-4">
            {links.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No social links added yet.</p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 sm:space-y-0"
                >
                  {editingLink?.id === link.id ? (
                    <form onSubmit={handleUpdateLink} className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      <input
                        type="text"
                        value={editingLink.name}
                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, name: e.target.value } : null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        required
                      />
                      <input
                        type="url"
                        value={editingLink.url}
                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        required
                      />
                      <select
                        value={editingLink.icon}
                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, icon: e.target.value } : null)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                      >
                        {socialIconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                          </option>
                        ))}
                      </select>
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
                          onClick={() => setEditingLink(null)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                        <div className="w-8 h-8 text-pink-500">
                          {React.createElement(getSocialIcon(link.icon), { size: 24 })}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800">{link.name}</p>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{link.url}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          link.isVisible 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleVisibility(link)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title={link.isVisible ? 'Hide' : 'Show'}
                        >
                          {link.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
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
        </div>
      </div>
    </div>
  );
};