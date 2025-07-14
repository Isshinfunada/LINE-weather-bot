# MCP (Model Context Protocol) セットアップガイド

## 🚀 クイックスタート

### 1. 自動セットアップ（推奨）

```bash
# セットアップスクリプトを実行
./setup.sh
```

このスクリプトは以下を自動で行います：
- 環境変数の設定（対話形式）
- .envファイルの作成
- 依存関係のインストール
- LINE MCPサーバーの動作確認

### 2. 手動セットアップ

#### Step 1: 環境変数の準備

`.env.example`をコピーして`.env`を作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、実際の値を入力：

```env
# LINE設定
LINE_CHANNEL_ACCESS_TOKEN=あなたのチャンネルアクセストークン
LINE_CHANNEL_SECRET=あなたのチャンネルシークレット
DESTINATION_USER_ID=送信先のLINEユーザーID

# OpenWeatherMap設定
OPENWEATHER_API_KEY=あなたのAPIキー
CITY=Tokyo

# サーバー設定
PORT=3000
```

#### Step 2: 依存関係のインストール

```bash
bun install
```

## 🤖 Claude Desktop との連携

### 1. 設定ファイルの場所

Claude Desktopの設定ファイルは以下の場所にあります：

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

> **注意**: Claude Desktopがインストールされていない場合は、まず[Claude Desktop](https://claude.ai/download)をダウンロードしてインストールしてください。

### 2. MCP設定の追加

`claude-desktop-config.json`の内容をClaude Desktopの設定に追加します。

既存の設定がある場合は、`mcpServers`セクションに追加：

```json
{
  "mcpServers": {
    // 既存の設定...
    "line-weather-bot": {
      "command": "npx",
      "args": ["@line/line-bot-mcp-server"],
      "env": {
        "CHANNEL_ACCESS_TOKEN": "あなたのトークン",
        "DESTINATION_USER_ID": "あなたのユーザーID"
      }
    }
  }
}
```

### 3. Claude Desktopを再起動

設定を反映させるため、Claude Desktopを再起動してください。

## 📋 必要な情報の取得方法

### LINE Channel Access Token と Channel Secret

1. [LINE Developers Console](https://developers.line.biz/console/)にログイン
2. プロバイダーとチャンネルを選択
3. 「Messaging API」タブを開く
4. Channel Secretをコピー
5. 「Channel access token」セクションで「Issue」をクリックしてトークンを発行

### LINE User ID

1. LINE公式アカウントマネージャーにログイン
2. 友だち追加したユーザーのプロフィールを確認
3. または、Webhookでメッセージを受信してユーザーIDを確認

### OpenWeatherMap API Key

1. [OpenWeatherMap](https://openweathermap.org/)でアカウント作成
2. APIキーセクションでキーを生成

## 🧪 動作確認

### 1. Weather Botの起動

```bash
bun run dev
```

### 2. APIエンドポイントのテスト

```bash
# ヘルスチェック
curl http://localhost:3000/

# 天気情報の取得
curl http://localhost:3000/weather

# 手動で天気チェック（雨の日なら通知送信）
curl -X POST http://localhost:3000/check

# カスタムメッセージの送信
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"message": "テストメッセージです"}'
```

### 3. Claude Desktop から MCP ツールの確認

Claude Desktopで以下のように入力して、MCPサーバーが認識されているか確認：

```
利用可能なMCPツールを教えてください
```

LINE関連のツール（push_message、get_profileなど）が表示されれば成功です。

## 🔧 トラブルシューティング

### MCPサーバーが認識されない

1. Claude Desktopの設定ファイルのパスを確認
2. JSONの構文エラーがないか確認
3. Claude Desktopを完全に再起動（タスクマネージャーから終了）

### メッセージが送信されない

1. `.env`ファイルの環境変数を確認
2. LINE Channel Access Tokenの有効期限を確認
3. サーバーログでエラーメッセージを確認

### 天気情報が取得できない

1. OpenWeatherMap APIキーの有効性を確認
2. 都市名が正しいか確認（英語表記）
3. APIの利用制限に達していないか確認

## 📚 参考リンク

- [LINE Messaging API ドキュメント](https://developers.line.biz/ja/docs/messaging-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [LINE Bot MCP Server (GitHub)](https://github.com/line/line-bot-mcp-server)