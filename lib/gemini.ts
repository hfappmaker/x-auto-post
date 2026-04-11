import { GoogleGenAI } from "@google/genai";
import { config } from "./config";

export class GeminiService {
  private client: GoogleGenAI;
  private readonly modelName = "gemini-2.5-flash";

  constructor() {
    this.client = new GoogleGenAI({ apiKey: config.gemini.apiKey });
  }

  /**
   * フリーランスエンジニア向けのツイートを生成
   * Google Search Groundingで現在時点の最新IT事情を反映する
   */
  async generateFreelanceEngineerTweet(): Promise<string> {
    const now = new Date();
    const formattedDate = now.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });

    const systemPrompt = `あなたはフリーランスエンジニアコミュニティで人気のSNS投稿者です。
プログラミング技術のトレンドに詳しく、フリーランスエンジニアの悩みや喜び、成長への願いを深く理解しています。
投稿は常にポジティブで、読者のモチベーションを高めます。

【あなたの役割】
- フリーランスエンジニアの心に刺さる、共感と前向きな気持ちを引き出す投稿を作成すること
- 最新の技術トレンドやエンジニア業界の話題を取り入れること
- カジュアルで親しみやすく、かつプロフェッショナルなトーンを保つこと`;

    const userPrompt = `現在日時は【${formattedDate} (JST)】です。

まずGoogle検索ツールを使って、この日時時点で話題になっている最新のIT・プログラミング関連ニュースを調べてください。対象例:
- 新しく発表・アップデートされたプログラミング言語、フレームワーク、ライブラリ
- AI / LLM / 開発ツールの最新動向
- エンジニア業界・フリーランス市場のニュース

調べた内容の中から最も話題性の高いトピックを1つ選び、それを踏まえてフリーランスエンジニアが思わず「いいね」や「リツイート」をしたくなるツイートを1つ生成してください。

【必須条件】
1. 上で検索した最新トピックに具体的に言及すること(一般論で終わらせない)
2. フリーランスエンジニアの心に響く内容にすること(自由な働き方、スキルアップ、市場価値、ワークライフバランスなど)
3. 前向きでモチベーションが上がる内容にすること
4. 適切なハッシュタグを2-3個含めること(例: #エンジニア #フリーランス #プログラミング #AI #リモートワーク など)
5. 絵文字を1-2個使用すること
6. **厳密に140文字以内に収めること**(ハッシュタグ・絵文字・スペース含む)

【注意事項】
- 宣伝や売り込みっぽい内容は避ける
- 自然で読みやすい日本語を使う
- ハッシュタグは文末にまとめて配置
- URLや出典は本文に含めない(文字数を圧迫するため)
- 出力はツイート本文のみ。前置きや説明文は一切書かない

それでは、魅力的なツイートを生成してください。`;

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],
          temperature: 0.9,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const candidate = response.candidates?.[0];
      console.log(
        `ℹ️ finishReason=${candidate?.finishReason} usage=${JSON.stringify(response.usageMetadata)}`
      );

      const text = (response.text ?? "").trim();

      const grounding = candidate?.groundingMetadata;
      if (grounding?.webSearchQueries?.length) {
        console.log(
          `🔎 Grounding queries: ${JSON.stringify(grounding.webSearchQueries)}`
        );
      }
      if (grounding?.groundingChunks?.length) {
        const sources = grounding.groundingChunks
          .map((c) => c.web?.uri)
          .filter(Boolean);
        if (sources.length) {
          console.log(`🔗 Grounding sources: ${JSON.stringify(sources)}`);
        }
      }

      return text;
    } catch (error) {
      console.error("Error generating freelance engineer tweet:", error);
      throw error;
    }
  }
}
