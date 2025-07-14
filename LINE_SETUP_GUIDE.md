# LINE公式アカウント開設ガイド

## 📱 必要なもの

- LINEアカウント（個人のLINE）
- メールアドレス
- 基本的に無料で始められます

## 🚀 ステップバイステップガイド

### Step 1: LINE Developersにアクセス

1. [LINE Developers](https://developers.line.biz/ja/) にアクセス
2. 右上の「コンソール」をクリック
3. 「LINEアカウントでログイン」をクリック
4. 個人のLINEアカウントでログイン

### Step 2: プロバイダーを作成

初めての場合：
1. 「新規プロバイダー作成」をクリック
2. プロバイダー名を入力（例：「Weather Bot Provider」）
   - これは管理用の名前で、ユーザーには表示されません
3. 「作成」をクリック

### Step 3: チャンネル（公式アカウント）を作成

1. 作成したプロバイダーを選択
2. 「新規チャンネル作成」をクリック
3. 「Messaging API」を選択
4. 以下の情報を入力：

#### 必須項目
- **チャンネル名**: 「お天気通知Bot」など
  - これがLINEアプリで表示される名前になります
- **チャンネル説明**: 「雨の日だけ通知するお天気Bot」など
- **大業種**: 「メディア」など適当なものを選択
- **小業種**: 「その他メディア」など
- **メールアドレス**: 連絡用メールアドレス

#### 任意項目
- **アイコン画像**: 後で設定可能（推奨サイズ：3MB以下、JPEGまたはPNG）

5. 利用規約に同意して「作成」

### Step 4: Messaging APIを設定

チャンネル作成後、自動的にチャンネル設定画面に移動します。

1. 「Messaging API」タブをクリック
2. 以下の情報をメモ：
   - **Channel ID**
   - **Channel secret**（「チャンネルシークレット」欄）

### Step 5: チャンネルアクセストークンを発行

1. 同じ「Messaging API」タブ内
2. 「チャンネルアクセストークン（長期）」セクション
3. 「発行」ボタンをクリック
4. 表示されたトークンをコピー（後で使用）

### Step 6: 応答設定を調整

1. 「Messaging API」タブの下部
2. 「LINE公式アカウント機能」の「編集」リンクをクリック
3. LINE Official Account Managerが開きます
4. 左メニューから「応答設定」を選択
5. 以下を設定：
   - **応答メッセージ**: オフ
   - **Webhook**: オン
   - **あいさつメッセージ**: お好みで設定

### Step 7: ユーザーIDを取得

自分のLINE IDを取得する方法：

#### 方法1: Webhook経由（推奨）
1. Botを友だち追加
2. 何かメッセージを送信
3. Webhookでユーザー情報を受信してIDを確認

#### 方法2: LINE公式アカウントマネージャー
1. [LINE Official Account Manager](https://manager.line.biz/)にログイン
2. 該当のアカウントを選択
3. 「チャット」から友だちのプロフィールを確認

## 🔑 必要な情報まとめ

Botの設定に必要な3つの情報：

1. **Channel Secret**（チャンネルシークレット）
   - 場所：Messaging API設定 → 「チャンネル基本設定」タブ
   - 形式：32文字の英数字

2. **Channel Access Token**（チャンネルアクセストークン）
   - 場所：Messaging API設定 → 「Messaging API」タブ
   - 形式：長い英数字の文字列

3. **Your User ID**（あなたのユーザーID）
   - 形式：`U`で始まる33文字の文字列
   - 例：`U1234567890abcdef1234567890abcdef`

## ⚡ クイックテスト

### 1. QRコードで友だち追加

1. Messaging API設定の「QRコード」をスマホで読み取り
2. LINEアプリで友だち追加

### 2. .envファイルを更新

```env
LINE_CHANNEL_ACCESS_TOKEN=ここにアクセストークンを貼り付け
LINE_CHANNEL_SECRET=ここにチャンネルシークレットを貼り付け
DESTINATION_USER_ID=ここにあなたのユーザーIDを貼り付け
```

### 3. ローカルでテスト

```bash
# サーバー起動
bun run dev

# 別ターミナルでメッセージ送信テスト
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"message": "テストメッセージ"}'
```

## 💰 料金について

### 無料枠
- **月間メッセージ数**: 1,000通まで無料
- **友だち数**: 無制限
- **基本機能**: すべて無料

### 雨の日通知Botの場合
- 1日1回の通知 × 30日 = 月30通
- 十分無料枠内で運用可能！

## 🔧 トラブルシューティング

### トークンが発行できない
- チャンネルが作成直後の場合、少し待ってから再試行

### メッセージが届かない
1. Botを友だち追加しているか確認
2. トークンが正しいか確認
3. ユーザーIDが正しいか確認

### Webhookエラー
- 応答設定で「Webhook」がオンになっているか確認

## 📚 参考リンク

- [LINE Developers ドキュメント](https://developers.line.biz/ja/docs/)
- [Messaging APIリファレンス](https://developers.line.biz/ja/reference/messaging-api/)
- [料金プラン](https://www.linebiz.com/jp/service/line-official-account/plan/)

---

## 次のステップ

LINE設定が完了したら：

1. OpenWeatherMap APIキーを取得
2. `.env`ファイルを設定
3. `./setup.sh`を実行してセットアップ完了！