# 📝 Инструкция по настройке

## Шаг 1: Получение API ключей

### 1.1 Telegram Bot Token

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Сохраните токен вида: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### 1.2 Настройка Telegram Stars (платежи)

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Bot Settings → Payments
5. Выберите **Telegram Stars**

### 1.3 OpenRouter API Key

1. Зарегистрируйтесь на [openrouter.ai](https://openrouter.ai/)
2. Перейдите в [Keys](https://openrouter.ai/keys)
3. Create Key
4. Сохраните ключ вида: `sk-or-v1-...`

### 1.4 Replicate API Token

1. Зарегистрируйтесь на [replicate.com](https://replicate.com/)
2. Перейдите в [Account → API Tokens](https://replicate.com/account/api-tokens)
3. Create token
4. Сохраните токен вида: `r8_...`

## Шаг 2: Установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd Sticker

# Установить зависимости
npm install

# Запустить PostgreSQL (Docker)
docker-compose up -d

# Или создать БД вручную
createdb sticker_bot
```

## Шаг 3: Конфигурация

```bash
# Скопировать пример конфигурации
cp .env.example .env

# Отредактировать .env
nano .env  # или используйте ваш редактор
```

Вставьте ваши ключи в `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://sticker_user:sticker_password@localhost:5432/sticker_bot?schema=public
AI_MODEL=google/gemini-2.0-flash-001:free
```

## Шаг 4: Инициализация БД

```bash
npm run db:push
```

## Шаг 5: Запуск

```bash
npm run dev
```

Вы должны увидеть:
```
🤖 Запуск бота...
✅ Бот запущен и готов к работе!
```

## Шаг 6: Тестирование

1. Найдите вашего бота в Telegram (по username)
2. Отправьте `/start`
3. Отправьте фотографию
4. Дождитесь создания стикерпака!

## ✅ Чеклист готовности

- [ ] Node.js установлен
- [ ] PostgreSQL запущен
- [ ] Получен Telegram Bot Token
- [ ] Настроены Telegram Stars
- [ ] Получен OpenRouter API Key
- [ ] Получен Replicate API Token
- [ ] Создан файл `.env`
- [ ] База данных инициализирована
- [ ] Бот запущен без ошибок
- [ ] Тестовая генерация прошла успешно

## 🆘 Если что-то пошло не так

### "Отсутствует переменная окружения"
→ Проверьте `.env` файл, все поля должны быть заполнены

### "Cannot connect to database"
→ Убедитесь что PostgreSQL запущен: `docker-compose ps` или `pg_isready`

### "Bot token is invalid"
→ Проверьте `TELEGRAM_BOT_TOKEN` в `.env`

### "API rate limit exceeded"
→ Проверьте баланс на OpenRouter или Replicate

### "Database schema is not in sync"
→ Запустите `npm run db:push` снова

## 💰 Пополнение баланса API

### OpenRouter
1. [Billing](https://openrouter.ai/settings/billing)
2. Add credits
3. Минимум $5

### Replicate
1. [Billing](https://replicate.com/account/billing)
2. Add payment method
3. Pay as you go (~$0.01-0.03 за генерацию)

## 🚀 Production Deploy

Для продакшн-развертывания рекомендуется:

1. **VPS/Cloud Server** (DigitalOcean, Hetzner, AWS)
2. **Process Manager**: PM2 или systemd
3. **PostgreSQL**: Отдельный сервер или managed DB
4. **Monitoring**: Sentry для ошибок
5. **Logs**: Winston или Pino

Пример с PM2:
```bash
npm run build
pm2 start dist/index.js --name sticker-bot
pm2 save
pm2 startup
```

Готово! 🎉
