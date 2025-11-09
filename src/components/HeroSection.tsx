import { useEffect, useRef, useState } from 'react'
import { Lightning, Rocket, PlayCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="pt-[220px] pb-[150px] text-center relative z-10" id="hero">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="max-w-5xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.15s_forwards]">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary/40 to-[oklch(0.60_0.22_250/0.4)] border border-primary/30 rounded-full pl-6 pr-8 py-3 mb-10 shadow-inner group cursor-default hover:shadow-[0_0_30px_oklch(0.75_0.16_195/0.4)] transition-all duration-300">
            <span className="w-3 h-3 bg-accent rounded-full animate-ping absolute left-4" />
            <span className="w-3 h-3 bg-accent rounded-full relative left-4" />
            <span className="text-sm text-cyan-200 font-semibold tracking-wide ml-6 group-hover:text-white transition-colors">
              Quantum Beta Program Activated
            </span>
            <Lightning size={16} weight="fill" className="text-cyan-300 ml-2 group-hover:text-white transition-colors" />
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-[1.05]">
            Unleash the
            <br />
            <span className="text-gradient">Quantum Intelligence</span>
            <br />
            of Aether.
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-14 max-w-3xl mx-auto leading-relaxed">
            Aether is forging the future of decentralized AI, merging advanced cognitive models with sovereign, verifiable data on Hedera Hashgraph.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Button className="btn-gradient text-xl px-10 py-6 h-auto group">
              <Rocket size={24} weight="fill" className="mr-3 group-hover:rotate-45 transition-transform duration-500" />
              Initiate Aether Protocol
            </Button>
            <Button variant="outline" className="text-xl px-10 py-6 h-auto group bg-white/5 border-white/15 hover:bg-accent/20 hover:border-accent">
              <PlayCircle size={24} weight="fill" className="mr-3 group-hover:scale-110 transition-transform duration-300" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-12 border-t border-gray-800/50">
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
      className={`bg-white/2 border border-white/7 rounded-2xl p-6 text-center backdrop-blur-[15px] shadow-[0_2px_20px_rgba(0,0,0,0.2)] transition-opacity duration-800 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-gradient font-extrabold text-5xl mb-3">
        {text || `${prefix}${value === 99.999 ? currentValue.toFixed(3) : value === 1 ? Math.floor(currentValue) : Math.floor(currentValue)}${suffix}`}
      </div>
      <div className="text-muted-foreground font-semibold text-base tracking-wide">
        {label}
      </div>
    </div>
  )
}

const style = document.createElement('style')
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)