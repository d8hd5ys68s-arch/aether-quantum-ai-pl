'use client';

import { useState, useRef, useEffect } from 'react'
import { PaperPlaneRight, ArrowsClockwise, Check, Copy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'ai' | 'loading'
  content: string
}

const suggestionChips = [
  'Define Quantum AI',
  'How does Hedera secure Aether?',
  "DocsGPT's role in Aether's learning?"
]

export function AIDemoSection() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Greetings, I am Aether. How may I illuminate your inquiries today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    setInput('')
    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    }

    setMessages(prev => [...prev, userMessage])

    const loadingId = `loading-${Date.now()}`
    setMessages(prev => [...prev, { id: loadingId, role: 'loading', content: 'Aether is computing...' }])

    try {
      const aiResponse = await getAIResponse(text)

      setMessages(prev => prev.filter(m => m.id !== loadingId))

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: aiResponse
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== loadingId))
      toast.error('Failed to get AI response. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([
      { id: '1', role: 'ai', content: 'Greetings, I am Aether. How may I illuminate your inquiries today?' }
    ])
    toast.info('Chat history cleared.')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section id="ai-demo" className="py-20 md:py-32 relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards]">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-5 md:mb-8 text-gradient" style={{ textShadow: '0 0 40px oklch(0.62 0.24 295 / 0.3)' }}>
              Engage with Aether AI
            </h2>
            <p className="text-gray-300/90 mb-8 md:mb-10 text-lg md:text-xl leading-relaxed max-w-lg" style={{ textShadow: '0 2px 15px rgba(0, 0, 0, 0.5)' }}>
              Interact directly with Aether's advanced cognitive model. Ask profound questions, request intricate data, or explore creative frontiers.
            </p>

            <div className="space-y-5 md:space-y-7 mt-8 md:mt-12 text-base md:text-lg">
              {[
                'Hyper-responsive feedback, even on the most complex queries.',
                'Profound contextual understanding across vast data oceans.',
                'Continuous self-optimization and emergent capabilities.'
              ].map((text, i) => (
                <div key={i} className="flex items-start space-x-4 md:space-x-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Check size={16} weight="bold" className="text-green-400 md:w-5 md:h-5" />
                  </div>
                  <p className="text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 md:p-10 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <div className="h-[500px] md:h-[600px] flex flex-col rounded-2xl overflow-hidden border border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.4)] bg-[oklch(0.08_0_0/0.7)] backdrop-blur-[30px] relative">
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 md:top-5 md:right-5 z-10 text-muted-foreground hover:text-accent hover:scale-110 hover:rotate-45 transition-all duration-300 p-2 hover:bg-white/5 rounded-full"
                title="Reset Conversation"
              >
                <ArrowsClockwise size={20} weight="bold" className="md:w-6 md:h-6" />
              </button>

              <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="space-y-5 md:space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage key={message.id} message={message} isLast={index === messages.length - 1} />
                  ))}
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-700/50">
                <div className="flex space-x-3 md:space-x-4 mb-3 md:mb-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Engage Aether intelligence..."
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-white/8 border-white/15 focus:border-accent focus:ring-accent focus:shadow-[0_0_30px_oklch(0.75_0.16_195/0.5)] text-base md:text-lg h-12 md:h-14 transition-all duration-300"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="btn-gradient w-12 h-12 md:w-14 md:h-14 rounded-full p-0 flex-shrink-0 touch-manipulation"
                  >
                    <PaperPlaneRight size={20} weight="fill" className="md:w-6 md:h-6" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {suggestionChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      disabled={isLoading}
                      className="text-sm md:text-base px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/8 border border-white/15 text-muted-foreground hover:bg-accent/20 hover:border-accent hover:text-accent hover:shadow-[0_0_20px_oklch(0.75_0.16_195/0.3)] transition-all duration-300 hover:translate-y-[-2px] disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ChatMessageProps {
  message: Message
  isLast: boolean
}

function ChatMessage({ message, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('AI response copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} opacity-0 animate-[slideIn_0.3s_ease-out_forwards]`}
      style={{ animationDelay: isLast ? '0.1s' : '0s' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[80%] lg:max-w-[75%] px-4 md:px-5 py-2.5 md:py-3 rounded-2xl text-white shadow-md text-sm md:text-base group ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-primary to-[oklch(0.60_0.22_250)] rounded-br-lg'
            : message.role === 'loading'
            ? 'bg-white/5 rounded-bl-lg text-gray-400 italic animate-pulse'
            : 'bg-white/8 rounded-bl-lg'
        }`}
      >
        <p className={message.role === 'ai' ? 'pr-8' : ''}>{message.content}</p>

        {message.role === 'ai' && (
          <button
            onClick={handleCopy}
            className={`absolute top-2 right-2 bg-black/30 hover:bg-accent border-none rounded px-2 py-1 text-xs transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title="Copy text"
          >
            {copied ? <Check size={12} className="md:w-3.5 md:h-3.5" /> : <Copy size={12} className="md:w-3.5 md:h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

async function getAIResponse(prompt: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('transaction')) {
    return "While Aether facilitates highly secure and verifiable transactions on the Hedera Hashgraph, I am not directly enabled for transaction initiation in this demo. My primary function is intelligence and data processing within the Aether network."
  }

  if (lowerPrompt.includes('quantum ai') || lowerPrompt.includes('define quantum')) {
    return "Quantum AI represents the convergence of quantum computing principles and artificial intelligence. In Aether's context, it refers to our advanced cognitive architecture that leverages quantum-inspired algorithms for unprecedented computational speed and problem-solving capabilities across multidimensional data spaces."
  }

  if (lowerPrompt.includes('hedera') || lowerPrompt.includes('secure')) {
    return "Hedera Hashgraph provides Aether with a robust distributed ledger foundation. Its asynchronous Byzantine Fault Tolerance (aBFT) consensus ensures unparalleled security and fairness. Every AI computation, data transaction, and state change is cryptographically verified and timestamped on the Hedera network, creating an immutable audit trail while maintaining carbon-negative operations."
  }

  if (lowerPrompt.includes('docsgpt') || lowerPrompt.includes('learning')) {
    return "DocsGPT serves as Aether's dynamic knowledge framework - a continuously evolving repository that enables contextual understanding and adaptive reasoning. It processes vast documentation sets, extracts semantic relationships, and enables Aether to provide accurate, contextually-aware responses while learning from each interaction to refine future outputs."
  }

  return "That's an intriguing query. Aether's advanced cognitive model is designed to handle complex inquiries across multiple domains. The platform leverages decentralized AI infrastructure, quantum-inspired computation, and sovereign data principles to deliver intelligent responses while maintaining privacy and verifiability. How else may I assist your exploration of the Aether ecosystem?"
}

