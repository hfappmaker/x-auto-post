import { validateConfig, config } from './config.js';
import { GeminiService } from './gemini.js';
import { TwitterService } from './twitter.js';

class AutoPostBot {
  private gemini: GeminiService;
  private twitter: TwitterService;
  private isRunning = false;

  constructor() {
    this.gemini = new GeminiService();
    this.twitter = new TwitterService();
  }

  /**
   * 初期化と認証チェック
   */
  async initialize(): Promise<void> {
    console.log('🚀 Starting X Auto Post Bot...');

    // 設定の検証
    validateConfig();
    console.log('✅ Configuration validated');

    // Twitter認証の確認
    const isAuthenticated = await this.twitter.verifyCredentials();
    if (!isAuthenticated) {
      throw new Error('Twitter authentication failed');
    }
  }

  /**
   * 1回のポストを実行
   */
  async post(topic?: string): Promise<void> {
    try {
      console.log('\n📝 Generating content...');
      const content = await this.gemini.generateTweet(topic);
      console.log(`Generated: "${content}"`);

      console.log('📤 Posting to X...');
      await this.twitter.postTweet(content);

      console.log('✨ Post completed successfully!\n');
    } catch (error) {
      console.error('❌ Error during post:', error);
      throw error;
    }
  }

  /**
   * 自動投稿を開始（定期実行）
   */
  async startAutoPost(topic?: string): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Auto post is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 Auto post started (interval: ${config.postIntervalMinutes} minutes)`);

    // 最初の投稿を即座に実行
    await this.post(topic);

    // 定期的な投稿のスケジュール
    const intervalMs = config.postIntervalMinutes * 60 * 1000;
    setInterval(async () => {
      if (this.isRunning) {
        await this.post(topic);
      }
    }, intervalMs);
  }

  /**
   * 自動投稿を停止
   */
  stopAutoPost(): void {
    this.isRunning = false;
    console.log('🛑 Auto post stopped');
  }
}

// メイン実行
async function main() {
  const bot = new AutoPostBot();

  try {
    await bot.initialize();

    // コマンドライン引数からトピックを取得
    const topic = process.argv[2];
    if (topic) {
      console.log(`📌 Topic: ${topic}`);
    }

    // 自動投稿を開始
    await bot.startAutoPost(topic);

    // プロセス終了時の処理
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down...');
      bot.stopAutoPost();
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
