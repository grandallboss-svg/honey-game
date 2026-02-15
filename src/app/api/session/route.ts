import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Сохранить игровую сессию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId,
      score,
      moves,
      matches,
      combos,
      nectarEarned,
      bonusesFound,
      duration,
    } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const session = await db.gameSession.create({
      data: {
        playerId,
        score: score || 0,
        moves: moves || 0,
        matches: matches || 0,
        combos: combos || 0,
        nectarEarned: nectarEarned || 0,
        bonusesFound: bonusesFound || 0,
        duration: duration || 0,
        completed: true,
        endedAt: new Date(),
      },
    });

    // Обновляем статистику игрока
    await db.player.update({
      where: { id: playerId },
      data: {
        gamesPlayed: { increment: 1 },
        matchesMade: { increment: matches || 0 },
        combosHit: { increment: combos || 0 },
        bonusesCollected: { increment: bonusesFound || 0 },
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Получить историю сессий игрока
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const sessions = await db.gameSession.findMany({
      where: { playerId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in session API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
