'use client';

import { useEffect } from 'react'

export function LoadingShimmer() {
  useEffect(() => {
    // Only run on client
    if (typeof document === 'undefined') return;

    const style = document.createElement('style')
    style.setAttribute('data-shimmer', 'true')
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .shimmer {
        animation: shimmer 3s infinite linear;
        background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.1), transparent);
        background-size: 1000px 100%;
      }
    `
    if (!document.head.querySelector('style[data-shimmer]')) {
      document.head.appendChild(style)
    }
  }, [])

  return (
    <div className="shimmer w-full h-4 rounded bg-white/5" />
  )
}
