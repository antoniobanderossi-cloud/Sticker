import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function getUserByTelegramId(telegramId: number) {
  return await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
}

export async function createUser(
  telegramId: number,
  username?: string,
  firstName?: string,
  lastName?: string
) {
  return await prisma.user.create({
    data: {
      telegramId: BigInt(telegramId),
      username,
      firstName,
      lastName,
      tokens: 1, // 1 бесплатный токен
    },
  });
}

export async function getOrCreateUser(
  telegramId: number,
  username?: string,
  firstName?: string,
  lastName?: string
) {
  let user = await getUserByTelegramId(telegramId);
  if (!user) {
    user = await createUser(telegramId, username, firstName, lastName);
  }
  return user;
}

export async function updateUserTokens(userId: string, tokensChange: number) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      tokens: {
        increment: tokensChange,
      },
    },
  });
}

export async function createTransaction(
  userId: string,
  type: 'purchase' | 'generation',
  amount: number,
  stars?: number
) {
  return await prisma.transaction.create({
    data: {
      userId,
      type,
      amount,
      stars,
    },
  });
}

export async function createStickerPack(
  userId: string,
  telegramName?: string,
  title?: string
) {
  return await prisma.stickerPack.create({
    data: {
      userId,
      telegramName,
      title,
    },
  });
}
