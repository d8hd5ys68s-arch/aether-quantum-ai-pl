'use client';

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (isLogin) {
        toast.success('Login successful. Welcome back!')
      } else {
        toast.success('Account registered successfully! Welcome.')
      }

      setEmail('')
      setPassword('')
      setAccessCode('')
      onClose()
    } catch (error) {
      toast.error('Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Logged in with Google successfully!')
      onClose()
    } catch (error) {
      toast.error('Google login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[oklch(0.10_0_0/0.95)] border border-white/8 backdrop-blur-[40px] max-w-[calc(100vw-2rem)] md:max-w-lg p-6 md:p-10 mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-white text-center mb-6 md:mb-8">
            {isLogin ? 'Access Aether Network' : 'Initialize New Aether ID'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Secure Email Address"
            className="px-4 md:px-6 py-3 md:py-4 h-12 md:h-14 rounded-full text-base md:text-lg bg-white/8 border-white/15 focus:border-accent focus:ring-accent"
            required
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? 'Quantum Password' : 'Quantum Password (min. 8 characters)'}
            className="px-4 md:px-6 py-3 md:py-4 h-12 md:h-14 rounded-full text-base md:text-lg bg-white/8 border-white/15 focus:border-accent focus:ring-accent"
            required
          />

          {!isLogin && (
            <Input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Beta Access Key (Optional)"
              className="px-4 md:px-6 py-3 md:py-4 h-12 md:h-14 rounded-full text-base md:text-lg bg-white/8 border-white/15 focus:border-accent focus:ring-accent"
            />
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-gradient w-full text-lg md:text-xl h-12 md:h-14 touch-manipulation"
          >
            {isSubmitting ? 'Processing...' : isLogin ? 'Authenticate Protocol' : 'Register Account'}
          </Button>
        </form>

        <div className="relative my-6 md:my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[oklch(0.10_0_0)] px-3 text-xs md:text-sm text-gray-500">
              or connect with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            variant="outline"
            className="px-3 md:px-6 py-3 md:py-4 h-auto flex items-center justify-center bg-white/5 border-white/15 hover:bg-accent/20 hover:border-accent text-sm md:text-base touch-manipulation"
          >
            <GoogleLogo size={18} weight="bold" className="mr-2 md:mr-3 md:w-5 md:h-5" />
            Google ID
          </Button>
          <Button
            type="button"
            disabled
            variant="outline"
            className="px-3 md:px-6 py-3 md:py-4 h-auto flex items-center justify-center bg-white/5 border-white/15 opacity-50 cursor-not-allowed text-sm md:text-base"
            title="Neuralink ID integration pending"
          >
            <span className="mr-2 md:mr-3">🧠</span>
            Neuralink ID
          </Button>
        </div>

        <p className="text-sm md:text-base text-gray-400 text-center mt-6 md:mt-10">
          {isLogin ? 'No Aether ID?' : 'Already have an Aether ID?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent font-medium hover:text-[oklch(0.85_0.16_195)] transition-colors touch-manipulation"
          >
            {isLogin ? 'Initialize New Account' : 'Log In Instead'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
