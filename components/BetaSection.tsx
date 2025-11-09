'use client';

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function BetaSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signups, setSignups] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSignups((current) => {
        const currentSignups = current || []
        return [...currentSignups, email]
      })

      toast.success('Success! Your access request has been transmitted.')
      setEmail('')
    } catch (error) {
      toast.error('Error saving request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="beta" className="py-20 md:py-32 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <AnimatedElement delay={0.1}>
          <div className="max-w-5xl mx-auto text-center">
            <div className="glass-card py-16 md:py-24 px-8 md:px-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-5 md:mb-8 text-gradient" style={{ textShadow: '0 0 40px oklch(0.62 0.24 295 / 0.3)' }}>
                  Join the Quantum Beta Program
                </h2>
                <p className="text-lg md:text-xl text-gray-300/90 mb-10 md:mb-14 max-w-3xl mx-auto leading-relaxed px-4" style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)' }}>
                Secure your exclusive access key to the Aether platform. Limited sovereign network nodes are available for pioneers.
              </p>

              <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your quantum email address"
                    className="flex-1 rounded-full px-5 md:px-8 h-14 md:h-16 text-base md:text-lg bg-white/8 border-white/15 focus:border-accent focus:ring-accent focus:shadow-[0_0_30px_oklch(0.75_0.16_195/0.5)] transition-all duration-300"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gradient px-8 md:px-12 h-14 md:h-16 whitespace-nowrap text-base md:text-xl touch-manipulation"
                  >
                    {isSubmitting ? 'Processing...' : 'Request Access Key'}
                  </Button>
                </div>
              </form>

              <div className="mt-12 md:mt-20 text-base md:text-lg text-gray-500 tracking-wide px-4">
                <p>Access keys are limited and allocated based on network contribution and verification. Pioneer status rewarded.</p>
              </div>
              </div>
            </div>
          </div>
        </AnimatedElement>
      </div>
    </section>
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
