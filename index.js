const express = require('express');
const { Client } = require('@line/bot-sdk');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// LINE Bot設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// OpenWeatherMap API設定
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.CITY || 'Tokyo';
const TARGET_USER_ID = process.env.TARGET_USER_ID;

// 天気情報を取得する関数
async function getWeatherData() {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`
    );
    return response.data;
  } catch (error) {
    console.error('天気情報の取得に失敗しました:', error);
    return null;
  }
}

// 雨の日かどうかを判定する関数
function isRainyDay(weatherData) {
  if (!weatherData) return false;
  
  const weatherId = weatherData.weather[0].id;
  // OpenWeatherMapの天気コード：200-299は雷雨、300-399は霧雨、500-599は雨
  return (weatherId >= 200 && weatherId <= 299) || 
         (weatherId >= 300 && weatherId <= 399) || 
         (weatherId >= 500 && weatherId <= 599);
}

// 雨の日の通知を送信する関数
async function sendRainNotification(weatherData) {
  if (!TARGET_USER_ID) {
    console.error('TARGET_USER_IDが設定されていません');
    return;
  }

  const weatherDescription = weatherData.weather[0].description;
  const temperature = Math.round(weatherData.main.temp);
  const humidity = weatherData.main.humidity;
  
  const message = {
    type: 'text',
    text: `☔️ 今日は雨の日です！\n\n🌧️ 天気: ${weatherDescription}\n🌡️ 気温: ${temperature}°C\n💧 湿度: ${humidity}%\n\n傘を忘れずに！☂️`
  };

  try {
    await client.pushMessage(TARGET_USER_ID, message);
    console.log('雨の日通知を送信しました');
  } catch (error) {
    console.error('通知の送信に失敗しました:', error);
  }
}

// 天気をチェックして雨の日なら通知する関数
async function checkWeatherAndNotify() {
  console.log('天気をチェックしています...');
  
  const weatherData = await getWeatherData();
  if (!weatherData) {
    console.error('天気データの取得に失敗しました');
    return;
  }

  console.log(`現在の天気: ${weatherData.weather[0].description}`);
  
  if (isRainyDay(weatherData)) {
    console.log('雨の日です！通知を送信します');
    await sendRainNotification(weatherData);
  } else {
    console.log('雨の日ではありません');
  }
}

// スケジュール設定（毎日朝7時に実行）
cron.schedule('0 7 * * *', checkWeatherAndNotify, {
  timezone: 'Asia/Tokyo'
});

// LINEからのメッセージを処理
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-line-signature'];
    const body = req.body.toString();
    
    // 署名検証（実際の運用では必要）
    
    const events = JSON.parse(body).events;
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text.toLowerCase();
        
        if (userMessage.includes('天気') || userMessage.includes('weather')) {
          // 現在の天気を即座に確認
          const weatherData = await getWeatherData();
          if (weatherData) {
            const weatherDescription = weatherData.weather[0].description;
            const temperature = Math.round(weatherData.main.temp);
            const isRainy = isRainyDay(weatherData);
            
            const replyMessage = {
              type: 'text',
              text: `🌤️ 現在の天気情報\n\n🌡️ 気温: ${temperature}°C\n☁️ 天気: ${weatherDescription}\n${isRainy ? '☔️ 雨が降っています' : '☀️ 雨は降っていません'}`
            };
            
            await client.replyMessage(event.replyToken, replyMessage);
          }
        }
      }
    }
    
    res.status(200).end();
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    res.status(500).end();
  }
});

// サーバー起動
app.listen(port, () => {
  console.log(`LINE Weather Bot が起動しました (Port: ${port})`);
  console.log('毎日朝7時に天気をチェックします');
  
  // 起動時に一度天気をチェック
  checkWeatherAndNotify();
});

// MCP サーバー機能
const mcpServer = {
  name: 'line-weather-bot',
  version: '1.0.0',
  tools: [
    {
      name: 'check_weather',
      description: '現在の天気を確認します',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'send_weather_notification',
      description: '天気通知を手動で送信します',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ]
};

// MCP ツール実行
async function handleMcpTool(toolName, args) {
  switch (toolName) {
    case 'check_weather':
      const weatherData = await getWeatherData();
      if (weatherData) {
        const isRainy = isRainyDay(weatherData);
        return {
          success: true,
          data: {
            weather: weatherData.weather[0].description,
            temperature: Math.round(weatherData.main.temp),
            isRainy: isRainy
          }
        };
      }
      return { success: false, error: '天気データの取得に失敗しました' };
      
    case 'send_weather_notification':
      const currentWeather = await getWeatherData();
      if (currentWeather && isRainyDay(currentWeather)) {
        await sendRainNotification(currentWeather);
        return { success: true, message: '雨の日通知を送信しました' };
      }
      return { success: false, message: '雨の日ではないため通知を送信しませんでした' };
      
    default:
      return { success: false, error: '不明なツールです' };
  }
}