import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
    return (
        <header className="bg-white border-b border-gray-100 h-16 sticky top-0 z-30">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden rounded-lg hover:bg-gray-100"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center relative">
                        <Search className="absolute left-3 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-pink-500 w-64"
                        />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-pink-500 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};
