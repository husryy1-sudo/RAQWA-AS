import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

export const SettingsPage: React.FC = () => {
    const { profile, updateProfile } = useProfile();
    const [username, setUsername] = useState(profile?.username || '');
    const [description, setDescription] = useState(profile?.description || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                id: '1',
                username,
                description
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                <p className="text-gray-500">Manage your profile and account settings</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border-4 border-white shadow-sm">
                            <User size={32} />
                        </div>
                        <div>
                            <button type="button" className="text-sm font-semibold text-pink-600 hover:text-pink-700">Change Photo</button>
                            <p className="text-xs text-gray-400 mt-1">Recommended: 400x400px</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 bg-gray-50 resize-none"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-right">0/150 characters</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-200 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
