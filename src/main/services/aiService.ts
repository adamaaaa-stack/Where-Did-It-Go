import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

interface GLMEmbeddingResponse {
  data: {
    embedding: number[]
  }[]
}

interface GLMChatResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export class AIService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://open.bigmodel.cn/api/paas/v4'
  private readonly embeddingModel = 'embedding-3'
  private readonly chatModel = 'glm-4-flash'

  constructor() {
    this.apiKey = process.env.GLM_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('GLM_API_KEY not found in environment variables')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const truncatedText = this.truncateText(text, 8000)

      const response = await axios.post<GLMEmbeddingResponse>(
        `${this.baseUrl}/embeddings`,
        {
          model: this.embeddingModel,
          input: truncatedText
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].embedding
      }

      throw new Error('No embedding returned from API')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GLM API Error:', error.response?.data || error.message)
      } else {
        console.error('Embedding generation error:', error)
      }
      throw error
    }
  }

  async generateSummary(text: string, filename: string): Promise<string> {
    try {
      const truncatedText = this.truncateText(text, 4000)

      const prompt = `Summarize the following file content in 2-3 sentences. Focus on the main topic and key information.

Filename: ${filename}

Content:
${truncatedText}`

      const response = await axios.post<GLMChatResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.chatModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim()
      }

      throw new Error('No summary returned from API')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GLM API Error:', error.response?.data || error.message)
      } else {
        console.error('Summary generation error:', error)
      }
      return 'Summary generation failed'
    }
  }

  async generateQueryEmbedding(query: string): Promise<number[]> {
    return this.generateEmbedding(query)
  }

  private truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
      return text
    }
    return text.substring(0, maxChars) + '...'
  }
}
