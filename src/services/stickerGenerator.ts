import path from 'path';
import fs from 'fs';
import { generateStickerGrid } from './openrouter.js';
import { upscaleImage, removeBackground, downloadImage } from './replicate.js';
import { splitGridIntoStickers, resizeForTelegram } from '../utils/imageProcessing.js';

export async function processStickerPack(
  userPhotoPath: string,
  userId: string,
  onProgress?: (message: string) => void
): Promise<string[]> {
  const tempDir = path.join(process.cwd(), 'temp', userId);
  const stickersDir = path.join(tempDir, 'stickers');
  const processedDir = path.join(tempDir, 'processed');

  // Создаем директории
  for (const dir of [tempDir, stickersDir, processedDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  try {
    // Шаг 1: Генерация сетки стикеров
    onProgress?.('🎨 Генерирую сетку стикеров...');
    const gridImageUrl = await generateStickerGrid(userPhotoPath);

    // Скачиваем сетку
    const gridPath = path.join(tempDir, 'grid.png');
    await downloadImage(gridImageUrl, gridPath);

    // Шаг 2: Апскейл
    onProgress?.('📈 Улучшаю качество...');
    const upscaledUrl = await upscaleImage(gridImageUrl);
    const upscaledPath = path.join(tempDir, 'grid_upscaled.png');
    await downloadImage(upscaledUrl, upscaledPath);

    // Шаг 3: Нарезаем сетку на отдельные стикеры
    onProgress?.('✂️ Нарезаю стикеры...');
    const stickerPaths = await splitGridIntoStickers(upscaledPath, stickersDir);

    // Шаг 4: Обработка каждого стикера (удаление фона + ресайз)
    const processedPaths: string[] = [];

    for (let i = 0; i < stickerPaths.length; i++) {
      onProgress?.(`🎭 Обрабатываю стикер ${i + 1}/${stickerPaths.length}...`);

      const stickerPath = stickerPaths[i];

      // Загружаем стикер в облако для обработки
      // Здесь нужно загрузить файл и получить URL
      // Для простоты используем локальный путь
      // В реальности нужно загрузить на CDN или использовать file:// URL

      // Временно пропускаем удаление фона для локальных файлов
      // и просто ресайзим для Telegram
      const processedPath = path.join(processedDir, `sticker_${i}.png`);
      await resizeForTelegram(stickerPath, processedPath, 512);

      processedPaths.push(processedPath);
    }

    onProgress?.('✅ Обработка завершена!');
    return processedPaths;
  } catch (error) {
    // Очищаем временные файлы в случае ошибки
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

export function cleanupTempFiles(userId: string) {
  const tempDir = path.join(process.cwd(), 'temp', userId);
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
