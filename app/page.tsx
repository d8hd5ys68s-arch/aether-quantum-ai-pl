'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { AIDemoSection } from '@/components/AIDemoSection';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ScrollIndicator } from '@/components/ScrollIndicator';

// Dynamic imports for below-the-fold components to reduce initial bundle size
const TechnologySection = dynamic(() => import('@/components/TechnologySection').then(mod => ({ default: mod.TechnologySection })), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
});

const BetaSection = dynamic(() => import('@/components/BetaSection').then(mod => ({ default: mod.BetaSection })), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
});

const Footer = dynamic(() => import('@/components/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-48 bg-background"></div>
});

// AuthModal is only needed when user clicks login, so load it on demand
const AuthModal = dynamic(() => import('@/components/AuthModal').then(mod => ({ default: mod.AuthModal })), {
  ssr: false // Don't render on server since it's modal-only
});

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollIndicator />
      <AnimatedBackground />
      <Navigation onLoginClick={() => setIsAuthModalOpen(true)} />
      <HeroSection />
      <FeaturesSection />
      <AIDemoSection />
      <TechnologySection />
      <BetaSection />
      <Footer />
      <ScrollToTop />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
