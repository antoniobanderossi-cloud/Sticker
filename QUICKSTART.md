# 🚀 Быстрый старт

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Создание базы данных

```bash
createdb sticker_bot
```

## Шаг 3: Настройка окружения

Создайте файл `.env` из примера:

```bash
cp .env.example .env
```

Заполните все необходимые поля в `.env`:

```env
# 1. Создайте бота через @BotFather в Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11

# 2. Зарегистрируйтесь на https://openrouter.ai/ и создайте ключ
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. Зарегистрируйтесь на https://replicate.com/ и создайте токен
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 4. Настройте подключение к PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/sticker_bot?schema=public

# 5. Модель AI (можно оставить по умолчанию)
AI_MODEL=google/gemini-2.0-flash-001:free
```

## Шаг 4: Настройка Telegram Payments

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Bot Settings → Payments
5. Выберите **Telegram Stars**
6. Подтвердите

## Шаг 5: Инициализация базы данных

```bash
npm run db:push
```

## Шаг 6: Запуск бота

```bash
npm run dev
```

## ✅ Проверка работы

1. Откройте вашего бота в Telegram
2. Отправьте команду `/start`
3. Отправьте любую фотографию
4. Дождитесь создания стикерпака!

---

## 💡 Полезные команды

```bash
# Просмотр базы данных
npm run db:studio

# Сборка для продакшена
npm run build

# Запуск в продакшене
npm start
```

## 🐛 Частые проблемы

### "Отсутствует переменная окружения"
→ Проверьте, что все поля в `.env` заполнены

### "Cannot connect to database"
→ Убедитесь, что PostgreSQL запущен и `DATABASE_URL` правильный

### "Invalid bot token"
→ Проверьте `TELEGRAM_BOT_TOKEN` в `.env`

### "API error" при генерации
→ Проверьте баланс на OpenRouter и Replicate

---

## 📊 Структура базы данных

После `npm run db:push` будут созданы таблицы:
- **User** - пользователи бота
- **StickerPack** - созданные стикерпаки
- **Transaction** - история операций с токенами

---

## 🎯 Следующие шаги

1. Протестируйте генерацию стикерпака
2. Настройте цены на токены (в `src/bot/handlers.ts`)
3. Кастомизируйте промпт генерации (в `src/services/openrouter.ts`)
4. Разверните на сервере для постоянной работы

Приятного использования! 🎨
