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
    <section id="features" className="py-28 relative z-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-20">
          <AnimatedElement delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-5 text-gradient">
              The Foundational Pillars of Aether
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our unique architecture combines cutting-edge AI with secure decentralized infrastructure to deliver unparalleled intelligence.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      className={`glass-card p-10 group transition-all duration-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${tilt.x || tilt.y ? 'scale(1.03)' : 'scale(1)'}`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`w-[72px] h-[72px] rounded-[20px] flex items-center justify-center mb-8 bg-gradient-to-r ${gradient} shadow-[0_0_15px_oklch(0.62_0.24_295/0.4),0_0_30px_oklch(0.60_0.22_250/0.3)] transition-all duration-400 group-hover:scale-110 group-hover:rotate-[7deg] group-hover:shadow-[0_0_30px_oklch(0.62_0.24_295/0.7),0_0_60px_oklch(0.60_0.22_250/0.5)]`}>
        <Icon size={36} weight="fill" className="text-white" />
      </div>
      <h3 className="text-2xl font-semibold mb-5 text-white">{title}</h3>
      <p className="text-gray-400 mb-8 leading-relaxed">{description}</p>
      <button className="inline-flex items-center text-primary text-lg font-medium group-hover:text-[oklch(0.72_0.24_295)] transition-colors">
        {link}
        <ArrowRight size={20} weight="bold" className="ml-3 group-hover:translate-x-1 transition-transform" />
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