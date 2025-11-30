import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  openrouterApiKey: process.env.OPENROUTER_API_KEY!,
  replicateApiToken: process.env.REPLICATE_API_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  aiModel: process.env.AI_MODEL || 'google/gemini-2.0-flash-001:free',
};

// Проверка обязательных переменных
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'OPENROUTER_API_KEY',
  'REPLICATE_API_TOKEN',
  'DATABASE_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Отсутствует переменная окружения: ${envVar}`);
  }
}
