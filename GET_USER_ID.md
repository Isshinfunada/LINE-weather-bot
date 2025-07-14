# LINE User IDを取得する方法

LINE User IDは`U`で始まる33文字の文字列です。以下の方法で取得できます。

## 方法1: 簡易サーバーを使う（推奨） 🚀

### 1. ngrokをインストール

```bash
# macOS (Homebrew)
brew install ngrok

# または公式サイトからダウンロード
# https://ngrok.com/download
```

### 2. User ID取得サーバーを起動

```bash
# このプロジェクトのディレクトリで
node get-user-id.js
```

### 3. ngrokでサーバーを公開

別のターミナルで：
```bash
ngrok http 3000
```

表示されるURL（例：`https://abcd1234.ngrok.io`）をコピー

### 4. LINE DevelopersでWebhook設定

1. [LINE Developers Console](https://developers.line.biz/console/)にログイン
2. 該当のチャンネルを選択
3. 「Messaging API」タブ
4. 「Webhook設定」で：
   - Webhook URL: `https://abcd1234.ngrok.io/webhook`
   - 「更新」をクリック
   - Webhookの利用: オン

### 5. Botにメッセージを送信

1. QRコードでBotを友だち追加
2. 何かメッセージを送信（「こんにちは」など）
3. ターミナルにUser IDが表示されます！

```
💬 メッセージを受信！
User ID: U1234567890abcdef1234567890abcdef
メッセージ: こんにちは
--------------------------------------------------
```

## 方法2: LINE公式アカウントマネージャー 📊

1. [LINE Official Account Manager](https://manager.line.biz/)にログイン
2. 該当のアカウントを選択
3. 「チャット」タブをクリック
4. メッセージを送信したユーザーの履歴が表示される
5. ユーザー名をクリックしてプロフィールを開く
6. URLに含まれるIDを確認

> ⚠️ この方法は友だちがメッセージを送信済みの場合のみ使用可能

## 方法3: LINE Notify（代替案） 🔔

LINE Notifyを使う場合は、個人のLINEアカウントに直接通知できます：

1. [LINE Notify](https://notify-bot.line.me/ja/)にログイン
2. 「トークンを発行する」
3. トークン名を入力（例：「Weather Bot」）
4. 通知を送信するトークルームを選択
5. 発行されたトークンを使用

```bash
# LINE Notifyでテスト
curl -X POST https://notify-api.line.me/api/notify \
  -H "Authorization: Bearer YOUR_NOTIFY_TOKEN" \
  -F "message=雨の日です！"
```

## User IDの形式

正しいUser IDの例：
```
U1234567890abcdef1234567890abcdef
```

特徴：
- 必ず`U`で始まる
- 33文字の長さ
- 16進数の文字（0-9, a-f）

## ⚠️ 注意事項

- User IDは個人情報なので、公開しないよう注意
- GitHubにコミットする際は`.env`ファイルに記載
- テスト用のUser IDは存在しないので、実際のIDが必要

## 🔧 トラブルシューティング

### ngrokが使えない場合

他の選択肢：
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [localtunnel](https://github.com/localtunnel/localtunnel)
- [Serveo](https://serveo.net/)

### Webhookが届かない

1. LINE Developersで「Webhook」がオンになっているか確認
2. 応答設定で「応答メッセージ」がオフになっているか確認
3. ngrokのURLが正しいか確認（httpsであることを確認）

### User IDが表示されない

1. Botを友だち追加しているか確認
2. ブロックしていないか確認
3. サーバーのログを確認