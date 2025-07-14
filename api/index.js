const { Hono } = require('hono');
const { handle } = require('hono/vercel');
const { spawn } = require('child_process');

const app = new Hono();

// 環境変数
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = process.env.CITY || 'Tokyo';
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const DESTINATION_USER_ID = process.env.DESTINATION_USER_ID;

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
function isRainyDay(weatherData) {
  if (!weatherData) return false;
  
  const weatherId = weatherData.weather[0].id;
  return (weatherId >= 200 && weatherId <= 299) || 
         (weatherId >= 300 && weatherId <= 399) || 
         (weatherId >= 500 && weatherId <= 599);
}

// LINE MCPサーバーを使ってメッセージを送信
async function sendLineMessage(message, userId) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('npx', [
      '@line/line-bot-mcp-server'
    ], {
      env: {
        ...process.env,
        CHANNEL_ACCESS_TOKEN,
        DESTINATION_USER_ID: userId || DESTINATION_USER_ID
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'push_message',
        arguments: {
          user_id: userId || DESTINATION_USER_ID,
          text: message
        }
      },
      id: 1
    };

    let responseData = '';
    let errorData = '';

    mcpProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0 && responseData) {
        try {
          const lines = responseData.trim().split('\n');
          for (const line of lines) {
            try {
              const response = JSON.parse(line);
              if (response.result) {
                console.log('メッセージ送信成功');
                resolve(response.result);
                return;
              }
            } catch (e) {
              // JSONパースエラーは無視
            }
          }
        } catch (error) {
          console.error('レスポンス解析エラー:', error);
        }
      }
      
      if (errorData) {
        console.error('MCPエラー:', errorData);
        reject(new Error(errorData));
      } else {
        resolve('completed');
      }
    });

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();

    setTimeout(() => {
      mcpProcess.kill();
      resolve('timeout');
    }, 10000);
  });
}

// 天気をチェックして雨の日なら通知する関数
async function checkWeatherAndNotify() {
  console.log('天気をチェックしています...');
  
  const weatherData = await getWeatherData();
  if (!weatherData) {
    console.error('天気データの取得に失敗しました');
    return { error: '天気データの取得に失敗しました' };
  }

  console.log(`現在の天気: ${weatherData.weather[0].description}`);
  
  if (isRainyDay(weatherData)) {
    console.log('雨の日です！通知を送信します');
    
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp);
    const humidity = weatherData.main.humidity;
    
    const message = `☔️ 今日は雨の日です！

🌧️ 天気: ${weatherDescription}
🌡️ 気温: ${temperature}°C
💧 湿度: ${humidity}%

傘を忘れずに！☂️`;
    
    try {
      await sendLineMessage(message);
      return { 
        success: true, 
        message: '雨の日通知を送信しました',
        weather: weatherDescription,
        isRainy: true
      };
    } catch (error) {
      console.error('通知送信エラー:', error);
      return { error: '通知送信に失敗しました' };
    }
  } else {
    console.log('雨の日ではありません');
    return { 
      success: true, 
      message: '雨の日ではありません',
      weather: weatherData.weather[0].description,
      isRainy: false
    };
  }
}

// APIエンドポイント
app.get('/', (c) => {
  return c.text('LINE Weather Bot (Vercel) is running! 🌧️');
});

// 天気情報を取得するエンドポイント
app.get('/weather', async (c) => {
  const weatherData = await getWeatherData();
  if (weatherData) {
    const isRainy = isRainyDay(weatherData);
    return c.json({
      city: CITY,
      weather: weatherData.weather[0].description,
      temperature: Math.round(weatherData.main.temp),
      humidity: weatherData.main.humidity,
      isRainy
    });
  }
  return c.json({ error: '天気データの取得に失敗しました' }, 500);
});

// 手動で天気チェックを実行するエンドポイント
app.post('/check', async (c) => {
  const result = await checkWeatherAndNotify();
  return c.json(result);
});

// カスタムメッセージを送信するエンドポイント
app.post('/send', async (c) => {
  try {
    const { message, userId } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'メッセージが必要です' }, 400);
    }
    
    await sendLineMessage(message, userId);
    return c.json({ message: 'メッセージを送信しました' });
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    return c.json({ error: 'メッセージ送信に失敗しました' }, 500);
  }
});

// Vercel Cron Job用エンドポイント
app.get('/api/cron', async (c) => {
  const result = await checkWeatherAndNotify();
  return c.json(result);
});

module.exports = handle(app);