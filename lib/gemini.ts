import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    // Gemini 3 Pro Preview - 最新の高性能推論モデル（2024年11月リリース）
    // 100万トークンコンテキスト、知識カットオフ2025年1月
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
    });
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

      return text;
    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      throw error;
    }
  }

  /**
   * トピックに基づいてツイートを生成
   * @param topic ツイートのトピック
   * @returns 生成されたツイート
   */
  async generateTweet(topic?: string): Promise<string> {
    const defaultPrompt = `面白くて魅力的なツイートを1つ生成してください。280文字以内で、絵文字を適度に使用してください。${topic ? `トピック: ${topic}` : ""}`;
    return this.generateContent(defaultPrompt);
  }

  /**
   * フリーランスエンジニア向けのツイートを生成
   * システムプロンプトと詳細な指示を使用して、質の高いコンテンツを生成
   * @returns 生成されたツイート（140文字以内）
   */
  async generateFreelanceEngineerTweet(): Promise<string> {
    // 現在時刻を取得（日本時間）
    const now = new Date();
    const formattedDate = now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });

    // システムプロンプト + 詳細な指示を含む包括的なプロンプト
    const systemPrompt = `あなたはフリーランスエンジニアコミュニティで人気のSNS投稿者です。
プログラミング技術のトレンドに詳しく、フリーランスエンジニアの悩みや喜び、成長への願いを深く理解しています。
投稿は常にポジティブで、読者のモチベーションを高めます。

【あなたの役割】
- フリーランスエンジニアの心に刺さる、共感と前向きな気持ちを引き出す投稿を作成すること
- 最新の技術トレンドやエンジニア業界の話題を取り入れること
- カジュアルで親しみやすく、かつプロフェッショナルなトーンを保つこと`;

    const userPrompt = `現在日時は【${formattedDate} (JST)】です。

この日付、時刻にふさわしい、フリーランスエンジニアが思わず「いいね」や「リツイート」をしたくなるツイートを1つ生成してください。

【必須条件】
1. 最新のプログラミング技術、フレームワーク、またはエンジニア業界のトレンドに言及すること
2. フリーランスエンジニアの心に響く内容にすること（例：自由な働き方、スキルアップ、市場価値、ワークライフバランスなど）
3. 前向きでモチベーションが上がる内容にすること
4. 適切なハッシュタグを2-3個含めること（例：#エンジニア #フリーランス #プログラミング #副業 #リモートワーク など）
5. 絵文字を1-2個使用すること
6. **厳密に140文字以内に収めること**（これは絶対条件です）

【注意事項】
- 宣伝や売り込みっぽい内容は避ける
- 自然で読みやすい日本語を使う
- ハッシュタグは文末にまとめて配置

それでは、魅力的なツイートを生成してください。`;

    try {
      const result = await this.model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      });
      const response = result.response;
      let text = response.text().trim();

      return text;
    } catch (error) {
      console.error("Error generating freelance engineer tweet:", error);
      throw error;
    }
  }
}
