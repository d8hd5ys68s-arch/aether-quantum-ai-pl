export function LoadingShimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  )
}

const style = document.createElement('style')
style.textContent = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`
if (!document.head.querySelector('style[data-shimmer]')) {
  style.setAttribute('data-shimmer', 'true')
  document.head.appendChild(style)
}
