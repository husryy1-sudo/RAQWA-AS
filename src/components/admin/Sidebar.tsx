```
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    QrCode,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Share2,
    BarChart2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
        { icon: QrCode, label: 'QR Codes', path: '/admin/qrcodes' },
        { icon: Share2, label: 'Social Bio', path: '/admin/social' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
        fixed top - 0 left - 0 h - full w - 64 bg - slate - 900 text - white shadow - xl z - 50
        transform transition - transform duration - 300 ease -in -out
        ${ isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' }
`}>
                {/* Logo Area */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                            <QrCode className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                            RAQWA
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`flex items - center gap - 3 px - 4 py - 3 rounded - xl transition - all duration - 200 ${
    isActive
        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
} `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout - Fixed at bottom */}
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Users size={20} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Admin User</p>
                            <p className="text-xs text-slate-500 truncate">admin@raqwa.com</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};
