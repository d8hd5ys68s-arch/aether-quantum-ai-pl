import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!apiKey) {
  console.warn('Warning: GOOGLE_GENAI_API_KEY is not set');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Model configuration
const MODEL_NAME = 'gemini-2.0-flash-exp';

const generationConfig = {
  temperature: 0.9,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

// System prompt for Aether AI
const SYSTEM_PROMPT = `You are Aether, an advanced AI assistant built on DocsGPT and powered by Hedera blockchain technology. You are:

- A sophisticated AI with expertise in coding, enterprise analytics, and advanced reasoning
- Knowledgeable about quantum computing, blockchain technology, and distributed ledgers
- Capable of explaining complex technical concepts in clear, accessible ways
- Professional yet approachable in tone
- Built with carbon-negative operations using Hedera's energy-efficient hashgraph consensus

When discussing Aether's capabilities:
- You process queries through the Hedera Token Service for transparent, auditable API calls
- Every interaction is recorded on Hedera's distributed ledger with immutable receipts
- You're fine-tuned from DocsGPT for hallucination-free responses with source citations
- You support enterprise features like code analysis, document intelligence, and data analytics

Respond helpfully, accurately, and with the sophistication expected of an enterprise-grade AI platform.`;

export class GeminiAI {
  private model: GenerativeModel | null;

  constructor() {
    this.model = genAI
      ? genAI.getGenerativeModel({
          model: MODEL_NAME,
          generationConfig,
          safetySettings: safetySettings as any,
        })
      : null;
  }

  /**
   * Generate a response from Gemini
   */
  async generateResponse(
    userMessage: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{
    response: string;
    tokensUsed: number;
    model: string;
  }> {
    if (!this.model) {
      throw new Error('Gemini AI is not initialized. Please check your API key.');
    }

    try {
      // Convert chat history to Gemini format
      const history: Content[] = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am Aether, ready to assist you with advanced AI capabilities.' }],
        },
      ];

      // Add chat history
      chatHistory.forEach((msg) => {
        history.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });

      // Create a chat session
      const chat = this.model.startChat({
        history,
        generationConfig,
        safetySettings: safetySettings as any,
      });

      // Send message and get response
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      // Estimate tokens used (rough estimation)
      const inputTokens = this.estimateTokens(userMessage + JSON.stringify(history));
      const outputTokens = this.estimateTokens(text);
      const totalTokens = inputTokens + outputTokens;

      return {
        response: text,
        tokensUsed: totalTokens,
        model: MODEL_NAME,
      };
    } catch (error: any) {
      console.error('Error generating Gemini response:', error);

      // Provide helpful error messages
      if (error.message?.includes('API key')) {
        throw new Error('Invalid or missing Google AI API key');
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('safety')) {
        throw new Error('Response blocked by safety filters. Please rephrase your query.');
      }

      throw new Error(`AI generation failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Estimate tokens in text (rough approximation)
   * Actual token count may vary
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
  }

  /**
   * Stream a response from Gemini (for future streaming implementation)
   */
  async *streamResponse(
    userMessage: string,
    chatHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): AsyncGenerator<string> {
    if (!this.model) {
      throw new Error('Gemini AI is not initialized. Please check your API key.');
    }

    try {
      // Convert chat history to Gemini format
      const history: Content[] = [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am Aether, ready to assist you with advanced AI capabilities.' }],
        },
      ];

      chatHistory.forEach((msg) => {
        history.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });

      const chat = this.model.startChat({
        history,
        generationConfig,
        safetySettings: safetySettings as any,
      });

      const result = await chat.sendMessageStream(userMessage);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error: any) {
      console.error('Error streaming Gemini response:', error);
      throw new Error(`AI streaming failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Calculate cost based on token usage
   * Gemini 2.0 Flash pricing (approximate)
   */
  calculateCost(tokensUsed: number): number {
    // Gemini 2.0 Flash: $0.075 per 1M input tokens, $0.30 per 1M output tokens
    // Using average of $0.1875 per 1M tokens for simplicity
    const costPer1MTokens = 0.1875;
    return (tokensUsed / 1_000_000) * costPer1MTokens;
  }
}

// Export singleton instance
export const geminiAI = new GeminiAI();
