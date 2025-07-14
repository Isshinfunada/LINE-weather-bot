# LINE Weather Bot (MCP Server連携)

雨の日だけLINEで通知してくれるお天気botです。LINE公式のMCPサーバー（`@line/line-bot-mcp-server`）を活用し、Bun + Honoで実装されています。

## 特徴

- 🌧️ 毎日朝7時に天気をチェックし、雨の日だけ通知
- 🤖 LINE公式MCPサーバーを使用したメッセージ送信
- ⚡ Bunによる高速な実行環境
- 🪶 Honoによる軽量なWebサーバー
- 📍 都市を指定可能（デフォルト：東京）

## アーキテクチャ

```
Weather Bot (Bun + Hono)
    ├── OpenWeatherMap API → 天気情報取得
    └── LINE MCP Server → LINEメッセージ送信
```

## 必要な準備

### 1. LINE公式アカウントの作成

1. [LINE Developers](https://developers.line.biz/)でチャンネルを作成
2. Messaging APIを有効化
3. チャンネルアクセストークンを取得
4. 送信先のユーザーIDを取得

📖 **詳細ガイド**: 
- [LINE_SETUP_GUIDE.md](./LINE_SETUP_GUIDE.md) - LINE公式アカウント開設の完全ガイド
- [GET_USER_ID.md](./GET_USER_ID.md) - User ID取得方法

### 2. OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/api)でアカウント作成
2. APIキーを取得

### 3. 環境変数の設定

`.env`ファイルを作成：

```bash
# LINE設定
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
DESTINATION_USER_ID=your_line_user_id

# OpenWeatherMap設定
OPENWEATHER_API_KEY=your_api_key
CITY=Tokyo

# サーバー設定
PORT=3000
```

## インストールと実行

```bash
# リポジトリをクローン
git clone https://github.com/Isshinfunada/LINE-weather-bot.git
cd line-weather-bot

# 依存関係をインストール
bun install

# LINE MCPサーバーをインストール（グローバル）
npm install -g @line/line-bot-mcp-server

# 開発環境で実行
bun run dev

# 本番環境で実行
bun start
```

## APIエンドポイント

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/` | GET | ヘルスチェック |
| `/weather` | GET | 現在の天気情報を取得 |
| `/check` | POST | 手動で天気チェックを実行 |
| `/send` | POST | カスタムメッセージを送信 |

### APIレスポンス例

```json
// GET /weather
{
  "city": "Tokyo",
  "weather": "小雨",
  "temperature": 18,
  "humidity": 85,
  "isRainy": true
}

// POST /send
{
  "message": "テストメッセージ",
  "userId": "U1234567890abcdef" // オプション
}
```

## Claude Desktopとの連携

Claude DesktopでLINE MCPサーバーを使用する場合、以下の設定を追加：

`mcp-config.json`:
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

OpenWeatherMapの天気コードに基づいて判定：

| コード範囲 | 天気 |
|---|---|
| 200-299 | 雷雨 |
| 300-399 | 霧雨 |
| 500-599 | 雨 |

## 技術スタック

- [Bun](https://bun.sh/) - 高速なJavaScriptランタイム
- [Hono](https://hono.dev/) - 軽量なWebフレームワーク
- [@line/line-bot-mcp-server](https://github.com/line/line-bot-mcp-server) - LINE公式MCPサーバー
- [node-cron](https://github.com/node-cron/node-cron) - スケジューリング
- [OpenWeatherMap API](https://openweathermap.org/api) - 天気情報API

## デプロイ

### Railway

```bash
# Railwayにデプロイ
railway up
```

### Docker

```dockerfile
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

EXPOSE 3000
CMD ["bun", "run", "start"]
```

## ライセンス

ISC