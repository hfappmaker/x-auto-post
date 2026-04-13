# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

X Auto Post Bot - Next.js APIルート（App Router）とVercel Cronを使用して、Gemini AIでフリーランスエンジニア向けのモチベーション高いコンテンツを自動生成し、X (Twitter) に定期投稿するサーバーレスアプリケーション。

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
- **Framework**: Next.js 14 (App Router)
- **Runtime**: Node.js (Vercel Serverless Functions)
- **Deployment**: Vercel with Cron Jobs
- **Language**: TypeScript
- **AI SDK**: `@google/genai`(新SDK)
- **AI Model**: Google Gemini (`gemini-2.5-flash`) + Google Search Grounding

### Directory Structure

```
├── lib/                    # Shared utilities and services
│   ├── config.ts          # Environment configuration
│   ├── gemini.ts          # Gemini AI service
│   └── twitter.ts         # X API service
├── app/
│   └── api/
│       └── post/
│           └── route.ts   # Main API endpoint (called by Vercel Cron)
├── vercel.json            # Vercel Cron configuration
└── next.config.js         # Next.js configuration
```

### Core Components

- **lib/config.ts**: 環境変数の読み込みと検証。CRON_SECRET認証トークンを含む。
- **lib/gemini.ts**: Google Gemini APIとの統合。`@google/genai` SDKを使用。
  - モデル: `gemini-2.5-flash`
  - `generateFreelanceEngineerTweet()`: フリーランスエンジニア向けの特化メソッド
  - システムプロンプト（`config.systemInstruction`）でロール設定（フリーランスエンジニアコミュニティの投稿者）
  - 現在日時（JST）を取得してプロンプトに含める
  - **Google Search Grounding**（`config.tools: [{ googleSearch: {} }]`）を有効化し、実行時点の最新IT・プログラミング動向をモデルに検索させ、結果をツイートに反映
  - `groundingMetadata.webSearchQueries` と `groundingChunks` はログにのみ出力（ツイート本文には含めない）
  - 140文字以内はプロンプト側で指示（コード側での切り詰めは行わない）
- **lib/twitter.ts**: X (Twitter) API v2統合。`twitter-api-v2`でツイート投稿と認証管理。
- **app/api/post/route.ts**: メインAPIエンドポイント。`GET`ハンドラーをエクスポートし、Vercel Cronから呼び出される。1回の実行で1ツイート投稿。本番環境では`Authorization: Bearer <CRON_SECRET>`ヘッダで認証。

### Data Flow

1. **Vercel Cron** → `/api/post` をGETで定期的に呼び出し（1日1回）
2. **認証チェック**: 本番環境のみ`Authorization: Bearer <CRON_SECRET>`を検証
3. **設定検証**: 環境変数の存在確認（`validateConfig()`）
4. **Twitter認証**: APIクレデンシャルを検証（`verifyCredentials()`）
5. **コンテンツ生成**:
   - 現在日時（JST）を取得
   - システムプロンプト + 詳細指示でGemini APIを呼び出し
   - Google Search Groundingで現在時点の最新IT動向を検索させ、その内容を反映
   - フリーランスエンジニア向けの内容を生成（140文字はプロンプトで指示）
6. **投稿**: Twitter APIでツイート投稿
7. **レスポンス**: 成功/失敗をJSONで返却

### Vercel Cron

`vercel.json`で設定:
```json
{
  "crons": [{
    "path": "/api/post",
    "schedule": "0 0 * * *"  // 1日1回（UTC 00:00 = JST 09:00）に実行
  }]
}
```

### Content Generation Strategy

Geminiのプロンプト設計:
- **システムプロンプト**: フリーランスエンジニアコミュニティの投稿者としてのロール設定
- **コンテキスト**: 現在日時、フリーランスの悩み・喜びへの理解
- **Grounding**: `googleSearch`ツールで実行時点の最新IT/プログラミングニュースをモデル自身に検索させ、最も話題性の高いトピックを1つ選んで反映
- **指示**:
  - 検索結果の最新トピックに具体的に言及（一般論で終わらせない）
  - フリーランスエンジニアの共感とモチベーション向上
  - ハッシュタグ2-3個、絵文字1-2個
  - URL・出典は本文に含めない（140文字を圧迫するため）
  - 140文字厳守（プロンプトで指示。コード側の後処理での切り詰めは行わない）
- **トーン**: カジュアルで親しみやすく、プロフェッショナル

## Configuration

Vercel Dashboard（または`.env.local` / `.env`）で以下を設定:
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` - X API認証情報
- `GEMINI_API_KEY` - Gemini API Key
- `CRON_SECRET` - Cron認証用のランダム文字列（`openssl rand -base64 32`で生成）

## Local Testing

ローカルでAPIをテスト:
```bash
# 開発サーバー起動
npm run dev

# 別のターミナルでAPIを呼び出し（GETで呼ぶ）
curl http://localhost:3000/api/post
```

注:
- 開発環境（`NODE_ENV !== 'production'`）では認証チェックは無効（本番環境のみ`CRON_SECRET`が必要）
- エンドポイントは`GET`メソッドのみ対応（`POST`では405になる）
- トピック指定は廃止（フリーランスエンジニア向け固定）

## Deployment

1. GitHubにプッシュ
2. Vercelに接続
3. 環境変数を設定
4. デプロイ完了後、Cronが自動的に実行開始

Cronログは Vercel Dashboard > Deployments > Cron Logs で確認可能。

## Known Issues

- **Google Search Groundingの課金ティア**: Grounding（`googleSearch`ツール）は有料Tierでは1日1,500リクエストまで無料、超過後は1,000リクエストあたり$35。Free Tierではツール自体が利用できない場合があり、その際は`lib/gemini.ts`の`config.tools`を外して通常生成に戻す必要がある。
