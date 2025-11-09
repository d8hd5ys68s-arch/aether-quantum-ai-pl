import { useEffect, useRef, useState } from 'react'
import { Brain, Graph, Database, Fingerprint, ArrowRight } from '@phosphor-icons/react'

const features = [
  {
    icon: Brain,
    title: 'Aether AI Core',
    description: 'A proprietary multi-modal AI designed for quantum-level computation, predictive analysis, and emergent intelligence.',
    link: 'Deep Dive',
    gradient: 'from-primary to-[oklch(0.60_0.22_250)]'
  },
  {
    icon: Graph,
    title: 'Decentralized Conduits',
    description: 'Secure, encrypted peer-to-peer network pathways ensuring data sovereignty and verifiable computation across the nexus.',
    link: 'View Schema',
    gradient: 'from-[oklch(0.60_0.22_250)] to-accent'
  },
  {
    icon: Database,
    title: 'DocsGPT Nexus',
    description: 'A dynamic, self-evolving knowledge base providing real-time learning, contextual reasoning, and adaptive intelligence.',
    link: 'Docs Protocol',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Fingerprint,
    title: 'Hedera Hashgraph',
    description: 'Leveraging the Hedera DLT for unparalleled speed, ultra-low cost microtransactions, and environmental sustainability.',
    link: 'Hedera Vision',
    gradient: 'from-orange-500 to-red-500'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <AnimatedElement delay={0.1}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-5 md:mb-6 text-gradient" style={{ textShadow: '0 0 40px oklch(0.62 0.24 295 / 0.3)' }}>
              The Foundational Pillars of Aether
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)' }}>
              Our unique architecture combines cutting-edge AI with secure decentralized infrastructure to deliver unparalleled intelligence.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={0.2 + index * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  link: string
  gradient: string
  delay: number
}

function FeatureCard({ icon: Icon, title, description, link, gradient, delay }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return

    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = ((y - centerY) / centerY) * -10
    const tiltY = ((x - centerX) / centerX) * 10

    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={cardRef}
      className={`glass-card p-8 md:p-12 group transition-all duration-900 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${tilt.x || tilt.y ? 'scale(1.05)' : 'scale(1)'}`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[18px] md:rounded-[24px] flex items-center justify-center mb-8 md:mb-10 bg-gradient-to-r ${gradient} shadow-[0_0_20px_oklch(0.62_0.24_295/0.5),0_0_40px_oklch(0.60_0.22_250/0.4)] transition-all duration-500 group-hover:scale-115 group-hover:rotate-[9deg] group-hover:shadow-[0_0_40px_oklch(0.62_0.24_295/0.9),0_0_80px_oklch(0.60_0.22_250/0.7),0_0_120px_oklch(0.75_0.16_195/0.5)]`}>
        <Icon size={32} weight="fill" className="text-white md:w-10 md:h-10" />
      </div>
      <h3 className="text-2xl md:text-3xl font-semibold mb-5 md:mb-6 text-white" style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)' }}>{title}</h3>
      <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-10 leading-relaxed">{description}</p>
      <button className="inline-flex items-center text-primary text-lg md:text-xl font-medium group-hover:text-[oklch(0.72_0.24_295)] transition-colors duration-300">
        {link}
        <ArrowRight size={20} weight="bold" className="ml-3 md:ml-4 group-hover:translate-x-2 transition-transform duration-300 md:w-6 md:h-6" />
      </button>
    </div>
  )
}

interface AnimatedElementProps {
  children: React.ReactNode
  delay: number
}

function AnimatedElement({ children, delay }: AnimatedElementProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}