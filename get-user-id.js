// LINE User ID取得用の簡易サーバー
// 使い方: node get-user-id.js

const express = require('express');
const app = express();

app.use(express.json());

console.log('🚀 User ID取得サーバーを起動しています...\n');

// Webhookエンドポイント
app.post('/webhook', (req, res) => {
  const events = req.body.events || [];
  
  events.forEach(event => {
    if (event.type === 'follow') {
      console.log('✅ 新しい友だち追加！');
      console.log('User ID:', event.source.userId);
      console.log('-'.repeat(50));
    } else if (event.type === 'message') {
      console.log('💬 メッセージを受信！');
      console.log('User ID:', event.source.userId);
      console.log('メッセージ:', event.message.text);
      console.log('-'.repeat(50));
    }
  });
  
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✨ サーバーが起動しました: http://localhost:${port}`);
  console.log('\n📱 設定手順:');
  console.log('1. ngrokなどでこのサーバーを公開');
  console.log('   例: ngrok http 3000');
  console.log('2. LINE DevelopersでWebhook URLを設定');
  console.log('   例: https://xxxxx.ngrok.io/webhook');
  console.log('3. Botを友だち追加またはメッセージを送信');
  console.log('4. このコンソールにUser IDが表示されます！\n');
});