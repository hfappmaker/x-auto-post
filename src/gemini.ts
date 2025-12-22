import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Geminiを使用してポスト用のコンテンツを生成
   * @param prompt コンテンツ生成のためのプロンプト
   * @returns 生成されたテキスト
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // X (Twitter)の文字数制限を考慮 (280文字)
      if (text.length > 280) {
        return text.substring(0, 277) + '...';
      }

      return text;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }

  /**
   * トピックに基づいてツイートを生成
   * @param topic ツイートのトピック
   * @returns 生成されたツイート
   */
  async generateTweet(topic?: string): Promise<string> {
    const defaultPrompt = `面白くて魅力的なツイートを1つ生成してください。280文字以内で、絵文字を適度に使用してください。${topic ? `トピック: ${topic}` : ''}`;
    return this.generateContent(defaultPrompt);
  }
}
