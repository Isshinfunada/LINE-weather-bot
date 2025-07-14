declare module "bun" {
  interface Env {
    LINE_CHANNEL_ACCESS_TOKEN: string;
    LINE_CHANNEL_SECRET: string;
    OPENWEATHER_API_KEY: string;
    CITY?: string;
    TARGET_USER_ID: string;
    PORT?: string;
  }
}