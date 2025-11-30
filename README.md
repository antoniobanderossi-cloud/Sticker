# 🎨 Telegram Sticker Bot

Telegram бот для создания персонализированных стикерпаков из фотографий пользователей.

## 🌟 Возможности

- 🎨 Генерация 25 уникальных стикеров из одной фотографии
- 💎 Система токенов для управления генерациями
- ⭐️ Покупка токенов за Telegram Stars
- 🤖 Автоматическая обработка изображений (апскейл + удаление фона)
- 📦 Автоматическое создание стикерпака в Telegram

## 📋 Требования

- Node.js >= 18
- PostgreSQL >= 14
- Telegram Bot Token (получить у [@BotFather](https://t.me/BotFather))
- OpenRouter API Key (для Google Gemini)
- Replicate API Token (для обработки изображений)

## 🚀 Установка

> 💡 Для быстрого старта см. [QUICKSTART.md](QUICKSTART.md)

### Вариант 1: С Docker (рекомендуется)

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd Sticker
```

2. **Запустите PostgreSQL через Docker:**
```bash
docker-compose up -d
```

3. **Установите зависимости:**
```bash
npm install
```

### Вариант 2: Без Docker

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd Sticker
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Создайте базу данных PostgreSQL:**
```bash
createdb sticker_bot
```

4. **Настройте переменные окружения:**
```bash
cp .env.example .env
```

Отредактируйте `.env` файл и укажите ваши настройки:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
REPLICATE_API_TOKEN=your_replicate_api_token_here
DATABASE_URL=postgresql://user:password@localhost:5432/sticker_bot?schema=public
AI_MODEL=google/gemini-2.0-flash-001:free
```

5. **Выполните миграции базы данных:**
```bash
npm run db:push
```

6. **Запустите бота:**
```bash
npm run dev
```

## 📚 Получение API ключей

### 1. Telegram Bot Token

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен в `.env`
5. Отправьте команду `/mybots` → выберите вашего бота → Bot Settings → Payments
6. Выберите Telegram Stars для активации платежей

### 2. OpenRouter API Key

1. Зарегистрируйтесь на [OpenRouter](https://openrouter.ai/)
2. Перейдите в [настройки API](https://openrouter.ai/keys)
3. Создайте новый ключ
4. Скопируйте ключ в `.env`

### 3. Replicate API Token

1. Зарегистрируйтесь на [Replicate](https://replicate.com/)
2. Перейдите в [настройки аккаунта](https://replicate.com/account/api-tokens)
3. Создайте новый токен
4. Скопируйте токен в `.env`

## 🔧 Доступные команды

```bash
npm run dev         # Запуск в режиме разработки с hot-reload
npm run build       # Сборка проекта
npm start           # Запуск собранного проекта
npm run db:generate # Генерация Prisma Client
npm run db:push     # Применение схемы к базе данных
npm run db:migrate  # Создание миграций
npm run db:studio   # Открыть Prisma Studio
```

## 📖 Как использовать бота

1. Запустите бота командой `/start`
2. Отправьте свою фотографию боту
3. Дождитесь обработки (займет несколько минут)
4. Получите ссылку на готовый стикерпак!

### Система токенов

- При первом запуске каждый пользователь получает **1 бесплатный токен**
- 1 генерация = 1 токен
- Дополнительные токены можно купить за Telegram Stars:
  - 5 токенов = 50 ⭐️
  - 10 токенов = 90 ⭐️
  - 25 токенов = 200 ⭐️

## 🏗️ Архитектура проекта

```
Sticker/
├── src/
│   ├── bot/
│   │   └── handlers.ts      # Обработчики команд и событий
│   ├── services/
│   │   ├── openrouter.ts    # Интеграция с OpenRouter/Gemini
│   │   ├── replicate.ts     # Интеграция с Replicate
│   │   └── stickerGenerator.ts  # Основная логика генерации
│   ├── utils/
│   │   └── imageProcessing.ts   # Обработка изображений
│   ├── config.ts            # Конфигурация
│   ├── db.ts                # Работа с базой данных
│   └── index.ts             # Точка входа
├── prisma/
│   └── schema.prisma        # Схема базы данных
├── temp/                    # Временные файлы (создается автоматически)
├── uploads/                 # Загруженные фото (создается автоматически)
├── .env                     # Переменные окружения
├── .env.example             # Пример конфигурации
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Процесс генерации стикерпака

1. **Получение фото** от пользователя
2. **Генерация сетки** 5×5 стикеров через Google Gemini
3. **Апскейл** изображения через Recraft AI
4. **Нарезка** сетки на 25 отдельных стикеров
5. **Удаление фона** у каждого стикера (опционально)
6. **Ресайз** до размеров Telegram (512×512)
7. **Создание стикерпака** в Telegram
8. **Отправка ссылки** пользователю

## ⚙️ Технологии

- **Grammy** - фреймворк для Telegram Bot API
- **Prisma** - ORM для работы с PostgreSQL
- **Sharp** - обработка изображений
- **TypeScript** - типизированный JavaScript
- **OpenRouter** - доступ к AI моделям (Google Gemini)
- **Replicate** - AI сервисы для обработки изображений

## 🐛 Решение проблем

### Ошибка подключения к базе данных

Убедитесь, что:
- PostgreSQL запущен
- DATABASE_URL в `.env` правильный
- База данных создана

### Бот не отвечает

Проверьте:
- Правильность TELEGRAM_BOT_TOKEN
- Бот запущен (`npm run dev`)
- Нет ошибок в консоли

### Ошибки при генерации

Проверьте:
- Наличие валидных API ключей (OpenRouter, Replicate)
- Баланс на OpenRouter и Replicate
- Интернет соединение

## 📝 Лицензия

ISC

## 👨‍💻 Разработка

Для разработки используйте:
```bash
npm run dev
```

Это запустит бота с hot-reload при изменении файлов.

## 🤝 Вклад

Приветствуются Pull Request'ы и Issues!

## 🔮 Планируемые улучшения

- [ ] Добавить полноценное удаление фона для каждого стикера
- [ ] Поддержка загрузки файлов на CDN для обработки в Replicate
- [ ] Анимированные стикеры
- [ ] Кастомизация промптов пользователями
- [ ] Статистика использования
- [ ] Реферальная система

## ⚠️ Важные замечания

### Удаление фона

В текущей версии этап удаления фона через Replicate пропущен для упрощения. Стикеры создаются с фоном, который сгенерирован AI. Для добавления удаления фона нужно:

1. Настроить загрузку временных файлов на CDN (например, Cloudinary, AWS S3)
2. Обновить логику в `src/services/stickerGenerator.ts` для работы с URL
3. Раскомментировать код удаления фона

### Стоимость API

- **OpenRouter (Gemini)**: ~$0.01-0.05 за генерацию
- **Replicate (Upscale)**: ~$0.01-0.03 за изображение
- **Replicate (Background removal)**: ~$0.01 за изображение (если включено)

**Итого**: примерно $0.03-0.10 на один стикерпак

## 📞 Поддержка

При возникновении проблем создайте Issue в репозитории.
