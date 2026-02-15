import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GAME_CONFIG } from '@/types/game';

// Обменять нектар на MED токены
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, nectarAmount } = body;

    if (!telegramId || !nectarAmount) {
      return NextResponse.json(
        { error: 'Telegram ID and nectar amount are required' },
        { status: 400 }
      );
    }

    if (nectarAmount < GAME_CONFIG.NECTAR_TO_MED) {
      return NextResponse.json(
        { error: `Minimum exchange is ${GAME_CONFIG.NECTAR_TO_MED} nectar` },
        { status: 400 }
      );
    }

    const player = await db.player.findUnique({
      where: { telegramId },
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    if (player.nectar < nectarAmount) {
      return NextResponse.json(
        { error: 'Not enough nectar' },
        { status: 400 }
      );
    }

    // Вычисляем количество MED токенов
    const medAmount = nectarAmount / GAME_CONFIG.NECTAR_TO_MED;

    // Создаем транзакцию и обновляем баланс игрока
    const [transaction, updatedPlayer] = await db.$transaction([
      db.transaction.create({
        data: {
          playerId: player.id,
          type: 'exchange',
          amount: medAmount,
          nectarSpent: nectarAmount,
          status: 'completed',
        },
      }),
      db.player.update({
        where: { telegramId },
        data: {
          nectar: { decrement: nectarAmount },
          medBalance: { increment: medAmount },
          totalWithdrawn: { increment: medAmount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transaction,
      player: updatedPlayer,
      medAmount,
    });
  } catch (error) {
    console.error('Error in exchange API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
