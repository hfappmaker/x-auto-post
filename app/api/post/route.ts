import { NextRequest, NextResponse } from 'next/server';
import { validateConfig, config } from '../../../lib/config';
import { GeminiService } from '../../../lib/gemini';
import { TwitterService } from '../../../lib/twitter';

type ResponseData = {
  success: boolean;
  message?: string;
  tweetId?: string;
  error?: string;
};

export async function GET(request: NextRequest): Promise<NextResponse<ResponseData>> {
  // Cron認証チェック（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${config.cronSecret}`;

    if (!authHeader || authHeader !== expectedAuth) {
      console.error('❌ Unauthorized: Invalid or missing CRON_SECRET');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Tweet posted successfully',
      tweetId: result.id,
    });
  } catch (error) {
    console.error('❌ Error during post:', error);

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
