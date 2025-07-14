# LINE Weather Bot (MCP対応)

雨の日だけLINEで通知してくれるお天気botです。MCPサーバー機能も搭載しています。

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

1. 依存関係をインストール：
```bash
npm install
```

2. 開発環境で起動：
```bash
npm run dev
```

3. 本番環境で起動：
```bash
npm start
```

## 使用方法

### LINE Bot

- botを友達追加
- 「天気」と送信すると現在の天気を確認可能
- 毎日朝7時に雨の日だけ自動通知

### MCP Server

Claudeから以下のツールを使用可能：

- `check_weather`: 現在の天気を確認
- `send_weather_notification`: 天気通知を手動送信

## 雨の判定条件

OpenWeatherMapの天気コードによる判定：
- 200-299: 雷雨
- 300-399: 霧雨
- 500-599: 雨

## デプロイ

Heroku、Railway、Renderなどのクラウドサービスにデプロイ可能です。