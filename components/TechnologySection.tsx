'use client';

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
    <section id="technology" className="py-20 md:py-32 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <AnimatedElement delay={0.1}>
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-5 md:mb-6 text-gradient" style={{ textShadow: '0 0 40px oklch(0.62 0.24 295 / 0.3)' }}>
              Our Sovereign Technology Stack
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)' }}>
              Aether is engineered on a resilient, scalable, and secure foundation designed for the future of distributed intelligence.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
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
      className={`glass-card p-8 md:p-12 text-center transition-all duration-900 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-24 h-24 md:w-28 md:h-28 bg-gradient-to-r ${gradient} rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-[0_0_25px_oklch(0.62_0.24_295/0.6)] transition-all duration-500 ${
          isHovered ? 'scale-115 translate-y-[-12px] rotate-[7deg] shadow-[0_0_50px_oklch(0.62_0.24_295/0.9),0_0_100px_oklch(0.60_0.22_250/0.7)]' : ''
        }`}
      >
        <Icon size={40} weight="fill" className="text-white md:w-14 md:h-14" />
      </div>
      <h3 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-5 text-white" style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)' }}>{title}</h3>
      <p className="text-base md:text-lg text-gray-400 leading-relaxed">{description}</p>
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
