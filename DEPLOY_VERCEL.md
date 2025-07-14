# Vercelへのデプロイガイド

## 🚀 デプロイ手順

### 1. 事前準備

必要なアカウント：
- [Vercel](https://vercel.com/)アカウント
- [LINE Developers](https://developers.line.biz/)アカウント
- [OpenWeatherMap](https://openweathermap.org/)アカウント

### 2. プロジェクトのフォーク/クローン

```bash
git clone https://github.com/Isshinfunada/LINE-weather-bot.git
cd line-weather-bot
```

### 3. Vercel CLIでデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel
```

### 4. 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINEチャンネルアクセストークン | `xxx...` |
| `LINE_CHANNEL_SECRET` | LINEチャンネルシークレット | `xxx...` |
| `DESTINATION_USER_ID` | 送信先のLINEユーザーID | `Uxxxx...` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap APIキー | `xxx...` |
| `CITY` | 天気を取得する都市 | `Tokyo` |
| `CRON_SECRET` | Cron Job用シークレット | ランダムな文字列 |

### 5. Cron Jobの設定

`vercel.json`に以下の設定が含まれています：

```json
"crons": [
  {
    "path": "/api/cron",
    "schedule": "0 22 * * *"  // UTC 22:00 = JST 7:00
  }
]
```

> **注意**: Vercelの無料プランではCron Jobは1日1回までの制限があります。

## 🧪 テスト環境のセットアップ

### デモ用の設定

1. `.env.test`をコピーして`.env`を作成：
```bash
cp .env.test .env
```

2. 最小限のテスト設定：
```env
# テスト用のLINE設定（実際には通知は送れません）
LINE_CHANNEL_ACCESS_TOKEN=test_token_123
LINE_CHANNEL_SECRET=test_secret_123
DESTINATION_USER_ID=Utest123456789

# OpenWeatherMapの無料API（動作確認用）
# 以下は仮のAPIキーです。実際のキーに置き換えてください
OPENWEATHER_API_KEY=your_actual_api_key_here
CITY=Tokyo

# Vercel設定
CRON_SECRET=your_random_secret_here
```

### ローカルでのテスト

```bash
# Node.jsで実行（Vercel環境をシミュレート）
cd api
node -e "require('./index.js')"

# 別ターミナルでテスト
curl http://localhost:3000/weather
```

## 📡 エンドポイント

デプロイ後は以下のエンドポイントが利用可能：

- `GET https://your-app.vercel.app/` - ヘルスチェック
- `GET https://your-app.vercel.app/weather` - 天気情報取得
- `POST https://your-app.vercel.app/check` - 手動天気チェック
- `POST https://your-app.vercel.app/send` - メッセージ送信

## ⚠️ 制限事項

### Vercelの制限

1. **Cron Jobs**: 無料プランは1日1回まで
2. **実行時間**: 最大10秒（無料プラン）
3. **MCPサーバー**: Vercel環境では`npx`コマンドが使えない可能性があります

### 代替案

MCPサーバーが動作しない場合は、LINE Bot SDKを直接使用する版も用意しています：

```javascript
// api/index.js の sendLineMessage 関数を以下に置き換え
async function sendLineMessage(message, userId) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      to: userId || DESTINATION_USER_ID,
      messages: [{
        type: 'text',
        text: message
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`LINE API error: ${response.status}`);
  }
  
  return response.json();
}
```

## 🔧 トラブルシューティング

### Cron Jobが動作しない

1. Vercelダッシュボードで「Functions」タブを確認
2. ログでエラーを確認
3. `CRON_SECRET`が正しく設定されているか確認

### 環境変数が読み込まれない

1. Vercelダッシュボードの「Settings」→「Environment Variables」を確認
2. デプロイ後に環境変数を追加した場合は再デプロイが必要

### デプロイエラー

```bash
# キャッシュをクリアして再デプロイ
vercel --force

# ログを確認
vercel logs
```

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)