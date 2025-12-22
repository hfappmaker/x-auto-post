# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

X Auto Post Bot - Next.js APIルートとVercel Cronを使用して、Gemini AIでフリーランスエンジニア向けのモチベーション高いコンテンツを自動生成し、X (Twitter) に定期投稿するサーバーレスアプリケーション。

システムプロンプトと詳細な指示により、最新技術トレンドやエンジニア業界の話題を含む、140文字以内の高品質なツイートを生成。

## Development Commands

```bash
# Install dependencies
npm install

# Run Next.js dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Architecture

### Technology Stack
- **Framework**: Next.js 14 (Pages Router)
- **Runtime**: Node.js (Vercel Serverless Functions)
- **Deployment**: Vercel with Cron Jobs
- **Language**: TypeScript

### Directory Structure

```
├── lib/                    # Shared utilities and services
│   ├── config.ts          # Environment configuration
│   ├── gemini.ts          # Gemini AI service
│   └── twitter.ts         # X API service
├── pages/
│   └── api/
│       └── post.ts        # Main API endpoint (called by Vercel Cron)
├── vercel.json            # Vercel Cron configuration
└── next.config.js         # Next.js configuration
```

### Core Components

- **lib/config.ts**: 環境変数の読み込みと検証。CRON_SECRET認証トークンを含む。
- **lib/gemini.ts**: Google Gemini APIとの統合。`@google/generative-ai` SDKを使用。
  - `generateFreelanceEngineerTweet()`: フリーランスエンジニア向けの特化メソッド
  - システムプロンプトでロール設定（フリーランスエンジニアコミュニティの投稿者）
  - 現在時刻（JST）を取得してプロンプトに含める
  - 140文字制限厳守、ハッシュタグ保持ロジック付き
- **lib/twitter.ts**: X (Twitter) API v2統合。`twitter-api-v2`でツイート投稿と認証管理。
- **pages/api/post.ts**: メインAPIエンドポイント。Vercel Cronから呼び出され、1回の実行で1ツイート投稿。CRON_SECRETで認証。

### Data Flow

1. **Vercel Cron** → `/api/post` を定期的に呼び出し（デフォルト: 1時間ごと）
2. **認証チェック**: CRON_SECRETで本番環境の認証を確認
3. **設定検証**: 環境変数の存在確認
4. **Twitter認証**: APIクレデンシャルを検証
5. **コンテンツ生成**:
   - 現在時刻（JST）を取得
   - システムプロンプト + 詳細指示でGemini APIを呼び出し
   - フリーランスエンジニア向けの内容を生成
   - 140文字以内に調整（ハッシュタグ保持）
6. **投稿**: Twitter APIでツイート投稿
7. **レスポンス**: 成功/失敗をJSONで返却

### Vercel Cron

`vercel.json`で設定:
```json
{
  "crons": [{
    "path": "/api/post",
    "schedule": "0 * * * *"  // 毎時0分実行（1時間ごと）
  }]
}
```

### Content Generation Strategy

Geminiのプロンプト設計:
- **システムプロンプト**: フリーランスエンジニアコミュニティの投稿者としてのロール設定
- **コンテキスト**: 現在時刻、技術トレンド、フリーランスの悩み・喜びへの理解
- **指示**:
  - 最新技術・業界トレンドへの言及
  - フリーランスエンジニアの共感とモチベーション向上
  - ハッシュタグ2-3個、絵文字1-2個
  - 140文字厳守
- **トーン**: カジュアルで親しみやすく、プロフェッショナル

## Configuration

Vercel Dashboard（または`.env.local`）で以下を設定:
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` - X API認証情報
- `GEMINI_API_KEY` - Gemini API Key
- `CRON_SECRET` - Cron認証用のランダム文字列（`openssl rand -base64 32`で生成）

## Local Testing

ローカルでAPIをテスト:
```bash
# 開発サーバー起動
npm run dev

# 別のターミナルでAPIを呼び出し
curl -X POST http://localhost:3000/api/post \
  -H "Content-Type: application/json"
```

注:
- 開発環境では認証チェックは無効（本番環境のみCRON_SECRETが必要）
- トピック指定は廃止（フリーランスエンジニア向け固定）

## Deployment

1. GitHubにプッシュ
2. Vercelに接続
3. 環境変数を設定
4. デプロイ完了後、Cronが自動的に実行開始

Cronログは Vercel Dashboard > Deployments > Cron Logs で確認可能。
