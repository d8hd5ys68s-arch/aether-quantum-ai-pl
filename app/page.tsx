'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { AIDemoSection } from '@/components/AIDemoSection';
import { TechnologySection } from '@/components/TechnologySection';
import { BetaSection } from '@/components/BetaSection';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { AuthModal } from '@/components/AuthModal';

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
