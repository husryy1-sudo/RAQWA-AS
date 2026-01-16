import React, { useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Save
} from 'lucide-react';
import { useSocialLinks } from '../../hooks/useSocialLinks';
import { SocialLink } from '../../types';
import { getSocialIcon } from '../../utils/socialIcons';

export const SocialLinksPage: React.FC = () => {
    const { links, addLink, updateLink, deleteLink } = useSocialLinks();
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [linkForm, setLinkForm] = useState({
        name: '',
        url: '',
        icon: 'link',
        isVisible: true,
        order: links.length
    });

    const socialIconOptions = [
        'instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok',
        'snapchat', 'whatsapp', 'telegram', 'discord', 'twitch', 'github',
        'behance', 'dribbble', 'pinterest', 'link'
    ];

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Social Links</h2>
                    <p className="text-gray-500 mt-1">Manage links displayed on your profile</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                    <Plus size={18} />
                    Add Link
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Link</h3>
                    <form onSubmit={handleAddLink} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={linkForm.name}
                                    onChange={(e) => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-gray-50"
                                    placeholder="e.g., Instagram"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                                <input
                                    type="url"
                                    value={linkForm.url}
                                    onChange={(e) => setLinkForm(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-gray-50"
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                            <div className="flex gap-4 items-center">
                                <select
                                    value={linkForm.icon}
                                    onChange={(e) => setLinkForm(prev => ({ ...prev, icon: e.target.value }))}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 bg-gray-50"
                                >
                                    {socialIconOptions.map(icon => (
                                        <option key={icon} value={icon}>
                                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                                    {React.createElement(getSocialIcon(linkForm.icon), { size: 20 })}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                            >
                                Save Link
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {links.map((link) => (
                    <div
                        key={link.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        {editingLink?.id === link.id ? (
                            <form onSubmit={handleUpdateLink} className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
                                <div className="md:col-span-3">
                                    <input
                                        type="text"
                                        value={editingLink.name}
                                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <input
                                        type="url"
                                        value={editingLink.url}
                                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <select
                                        value={editingLink.icon}
                                        onChange={(e) => setEditingLink(prev => prev ? { ...prev, icon: e.target.value } : null)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        {socialIconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex gap-2 justify-end">
                                    <button type="submit" className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Save size={18} /></button>
                                    <button type="button" onClick={() => setEditingLink(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><EyeOff size={18} /></button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 group-hover:text-pink-500 group-hover:bg-pink-50 transition-colors">
                                        {React.createElement(getSocialIcon(link.icon), { size: 20 })}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{link.name}</h4>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-pink-500 truncate block max-w-[200px] sm:max-w-xs">{link.url}</a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                    <button
                                        onClick={() => handleToggleVisibility(link)}
                                        className={`p-2 rounded-lg transition-colors ${link.isVisible ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-50'}`}
                                        title={link.isVisible ? 'Visible' : 'Hidden'}
                                    >
                                        {link.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => setEditingLink(link)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteLink(link.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
