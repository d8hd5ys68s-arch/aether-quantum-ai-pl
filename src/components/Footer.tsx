import { Atom } from '@phosphor-icons/react'
import { TwitterLogo, GithubLogo, LinkedinLogo, DiscordLogo } from '@phosphor-icons/react'

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="py-16 border-t border-gray-800/50 relative z-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-[oklch(0.60_0.22_250)] rounded-xl flex items-center justify-center shadow-lg">
                <Atom size={24} weight="bold" className="text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gradient tracking-tight">
                AETHER
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              The definitive nexus for decentralized quantum AI intelligence and innovation. Sovereignty and computation, united.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white hover:scale-125 transition-all text-xl">
                <TwitterLogo size={24} weight="fill" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white hover:scale-125 transition-all text-xl">
                <GithubLogo size={24} weight="fill" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white hover:scale-125 transition-all text-xl">
                <LinkedinLogo size={24} weight="fill" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white hover:scale-125 transition-all text-xl">
                <DiscordLogo size={24} weight="fill" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide">Protocol</h4>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all"
                >
                  Core Elements
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('ai-demo')}
                  className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all"
                >
                  AI Nexus Playground
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Compute Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Developer Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide">Aether Labs</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Manifesto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Career Pathways (3 Nodes Open)
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Research Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Contact Network Hub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide">Legal Nexus</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Privacy Protocols
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Data Security Audit
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary hover:translate-x-1 transition-all">
                  Cookie Configurations
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-16 pt-10 text-center text-gray-600 text-sm">
          <p>&copy; 2024 Aether Labs Inc. All quantum rights reserved. Engineered for the futureverse.</p>
        </div>
      </div>
    </footer>
  )
}