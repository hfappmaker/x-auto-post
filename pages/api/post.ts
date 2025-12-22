import type { NextApiRequest, NextApiResponse } from 'next';
import { validateConfig, config } from '../../lib/config';
import { GeminiService } from '../../lib/gemini';
import { TwitterService } from '../../lib/twitter';

type ResponseData = {
  success: boolean;
  message?: string;
  tweetId?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  // Cron認証チェック（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    const expectedAuth = `Bearer ${config.cronSecret}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error('❌ Unauthorized: Invalid or missing CRON_SECRET');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }
  }

  try {
    console.log('🚀 Starting auto post...');

    // 設定の検証
    validateConfig();
    console.log('✅ Configuration validated');

    // サービスの初期化
    const gemini = new GeminiService();
    const twitter = new TwitterService();

    // Twitter認証確認
    const isAuthenticated = await twitter.verifyCredentials();
    if (!isAuthenticated) {
      throw new Error('Twitter authentication failed');
    }

    // フリーランスエンジニア向けコンテンツ生成
    console.log('📝 Generating freelance engineer content...');
    const content = await gemini.generateFreelanceEngineerTweet();
    console.log(`Generated (${content.length} chars): "${content}"`);

    // ツイート投稿
    console.log('📤 Posting to X...');
    const result = await twitter.postTweet(content);

    console.log('✨ Post completed successfully!');

    return res.status(200).json({
      success: true,
      message: 'Tweet posted successfully',
      tweetId: result.id,
    });
  } catch (error) {
    console.error('❌ Error during post:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
