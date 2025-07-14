#!/bin/bash

echo "🌧️ LINE Weather Bot MCPセットアップを開始します..."
echo ""

# .envファイルの作成
if [ -f .env ]; then
    echo "⚠️  .envファイルが既に存在します。上書きしますか？ (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "セットアップを中止しました。"
        exit 1
    fi
fi

echo "📝 環境変数を設定します..."
echo ""

# LINE設定
echo "1. LINE設定"
echo -n "LINE_CHANNEL_ACCESS_TOKEN を入力してください: "
read -r LINE_CHANNEL_ACCESS_TOKEN

echo -n "LINE_CHANNEL_SECRET を入力してください: "
read -r LINE_CHANNEL_SECRET

echo -n "DESTINATION_USER_ID (送信先のLINEユーザーID) を入力してください: "
read -r DESTINATION_USER_ID

echo ""
echo "2. OpenWeatherMap設定"
echo -n "OPENWEATHER_API_KEY を入力してください: "
read -r OPENWEATHER_API_KEY

echo -n "CITY (天気を取得する都市名、デフォルト: Tokyo): "
read -r CITY
CITY=${CITY:-Tokyo}

echo -n "PORT (サーバーポート、デフォルト: 3000): "
read -r PORT
PORT=${PORT:-3000}

# .envファイルの作成
cat > .env <<EOF
# LINE設定
LINE_CHANNEL_ACCESS_TOKEN=$LINE_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=$LINE_CHANNEL_SECRET
DESTINATION_USER_ID=$DESTINATION_USER_ID

# OpenWeatherMap設定
OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY
CITY=$CITY

# サーバー設定
PORT=$PORT
EOF

echo ""
echo "✅ .envファイルを作成しました"
echo ""

# 依存関係のインストール
echo "📦 依存関係をインストールしています..."
bun install

# LINE MCPサーバーのインストール確認
echo ""
echo "🔍 LINE MCPサーバーの確認..."
if ! command -v npx &> /dev/null; then
    echo "⚠️  npxが見つかりません。Node.jsをインストールしてください。"
    exit 1
fi

echo "📥 LINE MCPサーバーをテスト実行..."
npx @line/line-bot-mcp-server --version 2>/dev/null || {
    echo "LINE MCPサーバーを初回ダウンロードしています..."
}

echo ""
echo "🎉 セットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. Claude Desktopの設定:"
echo "   claude-desktop-config.jsonの内容をClaude Desktopの設定に追加してください"
echo ""
echo "2. Botの起動:"
echo "   bun run dev"
echo ""
echo "3. 動作確認:"
echo "   curl http://localhost:$PORT/weather"
echo ""