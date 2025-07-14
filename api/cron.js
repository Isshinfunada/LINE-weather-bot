// Vercel Cron Job用のエンドポイント
// 毎日朝7時（JST）に実行される

const checkWeatherAndNotify = require('./index.js');

module.exports = async (req, res) => {
  // Vercel Cronからのリクエストを検証
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 天気チェックを実行
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    console.log('Cron job executed:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ error: 'Cron job failed' });
  }
};