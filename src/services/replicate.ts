import Replicate from 'replicate';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const replicate = new Replicate({
  auth: config.replicateApiToken,
});

export async function upscaleImage(imageUrl: string): Promise<string> {
  const input = {
    image: imageUrl,
  };

  const output = await replicate.run('recraft-ai/recraft-crisp-upscale', { input }) as any;

  if (typeof output === 'string') {
    return output;
  } else if (output && output.url) {
    return output.url();
  } else if (Array.isArray(output) && output.length > 0) {
    return output[0];
  }

  throw new Error('Не удалось получить URL апскейленного изображения');
}

export async function removeBackground(imageUrl: string): Promise<string> {
  const output = await replicate.run(
    '851-labs/background-remover:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc',
    {
      input: {
        image: imageUrl,
        format: 'png',
        reverse: false,
        threshold: 0,
        background_type: 'rgba',
      },
    }
  ) as any;

  if (typeof output === 'string') {
    return output;
  } else if (output && output.url) {
    return output.url();
  } else if (Array.isArray(output) && output.length > 0) {
    return output[0];
  }

  throw new Error('Не удалось получить URL изображения без фона');
}

export async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Не удалось скачать изображение: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await fs.promises.writeFile(outputPath, buffer);
}
