import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function splitGridIntoStickers(
  gridImagePath: string,
  outputDir: string
): Promise<string[]> {
  // Создаем папку для стикеров, если не существует
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Загружаем изображение и получаем его размеры
  const image = sharp(gridImagePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Не удалось получить размеры изображения');
  }

  // Вычисляем размер одного стикера (сетка 5x5)
  const stickerWidth = Math.floor(metadata.width / 5);
  const stickerHeight = Math.floor(metadata.height / 5);

  const stickerPaths: string[] = [];

  // Нарезаем сетку на отдельные стикеры
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      const outputPath = path.join(outputDir, `sticker_${index}.png`);

      await image
        .clone()
        .extract({
          left: col * stickerWidth,
          top: row * stickerHeight,
          width: stickerWidth,
          height: stickerHeight,
        })
        .toFile(outputPath);

      stickerPaths.push(outputPath);
    }
  }

  return stickerPaths;
}

export async function resizeForTelegram(
  imagePath: string,
  outputPath: string,
  maxSize: number = 512
): Promise<void> {
  await sharp(imagePath)
    .resize(maxSize, maxSize, {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toFile(outputPath);
}
