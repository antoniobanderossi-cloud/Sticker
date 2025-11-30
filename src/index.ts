import { Bot, session } from 'grammy';
import { hydrate } from '@grammyjs/hydrate';
import { config } from './config.js';
import {
  MyContext,
  handleStart,
  handleBalance,
  handleBuyTokens,
  handlePurchase,
  handleSuccessfulPayment,
  handlePhoto,
  handleHelp,
} from './bot/handlers.js';

const bot = new Bot<MyContext>(config.telegramBotToken);

// Плагины
bot.use(hydrate());

// Middleware для логирования
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${ctx.from?.id} - ${ctx.message?.text || 'action'} - ${ms}ms`);
});

// Команды
bot.command('start', handleStart);

// Обработка текстовых сообщений (кнопки)
bot.hears('💰 Мой баланс', handleBalance);
bot.hears('🛒 Купить токены', handleBuyTokens);
bot.hears('❓ Помощь', handleHelp);

// Callback queries
bot.callbackQuery('buy_tokens', async (ctx) => {
  await ctx.answerCallbackQuery();
  await handleBuyTokens(ctx);
});

bot.callbackQuery('buy_5', async (ctx) => {
  await ctx.answerCallbackQuery();
  await handlePurchase(ctx, 5, 50);
});

bot.callbackQuery('buy_10', async (ctx) => {
  await ctx.answerCallbackQuery();
  await handlePurchase(ctx, 10, 90);
});

bot.callbackQuery('buy_25', async (ctx) => {
  await ctx.answerCallbackQuery();
  await handlePurchase(ctx, 25, 200);
});

// Обработка успешного платежа
bot.on('message:successful_payment', handleSuccessfulPayment);

// Pre-checkout query (обязательно для Telegram Stars)
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// Обработка фото
bot.on('message:photo', handlePhoto);

// Обработка ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err.error);

  ctx.reply('❌ Произошла ошибка. Попробуйте позже или обратитесь в поддержку.').catch(console.error);
});

// Запуск бота
async function main() {
  console.log('🤖 Запуск бота...');

  // Устанавливаем команды
  await bot.api.setMyCommands([
    { command: 'start', description: 'Начать работу с ботом' },
  ]);

  console.log('✅ Бот запущен и готов к работе!');

  // Запускаем бота
  await bot.start();
}

main().catch((error) => {
  console.error('❌ Ошибка при запуске бота:', error);
  process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stop();
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stop();
});
