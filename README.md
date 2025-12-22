# X Auto Post

GeminiAIを使用してフリーランスエンジニア向けのコンテンツを自動生成し、X (Twitter) に投稿するツールです。Vercel Cronで定期実行されます。

## 機能

- **Gemini AI**で高品質なツイート内容を自動生成
  - システムプロンプトを活用した詳細な指示
  - フリーランスエンジニア向けのモチベーション高い内容
  - 最新技術トレンドやエンジニア業界の話題を含む
  - 適切なハッシュタグ付き（#エンジニア #フリーランス など）
  - 140文字以内に厳守
- **X (Twitter) API**で自動投稿
- **Vercel Cron**で定期実行（デフォルト: 1時間ごと）
- セキュアな認証機能
- 現在時刻（JST）を考慮した時間帯にふさわしい内容

## セットアップ

### 1. APIキーの取得

以下のサービスからAPIキーを取得してください：
- **X API**: https://developer.twitter.com/
- **Gemini API**: https://makersuite.google.com/app/apikey

### 2. Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定（下記参照）
3. デプロイ

### 3. 環境変数の設定

Vercel Dashboardで以下の環境変数を設定してください：

```env
# X (Twitter) API Credentials
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here
X_ACCESS_TOKEN=your_access_token_here
X_ACCESS_SECRET=your_access_secret_here

# Gemini API Credentials
GEMINI_API_KEY=your_gemini_api_key_here

# Cron Secret（セキュリティ用）
CRON_SECRET=your_secure_random_string_here
```

**CRON_SECRETの生成方法:**
```bash
openssl rand -base64 32
```

## Cron設定のカスタマイズ

`vercel.json`で実行頻度を変更できます：

```json
{
  "crons": [
    {
      "path": "/api/post",
      "schedule": "0 * * * *"  // 1時間ごと（デフォルト）
    }
  ]
}
```

### Cron式の例

- `0 * * * *` - 毎時0分（デフォルト）
- `0 */2 * * *` - 2時間ごと
- `0 */6 * * *` - 6時間ごと
- `0 9 * * *` - 毎日9:00
- `0 9,21 * * *` - 毎日9:00と21:00

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 開発サーバー起動
npm run dev
```

### 手動でAPIを呼び出す

```bash
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json"
```

注: 開発環境では認証不要。本番環境では`Authorization: Bearer YOUR_CRON_SECRET`ヘッダーが必要。

## コマンド

- `npm run dev` - Next.js開発サーバーを起動
- `npm run build` - 本番用にビルド
- `npm start` - 本番サーバーを起動
- `npm run lint` - コードをチェック
- `npm run format` - コードをフォーマット

## トラブルシューティング

### Vercel Cronが動かない

1. Vercel Dashboardの「Deployments」でCronログを確認
2. 環境変数が正しく設定されているか確認
3. `vercel.json`の構文が正しいか確認

### 認証エラー

- `CRON_SECRET`が環境変数に設定されているか確認
- 本番環境でのみ認証が必要（開発環境では不要）
