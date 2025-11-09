import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function BetaSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signups, setSignups] = useKV<string[]>('beta-signups', [])

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
    <section id="beta" className="py-16 md:py-28 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <AnimatedElement delay={0.1}>
          <div className="max-w-5xl mx-auto text-center">
            <div className="glass-card py-12 md:py-20 px-6 md:px-10 relative">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 text-gradient">
                Join the Quantum Beta Program
              </h2>
              <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                Secure your exclusive access key to the Aether platform. Limited sovereign network nodes are available for pioneers.
              </p>

              <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-5">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your quantum email address"
                    className="flex-1 rounded-full px-4 md:px-6 h-12 md:h-14 text-base md:text-lg bg-white/8 border-white/15 focus:border-accent focus:ring-accent"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gradient px-6 md:px-10 h-12 md:h-14 whitespace-nowrap text-base md:text-xl touch-manipulation"
                  >
                    {isSubmitting ? 'Processing...' : 'Request Access Key'}
                  </Button>
                </div>
              </form>

              <div className="mt-10 md:mt-16 text-sm md:text-base text-gray-500 tracking-wide px-4">
                <p>Access keys are limited and allocated based on network contribution and verification. Pioneer status rewarded.</p>
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