# LINE Weather Bot (MCP対応)

雨の日だけLINEで通知してくれるお天気botです。Bun + Honoで実装され、LINE公式のMCPサーバー（`@line/line-bot-mcp-server`）を活用しています。

## 機能

- 毎日朝7時に天気をチェック
- 雨の日だけLINE通知を送信
- LINEでの天気確認機能
- MCPサーバーとしてClaudeから操作可能

## 必要な設定

### 1. LINE Bot設定

1. [LINE Developers](https://developers.line.biz/)でチャンネルを作成
2. チャンネルアクセストークンとチャンネルシークレットを取得
3. Webhook URLを設定: `https://your-domain.com/webhook`

### 2. OpenWeatherMap API設定

1. [OpenWeatherMap](https://openweathermap.org/api)でAPIキーを取得

### 3. 環境変数設定

`.env`ファイルを作成し、以下を設定：

```
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
OPENWEATHER_API_KEY=your_openweather_api_key
CITY=Tokyo
TARGET_USER_ID=your_line_user_id
```

## セットアップ

### 1. 基本設定

```bash
# 依存関係をインストール
bun install

# LINE MCPサーバーをグローバルインストール（オプション）
npm install -g @line/line-bot-mcp-server
```

### 2. 実行方法

#### 方法1: 統合型（推奨）
```bash
# 通常のindex.tsを実行
bun run dev
```

#### 方法2: LINE MCPサーバー連携型
```bash
# 1. LINE MCPサーバーを起動（別ターミナル）
npx @line/line-bot-mcp-server

# 2. Weather Botを起動
bun run index-mcp.ts
```

## 使用方法

### LINE Bot

- botを友達追加
- 「天気」と送信すると現在の天気を確認可能
- 毎日朝7時に雨の日だけ自動通知

### MCP Server連携

#### LINE公式MCPサーバーの使用

このプロジェクトはLINE公式の`@line/line-bot-mcp-server`を活用しています。

**利用可能なツール：**
- `push_message`: テキストメッセージを送信
- `push_flex_message`: Flexメッセージを送信
- `broadcast_message`: 全フォロワーにブロードキャスト
- `get_profile`: ユーザープロファイル取得
- `get_quota_consumption`: メッセージクォータ確認

#### MCPサーバーの設定

`mcp-config.json`をClaude Desktopに追加：

```json
{
  "mcpServers": {
    "line-bot": {
      "command": "npx",
      "args": ["@line/line-bot-mcp-server"],
      "env": {
        "CHANNEL_ACCESS_TOKEN": "YOUR_TOKEN",
        "DESTINATION_USER_ID": "YOUR_USER_ID"
      }
    }
  }
}
```

## 雨の判定条件

OpenWeatherMapの天気コードによる判定：
- 200-299: 雷雨
- 300-399: 霧雨
- 500-599: 雨

## 技術スタック

- [Bun](https://bun.sh/) - 高速なJavaScriptランタイム
- [Hono](https://hono.dev/) - 軽量なWebフレームワーク
- [@line/line-bot-mcp-server](https://github.com/line/line-bot-mcp-server) - LINE公式MCPサーバー
- [LINE Bot SDK](https://github.com/line/line-bot-sdk-nodejs) - LINE Bot開発用SDK
- [node-cron](https://github.com/node-cron/node-cron) - スケジューリング
- [OpenWeatherMap API](https://openweathermap.org/api) - 天気情報API

## デプロイ

Heroku、Railway、Renderなどのクラウドサービスにデプロイ可能です。