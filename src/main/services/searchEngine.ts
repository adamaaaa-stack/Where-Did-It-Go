import { DatabaseQueries } from '../database/queries'
import { AIService } from './aiService'

export interface SearchResult {
  fileId: number
  path: string
  filename: string
  score: number
  summary: string | null
  extractedText: string
  modifiedAt: number
}

export class SearchEngine {
  constructor(
    private dbQueries: DatabaseQueries,
    private aiService: AIService
  ) {}

  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.aiService.generateQueryEmbedding(query)
      const allEmbeddings = this.dbQueries.getAllEmbeddings()

      if (allEmbeddings.length === 0) {
        return []
      }

      const scoredResults = allEmbeddings.map(item => {
        const similarity = this.cosineSimilarity(queryEmbedding, item.embedding)
        return {
          fileId: item.file_id,
          score: similarity
        }
      })

      scoredResults.sort((a, b) => b.score - a.score)

      const topResults = scoredResults.slice(0, limit)

      const results: SearchResult[] = []

      for (const item of topResults) {
        const fileData = this.dbQueries.getFileWithContent(item.fileId)

        if (fileData) {
          const recencyBoost = this.calculateRecencyBoost(fileData.modified_at)
          const finalScore = item.score * 0.7 + recencyBoost * 0.3

          results.push({
            fileId: fileData.id,
            path: fileData.path,
            filename: fileData.filename,
            score: finalScore,
            summary: fileData.summary || null,
            extractedText: fileData.extracted_text || '',
            modifiedAt: fileData.modified_at
          })
        }
      }

      results.sort((a, b) => b.score - a.score)

      return results
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB)

    if (denominator === 0) {
      return 0
    }

    return dotProduct / denominator
  }

  private calculateRecencyBoost(modifiedAt: number): number {
    const now = Date.now()
    const ageInDays = (now - modifiedAt) / (1000 * 60 * 60 * 24)

    if (ageInDays < 7) return 1.0
    if (ageInDays < 30) return 0.8
    if (ageInDays < 90) return 0.6
    if (ageInDays < 365) return 0.4
    return 0.2
  }
}
