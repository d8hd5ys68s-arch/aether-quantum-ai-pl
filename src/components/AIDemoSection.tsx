import { useState, useRef, useEffect } from 'react'
import { PaperPlaneRight, ArrowsClockwise, Check, Copy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <section id="ai-demo" className="py-28 relative z-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.1s_forwards]">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-gradient">
              Engage with Aether AI
            </h2>
            <p className="text-gray-300 mb-8 text-xl leading-relaxed max-w-lg">
              Interact directly with Aether's advanced cognitive model. Ask profound questions, request intricate data, or explore creative frontiers.
            </p>

            <div className="space-y-6 mt-10 text-lg">
              {[
                'Hyper-responsive feedback, even on the most complex queries.',
                'Profound contextual understanding across vast data oceans.',
                'Continuous self-optimization and emergent capabilities.'
              ].map((text, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-11 h-11 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check size={16} weight="bold" className="text-green-400" />
                  </div>
                  <p className="text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <div className="h-[550px] flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] bg-[oklch(0.08_0_0/0.6)] backdrop-blur-[25px] relative">
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-accent hover:scale-110 hover:rotate-45 transition-all"
                title="Reset Conversation"
              >
                <ArrowsClockwise size={20} weight="bold" />
              </button>

              <ScrollArea ref={scrollRef} className="flex-1 p-5">
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <ChatMessage key={message.id} message={message} isLast={index === messages.length - 1} />
                  ))}
                </div>
              </ScrollArea>

              <div className="p-5 border-t border-gray-700/50">
                <div className="flex space-x-4 mb-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Engage Aether intelligence..."
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-white/8 border-white/15 focus:border-accent focus:ring-accent text-base h-12"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="btn-gradient w-14 h-14 rounded-full p-0 flex-shrink-0"
                  >
                    <PaperPlaneRight size={24} weight="fill" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {suggestionChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      disabled={isLoading}
                      className="text-sm px-5 py-2 rounded-full bg-white/8 border border-white/15 text-muted-foreground hover:bg-accent/20 hover:border-accent hover:text-accent transition-all hover:translate-y-[-2px] disabled:opacity-50"
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
    >
      <div
        className={`relative max-w-[80%] md:max-w-[75%] px-5 py-3 rounded-2xl text-white shadow-md ${
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
            className="absolute top-2 right-2 bg-black/30 hover:bg-accent border-none rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy text"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
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

const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`
document.head.appendChild(style)