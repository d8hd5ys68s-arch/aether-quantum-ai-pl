import { useEffect, useState } from 'react'

export function ScrollIndicator() {
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const totalScroll = documentHeight - windowHeight
      const percentage = (scrollTop / totalScroll) * 100

      setScrollPercentage(Math.min(percentage, 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-[oklch(0.60_0.22_250)] to-accent transition-all duration-200 ease-out shadow-[0_0_10px_oklch(0.75_0.16_195)]"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  )
}
