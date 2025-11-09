import { useState, useEffect } from 'react'
import { Atom, List, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface NavigationProps {
  onLoginClick: () => void
}

export function Navigation({ onLoginClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    )

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      <nav
        className={`fixed w-full z-50 py-5 top-0 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-[40px] border-b border-white/6 shadow-[0_4px_40px_rgba(0,0,0,0.4)]'
            : 'bg-background/50 backdrop-blur-[20px] border-b border-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_250)] rounded-xl flex items-center justify-center shadow-lg quantum-pulse">
              <Atom size={24} weight="bold" className="text-white" />
            </div>
            <span className="text-3xl font-extrabold text-gradient tracking-tight">
              AETHER
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <button
              onClick={() => scrollToSection('features')}
              className={`nav-link relative font-semibold tracking-wide transition-all ${
                activeSection === 'features' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('ai-demo')}
              className={`nav-link relative font-semibold tracking-wide transition-all ${
                activeSection === 'ai-demo' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              AI Demo
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className={`nav-link relative font-semibold tracking-wide transition-all ${
                activeSection === 'technology' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection('beta')}
              className={`nav-link relative font-semibold tracking-wide transition-all ${
                activeSection === 'beta' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Join Beta
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={onLoginClick} className="btn-gradient text-base px-8">
              Login
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white text-2xl"
            >
              <List size={32} />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-[40px] opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-8 right-8 text-white text-4xl"
          >
            <X size={48} />
          </button>
          <div className="flex flex-col space-y-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-3xl font-bold text-gray-300 text-center py-4 hover:text-white hover:scale-105 transition-all"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('ai-demo')}
              className="text-3xl font-bold text-gray-300 text-center py-4 hover:text-white hover:scale-105 transition-all"
            >
              AI Demo
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="text-3xl font-bold text-gray-300 text-center py-4 hover:text-white hover:scale-105 transition-all"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection('beta')}
              className="text-3xl font-bold text-gray-300 text-center py-4 hover:text-white hover:scale-105 transition-all"
            >
              Join Beta
            </button>
          </div>
        </div>
      )}
    </>
  )
}