'use client';

import { useState } from 'react';
import { AnimatedBackground } from '@/src/components/AnimatedBackground';
import { Navigation } from '@/src/components/Navigation';
import { HeroSection } from '@/src/components/HeroSection';
import { FeaturesSection } from '@/src/components/FeaturesSection';
import { AIDemoSection } from '@/src/components/AIDemoSection';
import { TechnologySection } from '@/src/components/TechnologySection';
import { BetaSection } from '@/src/components/BetaSection';
import { Footer } from '@/src/components/Footer';
import { ScrollToTop } from '@/src/components/ScrollToTop';
import { ScrollIndicator } from '@/src/components/ScrollIndicator';
import { AuthModal } from '@/src/components/AuthModal';

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
