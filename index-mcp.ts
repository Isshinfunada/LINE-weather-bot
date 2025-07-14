import { Hono } from 'hono';
import * as cron from 'node-cron';

const app = new Hono();

// 環境変数
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;
const CITY = process.env.CITY || 'Tokyo';

// MCPクライアント設定
interface MCPRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number;
}

interface MCPResponse {
  jsonrpc: string;
  result?: any;
  error?: any;
  id: number;
}

// MCPクライアントクラス
class MCPClient {
  private endpoint: string;

  constructor(endpoint: string = 'http://localhost:3002/mcp') {
    this.endpoint = endpoint;
  }

  async call(toolName: string, args: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      },
      id: Date.now()
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const result: MCPResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message || 'MCP call failed');
      }

      return result.result;
    } catch (error) {
      console.error('MCP call error:', error);
      throw error;
    }
  }
}

const mcpClient = new MCPClient();

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
    
    const message = `☔️ 今日は雨の日です！

🌧️ 天気: ${weatherDescription}
🌡️ 気温: ${temperature}°C
💧 湿度: ${humidity}%

傘を忘れずに！☂️`;

    try {
      // LINE MCPサーバーを使ってメッセージを送信
      const result = await mcpClient.call('push_message', {
        text: message
      });
      console.log('通知送信成功:', result);
    } catch (error) {
      console.error('通知送信エラー:', error);
    }
  } else {
    console.log('雨の日ではありません');
  }
}

// スケジュール設定（毎日朝7時に実行）
cron.schedule('0 7 * * *', checkWeatherAndNotify, {
  timezone: 'Asia/Tokyo'
});

// Webhookエンドポイント
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const events = body.events;
    
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text.toLowerCase();
        
        if (userMessage.includes('天気') || userMessage.includes('weather')) {
          const weatherData = await getWeatherData();
          if (weatherData) {
            const weatherDescription = weatherData.weather[0].description;
            const temperature = Math.round(weatherData.main.temp);
            const isRainy = isRainyDay(weatherData);
            
            const message = `🌤️ 現在の天気情報

🌡️ 気温: ${temperature}°C
☁️ 天気: ${weatherDescription}
${isRainy ? '☔️ 雨が降っています' : '☀️ 雨は降っていません'}`;

            // Reply via MCP
            await mcpClient.call('reply_message', {
              reply_token: event.replyToken,
              text: message
            });
          }
        }
      }
    }
    
    return c.json({ message: 'ok' });
  } catch (error) {
    console.error('Webhook処理エラー:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// ヘルスチェック
app.get('/', (c) => {
  return c.text('LINE Weather Bot with MCP is running! 🌧️');
});

// 手動天気チェックエンドポイント
app.post('/check-weather', async (c) => {
  await checkWeatherAndNotify();
  return c.json({ message: '天気チェックを実行しました' });
});

const port = process.env.PORT || 3000;

console.log(`LINE Weather Bot が起動しました (Port: ${port})`);
console.log('毎日朝7時に天気をチェックします');
console.log('LINE MCP Serverとの連携準備完了');

// 起動時に一度天気をチェック
setTimeout(() => {
  checkWeatherAndNotify();
}, 5000);

export default {
  port,
  fetch: app.fetch,
};