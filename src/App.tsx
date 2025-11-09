import { useState } from 'react'
import { Toaster } from 'sonner'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { Navigation } from '@/components/Navigation'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { AIDemoSection } from '@/components/AIDemoSection'
import { TechnologySection } from '@/components/TechnologySection'
import { BetaSection } from '@/components/BetaSection'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { ScrollIndicator } from '@/components/ScrollIndicator'
import { AuthModal } from '@/components/AuthModal'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'oklch(0.10 0 0 / 0.9)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            color: 'oklch(0.95 0 0)',
            backdropFilter: 'blur(20px)'
          }
        }}
      />
    </div>
  )
}

export default App