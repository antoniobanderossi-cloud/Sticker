import { config } from '../config.js';
import fs from 'fs';

const STICKER_PROMPT = `Based on the provided image, generate a 5×5 grid (25 items) of Telegram-ready stickers.
Each sticker must feature the same person, with recognizable facial features, proportions, and identity, but without caricature distortion.
Use a clean vector-style cute aesthetic, similar to modern Telegram sticker packs.
Stickers must have a transparent background.

Style Requirements:

Cute, polished vector animation style.

No exaggerated or distorted facial features.

Keep the person's identity clearly recognizable across all 25 stickers.

Smooth outlines, soft shading, expressive poses.

Colors should remain consistent with the original appearance.

Content Requirements:
Generate 25 different emotions and micro-situations, one per sticker, including but not limited to:

happy

excited

surprised

thinking

angry (soft/cute)

sad

crying

laughing

facepalm

embarrassed

sleepy

proud

confused

mischievous

shocked

worried

determined

thumbs up

thumbs down

waving

wink

neutral

"OK" gesture

"heart sign"

celebration pose

Output Requirements:

25 separate sticker images arranged in a 5×5 grid.

Transparent PNGs.

Uniform framing and proportions so the set looks cohesive.

Maintain character consistency across all stickers.`;

async function encodeImageToBase64(imagePath: string): Promise<string> {
  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}

export async function generateStickerGrid(imagePath: string): Promise<string> {
  const base64Image = await encodeImageToBase64(imagePath);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openrouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.aiModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: STICKER_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      modalities: ['image', 'text'],
      image_config: {
        aspect_ratio: '1:1',
      },
    }),
  });

  const result = (await response.json()) as any;

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${JSON.stringify(result)}`);
  }

  if (result.choices && result.choices[0]?.message?.images) {
    const images = result.choices[0].message.images;
    if (images.length > 0) {
      const imageUrl = images[0].image_url?.url;
      if (!imageUrl) {
        throw new Error('Не получен URL изображения от API');
      }
      return imageUrl;
    }
  }

  throw new Error('API не вернул изображений');
}
