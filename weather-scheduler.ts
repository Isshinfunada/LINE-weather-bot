import { Hono } from 'hono';
import * as cron from 'node-cron';
import { spawn } from 'child_process';

const app = new Hono();

// 環境変数
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;
const CITY = process.env.CITY || 'Tokyo';
const TARGET_USER_ID = process.env.DESTINATION_USER_ID!;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN!;

// 天気情報を取得する関数
async function getWeatherData() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`
    );
    return await response.json();
  } catch (error) {
    console.error('天気情報の取得に失敗しました:', error);
    return null;
  }
}

// 雨の日かどうかを判定する関数
function isRainyDay(weatherData: any): boolean {
  if (!weatherData) return false;
  
  const weatherId = weatherData.weather[0].id;
  return (weatherId >= 200 && weatherId <= 299) || 
         (weatherId >= 300 && weatherId <= 399) || 
         (weatherId >= 500 && weatherId <= 599);
}

// LINE MCPサーバーを使ってメッセージを送信
async function sendLineMessage(message: string) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('npx', [
      '@line/line-bot-mcp-server'
    ], {
      env: {
        ...process.env,
        CHANNEL_ACCESS_TOKEN,
        DESTINATION_USER_ID: TARGET_USER_ID
      }
    });

    // MCPサーバーにコマンドを送信
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'push_message',
        arguments: {
          user_id: TARGET_USER_ID,
          text: message
        }
      },
      id: 1
    };

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');

    mcpProcess.stdout.on('data', (data) => {
      const response = JSON.parse(data.toString());
      if (response.result) {
        console.log('メッセージ送信成功:', response.result);
        resolve(response.result);
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      console.error('MCPエラー:', data.toString());
      reject(new Error(data.toString()));
    });

    setTimeout(() => {
      mcpProcess.kill();
      resolve('completed');
    }, 5000);
  });
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
    
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp);
    const humidity = weatherData.main.humidity;
    
    const message = `☔️ 今日は雨の日です！\n\n🌧️ 天気: ${weatherDescription}\n🌡️ 気温: ${temperature}°C\n💧 湿度: ${humidity}%\n\n傘を忘れずに！☂️`;
    
    await sendLineMessage(message);
  } else {
    console.log('雨の日ではありません');
  }
}

// スケジュール設定（毎日朝7時に実行）
cron.schedule('0 7 * * *', checkWeatherAndNotify, {
  timezone: 'Asia/Tokyo'
});

// APIエンドポイント
app.get('/', (c) => {
  return c.text('Weather Scheduler is running! 🌧️');
});

app.get('/check', async (c) => {
  const weatherData = await getWeatherData();
  if (weatherData) {
    const isRainy = isRainyDay(weatherData);
    return c.json({
      weather: weatherData.weather[0].description,
      temperature: Math.round(weatherData.main.temp),
      isRainy
    });
  }
  return c.json({ error: '天気データの取得に失敗しました' }, 500);
});

app.post('/notify', async (c) => {
  await checkWeatherAndNotify();
  return c.json({ message: '天気チェックを実行しました' });
});

const port = process.env.PORT || 3001;

console.log(`Weather Scheduler が起動しました (Port: ${port})`);
console.log('毎日朝7時に天気をチェックします');

// 起動時に一度天気をチェック
checkWeatherAndNotify();

export default {
  port,
  fetch: app.fetch,
};