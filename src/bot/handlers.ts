import { Context } from 'grammy';
import { HydrateFlavor } from '@grammyjs/hydrate';
import { getOrCreateUser, updateUserTokens, createTransaction, createStickerPack } from '../db.js';
import { processStickerPack, cleanupTempFiles } from '../services/stickerGenerator.js';
import path from 'path';
import fs from 'fs';
import { InputFile } from 'grammy';

export type MyContext = HydrateFlavor<Context>;

export async function handleStart(ctx: MyContext) {
  const user = ctx.from;
  if (!user) return;

  const dbUser = await getOrCreateUser(
    user.id,
    user.username,
    user.first_name,
    user.last_name
  );

  const welcomeMessage = `👋 Привет, ${user.first_name}!

🎨 Я помогу тебе создать уникальный стикерпак из твоей фотографии!

💎 У тебя сейчас: ${dbUser.tokens} ${getTokenWord(dbUser.tokens)}

📸 Просто отправь мне свою фотографию, и я создам для тебя набор из 25 стикеров с разными эмоциями!

Каждая генерация стоит 1 токен.`;

  await ctx.reply(welcomeMessage, {
    reply_markup: {
      keyboard: [
        [{ text: '💰 Мой баланс' }, { text: '🛒 Купить токены' }],
        [{ text: '❓ Помощь' }],
      ],
      resize_keyboard: true,
    },
  });
}

export async function handleBalance(ctx: MyContext) {
  const user = ctx.from;
  if (!user) return;

  const dbUser = await getOrCreateUser(user.id, user.username, user.first_name, user.last_name);

  await ctx.reply(
    `💰 Ваш баланс: ${dbUser.tokens} ${getTokenWord(dbUser.tokens)}

1 генерация = 1 токен
Используйте кнопку "🛒 Купить токены" для покупки.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: '🛒 Купить токены', callback_data: 'buy_tokens' }]],
      },
    }
  );
}

export async function handleBuyTokens(ctx: MyContext) {
  await ctx.reply(
    `🛒 Выберите количество токенов:

⭐️ 5 токенов = 50 Stars
⭐️ 10 токенов = 90 Stars
⭐️ 25 токенов = 200 Stars`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '5 токенов за 50 ⭐️', callback_data: 'buy_5' }],
          [{ text: '10 токенов за 90 ⭐️', callback_data: 'buy_10' }],
          [{ text: '25 токенов за 200 ⭐️', callback_data: 'buy_25' }],
        ],
      },
    }
  );
}

export async function handlePurchase(ctx: MyContext, tokens: number, stars: number) {
  if (!ctx.from) return;

  try {
    // Создаем инвойс для Telegram Stars
    await ctx.replyWithInvoice(
      `Покупка ${tokens} ${getTokenWord(tokens)}`,
      `Пополнение баланса на ${tokens} ${getTokenWord(tokens)}`,
      JSON.stringify({ tokens }),
      '', // provider_token пустой для Stars
      'XTR', // валюта Stars
      [{ label: `${tokens} токенов`, amount: stars }],
      {
        reply_markup: {
          inline_keyboard: [[{ text: `Оплатить ${stars} ⭐️`, pay: true }]],
        },
      }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    await ctx.reply('❌ Произошла ошибка при создании платежа. Попробуйте позже.');
  }
}

export async function handleSuccessfulPayment(ctx: MyContext) {
  if (!ctx.from || !ctx.message?.successful_payment) return;

  const payment = ctx.message.successful_payment;
  const payload = JSON.parse(payment.invoice_payload);
  const tokens = payload.tokens;

  const dbUser = await getOrCreateUser(ctx.from.id, ctx.from.username, ctx.from.first_name, ctx.from.last_name);

  // Добавляем токены
  await updateUserTokens(dbUser.id, tokens);

  // Записываем транзакцию
  await createTransaction(dbUser.id, 'purchase', tokens, payment.total_amount);

  await ctx.reply(
    `✅ Оплата прошла успешно!
💎 Вам начислено ${tokens} ${getTokenWord(tokens)}
💰 Ваш новый баланс: ${dbUser.tokens + tokens} ${getTokenWord(dbUser.tokens + tokens)}`
  );
}

export async function handlePhoto(ctx: MyContext) {
  const user = ctx.from;
  if (!user || !ctx.message?.photo) return;

  const dbUser = await getOrCreateUser(user.id, user.username, user.first_name, user.last_name);

  // Проверяем баланс
  if (dbUser.tokens < 1) {
    await ctx.reply(
      '❌ Недостаточно токенов!\n\n' +
        'Для генерации стикерпака нужен минимум 1 токен.\n' +
        'Используйте кнопку "🛒 Купить токены" для покупки.',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '🛒 Купить токены', callback_data: 'buy_tokens' }]],
        },
      }
    );
    return;
  }

  const statusMsg = await ctx.reply('⏳ Начинаю обработку...');

  try {
    // Скачиваем фото
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.api.getFile(photo.file_id);
    const filePath = file.file_path;

    if (!filePath) {
      throw new Error('Не удалось получить путь к файлу');
    }

    // Скачиваем файл
    const fileUrl = `https://api.telegram.org/file/bot${ctx.api.token}/${filePath}`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localPath = path.join(uploadsDir, `${user.id}_${Date.now()}.jpg`);
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    await fs.promises.writeFile(localPath, Buffer.from(arrayBuffer));

    // Списываем токен
    await updateUserTokens(dbUser.id, -1);
    await createTransaction(dbUser.id, 'generation', -1);

    // Обрабатываем стикерпак
    const processedStickers = await processStickerPack(
      localPath,
      dbUser.id,
      async (message) => {
        try {
          await ctx.api.editMessageText(ctx.chat!.id, statusMsg.message_id, message);
        } catch (e) {
          // Игнорируем ошибки редактирования (если сообщение не изменилось)
        }
      }
    );

    // Создаем стикерпак
    await ctx.api.editMessageText(
      ctx.chat!.id,
      statusMsg.message_id,
      '📦 Создаю стикерпак...'
    );

    const stickerSetName = `stickers_${user.id}_${Date.now()}_by_${ctx.me.username}`;
    const stickerSetTitle = `Стикеры ${user.first_name}`;

    // Создаем новый стикерпак
    await ctx.api.createNewStickerSet(user.id, stickerSetName, stickerSetTitle, [
      {
        sticker: new InputFile(processedStickers[0]),
        emoji_list: ['😊'],
        format: 'static',
      },
    ]);

    // Добавляем остальные стикеры
    const emojis = [
      '😊', '🤩', '😮', '🤔', '😠', '😢', '😭', '😂', '🤦', '😳',
      '😴', '😎', '😕', '😏', '😱', '😰', '😤', '👍', '👎', '👋',
      '😉', '😐', '👌', '❤️', '🎉',
    ];

    for (let i = 1; i < processedStickers.length; i++) {
      await ctx.api.addStickerToSet(user.id, stickerSetName, {
        sticker: new InputFile(processedStickers[i]),
        emoji_list: [emojis[i] || '😊'],
        format: 'static',
      });
    }

    // Сохраняем в БД
    await createStickerPack(dbUser.id, stickerSetName, stickerSetTitle);

    // Отправляем результат
    await ctx.api.deleteMessage(ctx.chat!.id, statusMsg.message_id);
    await ctx.reply(
      `✅ Стикерпак успешно создан!

🎉 Ваш стикерпак: https://t.me/addstickers/${stickerSetName}

💰 Осталось токенов: ${dbUser.tokens - 1}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📦 Открыть стикерпак', url: `https://t.me/addstickers/${stickerSetName}` }],
            [{ text: '🛒 Купить токены', callback_data: 'buy_tokens' }],
          ],
        },
      }
    );

    // Очищаем временные файлы
    cleanupTempFiles(dbUser.id);
    fs.unlinkSync(localPath);
  } catch (error) {
    console.error('Error processing photo:', error);
    await ctx.api.editMessageText(
      ctx.chat!.id,
      statusMsg.message_id,
      '❌ Произошла ошибка при обработке фото. Попробуйте еще раз или обратитесь в поддержку.'
    );

    // Возвращаем токен в случае ошибки
    await updateUserTokens(dbUser.id, 1);
  }
}

export async function handleHelp(ctx: MyContext) {
  await ctx.reply(
    `❓ Помощь

🎨 Как создать стикерпак:
1. Отправьте боту свою фотографию
2. Подождите, пока бот обработает изображение
3. Получите ссылку на готовый стикерпак!

💎 Система токенов:
• 1 генерация = 1 токен
• При первом запуске вы получаете 1 бесплатный токен
• Дополнительные токены можно купить за Telegram Stars

⭐️ Цены:
• 5 токенов = 50 Stars
• 10 токенов = 90 Stars
• 25 токенов = 200 Stars

📝 Команды:
/start - Начать работу с ботом
💰 Мой баланс - Посмотреть текущий баланс
🛒 Купить токены - Приобрести токены
❓ Помощь - Показать это сообщение`
  );
}

function getTokenWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'токенов';
  }

  if (lastDigit === 1) {
    return 'токен';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'токена';
  }

  return 'токенов';
}
