import { useEffect, useRef, useState } from 'react'
import { GoogleLogo, BezierCurve, BookOpen } from '@phosphor-icons/react'

const technologies = [
  {
    icon: GoogleLogo,
    title: 'Gemini Pro API',
    description: "Harnessing Google's most advanced multi-modal AI for superior intelligence and creative capabilities within Aether.",
    gradient: 'from-blue-400 to-indigo-600'
  },
  {
    icon: BezierCurve,
    title: 'Hedera Hashgraph DLT',
    description: 'The underlying DLT providing blazing-fast, verifiable, and eco-friendly transactions and data logging for the network.',
    gradient: 'from-green-400 to-teal-600'
  },
  {
    icon: BookOpen,
    title: 'DocsGPT Framework',
    description: 'An adaptive knowledge management system for Aether to continually learn, evolve, and reason across diverse data sets.',
    gradient: 'from-purple-400 to-fuchsia-600'
  }
]

export function TechnologySection() {
  return (
    <section id="technology" className="py-28 relative z-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <AnimatedElement delay={0.1}>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-5 text-gradient">
              Our Sovereign Technology Stack
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Aether is engineered on a resilient, scalable, and secure foundation designed for the future of distributed intelligence.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid md:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <TechCard key={index} {...tech} delay={0.2 + index * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface TechCardProps {
  icon: React.ElementType
  title: string
  description: string
  gradient: string
  delay: number
}

function TechCard({ icon: Icon, title, description, gradient, delay }: TechCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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
      className={`glass-card p-10 text-center transition-all duration-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-24 h-24 bg-gradient-to-r ${gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transition-all duration-400 ${
          isHovered ? 'scale-110 translate-y-[-10px] rotate-[5deg] shadow-[0_0_30px_oklch(0.62_0.24_295/0.7),0_0_60px_oklch(0.60_0.22_250/0.5)]' : ''
        }`}
      >
        <Icon size={48} weight="fill" className="text-white" />
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
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