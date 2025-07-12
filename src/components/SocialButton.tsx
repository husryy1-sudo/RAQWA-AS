import React from 'react';
import { SocialLink } from '../types';
import { getSocialIcon } from '../utils/socialIcons.tsx';

interface SocialButtonProps {
  link: SocialLink;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ link }) => {
  const IconComponent = getSocialIcon(link.icon);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-center w-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-pink-100"
    >
      <div className="flex items-center space-x-4 w-full">
        <div className="flex-shrink-0 w-8 h-8 text-pink-500 group-hover:text-pink-600 transition-colors">
          <IconComponent size={32} />
        </div>
        <span className="text-gray-800 font-medium text-lg group-hover:text-gray-900 transition-colors">
          {link.name}
        </span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  );
}