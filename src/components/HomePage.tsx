import React from 'react';
import { SocialButton } from './SocialButton';
import { useSocialLinks } from '../hooks/useSocialLinks';
import { useProfile } from '../hooks/useProfile';

export const HomePage: React.FC = () => {
  const { links, loading: linksLoading } = useSocialLinks();
  const { profile, loading: profileLoading } = useProfile();

  const visibleLinks = links.filter(link => link.isVisible);

  if (linksLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white">

      <div className="container mx-auto px-6 py-12 max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/صورة واتساب بتاريخ 2025-05-30 في 16.06.23_2b0f1a92.jpg"
            alt="RAQWA Logo"
            className="w-32 h-32 mx-auto rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-sm"
          />
        </div>

        {/* Profile Info */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-800 mb-3 tracking-tight">
            {profile?.username || 'RAQWA'}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed font-normal">
            {profile?.description || 'Welcome to my social media hub'}
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          {visibleLinks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No social links available yet.</p>
            </div>
          ) : (
            visibleLinks.map((link) => (
              <SocialButton key={link.id} link={link} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            Made with ❤️ for connecting with you
          </p>
        </div>
      </div>
    </div>
  );
};
