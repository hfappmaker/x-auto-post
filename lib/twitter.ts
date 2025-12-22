import { TwitterApi } from 'twitter-api-v2';
import { config } from './config';

export class TwitterService {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: config.x.apiKey,
      appSecret: config.x.apiSecret,
      accessToken: config.x.accessToken,
      accessSecret: config.x.accessSecret,
    });
  }

  /**
   * ツイートを投稿
   * @param text ツイート内容
   * @returns 投稿されたツイートの情報
   */
  async postTweet(text: string): Promise<{ id: string; text: string }> {
    try {
      const tweet = await this.client.v2.tweet(text);
      console.log(`✅ Tweet posted successfully: ${tweet.data.id}`);
      return {
        id: tweet.data.id,
        text: tweet.data.text,
      };
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  }

  /**
   * 認証情報の検証
   * @returns 認証が成功したかどうか
   */
  async verifyCredentials(): Promise<boolean> {
    try {
      const user = await this.client.v2.me();
      console.log(`✅ Authenticated as: @${user.data.username}`);
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return false;
    }
  }
}
