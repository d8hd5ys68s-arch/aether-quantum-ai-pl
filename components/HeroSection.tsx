'use client';

import { useEffect, useRef, useState } from 'react'
import { Lightning, Rocket, PlayCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="pt-28 md:pt-36 lg:pt-48 pb-20 md:pb-28 lg:pb-36 text-center relative z-10" id="hero">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.15s_forwards]">
          <div className="inline-flex items-center space-x-2 md:space-x-3 bg-gradient-to-r from-primary/40 to-[oklch(0.60_0.22_250/0.4)] border border-primary/30 rounded-full pl-4 md:pl-6 pr-5 md:pr-8 py-2 md:py-3 mb-8 md:mb-12 shadow-[0_0_20px_oklch(0.62_0.24_295/0.3)] group cursor-default hover:shadow-[0_0_40px_oklch(0.75_0.16_195/0.6)] hover:border-primary/50 transition-all duration-500">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-accent rounded-full animate-ping absolute left-3 md:left-4" />
            <span className="w-2 h-2 md:w-3 md:h-3 bg-accent rounded-full relative left-3 md:left-4" />
            <span className="text-xs md:text-sm text-cyan-200 font-semibold tracking-wide ml-4 md:ml-6 group-hover:text-white transition-colors">
              Quantum Beta Program Activated
            </span>
            <Lightning size={14} weight="fill" className="text-cyan-300 ml-1 md:ml-2 group-hover:text-white transition-colors md:w-4 md:h-4" />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]" style={{ textShadow: '0 0 60px oklch(0.62 0.24 295 / 0.4), 0 0 120px oklch(0.75 0.16 195 / 0.3)' }}>
            Unleash the
            <br />
            <span className="text-gradient">Quantum Intelligence</span>
            <br />
            of Aether.
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-300/90 mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)' }}>
            Aether is forging the future of decentralized AI, merging advanced cognitive models with sovereign, verifiable data on Hedera Hashgraph.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
            <Button className="btn-gradient text-base md:text-lg lg:text-xl px-8 md:px-12 py-5 md:py-7 h-auto group w-full sm:w-auto touch-manipulation">
              <Rocket size={20} weight="fill" className="mr-2 md:mr-3 group-hover:rotate-45 transition-transform duration-500 md:w-6 md:h-6" />
              Initiate Aether Protocol
            </Button>
            <Button variant="outline" className="text-base md:text-lg lg:text-xl px-8 md:px-12 py-5 md:py-7 h-auto group bg-white/5 border-white/15 hover:bg-accent/20 hover:border-accent hover:shadow-[0_0_30px_oklch(0.75_0.16_195/0.5)] w-full sm:w-auto touch-manipulation transition-all duration-500">
              <PlayCircle size={20} weight="fill" className="mr-2 md:mr-3 group-hover:scale-110 transition-transform duration-300 md:w-6 md:h-6" />
              Explore Aether Universe
            </Button>
          </div>

          <StatsSection />
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { value: 99.999, suffix: '%', label: 'Network Uptime', delay: 0.3 },
    { value: 10, prefix: '<', suffix: 'ms', label: 'Cognitive Latency', delay: 0.45 },
    { value: 1, suffix: 'M+', label: 'Concurrent Ops/Sec', delay: 0.6 },
    { value: 0, text: 'Carbon-', label: 'Negative Footprint', delay: 0.75 }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-16 md:mt-28 pt-10 md:pt-16 border-t border-gray-800/50">
      {stats.map((stat, index) => (
        <StatBox key={index} {...stat} />
      ))}
    </div>
  )
}

interface StatBoxProps {
  value: number
  prefix?: string
  suffix?: string
  text?: string
  label: string
  delay: number
}

function StatBox({ value, prefix = '', suffix = '', text, label, delay }: StatBoxProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentValue, setCurrentValue] = useState(0)
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

  useEffect(() => {
    if (!isVisible || text) return

    const duration = 1500
    const startTime = Date.now()
    const startValue = value === 99.999 ? 90 : 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const current = startValue + (value - startValue) * progress
      setCurrentValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [isVisible, value, text])

  return (
    <div
      ref={ref}
      className={`bg-white/3 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_oklch(0.62_0.24_295/0.4),0_8px_40px_rgba(0,0,0,0.4)] hover:border-white/15 transition-all duration-700 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="text-gradient font-extrabold text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4" style={{ textShadow: '0 0 30px oklch(0.62 0.24 295 / 0.5)' }}>
        {text || `${prefix}${value === 99.999 ? currentValue.toFixed(3) : value === 1 ? Math.floor(currentValue) : Math.floor(currentValue)}${suffix}`}
      </div>
      <div className="text-muted-foreground font-semibold text-sm md:text-base lg:text-lg tracking-wide">
        {label}
      </div>
    </div>
  )
}

