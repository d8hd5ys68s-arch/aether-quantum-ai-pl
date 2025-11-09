import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  return (
    <>
      <div className="fixed inset-0 z-[-2] overflow-hidden bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[70vmax] h-[70vmax] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.24 295), oklch(0.60 0.22 250), oklch(0.75 0.16 195))',
            animation: 'morph 12s ease-in-out infinite both alternate, hueRotate 20s linear infinite',
            animationDelay: '-3s, 0s'
          }}
        />
        <div className="absolute bottom-[-15%] right-[-15%] w-[80vmax] h-[80vmax] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.24 295), oklch(0.60 0.22 250), oklch(0.75 0.16 195))',
            animation: 'morph 12s ease-in-out infinite both alternate, hueRotate 20s linear infinite',
            animationDelay: '-6s, -5s',
            transformOrigin: '70% 30%'
          }}
        />
        <div className="absolute top-[30%] right-[-5%] w-[50vmax] h-[50vmax] rounded-full opacity-10 blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.24 295), oklch(0.60 0.22 250), oklch(0.75 0.16 195))',
            animation: 'morph 12s ease-in-out infinite both alternate, hueRotate 20s linear infinite',
            animationDelay: '-9s, -10s'
          }}
        />
        <div className="absolute bottom-[-5%] left-[20%] w-[60vmax] h-[60vmax] rounded-full opacity-8 blur-[100px]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.62 0.24 295), oklch(0.60 0.22 250), oklch(0.75 0.16 195))',
            animation: 'morph 12s ease-in-out infinite both alternate, hueRotate 20s linear infinite',
            animationDelay: '-12s, -15s',
            transformOrigin: '20% 80%'
          }}
        />
      </div>
      <ParticleOverlay />
    </>
  )
}

function ParticleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Particle[] = []
    const particleCount = window.innerWidth < 768 ? 40 : 80
    const maxDistance = 120

    const particleColors = [
      'rgba(139, 92, 246, 0.4)',
      'rgba(59, 130, 246, 0.4)',
      'rgba(6, 182, 212, 0.4)'
    ]

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.vx = Math.random() * 0.4 - 0.2
        this.vy = Math.random() * 0.4 - 0.2
        this.radius = Math.random() * 1.5 + 0.5
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)]
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        context.fillStyle = this.color
        context.fill()
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1
      }
    }

    function resizeCanvas() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height))
      }
    }

    function drawLines(context: CanvasRenderingContext2D) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            context.beginPath()
            context.moveTo(particles[i].x, particles[i].y)
            context.lineTo(particles[j].x, particles[j].y)
            context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.03})`
            context.lineWidth = 0.5
            context.stroke()
          }
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.update(canvas.width, canvas.height)
        p.draw(ctx)
      })

      drawLines(ctx)

      requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  )
}